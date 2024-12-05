const userModel  = require("../models/user.model");
const { generateToken } = require("../utils/generateToken");
const bcrypt = require('bcryptjs');


exports. createUser = async (req, res) => {
  const { userName, email, password, role } = req.body;
  if ([userName, email, password].some((fields) => fields?.trim() === "")) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    let existedUser = await userModel.findOne({
      $or: [{ userName }, { email }],
    });

    console.log("existedUser",existedUser);
    
    if (existedUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new userModel({ userName, email, password, role });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    await user.save();
    return res.status(201).send({
      isError: false,
      msg: "Your account has been successfully registered !",
      data: user,
      token: generateToken(user.id),
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send({
      isError: true,
      msg: err.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Please enter all fields" });
  }

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid Credentials.(Email Not Found)" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (user && isMatch) {
      return res.status(201).send({
        isError: false,
        msg: "Login Successfull",
        token: generateToken(user.id), 
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error(err.message);
    return res.status(500).send({
      isError: true,
      msg: err.message,
    });
  }
};
