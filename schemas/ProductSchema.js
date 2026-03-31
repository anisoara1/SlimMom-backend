const { Schema, model } = require("mongoose");

const productSchema = new Schema({
  title: String,
  weight: Number,
  calories: Number,
  categories: [String],
  groupBloodNotAllowed: {
    1: Boolean,
    2: Boolean,
    3: Boolean,
    4: Boolean,
  },
});

module.exports = model("Product", productSchema);
