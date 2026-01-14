const db = require('../db');

exports.getAllUsers = async () => {
    const [users] = await db.query('select ID, Name, Email, Birth_Date, is_Admin from users');
    return users;
};

exports.getUserById = async (id) => {
    const [users] = await db.query('select ID, Name, Email, Birth_Date, is_Admin from users where ID = ?',[id]);
    return users[0];
};

exports.updateUserById = async (id, user) => {
  const [result] = await db.query(
    `
      UPDATE users
      SET name = ?, email = ?, password = ?, birth_date = ?
      WHERE id = ?
    `,
    [user.name, user.email, user.password, user.birth_date, id]
  );
  return result;
};

exports.setAdminStatus = async (id, isAdmin) => {
  const [result] = await db.query(
    "UPDATE users SET is_admin = ? WHERE id = ?",
    [isAdmin ? 1 : 0, id]
  );
  return result;
};