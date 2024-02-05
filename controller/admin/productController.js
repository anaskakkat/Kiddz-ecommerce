const Product = require("../../model/productModal");
const Category = require("../../model/category");
const sharp = require("sharp");
const fs = require("fs").promises;
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
      stock: productQty,
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
    const ProductFind = await Product.find().sort({ _id: -1 })
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
    // console.log("idd-->   " + productId);
    const products = await Product.findOne({ _id: productId });
    const categories = await Category.find({ status: "Unblock" });


    // console.log("pro datas----> ", products);
    res.render("editProduct", { products: products,categories });
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
    // console.log("p id ---->", productId);
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
    // const productId = req.body.productId;
    const {
      productId,
      productName,
      productDesc,
      productPrice,
      productQty,
      productCat,
      brand,
    } = req.body;
    console.log("productID-->", productId);
    console.log(
      "product sdetails",
  
      productName,
      productDesc,
      productPrice,
      productQty,
      productCat,
      brand
    );
    // ... handle other form fields

    // Update the product with the new images
    await Product.findByIdAndUpdate(productId, {
      $set: {
        productName: productName,
        description: productDesc,
        productName: productName,
        description: productDesc,
        price: productPrice,
        stock: productQty,
        category: productCat,
        brand: brand,
      },
    });
    req.flash("message", " Product Updated");
    res.redirect("/admin/products");
  } catch (err) {
    console.log(err.message);
  }
};
// -delete image of products----------
const deleteImage = async (req, res) => {
  try {
    const { productId, index } = req.params;
    console.log(` ProductId: ${productId}, Index: ${index}`);
    const product = await Product.findById(productId);
    console.log(` product details: ${productId}}`);
    const imagePath = path.join(product.images[index]);
    console.log(` imagePath : ${imagePath}}`);
    // Delete the image file
    await fs.unlink(path.join(process.cwd(), "public", "uploads", imagePath));

    // Remove the image path from the product data
    product.images.splice(index, 1);

    // Save the updated product data
    await product.save();

    res.json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    console.log(err.message);
  }
};
// -add image of products----------
const addImage = async (req, res) => {
  try {
    console.log("iam body", req.body);
    const { productId } = req.params;
    console.log("productID-->", productId, "request file -->", req.file);

    const originalPath = req.file.path;
    const resizedPath = path.join(
      __dirname,
      `../../public/uploads`,
      req.file.filename
    );
    console.log("images name-->", req.file.filename);
    await sharp(originalPath)
      .resize(400, 500, { fit: "fill" })
      .toFile(resizedPath);

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      {
        $push: { images: req.file.filename },
      },
      { new: true }
    );

    res.json({ success: true, message: "Images added successfully" });
  } catch (err) {
    console.log(err.message);
  }
};
module.exports = {
  addProduct,
  unlistProducts,
  productsAdding,
  products,
  editProducts,
  listProducts,
  updateProducts,
  deleteImage,
  addImage,
};
