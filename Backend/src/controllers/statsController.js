const db = require('../db');
// Add these functions to your existing controller or create a new one

exports.getStatistics = async (req, res) => {
  try {
    // 1. Number of admins
    const [adminResult] = await db.query(
      "SELECT COUNT(*) as adminCount FROM users WHERE is_admin = 1"
    );
    
    // 2. Number of all members (users)
    const [userResult] = await db.query(
      "SELECT COUNT(*) as userCount FROM users"
    );
    
    // 3. Number of not returned borrows
    const [notReturnedResult] = await db.query(
      "SELECT COUNT(*) as notReturnedCount FROM borrow WHERE actual_return_date IS NULL"
    );
    
    // 4. Total fines (sum of all fines for overdue books)
    const [finesResult] = await db.query(`
      SELECT 
        SUM(
          GREATEST(
            DATEDIFF(
              IFNULL(actual_return_date, CURDATE()),
              expected_return_date
            ) * fine_per_day,
            0
          )
        ) as totalFines
      FROM borrow
    `);
    
    // 5. Number of all borrows
    const [allBorrowsResult] = await db.query(
      "SELECT COUNT(*) as allBorrowsCount FROM borrow"
    );
    
    // 6. Number of not returned overdue borrows
    const [overdueResult] = await db.query(`
      SELECT COUNT(*) as overdueCount 
      FROM borrow 
      WHERE actual_return_date IS NULL 
      AND CURDATE() > expected_return_date
    `);
    
    // 7. Number of pending reservations (waiting for a copy or waiting for user to borrow)
    const [pendingReservationsResult] = await db.query(`
      SELECT COUNT(*) as pendingReservationsCount 
      FROM reserve 
      WHERE is_reservation_done = 0
    `);
    
    // 8. Number of cancelled reservations
    const [cancelledResult] = await db.query(`
      SELECT COUNT(*) as cancelledCount 
      FROM reserve 
      WHERE is_reservation_done = 1 
      AND book_availble_date IS NULL
    `);
    
    // 9. Number of pending reservations waiting for user to borrow (available but not taken)
    const [pendingUserResult] = await db.query(`
      SELECT COUNT(*) as pendingUserCount 
      FROM reserve 
      WHERE is_reservation_done = 0 
      AND book_availble_date IS NOT NULL
    `);

    // 10. Total number of reservations
    const [totalReservationsResult] = await db.query(
      "SELECT COUNT(*) as totalReservationsCount FROM reserve"
    );
    
    // 11. Total number of finished reservations
    const [finishedReservationsResult] = await db.query(`
      SELECT COUNT(*) as finishedReservationsCount 
      FROM reserve 
      WHERE is_reservation_done = 1 
      AND book_availble_date IS NOT NULL
    `);

    // 11. Total number of finished reservations
    const [bookResult] = await db.query(
      "SELECT COUNT(*) as bookCount FROM books"
    );

    res.json({
      statistics: {
        adminCount: adminResult[0]?.adminCount || 0,
        userCount: userResult[0]?.userCount || 0,
        bookCount: bookResult[0]?.bookCount || 0,
        notReturnedCount: notReturnedResult[0]?.notReturnedCount || 0,
        totalFines: finesResult[0]?.totalFines || 0,
        allBorrowsCount: allBorrowsResult[0]?.allBorrowsCount || 0,
        overdueCount: overdueResult[0]?.overdueCount || 0,
        pendingReservationsCount: pendingReservationsResult[0]?.pendingReservationsCount || 0,
        cancelledCount: cancelledResult[0]?.cancelledCount || 0,
        pendingUserCount: pendingUserResult[0]?.pendingUserCount || 0,
        totalReservationsCount: totalReservationsResult[0]?.totalReservationsCount || 0,
        finishedReservationsCount: finishedReservationsResult[0]?.finishedReservationsCount || 0
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};