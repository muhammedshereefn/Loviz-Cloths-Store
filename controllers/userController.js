const { Product } = require("../models/product");
const User = require("../models/userModel");
const category = require("../models/category");
const Address = require("../models/addressModel");
const Cart = require("../models/cartModel");
const Order = require("../models/orderModel");
const mongoose = require("mongoose");
const Razorpay = require("razorpay");
const { Readable } = require("stream");
const bcrypt = require('bcryptjs')
const Offer = require('../models/offerModel');
const nodemailer = require('nodemailer');


require('dotenv').config();


const loadRegister = async (req, res) => {
  try {
    res.render("registration", { message: "", errMessage: "" });
  } catch (error) {
    console.log(error.message);
  }
};

const insertUser = async (req, res) => {
  try {
    const email = req.body.email;
    const checkData = await User.findOne({ email: email });

    if (checkData) {
      res.render("registration", {
        errMessage: "User already Registered",
        message: "",
      });
    } else {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        mobile: req.body.mobile,
      });

      await user.save(); // Save the user to the database
      req.session.userData = user;
      res.redirect("/login");
      
    }
  } catch (error) {
    console.log(error.message);
  }
};


const loaddLogin = async (req, res) => {
  try {
    const products = await Product.find({ status: true }).sort({ price: 1 });
    const cata = await category.find();
    const latestOffer = await Offer.findOne().sort({ createdAt: -1 }).limit(1);
    res.render("home", {
      message: "",
      userId: req.session.user_id ? req.session.user_id : "",
      products,
      cata,
      userName: " PLease login",
      latestOffer,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const loadLogin = async (req, res) => {
  try {
    if (req.session.user_id) {
      return res.redirect("/home"); 
    }
    res.render("login", { message: "" });
  } catch (error) {
    console.log(error.message);
  }
};

const verfiyUser = async (req, res) => {
  try {
    const email = req.body.email;
    const userData = await User.findOne({ email: email });
    if (userData) {
    
        if (userData.isBlocked === false) {
          req.session.user_id = userData._id;
          res.redirect("/home");
        } else {
            // User is blocked
            res.render("login", { message: "User is blocked. Please contact support for assistance." });
        }
      
    } else {
      res.render("login", { message: "Invalid email or password" });
    }
  } catch (error) {
    console.log(error);
  }
};

const loadHome = async (req, res) => {
  try {
    console.log("Load home")
    let user = { name: "For better experience please login" };
    if (req.session) {
      const userId = req.session.user_id;
      user = await User.findOne({ _id: userId });
    }

    const products = await Product.find({ status: true }).sort({ price: 1 }).limit(28);
    const cata = await category.find();

    const latestOffer = await Offer.findOne().sort({ createdAt: -1 });

    res.render("home", {
      userId: req.session.user_id ? req.session.user_id : "",
      products,
      cata,
      userName: user.name,
      latestOffer
    });
  } catch (error) {
    console.log(error);
  }
};


const userLogout = async (req, res) => {
  try {
    req.session.user_id = null;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
  }
};

const loadProductDetails = async (req, res) => {
  try {
    const productId = req.params.id;

    const productdetails = await Product.findById(productId);

   // Extract the base name (e.g., "Travel Bag") by removing the color
   const baseName = productdetails.name.replace(/(\s*\(.*\))$/, '').trim(); // Remove color part (e.g., " (Red)")

   // Fetch similar products that have the same base name but a different color
   const similarProducts = await Product.find({
     _id: { $ne: productId }, // Exclude the current product
     name: { $regex: new RegExp(`^${baseName}\\s*\\(`, 'i') }, // Match base name followed by optional space and '('
   }).limit(5);

   console.log(similarProducts, "Similar Products");

    res.render("productDetails", {
      userId: req.session.user_id ? req.session.user_id : "",
      productdetails,
      similarProducts
    });
  } catch (error) {
    console.log(error);
  }
};

const loadCategoryPage = async (req, res) => {
  try {
    const products = await Product.find({ status: true });
    const cata = await category.find({ isListed: true });
    res.render("categoryPage", {
      userId: req.session.user_id ? req.session.user_id : "",
      cata,
      products,
    });
  } catch (error) {
    console.log(error);
  }
};

const loadProfilePage = async (req, res) => {
  try {
    console.log(req.session.user_id);
    const userId = req.session.user_id;
    const user = await User.findById(userId);
    const userData = await User.find();

    const orders = await Order.find({ user: req.session.user_id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    const userAddresses = user.addresses;

    res.render("profilePage", {
      users: userData,
      user: user,
      userId: req.session.user_id ? req.session.user_id : "",
      userAddresses,
      orders,
    });
  } catch (error) {
    console.log(error);
  }
};





const loadTermsandConditions = async (req, res) => {
  try {
    const userId = req.session.user_id;
    res.render("Teams&condition",{userId: req.session.user_id ? req.session.user_id : ""});
  } catch (error) {
    console.log(error);
  }
};


const loadPrivacyandPolicies = async (req, res) => {
  try {
    res.render("privacy&policy");
  } catch (error) {
    console.log(error);
  }
};


const loadContactUs = async (req, res) => {
  try {
    
    const userId = req.session.user_id;
  
    res.render("contactus", {
      
     
      userId: req.session.user_id ? req.session.user_id : "",
      
    });
  } catch (error) {
    console.log(error);
  }
};



const loadRefundPolicy = async (req, res) => {
  try {
    const userId = req.session.user_id;
    res.render("refundPolicy",{userId: req.session.user_id ? req.session.user_id : ""});
  } catch (error) {
    console.log(error);
  }
};




const loadhomeProduct = async (req, res) => {
  try {
    let user = { name: "For better experience please login" };
    if (req.session) {
      const userId = req.session.user_id;
      user = await User.findOne({ _id: userId });
    }

    const productsPerPage = 20; // Number of products per page
    const currentPage = req.query.page || 1;

    // Retrieve category filter from the request query
    const categoryFilter = req.query.category || "All Categories";

    // Find all categories
    const cata = await category.find();

    // Adjust the category query based on the filter
    const categoryQuery =
      categoryFilter !== "All Categories" ? { category: categoryFilter } : {};

    // Count total products based on category filter
    const totalProducts = await Product.countDocuments({
      status: true,
      ...categoryQuery,
    });

    // Calculate total pages based on total products and products per page
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    // Calculate the skip value for pagination
    const skip = (currentPage - 1) * productsPerPage;

    // Retrieve products based on category filter, skipping, and limiting
    const products = await Product.find({ status: true, ...categoryQuery })
      .sort({ offerPercentage: -1 })
      .skip(skip)
      .limit(productsPerPage);

    res.render("shop", {
      userId: req.session.user_id ? req.session.user_id : "",
      products,
      cata,
      userName: user ? user.name : "",
      currentPage,
      totalPages,
      categoryFilter,
    });
  } catch (error) {
    console.log(error);
  }
};



const searchProduct = async (req, res, next) => {
  try {
    const filter = req.query.q;

    if (filter != "") {
      const regex = new RegExp(filter, "i");
      const products = await Product.find({ name: { $regex: regex } });

      if (products) {
        res.json(products);
      }
    }
  } catch (error) {
    console.log(error);
  }
};



module.exports = {
  loadRegister,
  insertUser,
  loaddLogin,
  verfiyUser,
  loadHome,
  userLogout,
  loadLogin,
  loadProductDetails,
  loadCategoryPage,
  loadProfilePage,
  loadhomeProduct,
  searchProduct,
  loadTermsandConditions,
  loadPrivacyandPolicies,
  loadContactUs,
  loadRefundPolicy
};
