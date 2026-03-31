const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const users = require("../../controllers/userController");

// REGISTER
router.post("/signup", users.userSignup);

// LOGIN
router.post("/login", users.userLogin);

// CURRENT USER
router.get("/current", auth, users.getCurrent);

// UPDATE PROFILE (date fixe)
router.patch("/profile", auth, users.updateProfile);

// UPDATE WEIGHT (zilnic)
router.patch("/weight", auth, users.updateWeight);

// LOGOUT
router.post("/logout", auth, users.userLogout);

module.exports = router;
