const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "API is running" });
});

router.use("/users", require("./users"));
router.use("/products", require("./products"));
router.use("/diary", require("./diary"));

module.exports = router;
