const Product = require("../../model/productModal");
const Cart = require("../../model/cartModal");
const Userdb = require("../../model/userModel");
const Order = require("../../model/orderModel");

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
      res.render("checkout", {
        user,
        cart,
        subTotal,
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

    console.log(selectedAddress, selectedPayment, subTotal);

    const userData = await Userdb.findOne({ _id: userid });

    // console.log("userData==>", userData);

    const cartData = await Cart.findOne({ userId: userid });
    // console.log("cartData==>", cartData);
    const cartProducts = cartData.items;
    // console.log("cartProducts==>", cartProducts);
    //  const totalQuantity = cartProducts.reduce((total, item) => total + item.quantity, 0);
    // date make
    const date = new Date();
    const orderDate = date.toLocaleDateString();
    const delivery = new Date(date.getTime() + 10 * 24 * 60 * 60 * 1000);
    const deliveryDate = delivery
      .toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "2-digit",
      })
      .replace(/\//g, "-");

    const order = new Order({
      userId: userid,
      delivery_address: selectedAddress,
      user_name: userData.name,
      total_amount: subTotal,
      date: orderDate,
      status: 'Placed',
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

      await Product.updateOne(
        { _id: productId },
        { $inc: { stock: -count } }
      );
      console.log("order placed");
      return res.json({ success: true, params: orderId });

    }
    console.log("order placed");
    res.json({ success: true,params: orderId });
    
  } catch (err) {

    console.log("error", err.message);
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
    const id=req.params.id
    console.log('body----',id);
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    const order = await Order.findOne({ _id: id }).populate("items.productId");

console.log('oreder-->',order);

    res.render("successPage", { user,order });
  } catch (err) {
    // res.render('')
    console.log("error", err.message);
  }
};
module.exports = {
  checkout,
  successPage,
  PlaceToOrder,
  checkoutAddAddress,
};
