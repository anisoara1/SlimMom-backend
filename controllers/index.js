const services = require("../services/index");
const jwt = require("jsonwebtoken");
const User = require("../services/schemas/UserSchema");
const Product = require("../services/schemas/ProductSchema");
const MyProducts = require("../services/schemas/MyProductSchema");
const { findUserName } = require("../services/index");
require("dotenv").config();
const bcrypt = require("bcrypt");
const secret = process.env.SECRET;
exports.secret = secret;
const mongoose = require("mongoose");

const getUsers = async (req, res, next) => {
  try {
    const results = await services.getUsers();
    res.json({
      status: "Success",
      code: 200,
      data: results,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await services.createUser({
      name,
      email,
      password: hashedPassword,
    });
    const payload = {
      id: result.id,
      email: result.email,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await services.updateUser(result.id, { token });

    res.status(201).json({
      code: 201,
      status: "succes",
      data: { email: result.email, token, avatarUrl: result.avatarUrl },
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      error: error.message,
    });
  }
};

const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await services.userExists({
      email,
      password,
    });
    const payload = {
      id: result.id,
      email: result.email,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await services.updateUser(result.id, { token });

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        email: result.email,
        token,
        avatarUrl: result.avatarUrl,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      error: error.message,
    });
  }
};

const getCurrent = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ status: "error", message: "Missing Authorization header" });
    }
    const token = authHeader.split(" ")[1];

    const user = jwt.verify(token, secret);
    console.log(user);
    const result = await findUserName({ email: user.email });
    const updatedAt = user.updatedAt;
    console.log(updatedAt);
    console.log(result);
    if (result) {
      res.status(200).json({
        status: "success",
        code: 200,
        data: {
          _id: result.id,
          name: result.name,
          infouser: result.infouser,
          token,
          avatarUrl: result.avatarUrl,
          currentDate: result.updatedAt,
        },
      });
    } else {
      res.status(404).json({ status: "error", message: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};

const updateById = async (req, res) => {
  try {
    const { _id, ...updateData } = req.body;
    const { currentWeight, height, age, desiredWeight } = req.body;
    console.log(req.body);
    const dailyRate = await services.calculateDailyRate({
      currentWeight,
      height,
      age,
      desiredWeight,
    });
    console.log(dailyRate);

    const updatedInfouser = {
      dailyRate: dailyRate,
      ...updateData,
    };

    const result = await User.findByIdAndUpdate(
      _id,
      { infouser: updatedInfouser },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
      });
    }

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        user: result,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

const userLogout = async (req, res) => {
  try {
    const userId = req.user;
    await User.findByIdAndUpdate(userId, { token: null });

    res.status(200).json({
      status: "success",
      message: "User successfully logged out",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      status: "error",
      message: "Internal Server Error",
    });
  }
};

const getProducts = async (req, res, next) => {
  try {
    const bloodType = await services.userBloodType(req.user);
    console.log(bloodType);

    const userId = req.user._id;

    const notAllowedProducts = await Product.find({
      [`groupBloodNotAllowed.${bloodType}`]: true,
    })
      .select("categories")
      .limit(5);

    const allowedProductsAll = await Product.find({
      [`groupBloodNotAllowed.${bloodType}`]: false,
    }).select("title weight calories");

    const message = ["You can eat everything"];
    const result = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "infouser.notAllowedProducts": notAllowedProducts.length
            ? [
                ...new Set(
                  notAllowedProducts.flatMap((product) => product.categories)
                ),
              ]
            : message,
          "infouser.allowedProductsAll": allowedProductsAll.map((product) => ({
            title: product.title,
            weight: product.weight,
            calories: product.calories,
          })),
        },
      },
      {
        new: true,
      }
    );
    if (!result) {
      return res.status(404).json({
        status: "error",
        code: 404,
        message: "User not found",
      });
    }
    const { infouser, ...userData } = result.toObject();
    const response = {
      ...userData,
      infouser: {
        ...infouser,
        allowedProductsAll: infouser.allowedProductsAll,
        notAllowedProducts: infouser.notAllowedProducts,
      },
    };

    res.status(200).json({
      status: "success",
      code: 200,
      data: {
        user: response,
      },
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      status: 500,
      error: "Internal server error",
    });
  }
};

const saveProductData = async (req, res) => {
  try {
    const { product, quantity } = req.body;
    console.log("reqBody:", req.body);

    const selectedProduct = req.user.infouser.allowedProductsAll.find(
      (item) => item.title === product
    );

    console.log("selectedProduct:", selectedProduct);
    if (!selectedProduct) {
      return res.status(404).json({ error: "Product not found" });
    }
    const productCalories = selectedProduct.calories;
    const totalCalories = Math.round((productCalories * quantity) / 100);

    const originalDate = req.user.updatedAt;
    const formattedDate = new Date(originalDate).toISOString().split("T")[0];

    let existingDocument = await MyProducts.findOne({
      owner: req.user._id,
    });
    console.log("Existing document:", existingDocument);

    if (!existingDocument) {
      console.log(
        "No existing document found for the owner and login date. Creating a new one..."
      );

      const newDocumentData = {
        owner: req.user._id,
        products: [
          {
            product: req.body.product,
            quantity: req.body.quantity,
            newCalories: totalCalories,
          },
        ],
        date: formattedDate,
      };

      existingDocument = await MyProducts.create(newDocumentData);
      console.log("New document created:", existingDocument);
    } else {
      console.log("Existing document found. Appending product...");

      const currentDateIndex = existingDocument.dates.findIndex(
        (date) => date.date.toString() === new Date(formattedDate).toString()
      );
      if (currentDateIndex !== -1) {
        existingDocument.dates[currentDateIndex].products.push({
          product: req.body.product,
          quantity: req.body.quantity,
          newCalories: totalCalories,
        });
      } else {
        const newDateArray = {
          date: formattedDate,
          products: [
            {
              product: req.body.product,
              quantity: req.body.quantity,
              newCalories: totalCalories,
            },
          ],
        };
        existingDocument.dates.push(newDateArray);
      }

      existingDocument = await existingDocument.save();
      console.log("Updated document:", existingDocument);
    }

    res.status(200).json(existingDocument);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log("req.params:", req.params);
    console.log("req.user :", req.user);

    const existingDocument = await MyProducts.findOne({ owner: req.user._id });
    console.log("Existing document:", existingDocument);

    if (!existingDocument) {
      return res
        .status(404)
        .json({ error: "Document not found for the owner" });
    }

    let productIndex = -1;
    existingDocument.dates.forEach((date, index) => {
      const foundIndex = date.products.findIndex((product) => {
        return product._id.equals(new mongoose.Types.ObjectId(productId));
      });
      if (foundIndex !== -1) {
        productIndex = foundIndex;
        existingDocument.dates[index].products.splice(productIndex, 1);
      }
    });

    if (productIndex === -1) {
      return res
        .status(404)
        .json({ error: "Product not found in the document" });
    }

    const updatedDocument = await existingDocument.save();
    console.log("Updated document:", updatedDocument);

    res.status(200).json(updatedDocument);
  } catch (error) {
    console.error("Error removing product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

module.exports = {
  getUsers,
  userSignup,
  userLogin,
  getCurrent,
  updateById,
  userLogout,
  getProducts,
  saveProductData,
  removeProduct,
  getAllProducts,
};
