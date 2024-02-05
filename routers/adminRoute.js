const express = require("express");
const adminRouter = express();
const adminControl = require("../controller/admin/adminController");
const productController = require("../controller/admin/productController");
const categoryController = require("../controller/admin/categoryController");
const orderController = require("../controller/admin/orderController");
const coupenController = require("../controller/admin/coupenController");

const auth = require("../middlewares/authAdmin");
const path = require("path");

const sharp = require("sharp");
const session = require("express-session");
require("dotenv").config();

const multer = require("multer");

adminRouter.use(
  express.static(path.join(__dirname, "..", "public", "uploads"))
);

adminRouter.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
// file upload  image strorage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "public", "uploads", "cropped"));
  },

  filename: (req, file, cb) => {
    // console.log('Uploaded file details:', file);
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});

const upload = multer({ storage: storage });

// set view engine
adminRouter.set("view engine", "ejs");
adminRouter.set("views", path.join(__dirname, "..", "views", "adminview"));

// admin login
adminRouter.get("/login", auth.isLogout, adminControl.adminLogin);

// verify admin
adminRouter.post("/login", adminControl.checkAdmin);

//admin dashbord
adminRouter.get("/dashboard", auth.isLogin, adminControl.adminDash);
//dashboard details
adminRouter.get("/dashboardData", auth.isLogin, adminControl.dashboardData);

//admin dashbord sales report
adminRouter.get("/salesReport", auth.isLogin, adminControl.salesReport);
//admin dashbord sales report
adminRouter.get("/sales", auth.isLogin, adminControl.sales);

// admin logout
adminRouter.get("/adminLogout", auth.isLogin, adminControl.adminLogout);

// admin panel show user
adminRouter.get("/users", auth.isLogin, adminControl.showUser);
// user block
adminRouter.get("/blockUser/:id", auth.isLogin, adminControl.blockUser);
// user unblock
adminRouter.get("/unblockUser/:id", auth.isLogin, adminControl.unblockUser);

//show add product  page
adminRouter.get("/addProduct", auth.isLogin, productController.addProduct);
// adding products page
// images file  upload
adminRouter.post(
  "/addProducts",
  upload.array("productImages", 4),
  productController.productsAdding
);

//  admin panel show products
adminRouter.get("/products", auth.isLogin, productController.products);

//  admin panal edit products
adminRouter.get(
  "/products/editProduct",
  auth.isLogin,
  productController.editProducts
);
//update products
adminRouter.post(
  "/products/editProduct",
  upload.array("productImages", 4),
  productController.updateProducts
);
// list products
adminRouter.get(
  "/unlistProducts/:id",
  auth.isLogin,
  productController.unlistProducts
);
//unlist products
adminRouter.get(
  "/listProduct/:id",
  auth.isLogin,
  productController.listProducts
);

// delete image  for editimageproducts
adminRouter.post(
  "/deleteImage/:productId/:index",
  productController.deleteImage
);
//add iamages for edit products
adminRouter.post(
  "/addImage/:productId",
  upload.single("image"),
  productController.addImage
);

// show catogery
adminRouter.get("/category", auth.isLogin, categoryController.category);
// add category
adminRouter.post("/Category", categoryController.addCategory);
// edit category
adminRouter.get(
  "/category/:id/editCategory",
  auth.isLogin,
  categoryController.editCategory
);
// update category
adminRouter.post("/editCategory/:id", categoryController.updateCategory);
//block catogery
adminRouter.get(
  "/blockCategory/:categoryId",
  auth.isLogin,
  categoryController.blockCategory
);
// unblock category
adminRouter.get(
  "/unblockCategory/:categoryId",
  auth.isLogin,
  categoryController.unBlockCategory
);

//orders page renser
adminRouter.get("/orders", auth.isLogin, orderController.orders);
//order  details  page
adminRouter.get(
  "/orders/orderDetails/:id",
  auth.isLogin,
  orderController.orderDetails
);
// change status
adminRouter.post("/changeStatus", orderController.changeStatus);

//coupen load admin get
adminRouter.get("/coupons", auth.isLogin, coupenController.couponsPage);
//coupenApply post
adminRouter.post("/coupons", coupenController.addCoupons);
//delete coupon
adminRouter.get(
  "/coupons/deleteCoupons/:id",
  auth.isLogin,
  coupenController.deleteCoupons
);
//edit coupon
adminRouter.get(
  "/coupons/editCoupons/:id",
  auth.isLogin,
  coupenController.editCoupons
);
//update Coupon
adminRouter.post("/coupons/:id", coupenController.updateCoupon);

module.exports = adminRouter;
