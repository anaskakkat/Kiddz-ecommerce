const Product = require("../../model/productModal");
const Order = require("../../model/orderModel");

// admin order page ----------------------------------------------------->
const orders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / pageSize);

    const ordersList = await Order.find({})
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);

    message = req.flash("message");
    res.render("orders", {
      ordersList,
      message,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    console.log("error lodaing ejs", error);
  }
};
// admin order details ----------------------------------------------------->

const orderDetails = async (req, res) => {
  try {
    message = req.flash("message");
    const orderID = req.params.id;
    // console.log("orderID:", orderID);

    const orderDetails = await Order.findOne({ _id: orderID })
      .populate("userId")
      .populate("items.productId");
    console.log("orderDetails", orderDetails);

    res.render("orderDetails", { message, orderDetails });
  } catch (error) {
    console.log("error lodaing ejs", error);
  }
};
//order status change-------------------------------------------->
const changeStatus = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const status = req.body.status;
    // console.log("orderId", orderId, "status", status);/
    await Order.updateOne({ _id: orderId }, { $set: { status: status } });

    console.log("status updated to =>", status);
    res.json({ updatedStatus: status });
  } catch (err) {
    // res.render('')
    console.log("error>>", err.message);
  }
};
module.exports = {
  orders,
  orderDetails,
  changeStatus,
};
