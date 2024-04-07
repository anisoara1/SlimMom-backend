const services = require("../services/index");
const jwt = require("jsonwebtoken");
const User = require("../services/schemas/UserSchema");
const Product = require("../services/schemas/ProductSchema");
const MyProducts = require("../services/schemas/MyProductSchema");
const { findUserName, userBloodType } = require("../services/index");
const { error } = require("console");
require("dotenv").config();
const bcrypt = require("bcrypt");
const secret = process.env.SECRET;
exports.secret = secret;

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
    const result = await User.findByIdAndUpdate(
      _id,
      { infouser: updateData },
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
      .select("title")
      .limit(5);

    const allowedProductsAll = await Product.find({
      [`groupBloodNotAllowed.${bloodType}`]: false,
    }).select("title");

    const message = ["You can eat everything"];

    const result = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "infouser.notAllowedProducts": notAllowedProducts.length
            ? notAllowedProducts.map((product) => product.title)
            : message,
          "infouser.allowedProductsAll": allowedProductsAll.map(
            (product) => product.title
          ),
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

const getDailyRateController = async (req, res, next) => {
  try {
    console.log(req.body);
    const dailyRate = services.calculateDailyRate(req.body);
    console.log(req.body.bloodType);
    const { notAllowedProducts, allowedProductsAll } =
      await services.notAllowedProductsObj(req.body.bloodType);
    return res
      .status(200)
      .json({ dailyRate, notAllowedProducts, allowedProductsAll });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const getDailyRateUserController = async (req, res) => {
  try {
    const { user } = req;
    const dailyRate = services.calculateDailyRate(user.infouser);
    console.log(dailyRate);

    const { notAllowedProducts, notAllowedProductsAll } =
      await services.notAllowedProducts(user.infouser.bloodType);
    user.infouser = {
      ...user.infouser,
      dailyRate,
      notAllowedProducts,
      notAllowedProductsAll,
    };
    await User.findByIdAndUpdate(user._id, user);
    return res.status(200).json({ data: user.infouser });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
  }
};

const getAllProductsByQuery = async (req, res, next) => {
  try {
    const {
      query: { title, limit = 10 },
    } = req;
    const titleFromUrl = decodeURI(title).trim();
    const products = await Product.find({
      $or: [{ $text: { $search: titleFromUrl } }],
    }).limit(limit);
    if (products.length === 0) {
      const newProducts = await Product.find({
        $or: [{ title: { $regex: titleFromUrl, $options: "i" } }],
      }).limit(limit);

      if (newProducts.length === 0) {
        return error;
      }
      return res.status(200).json({ data: newProducts });
    }
    return res.status(200).json({ data: products });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const addMyProducts = async (req, res) => {
  try {
    console.log(req.user);
    const { _id } = req.user;
    const { productName, productWeight, date } = req.body;
    console.log(req.body);
    const productCalories = await services.countCalories(
      productName,
      productWeight
    );
    const product = await MyProducts.findOne({
      date,
      owner: _id,
      productInfo: { $elemMatch: { productName } },
    });
    if (product) {
      const index = product.productInfo.findIndex(
        (product) => product.productName === productName
      );
      const newWeight =
        Number(product.productInfo[index].productWeight) +
        Number(productWeight);
      const newCalories =
        Number(product.productInfo[index].productCalories) +
        Number(productCalories);
      await MyProducts.findOneAndUpdate(
        { date, owner: _id },
        {
          $pull: {
            productInfo: { productName },
          },
        }
      );
      await MyProducts.findOneAndUpdate(
        { date, owner: _id },
        {
          $push: {
            productInfo: {
              $each: [
                {
                  productCalories: newCalories.toString(),
                  productName,
                  productWeight: newWeight.toString(),
                },
              ],
              $position: 0,
            },
          },
        }
      );
      const newProduct = await MyProducts.findOne({
        date,
        owner: _id,
      });

      return res
        .status(201)
        .json({ success: "success", code: 201, newProduct });
    }
    if (await MyProducts.findOne({ date, owner: _id })) {
      await MyProducts.findOneAndUpdate(
        { date, owner: _id },
        {
          $push: {
            productInfo: {
              $each: [
                {
                  productCalories,
                  productName,
                  productWeight,
                },
              ],
              $position: 0,
            },
          },
        }
      );
      const newProduct = await MyProducts.findOne({
        date,
        owner: _id,
      });

      return res
        .status(201)
        .json({ success: "success", code: 201, newProduct });
    }
    const newProduct = await MyProducts.create({
      date,
      owner: _id,
      productInfo: [{ productCalories, productName, productWeight }],
    });
    return res.status(201).json({
      success: "success",
      code: 201,
      newProduct,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
  }
};

const deleteMyProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { date } = req.body;
    const { _id } = req.user;

    const product = await MyProducts.findOneAndUpdate(
      { date, productInfo: { $elemMatch: { _id: productId } } },
      {
        $pull: {
          productInfo: { _id: productId },
        },
      }
    );

    if (product.productInfo.length === 0) {
      await MyProducts.findOneAndDelete({ date });
    }

    if (!product) {
      NotFound(`Product with id = ${productId} not found`);
    }

    const newProduct = await MyProducts.findOne({
      date,
      owner: _id,
    });

    return res.status(200).json({
      status: "success",
      code: 200,
      newProduct,
    });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
  }
};

const getMyProducts = async (req, res) => {
  try {
    const { date } = req.body;
    const { _id } = req.user;

    const productList = await MyProducts.find({ owner: _id, date });
    console.log(productList);
    return res.status(200).json({ status: "success", code: 200, productList });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
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
  getDailyRateController,
  getProducts,
  getAllProductsByQuery,
  getDailyRateUserController,
  addMyProducts,
  deleteMyProducts,
  getMyProducts,
};
