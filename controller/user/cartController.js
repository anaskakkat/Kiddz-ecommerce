const Product = require("../../model/productModal");
const Cart = require("../../model/cartModal");
const Userdb = require("../../model/userModel");


// -rendering cart page------------------------------------------------------------------------------
const showCart = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });
    if (!user) {
      res.redirect("/userLogin");
    } else {
      const cartDetails = await Cart.findOne({ userId: userid }).populate({
        path: "products.productId",
      });
      // const userData = await Userdb.findOne({ _id: userId });
      


      res.render("cart", {
        user,
        cartDetails,
        
      });
    }
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};

// add to cart ----------------------------------------------------------------------------------------------------------------->
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
      return res.redirect("/userLogin");
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


//delete cart item------------------------------------------------------------------------------------->
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
//update cart--------------------------------------------------------------------------------------->

const updateCart = async (req, res) => {
  try {
    const { productId, count } = req.body;
    const userId = req.session.user_id;
    // console.log("userId:", userId, "productId:", productId, "count:", count);
    const cart = await Cart.findOne({ userId: userId });
    if (!cart) {
      return res.json({ success: false, message: "Cart not found." });
    }

    const cartProduct = cart.products.find(
      (item) => item.productId.toString() === productId
    );
    if (!cartProduct) {
      return res.json({
        success: false,
        message: "Product not found in the cart.",
      });
    }
    const product = await Product.findById(productId);
    if (!product) {
      console.log("Product not found in the database.");
      return res.json({
        success: false,
        message: "Product not found in the database.",
      });
    }

    if (count == 1) {
      if (cartProduct.qty < 10 && cartProduct.qty < product.stock) {
        await Cart.updateOne(
          { userId: userId, "products.productId": productId },
          {
            $inc: {
              "products.$.qty": 1,
              "products.$.total_price": product.price,
            },
          }
        );
        return res.json({ success: true });
      } else {
        const maxAllowedQuantity = Math.min(10, product.stock);
        return res.json({
          success: false,
          message: `The maximum quantity available for this product is ${maxAllowedQuantity}. Please adjust your quantity.`,
        });
      }
    } else if (count == -1) {
      // Decrease quantity logic
      if (cartProduct.qty > 1) {
        await Cart.updateOne(
          { userId: userId, "products.productId": productId },
          {
            $inc: {
              "products.$.qty": -1,
              "products.$.total_price": -product.price,
            },
          }
        );
        return res.json({ success: true });
      } else {
        return res.json({
          success: false,
          message: "Quantity cannot be less than 1.",
        });
      }
    }
  } catch (err) {
    console.log("cart-error>>", err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




module.exports = {
  showCart,
  addToCart,
  deleteCart,
  updateCart,
};
