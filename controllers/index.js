const services = require("../services/index");
const jwt = require("jsonwebtoken");
const User = require("../services/schemas/UserSchema");
const Product = require("../services/schemas/ProductSchema");
const MyProducts = require("../services/schemas/MyProductSchema");
const { error } = require("console");
require("dotenv").config();
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
    const result = await services.createUser({
      name,
      email,
      password,
    });
    const payload = {
      id: result.id,
      email: result.email,
      subscription: result.subscription,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await services.updateUser(result.id, { token });
    res.status(201).json({
      status: "succes",
      code: 201,
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
      subscription: result.subscription,
    };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    await services.updateUser(result.id, { token });
    res.status(201).json({
      status: "succes",
      code: 201,
      data: {
        email: result.email,
        token,
      },
    });
  } catch (error) {
    res.status(404).json({
      status: 404,
      error: error.message,
    });
  }
};

const userLogout = async (req, res, next) => {
  const userId = req.user;
  const token = null;
  try {
    const result = await services.updateUser(userId, { token });
    if (result) {
      res.status(200).json({
        status: "updated",
        code: 200,
        data: result,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({
      status: "error",
    });
  }
};

const getProducts = async (req, res, next) => {
  try {
    const results = await services.getProducts();
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

const getDailyRateController = async (req, res, next) => {
  try {
    console.log(req.body);
    const dailyRate = services.calculateDailyRate(req.body);
    console.log(req.body.bloodType);
    const { notAllowedProducts, notAllowedProductsAll } =
      await services.notAllowedProductsObj(req.body.bloodType);
    return res
      .status(200)
      .json({ dailyRate, notAllowedProducts, notAllowedProductsAll });
  } catch (error) {
    res.status(404).json({
      status: "error",
      code: 404,
    });
    next(error);
  }
};

const notAllowedProducts = async (bloodType) => {
  try {
    const notAllowedProductsArray = await services.findBloodType(bloodType);
    const arr = [];
    notAllowedProductsArray.map(({ title }) => arr.push(title.ua));
    let notAllowedProductsAll = [...new Set(arr)];
    let notAllowedProducts = [];
    const message = ["You can eat everything"];
    if (notAllowedProductsAll[0] === undefined) {
      notAllowedProducts = message;
    } else {
      do {
        const index = Math.floor(Math.random() * notAllowedProductsAll.length);
        if (
          notAllowedProducts.includes(notAllowedProductsAll[index]) ||
          notAllowedProducts.includes("undefined")
        ) {
          break;
        } else {
          notAllowedProducts.push(notAllowedProductsAll[index]);
        }
      } while (notAllowedProducts.length !== 5);
    }
    if (notAllowedProductsAll.length === 0) {
      notAllowedProductsAll = message;
    }
    const result = { notAllowedProductsAll, notAllowedProducts };
    return result;
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
      await services.notAllowedProductsObj(user.infouser.bloodType);
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
  userLogout,
  getProducts,
  getDailyRateController,
  notAllowedProducts,
  getAllProductsByQuery,
  getDailyRateUserController,
  addMyProducts,
  deleteMyProducts,
  getMyProducts,
};
