const cron = require("node-cron");
const db = require("./db"); // MySQL connection pool

// -----------------------------
// Job Functions
// -----------------------------

/**
 * Assign available books to pending reservations
 * Runs hourly before handling expired reservations
 */
async function giveToReservationsAvailableBooks() {
  console.log("Running hourly give-to-reservation task...");
  let connection;

  try {
    connection = await db.getConnection(); // get a dedicated DB connection
    await connection.beginTransaction();   // start transaction

    // Fetch pending reservations ordered by reservation date
    const [reservations] = await connection.query(`
      SELECT ID, Book_ID
      FROM Reserve
      WHERE book_availble_date IS NULL
        AND is_reservation_done = 0
      ORDER BY reservation_date ASC;
    `);

    for (const reservation of reservations) {
      const { ID, Book_ID } = reservation;

      // Check current available copies for the book
      const [[book]] = await connection.query(`
        SELECT Available_Copies
        FROM Books
        WHERE ID = ?;
      `, [Book_ID]);

      if (!book || book.Available_Copies <= 0) continue; // skip if none available

      // Atomically decrement available copies
      const [updateResult] = await connection.query(`
        UPDATE Books
        SET Available_Copies = Available_Copies - 1
        WHERE ID = ? AND Available_Copies > 0;
      `, [Book_ID]);

      if (updateResult.affectedRows === 0) continue; // skip if update failed

      // Assign book to reservation
      await connection.query(`
        UPDATE Reserve
        SET book_availble_date = CURRENT_DATE()
        WHERE ID = ?;
      `, [ID]);
    }

    await connection.commit(); // commit transaction
    console.log("Reservation processing completed.");

  } catch (err) {
    console.error("Error in giveToReservationsAvailableBooks:", err);
    if (connection) await connection.rollback(); // rollback on error
  } finally {
    if (connection) connection.release(); // release connection back to pool
  }
}

/**
 * Handle expired reservations
 * Marks reservations done, assigns next pending reservations, and returns leftover copies
 */
async function handleExpiredReservations() {
  console.log("Running hourly validate reservation task...");
  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Find books with expired reservations (older than 7 days)
    const [expiredBooks] = await connection.query(`
      SELECT Book_ID
      FROM Reserve
      WHERE book_availble_date IS NOT NULL
        AND is_reservation_done = FALSE
        AND DATE(book_availble_date) <= CURDATE() - INTERVAL 7 DAY
      GROUP BY Book_ID
    `);

    for (const row of expiredBooks) {
      const bookId = row.Book_ID;

      // Mark expired reservations as done
      const [result] = await connection.query(`
        UPDATE Reserve
        SET is_reservation_done = TRUE
        WHERE Book_ID = ?
          AND book_availble_date IS NOT NULL
          AND is_reservation_done = FALSE
          AND DATE(book_availble_date) <= CURDATE() - INTERVAL 7 DAY
      `, [bookId]);

      const expiredCount = result.affectedRows;

      // Get next pending reservations for this book
      const [pending] = await connection.query(`
        SELECT ID FROM Reserve
        WHERE Book_ID = ?
          AND is_reservation_done = FALSE
          AND book_availble_date IS NULL
        ORDER BY reservation_date ASC
        LIMIT ?
      `, [bookId, expiredCount]);

      let assignedCount = 0;

      if (pending.length > 0) {
        const pendingIds = pending.map(r => r.ID);

        // Assign available books to pending reservations
        const [assignResult] = await connection.query(`
          UPDATE Reserve
          SET book_availble_date = CURDATE()
          WHERE ID IN (?)
        `, [pendingIds]);

        assignedCount = assignResult.affectedRows;
      }

      // Return leftover copies to Books table
      const remaining = expiredCount - assignedCount;
      if (remaining > 0) {
        await connection.query(`
          UPDATE Books
          SET Available_Copies = Available_Copies + ?
          WHERE ID = ?
        `, [remaining, bookId]);
      }
    }

    await connection.commit();
    console.log("Expired reservations processed.");

  } catch (err) {
    console.error("Error in handleExpiredReservations:", err);
    if (connection) await connection.rollback();
  } finally {
    if (connection) connection.release();
  }
}

// -----------------------------
// Cron Scheduler
// -----------------------------

/**
 * Start all scheduled cron jobs
 * Currently runs every hour on the hour
 */
function startCronJobs() {
  cron.schedule("0 * * * *", async () => {
    try {
      await giveToReservationsAvailableBooks(); // assign available books
      await handleExpiredReservations();        // process expired reservations
    } catch (err) {
      console.error("Hourly cron job error:", err);
    }
  });
}

module.exports = startCronJobs;
