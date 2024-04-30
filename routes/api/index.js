const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const controller = require("../../controllers");

router.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// User routs

router.post("/users/signup", controller.userSignup);
router.post("/users/login", controller.userLogin);
router.post("/users/logout", auth, controller.userLogout);
router.get("/users/current", auth, controller.getCurrent);
router.patch("/users/infouser", auth, controller.updateById);
router.post("/users/getProducts", auth, controller.getProducts);

//Myproducts routs

router.post("/myproducts/saveProductData", auth, controller.saveProductData);
router.delete("/myproducts/:productId", auth, controller.removeProduct);

//Products routs
router.get("/products", controller.getAllProducts);

module.exports = router;
