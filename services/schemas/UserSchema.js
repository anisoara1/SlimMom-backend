const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");

const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      default: null,
    },
    avatarUrl: {
      type: String,
    },
    infouser: {
      currentWeight: {
        type: Number,
        default: null,
      },
      height: {
        type: Number,
        default: null,
      },
      age: {
        type: Number,
        default: null,
      },
      desiredWeight: {
        type: Number,
        default: null,
      },
      bloodType: {
        type: Number,
        default: null,
      },
      dailyRate: {
        type: Number,
        default: null,
      },
      notAllowedProducts: {
        type: [String],
        default: null,
      },
      allowedProductsAll: {
        title: {
          type: String,
          default: "Default Title",
        },
        weight: {
          type: Number,
          default: 0,
        },
        calories: {
          type: Number,
          default: 0,
        },
      },
    },
  },

  { versionKey: false, timestamps: true }
);

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.setPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(password, salt);
};

userSchema.pre("save", function (next) {
  if (!this.avatarUrl) {
    this.avatarUrl = gravatar.url(
      this.email,
      {
        s: 200,
        r: "pg",
        d: "identicon",
      },
      true
    );
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
