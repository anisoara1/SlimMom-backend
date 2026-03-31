const Product = require("../schemas/ProductSchema");

// GET PRODUCTS (allowed + notAllowed)
const getProducts = async (req, res) => {
  try {
    const bloodType = req.user.infouser.bloodType;

    const notAllowed = await Product.find({
      groupBloodNotAllowed: { $in: [bloodType] },
    }).lean();

    const allowed = await Product.find({
      groupBloodNotAllowed: { $nin: [bloodType] },
    }).lean();

    res.json({
      status: "success",
      data: { notAllowed, allowed },
    });
  } catch (error) {
    console.log("EROARE GET PRODUCTS:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

module.exports = {
  getProducts,
  getAllProducts,
};
