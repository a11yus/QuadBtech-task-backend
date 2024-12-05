const userModel = require("../models/user.model");
exports.fetchUserById = async (req, res) => {
  const { id } = req.user;

  try {
    const user = await userModel.findById(id);
    console.log("user", user);

    res.status(200).json({
      id: user._id,
      userName: user.userName,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    res.status(400).json(err);
  }
};
