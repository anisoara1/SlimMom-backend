const express = require("express");
const router = express.Router();
const { auth } = require("../../middlewares/auth");
const controller = require("../../controllers");

/* const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = new express();

const options = {
  definitions: {
    openapi: "3.0.0",
    info: {
      title: "Weight control Api",
      version: "1.0.0",
    },
    servers: [
      {
        api: "http://localhost:4000/",
      },
    ],
  },
  apis: ["/routes/api/index.js"],
};

const swaggerSpec = swaggerJSDoc.options;
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec)); */

router.get("/", (req, res) => {
  res.status(200).json({ message: "API is running" });
});

// Users routs
router.post("/users/signup", controller.userSignup);
router.post("/users/login", controller.userLogin);
router.patch("/users/logout", auth, controller.userLogout);

//Products routs
router.post("/products", controller.getDailyRateController);
router.post("/products/:userId", auth, controller.getDailyRateUserController);
router.get("/products/searchProducts", controller.getAllProductsByQuery);

//Myproducts routs
router.post("/myproducts/addProduct", controller.addMyProducts);
router.delete("/myproducts/:productId", controller.deleteMyProducts);
router.post("/myproducts/listMyProduct", controller.getMyProducts);

module.exports = router;
