const Userdb = require("../../model/userModel");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModal");
const Coupons = require("../../model/coupenModel");

//show  coupen load page ---------------------------->
const couponsPage = async (req, res) => {
  try {
    const coupons = await Coupons.find({});
    // console.log("coupons::", coupons);
    res.render("couponsPage", { coupons, messages: req.flash("messages") });
  } catch (error) {
    console.log("error lodaing ejs", error);
  }
};
//add coupen ---------------------------->
const addCoupons = async (req, res) => {
  try {
    const {
      couponName,
      couponCode,
      discountAmount,
      description,
      expiryDate,
    } = req.body;

    const existingCoupon = await Coupons.findOne({ couponCode });

    if (existingCoupon) {
      console.log("Coupon code already exists");
      req.flash(
        "messages",
        "Coupon code already exists. Please choose a different code."
      );
      res.redirect("/admin/coupons");
      return;
    }

    const newCoupon = new Coupons({
      couponName,
      couponCode,
      discountAmount,
      description,
      expiryDate,
    });

    await newCoupon.save();

    console.log("Coupon added");
    req.flash("messages", "Coupon added successfully");
    res.redirect("/admin/coupons");
  } catch (error) {
    console.error("Error adding coupon", error);
    req.flash("messages", "Error adding coupon. Please try again.");
    res.redirect("/admin/coupons");
  }
};

//delet coupons
const deleteCoupons = async (req, res) => {
  try {
    const couponId = req.params.id.trim();
    console.log("couponId:", couponId);

    // Use Mongoose to delete the coupon by ID
    const result = await Coupons.deleteOne({ _id: couponId });

    req.flash("messages", "Coupon deleted successfully");

    res.redirect("/admin/coupons");
  } catch (error) {
    console.log("Error deleting coupon:", error);
    req.flash("messages", "Error deleting coupon. Please try again.");
    res.redirect("/admin/coupons");
  }
};
//edit coupons
const editCoupons = async (req, res) => {
  try {
    const couponId = req.params.id.trim();
    console.log("couponId:", couponId);

    const coupon = await Coupons.findById(couponId);

    if (!coupon) {
      req.flash("messages", "Coupon not found");
      return res.redirect("/admin/coupons");
    }

    res.render("couponEditPage", { coupon });
  } catch (error) {
    console.log("Error editing coupon:", error);
    req.flash("messages", "Error editing coupon. Please try again.");
    res.redirect("/admin/coupons");
  }
};
//update coupons
const updateCoupon = async (req, res) => {
  try {
    const couponId = req.params.id.trim();
    const {
      couponName,
      couponCode,
      discountAmount,
      description,
      expiryDate,
    } = req.body;

    // Update the coupon data in the database
    const result = await Coupons.updateOne(
      { _id: couponId },
      {
        $set: {
          couponName,
          couponCode,
          discountAmount,
          description,
          expiryDate,
        },
      }
    );
    req.flash("messages", "Coupon Updated.");

    res.redirect("/admin/coupons");
  } catch (error) {
    console.log("Error updating coupon:", error);
    req.flash("messages", "Error updating coupon. Please try again.");
    res.redirect("/admin/coupons");
  }
};

module.exports = {
  couponsPage,
  addCoupons,
  deleteCoupons,
  editCoupons,
  updateCoupon,
};
