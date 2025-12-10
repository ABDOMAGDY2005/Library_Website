const db = require('../db');

exports.getAll = async (req, res) => {
    try{

        const [rows] = await db.query('select ID, Name, Email, Birth_Date, is_Admin from users');

        res.status(200).json(rows);

    }catch(err){

        res.sendStatus(500);

    }
};

exports.getById = async (req, res) => {
    try{
        
        const Id = Number(req.params.id);

        if(isNaN(Id)){
            res.sendStatus(404);
            return;
        }

        const [rows] = await db.query('select ID, Name, Email, Birth_Date, is_Admin from users where ID = ?',[Id]);

        if(rows.length === 0){
            res.sendStatus(404);
            return;
        }

        res.status(200).json(rows);

    }catch(err){

        res.sendStatus(500);

    }
};

exports.updateUser = async (req, res) => {
    const id = req.user.id;
    const { new_name, new_email, new_password, new_birth_date } = req.body || {};
    
    try {

    // 1️⃣ Get the existing user
    const [userRows] = await db.query(
      "SELECT * FROM users WHERE ID = ?",
      [id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: "User not found." });
    }

    const user = userRows[0];
    
    // 2️⃣ Merge old & new fields 
    const updatedUser = {
      name: new_name || user.Name,
      email: new_email || user.Email,
      password: new_password || user.Password,
      birth_date: new_birth_date || user.Birth_Date
    };

    // 3️⃣ Update query
    const [result] = await db.query(
      `
        UPDATE users
        SET name = ?, email = ?, password = ?, birth_date = ?
        WHERE ID = ?;
      `,
      [
        updatedUser.name,
        updatedUser.email,
        updatedUser.password,
        updatedUser.birth_date,
        id
      ]
    );

    return res.status(200).json({
      message: "User updated successfully.",
      updatedUser
    });

  } catch (err) {
    console.error(err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists." });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
};

exports.makeAdmin = async (req, res) => {
    const userId = Number(req.params.id);

    if(isNaN(userId)){
        res.sendStatus(404);
        return;
    }

    try {
        const [userRows] = await db.query(
            "SELECT * FROM users WHERE ID = ?",
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        await db.query(
            `UPDATE users SET is_admin = 1 WHERE ID = ?`,
            [userId]
        );

        return res.status(200).json({
            message: "User promoted to admin successfully.",
            promotedUserId: userId
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

exports.removeAdmin = async (req, res) => {
    const requesterId = req.user.id;        // Who is performing the action
    const userId = Number(req.params.id);   // Who is being demoted

    if(isNaN(userId)){
        res.sendStatus(404);
        return;
    }

    try {
        // 1️⃣ Prevent admin from removing their own admin rights
        if (parseInt(userId) === parseInt(requesterId)) {
            return res.status(400).json({
                error: "You cannot remove your own admin rights."
            });
        }

        // 2️⃣ Check if the target user exists
        const [userRows] = await db.query(
            "SELECT * FROM users WHERE ID = ?",
            [userId]
        );

        if (userRows.length === 0) {
            return res.status(404).json({ error: "User not found." });
        }

        // 3️⃣ Remove admin role
        await db.query(
            `UPDATE users SET is_admin = 0 WHERE ID = ?`,
            [userId]
        );

        return res.status(200).json({
            message: "Admin rights removed successfully.",
            userId
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal server error." });
    }
};

exports.getMyInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const [rows] = await db.query("SELECT id,name,email,birth_date FROM Users WHERE id = ?", [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
