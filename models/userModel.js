const mongoose = require("mongoose");
const Address = require("./addressModel");
const Cart = require("./cartModel");

const userModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
   },
  // password: {
  //   type: String,
  //   requird: true,
  // },
  mobile: {
    type: Number,
    required: true,
  },
  is_admin: {
    type: Number,
    default: 0,
  },
  isBlocked: {
    type: Boolean,
    default: false,
  },
 
  addresses: [Address.schema],

  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },

});

module.exports = mongoose.model("User", userModel);
