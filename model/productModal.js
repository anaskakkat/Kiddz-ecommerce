const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      unique: true,
    },
    isListed: {
      type: Boolean,
      default: false,
    },

    category: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },

    stock: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: [String],
   
  },
  { timestamps: true }
);

const Product = mongoose.model("products", productSchema);

module.exports = Product;
