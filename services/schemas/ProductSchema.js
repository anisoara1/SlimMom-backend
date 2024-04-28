const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const product = new mongoose.Schema({
  categories: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  groupBloodNotAllowed: {
    type: [Boolean],
    validate: {
      validator: function (v) {
        return (
          Array.isArray(v) &&
          v.length === 5 &&
          v.every((val) => typeof val === "boolean")
        );
      },
      message: (props) =>
        `${props.value} is not a valid array of 5 boolean values for groupBloodNotAllowed`,
    },
  },
});

const Product = mongoose.model("products", product);

module.exports = Product;
