const Product = require("../../model/productModal");
const Category = require("../../model/category");
const sharp = require("sharp");
const fs = require('fs').promises;
const path = require("path");
const { log } = require("console");

// adding products -------------------------------->

const productsAdding = async (req, res) => {
  try {
    // Process form data
    const {
      productName,
      productDesc,
      productPrice,
      productQty,
      productCat,
      brand,
    } = req.body;

    // Get uploaded images
    // const images = req.files;

    console.log("iamreqfiles", req.files);
    // Array to store paths of resized images
    const resizedImages = [];

    for (let i = 0; i < req.files.length; i++) {
      const originalPath = req.files[i].path;
      const resizedPath = path.join(
        __dirname,
        `../../public/uploads`,
        req.files[i].filename
      );

      await sharp(originalPath)
        .resize(400, 500, { fit: "fill" })
        .toFile(resizedPath);
      resizedImages[i] = req.files[i].filename;
      // Unlink (delete) the original image
      // await fs.unlink(originalPath); 
    }
    // console.log("Resized image paths:", resizedImages);

    // Additional logic to save product details in the database
    const newProducts = new Product({
      productName: productName,
      description: productDesc,
      price: productPrice,
      qty: productQty,
      category: productCat,
      brand: brand,
      images: resizedImages,
    });
    await newProducts.save();
    req.flash("message", "Product added successfully");
    res.redirect("/admin/products");
  } catch (error) {
    req.flash("message", "Product added successfully");
    console.error("Error adding product:", error);
    res.redirect("/admin/addProduct");
  }
};

// product add page /------------------------------------------->

const addProduct = async (req, res) => {
  try {
    const categories = await Category.find({ status: "Unblock" });
    // console.log(categories);
    const messages = req.flash("message");
    res.render("addProduct", { categories, messages });
  } catch (err) {
    console.log(err.message);
  }
};

// render products page /------------------------------------------->

const products = async (req, res) => {
  try {
    const ProductFind = await Product.find();
    const messages = req.flash("message");
    res.render("products", { ProductFind, messages });
  } catch (err) {
    console.log(err.message);
  }
};
// edit products --------------------------------------------------->

const editProducts = async (req, res) => {
  try {
    const productId = req.query.productId;
    console.log("idd-->   " + productId);
    const products = await Product.findOne({ _id: productId });
    
    console.log("pro datas----> ", products);
    res.render("editProduct", { products: products });
  } catch (err) {
    console.log(err.message);
  }
};
// --unListing products---------------------------------------------------------->
const unlistProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    await Product.findByIdAndUpdate(
      { _id: productId },
      { $set: { isListed: false } }
    );

    // Redirect to a specific page after listing
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err.message);
  }
};
// --listing products--------------------------------------------------------------------->

const listProducts = async (req, res) => {
  try {
    const productId = req.params.id;
    console.log("p id ---->", productId);
    await Product.findByIdAndUpdate(
      { _id: productId },
      { $set: { isListed: true } }
    );

    // Redirect to a specific page after listing
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err.message);
  }
};
// --edit-Update products------------------------------------------->

const updateProducts = async (req, res) => {
  try {
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err.message);
  }
};
// --

module.exports = {
  addProduct,
  unlistProducts,
  productsAdding,
  products,
  editProducts,
  listProducts,
  updateProducts,
};
