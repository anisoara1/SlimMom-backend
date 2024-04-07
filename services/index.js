const Product = require("./schemas/ProductSchema");
const User = require("./schemas/UserSchema");

const getUsers = async () => {
  return User.find();
};

const createUser = async ({ name, email, password }) => {
  try {
    const userExistent = await User.findOne({ email });

    if (userExistent) {
      throw new Error("Acest email exista deja.");
    }

    const codUnicDeVerificare = String(Date.now());

    const newUser = new User({
      name,
      email,
      password,
      verificationToken: codUnicDeVerificare,
    });
    newUser.setPassword(password);
    return await newUser.save();
  } catch (error) {
    console.log(error);
  }
};

const userExists = async ({ email, password }) => {
  try {
    console.log(`Parola:${password}`);
    const user = await User.findOne({ email });

    if (!user || !(await user.comparePassword(password))) {
      throw new Error("Email sau parola gresita!");
    }
    return user;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

const findUserName = async (user) => {
  try {
    const result = await User.findOne({ email: user.email });
    return result;
  } catch (error) {
    throw new Error("Error finding user by email");
  }
};

const updateUser = async (id, token) => {
  console.log(id, token);
  console.log(token);
  return User.findByIdAndUpdate({ _id: id }, { $set: token }, { new: true });
};

const getProducts = async () => {
  return Product.find();
};

const userBloodType = async (user) => {
  try {
    const result = await User.findOne({ bloodType: user.infouser.bloodType });
    if (!user) {
      console.log("User not found");
      return null;
    }
    const bloodType = user.infouser.bloodType;

    return bloodType;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

const calculateDailyRate = ({ currentWeight, height, age, desiredWeight }) => {
  return Math.floor(
    10 * currentWeight +
      6.25 * height -
      5 * age -
      161 -
      10 * (currentWeight - desiredWeight)
  );
};

const getNotAllowedProducts = async ({ bloodType }) => {
  const blood = [null, false, false, false, false];
  blood[bloodType] = true;
  const products = await Product.find({
    groupBloodNotAllowed: { $all: [blood] },
  });
  return products;
};

const notAllowedProductsObj = async (bloodType) => {
  const notAllowedProductsArray = await getNotAllowedProducts(bloodType);
  const arr = [];
  notAllowedProductsArray.map(({ title }) => arr.push(title));
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
};

const countCalories = async (productName, productWeight) => {
  const product = await Product.findOne({
    title: productName,
  });
  if (!product) {
    NotFound("Product name is not correct");
  }
  const { calories, weight } = product;
  const productCalories = Math.round((calories / weight) * productWeight);
  return productCalories;
};

module.exports = {
  getProducts,
  userBloodType,
  notAllowedProductsObj,
  calculateDailyRate,
  getUsers,
  createUser,
  findUserName,
  updateUser,
  userExists,
  countCalories,
};
