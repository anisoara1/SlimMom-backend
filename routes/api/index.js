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

//Product routs
router.post("/products/getProducts", auth, controller.getProducts);
router.get("/products/searchProducts", controller.getAllProductsByQuery);
router.post("/products", controller.getDailyRateController);
router.post("/products/:userId", auth, controller.getDailyRateUserController);

//Myproducts routs
router.post("/myProducts/addProduct", controller.addMyProducts);
router.delete("/myProducts/:productId", controller.deleteMyProducts);
router.post("/myProducts/listMyProduct", controller.getMyProducts);

module.exports = router;
