const Userdb = require("../../model/userModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const Order = require("../../model/orderModel");
const Product = require("../../model/productModal");
const moment = require("moment");

// admin login -------------------------------------------------->/
const adminLogin = async (req, res) => {
  try {
    const messages = req.flash("message");
    res.render("adminLogin", { messages });
  } catch (err) {
    console.log(err, err.message);
  }
};
// -verify admin--------------------------------------------------->
const checkAdmin = async (req, res) => {
  try {
    const { adminEmail, adminPassword } = req.body;

    // Validate that email and password are provided
    if (!adminEmail || !adminPassword) {
      req.flash("message", "Please provide both email and password");
      console.log("Please provide both email and password");
      return res.render("adminLogin");
    }

    const userdata = await Userdb.findOne({ email: adminEmail });
    if (!userdata) {
      req.flash("message", "Email Invalid: you are not an admin.");
      console.log("Admin login failed: user not found");
      return res.redirect("/admin/login");
    }
    // Check if user exists
    if (userdata) {
      const passwordMatch = await bcrypt.compare(
        adminPassword,
        userdata.password
      );

      // Check if the password matches
      if (passwordMatch) {
        // Check if the user is an admin
        if (userdata.role === "admin") {
          console.log("Admin logged in");
          req.session.admin_id = userdata._id;
          console.log("id===>", req.session.admin_id);
          return res.redirect("/admin/dashboard");
        } else {
          req.flash("message", "Login failed: you are not an admin.");
          console.log("Logging failed: not an admin");
          return res.redirect("/admin/login");
        }
      } else {
        req.flash("message", "Password Incorrect");
        console.log("Admin password does not match");
        return res.redirect("/admin/login");
      }
    } else {
      console.log("Admin login failed: user not found");
      return res.redirect("/admin/login");
    }
  } catch (err) {
    console.error("Error in checkAdmin:", err.message);
    req.flash("message", "Internal Server Error");
    // res.status(500).send("Internal Server Error");
    res.redirect("/admin/login");
  }
};

// -------logout admin------------------------------------------------------------->
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();

    res.redirect("/admin/login");
  } catch (err) {
    console.log(err.message);
  }
};

// -----render-dashbord ------ chart sale details--------------------------------------------->
const adminDash = async (req, res) => {
  try {
    const recentOrders = await Order.find({}).sort({ _id: -1 }).limit(5);

    const orders = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalOrderAmount: { $sum: "$total_amount" },
        },
      },
    ]);
    const totalProducts = await Product.aggregate([
      {
        $count: "totalProducts",
      },
    ]);

    const users = await Userdb.aggregate([
      {
        $sort: {
          _id: 1,
        },
      },
      {
        $limit: 4,
      },
    ]);
    const { totalOrders, totalOrderAmount } = orders[0];
    const product = totalProducts[0].totalProducts;
    console.log(
      "countProducts",
      product,
      "totalOrderAmount ",
      totalOrderAmount,
      " totalOrders",
      totalOrders
    );
    const monthlyRevenueData = await Order.aggregate([
      {
        $match: {
          status: { $ne: "Pending" },
        },
      },
      {
        $addFields: {
          date: {
            $dateFromString: {
              dateString: "$date",
              format: "%d/%m/%Y",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$date" },
            year: { $year: "$date" },
          },
          monthly_revenue: { $sum: "$total_amount" },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);
    console.log("monthlyRevenueData::", monthlyRevenueData);
    res.render("adminDashboard", {
      totalOrders,
      totalOrderAmount,
      product,
      users,
      recentOrders,
      monthlyRevenueData,
    });
  } catch (err) {
    console.log(err.message);
  }
};

// users show_page ------------------------------------------->
const showUser = async (req, res) => {
  try {
    const message = req.flash("message");

    const user = await Userdb.find({ role: "user" });
    res.render("showUser", { user, message });
  } catch (err) {
    console.log(err.message);
  }
};
// bloack user  -------------------------------------->

const blockUser = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    await Userdb.findByIdAndUpdate({ _id: id }, { $set: { status: "block" } });
    req.flash((messageType = "error"));
    req.flash("message", " user blocked");
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error);
  }
};
// unblock user-------------------------------->
const unblockUser = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id);
    const objectId = new mongoose.Types.ObjectId(id);
    // console.log(objectId+'new obj id');
    await Userdb.findByIdAndUpdate(
      { _id: objectId },
      { $set: { status: "unblock" } }
    );
    req.flash((messageType = "success"));
    req.flash("message", " Unblocked");
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error);
  }
};

