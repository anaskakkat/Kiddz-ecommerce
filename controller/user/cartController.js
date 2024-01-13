const Product = require("../../model/productModal");
const Cart = require("../../model/cartModal");
const Userdb = require("../../model/userModel");

const showCart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    const cartItems = await Cart.findOne({ userId: userid }).populate(
      "products.productId"
    );

    // // Calculate total on the server side
    // const calculateTotalQuantity = (products) => {
    //   let totalQuantity = 0;
    //   products.forEach((product) => {
    //     totalQuantity += product.qty;
    //   });
    //   return totalQuantity;
    // };
    // // Calculate total on the server side
    // const calculateTotalPrice = (products) => {
    //   let totalPrice = 0;
    //   products.forEach((product) => {
    //     totalPrice += product.productId.price * product.qty;
    //   });
    //   return totalPrice;
    // };
    // const totalPrice = calculateTotalPrice(cartItems.products);
    // const totalQuantity = calculateTotalQuantity(cartItems.products);
    // console.log('cart items==>',cartItems);
    res.render("cart", { cartItems, user });
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};

// add to cart ---------------------------------->
const addToCart = async (req, res) => {
  try {
    const productid = req.params.id;
    const cartQuantity = req.body.cartQuantity;
    const userid = req.session.user_id;

    const existingCartItem = await Cart.findOne({
      userId: userid,
      "products.productId": productid,
    });
    if (!userid) {
      return res.redirect('/userLogin');
    }

    if (existingCartItem) {
      await Cart.updateOne(
        { userId: userid, "products.productId": productid },
        { $inc: { "products.$.qty": cartQuantity } }
      );
    } else {
      await Cart.updateOne(
        { userId: userid },
        {
          $addToSet: { products: { productId: productid, qty: cartQuantity } },
        },
        { upsert: true }
      );
    }
    res.redirect("back");
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};
//---checkout------------------------------->
const checkout = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    res.render("checkout", { user });
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};

//delete cart item----------------------------------------->
const deleteCart = async (req, res) => {
  try {
    const productid = req.params.id;
    const userid = req.session.user_id;
    // console.log('uid==>',userid,'pid==>',productid);
    await Product.findOne({ _id: productid });
    await Cart.updateOne(
      { userId: userid },
      { $pull: { products: { productId: productid } } }
    );

    res.redirect("/cart");
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};
//update cart------------------------------->
 
const updateCart = async (req, res) => {
  try { 
    const { productId, quantity } = req.body;
    console.log('productId:', productId, 'quantity:', quantity);

    // Your logic for updating the cart based on productId and quantity

    // Send a response back
    res.json({ message: 'Cart updated successfully' });
  } catch (err) {
    console.log('cart-error>>', err.message);
    // Handle errors appropriately and send a response
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


module.exports = {
  showCart,
  addToCart,
  checkout,
  deleteCart,
  updateCart,
};
