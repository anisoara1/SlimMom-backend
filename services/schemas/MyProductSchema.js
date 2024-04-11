const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  allowedProductsAll: [
    {
      title: {
        type: String,
        required: true,
      },
      weight: {
        type: Number,
        required: true,
      },
      calories: {
        type: Number,
        required: true,
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

const MyProducts = mongoose.model("myproducts", productSchema);

module.exports = MyProducts;
