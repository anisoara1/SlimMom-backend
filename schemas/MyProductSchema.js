const { Schema, model } = require("mongoose");

const myProductSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },

  dates: [
    {
      date: { type: String, required: true },

      products: [
        {
          _id: { type: Schema.Types.ObjectId, auto: true },
          product: { type: String, required: true },
          quantity: { type: Number, required: true },
          newCalories: { type: Number, required: true },
        },
      ],
    },
  ],
});

module.exports = model("MyProduct", myProductSchema);
