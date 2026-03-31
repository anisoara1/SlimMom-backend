const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");
const users = require("../../controllers/productsController");

// GET PRODUCTS (allowed + notAllowed)
router.get("/", auth, users.getProducts);

// GET ALL PRODUCTS
router.get("/all", auth, users.getAllProducts);

module.exports = router;
