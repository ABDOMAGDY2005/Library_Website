const db = require('../db');
const UserModel = require('../Models/Users');

exports.getAll = async (req, res) => {
    try{

        const rows = await UserModel.getAllUsers();

        res.status(200).json(rows);

    }catch(err){

        res.sendStatus(500);

    }
};

exports.getById = async (req, res) => {
    try{
        
        const Id = Number(req.params.id);

        if(isNaN(Id)){
          
          return res.sendStatus(404);
          
        }

        const user = await UserModel.getUserById(Id);

        if(!user){

            return res.sendStatus(404);
            
        }

        res.status(200).json(user);

    }catch(err){

        res.sendStatus(500);

    }
};

exports.updateUser = async (req, res) => {
  const id = req.user.id;
  const { new_name, new_email, new_password, new_birth_date } = req.body || {};

  try {
    // Get existing user
    const user = await UserModel.getUserById(id);

    if (!user) {
      return res.sendStatus(404);
    }

    // Merge old & new data
    const updatedUser = {
      name: new_name || user.name,
      email: new_email || user.email,
      password: new_password || user.password,
      birth_date: new_birth_date || user.birth_date
    };

    // Update in DB
    await UserModel.updateUserById(id, updatedUser);

    return res.status(200).json({
      message: "User updated successfully",
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

  if (isNaN(userId)) {
    return res.sendStatus(404);
  }

  try {
    const user = await UserModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await UserModel.setAdminStatus(userId, true);

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
  const requesterId = req.user.id;
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    return res.sendStatus(404);
  }

  try {
    // Prevent self-demotion
    if (userId == requesterId) {
      return res.status(400).json({
        error: "You cannot remove your own admin rights."
      });
    }

    const user = await UserModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    await UserModel.setAdminStatus(userId, false);

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

    const user = await UserModel.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
