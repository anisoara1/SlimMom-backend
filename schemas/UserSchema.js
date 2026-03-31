const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    token: { type: String, default: null },

    infouser: {
      isProfileComplete: { type: Boolean, default: false },

      // date fixe
      height: Number,
      age: Number,
      desiredWeight: Number,
      bloodType: Number,

      // date dinamice
      currentWeight: Number,
      dailyRate: Number,

      // produse
      allowedProductsAll: [
        {
          title: String,
          weight: Number,
          calories: Number,
        },
      ],
      notAllowedProducts: [String],
    },
  },
  { timestamps: true },
);

module.exports = model("User", userSchema);