//dashboard details
const dashboardData = async (req, res) => {
  try {
    const orderData = await Order.aggregate([
      {
        $match: {
          status: "Deliverd",
        },
      },
      {
        $group: {
          _id: {
            month: { $month: { $toDate: "$createdAt" } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);
    const orderCount = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    const orderStatusLabels = orderCount.map((item) => item._id);
    const orderStatusCounts = orderCount.map((item) => item.count);
    const productData = await Product.aggregate([
      {
        $group: {
          _id: {
            month: { $month: { $toDate: "$createdAt" } },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.month": 1,
        },
      },
    ]);
    // console.log("orderData::", orderData, "productData::", productData);
    // console.log(
    //   "orderStatusLabels:",
    //   orderStatusLabels,
    //   "orderStatusCounts:",
    //   orderStatusCounts
    // );
    // ---------------------------------------
    const yearlySalesData = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: { $toDate: "$createdAt" } },
          },
          totalSales: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
        },
      },
    ]);
    // console.log("yearlySalesData:::", yearlySalesData);

    const yearlySalesCounts = yearlySalesData.map((item) => item.totalSales);
    console.log("yearlySalesCounts:::", yearlySalesCounts);
    res.status(200).json({
      orderData,
      productData,
      orderStatusLabels,
      orderStatusCounts,
      yearlySalesCounts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// unblock user-------------------------------->
const salesReport = async (req, res) => {
  try {
    const deliveredOrders = await Order.find({
      status: "Deliverd",
      // ...dateFilter,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.productId",
        model: "products",
        select: "productName",
      });

    let totalQty = 0;
    let totalAmount = 0;
    // console.log("deliveredOrders::", deliveredOrders);
    // Check if there are any delivered orders
    if (deliveredOrders.length > 0) {
      // Extract first and last order dates
      const firstOrderDate = await Order.find().sort({ createdAt: 1 });
      const lastOrderDate = await Order.find().sort({ createdAt: -1 });

      deliveredOrders.forEach((order) => {
        const totalProductsCount = order.items.reduce(
          (sum, item) => sum + item.qty,
          0
        );
        order.totalProductsCount = totalProductsCount;
        totalQty += totalProductsCount;
        totalAmount += order.total_amount;
      });
      let firstOrder = moment(firstOrderDate[0].createdAt).format("YYYY-MM-DD");
      let lastOrder = moment(lastOrderDate[0].createdAt).format("YYYY-MM-DD");
      // console.log("firstOrderDate:", firstOrder, "lastOrderDate:", lastOrder);
      res.render("salesReport", {
        orders: deliveredOrders,
        totalQty: totalQty,
        totalAmount: totalAmount,
        firstOrder,
        lastOrder,
      });
    } else {
      res.render("salesReport", {
        orders: [],
        totalQty: 0,
        totalAmount: 0,
        firstOrder: null,
        lastOrder: null,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//sales
const sales = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    console.log("startDate::", startDate, "endDate:", endDate);

    const startDateObj = new Date(startDate);
    startDateObj.setHours(0, 0, 0, 0);
    const endDateObj = new Date(endDate);
    endDateObj.setHours(23, 59, 59, 999);

    // console.log("startDate::", startDate, "endDate::", endDate);
    // console.log("startDateObj::", startDateObj, "endDateObj::", endDateObj);

    const dateFilter = {};
    if (!isNaN(startDateObj.getTime()) && !isNaN(endDateObj.getTime())) {
      dateFilter.createdAt = {
        $gte: startDateObj,
        $lte: endDateObj,
      };
    }
    // console.log("dateFilter::", dateFilter);

    const deliveredOrders = await Order.find({
      status: "Deliverd",
      ...dateFilter,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "items.productId",
        model: "products",
        select: "productName",
      });
    console.log("deliveredOrders--->>", deliveredOrders);
    res.json({ success: true, orders: deliveredOrders });
  } catch (err) {
    console.log(err, err.message);
  }
};

module.exports = {
  adminLogin,
  sales,
  dashboardData,
  checkAdmin,
  adminDash,
  adminLogout,
  showUser,
  blockUser,
  salesReport,
  unblockUser,
};
