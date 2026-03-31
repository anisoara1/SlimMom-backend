const services = require("../schemas/index");
const jwt = require("jsonwebtoken");
const User = require("../schemas/UserSchema");
const bcrypt = require("bcrypt");
require("dotenv").config();

const secret = process.env.SECRET;

// REGISTER
const userSignup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      infouser: {
        isProfileComplete: false,
        currentWeight: null,
        height: null,
        age: null,
        desiredWeight: null,
        bloodType: null,
        dailyRate: null,
        allowedProductsAll: [],
        notAllowedProducts: ["You can eat everything"],
      },
    });

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    await User.findByIdAndUpdate(user.id, { token });

    res.status(201).json({
      status: "success",
      data: { token, user },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// LOGIN
const userLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw new Error("Email sau parola gresita!");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Email sau parola gresita!");

    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });

    await User.findByIdAndUpdate(user.id, { token });

    res.status(200).json({
      status: "success",
      data: { token, user },
    });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

// CURRENT USER
const getCurrent = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ status: "success", data: { user } });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// UPDATE PROFILE
const updateProfile = async (req, res) => {
  const { height, age, desiredWeight, bloodType } = req.body;

  try {
    const dailyRate = services.calculateDailyRate({
      currentWeight: req.user.infouser.currentWeight,
      height,
      age,
      desiredWeight,
    });

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        "infouser.height": height,
        "infouser.age": age,
        "infouser.desiredWeight": desiredWeight,
        "infouser.bloodType": bloodType,
        "infouser.dailyRate": dailyRate,
        "infouser.isProfileComplete": true,
      },
      { new: true },
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

// UPDATE WEIGHT
const updateWeight = async (req, res) => {
  const { currentWeight, desiredWeight } = req.body;

  const dailyRate = services.calculateDailyRate({
    currentWeight,
    height: req.user.infouser.height,
    age: req.user.infouser.age,
    desiredWeight: desiredWeight ?? req.user.infouser.desiredWeight,
  });

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    {
      "infouser.currentWeight": currentWeight,
      "infouser.desiredWeight":
        desiredWeight ?? req.user.infouser.desiredWeight,
      "infouser.dailyRate": dailyRate,
    },
    { new: true },
  );

  res.json(updated);
};

// LOGOUT
const userLogout = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user, { token: null });

    res.status(200).json({
      status: "success",
      message: "User successfully logged out",
    });
  } catch (error) {
    res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
};

module.exports = {
  userSignup,
  userLogin,
  getCurrent,
  updateProfile,
  updateWeight,
  userLogout,
};
