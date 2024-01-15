const Product = require("../../model/productModal");
const Cart = require("../../model/cartModal");
const Userdb = require("../../model/userModel");

//-- load-checkout--------------------------------------------------------------------------->
const checkout = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    const cart = await Cart.findOne({ userId: userid }).populate({
      path: "products.productId",
    });
    // console.log("cart==>", cart);
    if (userid && cart) {
      let subTotal = 0;

      if (cart && cart.products) {
        // Assuming that items.product_id is populated with the product details
        cart.products.forEach(async (cartItem) => {
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


const placeToOrder = async (req, res) => {
  try {
   const date=new Date()
   console.log('body---------->',req.body);
           



  } catch (err) {
    // res.render('')
    console.log("error", err.message);
  };
}














//load order succuss page 

const successPage = async (req, res) => {
    try {
      const userid = req.session.user_id;
      const user = await Userdb.findOne({ _id: userid });
              // res.render("successPage",{user});
    } catch (err) {
      // res.render('')
      console.log("error", err.message);
    };
}
module.exports = {
  checkout,
  successPage,
  placeToOrder
};
