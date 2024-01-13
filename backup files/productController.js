const Product = require("../../model/productModal");
const Category = require("../../model/category");
const bcrypt = require("bcrypt");

const sharp = require('sharp');
const easyimage = require('easyimage');
const { promisify } = require('util');
const unlinkAsync = promisify(require('fs').unlink);

// product add page /------------------------------------------->

const addProduct = async (req, res) => {
  try {
    const categories = await Category.find({ status: "Unblock" });
    console.log(categories);
    res.render("addProduct", { categories });
  } catch (err) {
    console.log(err.message);
  }
};

// adding products -------------------------------->



const productsAdding = async (req, res) => {
  try {
    const { productName, category, brand, price, quantity, description } = req.body;
    const images = req.files;

    console.log('--image urls----->'+images);
    console.log(productName,   category,    brand,    price,    quantity,    description);

    const productData = new Product({
      productName: productName,
      category: category,
      brand: brand,
      price: price,
      qty: quantity,
      description: description,
      images: images.map(image => image.path),
    });

    // Save data in the database
    await productData.save();
    console.log("Data added successfully");
    res.redirect("/admin/addProduct");
  } catch (err) {
    console.error(err);
    // Handle the error appropriately
    res.status(500).send("Internal Server Error");
  }
};


// render products page /------------------------------------------->

const products = async (req, res) => {
  try {
    res.render("products");
  } catch (err) {
    console.log(err.message);
  }
};

module.exports = {
  addProduct,
  productsAdding,
    products,
};
