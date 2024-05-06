const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  product: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  newCalories: {
    type: Number,
    required: true,
  },
});

const MyProductsSchema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  dates: [
    {
      date: {
        type: Date,
        default: Date.now,
      },
      products: [productSchema],
    },
  ],
});

const MyProducts = mongoose.model("myproducts", MyProductsSchema);

module.exports = MyProducts;
