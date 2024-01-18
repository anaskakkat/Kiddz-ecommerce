const Product = require("../../model/productModal");
const Order = require("../../model/orderModel");

// admin order page ----------------------------------------------------->
const orders = async (req, res) => {
  try {
    message = req.flash("message");
    const ordersList = await Order.find({});

    // Render the admin panel view with the categories data
    res.render("orders", { ordersList, message });
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
    // console.log("orderDetails", orderDetails);

    // Render the admin panel view with the categories data
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

    console.log("status updated to =>",status);
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
