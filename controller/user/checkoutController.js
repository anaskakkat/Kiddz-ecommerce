const Product = require("../../model/productModal");
const Cart = require("../../model/cartModal");
const Userdb = require("../../model/userModel");
const Order = require("../../model/orderModel");
const OrderId = require("order-id");
const Razorpay = require("razorpay");
const { response } = require("../../routers/userRoute");
const crypto = require("crypto");
const Coupons = require("../../model/coupenModel");

//razorpay secret

var instance = new Razorpay({
  key_id: "rzp_test_30bTTgzLa7YbmF",
  key_secret: "GcnWUhLqCmiOlWRlXG5Cm0ZS",
});
// Function to generate HMAC-SHA256
function hmac_sha256(data, key) {
  const hmac = crypto.createHmac("sha256", key);
  hmac.update(data);
  return hmac.digest("hex");
}
//-- load-checkout--------------------------------------------------------------------------->
const checkout = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    const cart = await Cart.findOne({ userId: userid }).populate({
      path: "items.productId",
    });
    // console.log("cart==>", cart);
    if (userid && cart) {
      let subTotal = 0;

      if (cart && cart.items) {
        // Assuming that items.product_id is populated with the product details
        cart.items.forEach(async (cartItem) => {
          let itemPrice = cartItem.productId.price; // Use the price from the populated product
          let itemQuantity = cartItem.qty;

          let itemTotal = itemPrice * itemQuantity;

          subTotal += itemTotal;
        });
      }
      const currentDate = new Date();
      const coupons = await Coupons.find({ expiryDate: { $gt: currentDate } });

      res.render("checkout", {
        user,
        cart,
        subTotal,
        coupons,
      });
    } else {
      res.redirect("/");
    }
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};
// place to order page

