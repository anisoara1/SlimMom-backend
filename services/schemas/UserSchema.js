const mongoose = require("mongoose");
const bCrypt = require("bcryptjs");
const gravatar = require("gravatar");

const Schema = mongoose.Schema;

const userSchema = Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
    },
    token: {
      type: String,
      default: null,
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
      notAllowedProductsAll: {
        type: [String],
        default: null,
      },
    },
  },
  { versionKey: false, timestamps: true }
);

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

userSchema.methods.setPassword = function (password) {
  console.log(this);
  this.password = bCrypt.hashSync(password, bCrypt.genSaltSync(6));
};

userSchema.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password);
};

userSchema.methods.validPassword = function (password) {
  return bCrypt.compareSync(password, this.password);
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

const User = mongoose.model("users", userSchema);

module.exports = User;