const PlaceToOrder = async (req, res) => {
  try {
    const userid = req.session.user_id;

    // console.log("body---------->", req.body);
    const { selectedAddress, selectedPayment, subTotal } = req.body;

    console.log(selectedAddress, selectedPayment, "subTotal::", subTotal);

    const userData = await Userdb.findOne({ _id: userid });

    // console.log("userData==>", userData);

    const cartData = await Cart.findOne({ userId: userid });
    // console.log("cartData==>", cartData);
    const cartProducts = cartData.items;
    // console.log("cartProducts==>", cartProducts);

    const date = new Date();
    const orderDate = date.toLocaleDateString("en-GB");
    const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
    const deliveryDate = delivery
      .toLocaleString("en-GB", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const orderid = new OrderId();
    const uniqueOrderId = orderid.generate();

    const order = new Order({
      orderId: uniqueOrderId,
      userId: userid,
      delivery_address: selectedAddress,
      user_name: userData.name,
      total_amount: subTotal,
      date: orderDate,
      status: "Pending",
      expected_delivery: deliveryDate,
      payment: selectedPayment,
      items: cartProducts,
    });

    //save
    let orderData = await order.save();
    const orderId = orderData._id;

    await Cart.deleteOne({ userId: userid });

    for (let i = 0; i < cartData.items.length; i++) {
      const productId = cartProducts[i].productId;
      const count = cartProducts[i].qty;

      await Product.updateOne({ _id: productId }, { $inc: { stock: -count } });
      // console.log("order placed");
      // return res.json({ success: true, params: orderId });
    }
    // console.log("orderId", orderId, "subTotal", subTotal);
    if (selectedPayment == "cod") {
      await Order.updateOne({ _id: orderId }, { $set: { status: "Placed" } });
      console.log("order placed");
      res.json({ codSuccess: true, params: orderId });
    } else {
      const razorpayOrder = await genarateRazorpay(orderId, subTotal);
      console.log("Razorpay order generated successfully", razorpayOrder);
      res.json({ razorpayOrder });
    }
  } catch (err) {
    console.log("error", err.message);
  }
};

// -----------------------------------------

const genarateRazorpay = async (orderId, subTotal) => {
  try {
    const options = {
      amount: subTotal * 100,
      currency: "INR",
      receipt: orderId.toString(),
    };

    const order = await instance.orders.create(options);
    // console.log("Razorpay order created:", order);
    return order;
  } catch (err) {
    console.error("Error creating Razorpay order:", err);
    // Handle errors appropriately, e.g., render an error page
  }
};

//verify payment from razorpay ----------------------------------------------------
const verifyPayment = async (req, res) => {
  try {
    console.log("body->", req.body);
    const razorpay_payment_id = req.body.payment.razorpay_payment_id;
    const razorpay_order_id = req.body.payment.razorpay_order_id;
    const razorpay_signature = req.body.payment.razorpay_signature;
    const receiptID = req.body.order.receipt;

    console.log("razorpay_payment_id:", razorpay_payment_id);
    console.log("razorpay_order_id:", razorpay_order_id);
    console.log("razorpay_signature:", razorpay_signature);
    console.log("recieptID:", receiptID);

    generated_signature = hmac_sha256(
      razorpay_order_id + "|" + razorpay_payment_id,
      "GcnWUhLqCmiOlWRlXG5Cm0ZS"
    );

    if (generated_signature == razorpay_signature) {
      console.log("payment is successful");
      const update = await Order.updateOne(
        { _id: receiptID },
        { $set: { status: "Placed", payment: "razorpay" } }
      );
      console.log("status changed");
    }
    res.json({ razorpaySuccess: true, params: receiptID });
  } catch (err) {
    // res.render('')
    console.log("razorpay-error>>", err.message);
  }
};

//add address from checout page----------------------------------------------------
const checkoutAddAddress = async (req, res) => {
  try {
    const userId = req.session.user_id;
    console.log(userId);
    const { name, mobile, pincode, address, landmark, city, state } = req.body;
    console.log("req.body=>", req.body);

    const user = await Userdb.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    user.address.push({
      name,
      mobile,
      pincode,
      address,
      landmark,
      city,
      state,
    });

    await user.save();
    req.flash("message", "address added ");
    console.log("address added...");
    res.redirect("/checkout");
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};
//load order succuss page----------------------------------------------------

const successPage = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("body----", id);
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    const order = await Order.findOne({ _id: id }).populate("items.productId");

    console.log("oreder-->", order);

    res.render("successPage", { user, order });
  } catch (err) {
    // res.render('')
    console.log("error", err.message);
  }
};
//validateCoupon----------------------------------------------------

const validateCoupon = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const couponCode = req.query.code;
    console.log("couponCode::", couponCode);
    const coupon = await Coupons.findOne({ couponCode });
    console.log("coupon::>", coupon);
    if (!coupon) {
      console.log("Coupon not found.");
      return res.json({ valid: false, error: "Coupon not found." });
    }
    const currentDate = new Date();
    const expiryDate = coupon.expiryDate;

    if (currentDate > expiryDate) {
      console.log("Coupon has expired..");

      return res.json({ valid: false, error: "Coupon has expired." });
    }
    const isCouponUsedByUser =
      coupon.usedBy && coupon.usedBy._id.equals(userid);
    if (isCouponUsedByUser) {
      return res.json({
        valid: false,
        error: "Coupon has already been used by this user.",
      });
    }
    const couponDiscount = coupon.discountAmount || 0;
    await Coupons.findOneAndUpdate(
      { couponCode },
      { $set: { usedBy: userid } }
    );

    console.log("Coupon is valid..");

    return res.json({
      valid: true,
      message: "Coupon applied.",
      discount: couponDiscount,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    console.log("Error validating coupon.");

    return res.json({ valid: false, error: "Error validating coupon." });
  }
};

module.exports = {
  checkout,
  successPage,
  PlaceToOrder,
  checkoutAddAddress,
  verifyPayment,
  validateCoupon,
};
