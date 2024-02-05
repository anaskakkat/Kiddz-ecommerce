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
        path: "items.productId",
      });

      if (cartDetails && cartDetails.items) {
        let originalAmts = 0;

        cartDetails.items.forEach((cartItem) => {
          let itemPrice = cartItem.price;
          originalAmts += itemPrice * cartItem.quantity;
        });

        console.log("cartDetails..length::", cartDetails.items.length);
        const cartCount = cartDetails.items.length;

        res.render("cart", {
          user,
          cartDetails,
          subTotal: originalAmts,
          cartCount,
        });
      } else {
        res.render("cart", {
          user,
          cartDetails: null,
          subTotal: 0,
          cartCount: 0,
        });
      }
    }
  } catch (err) {
    console.log("cart-error>>", err.message);
  }
};

const addToCart = async (req, res) => {
  try {
    const productId = req.params.id;
    const cartQuantity = req.body.cartQuantity;
    const userId = req.session.user_id;
    console.log("cartQuantity:", typeof cartQuantity);
    if (!userId) {
      res.json({ success: false, message: "User not logged in." });
    } else {
      const product = await Product.findOne({ _id: productId });

      if (!product) {
        res.json({ success: false, message: "Product not found." });
        return;
      }

      const cart = await Cart.findOne({ userId: userId });

      if (cart) {
        const existProductIndex = cart.items.findIndex(
          (x) => x.productId.toString() === productId
        );

        if (existProductIndex !== -1) {
          // Update existing product in the cart
          const existingProduct = cart.items[existProductIndex];
          const updatedQuantity = existingProduct.qty + Number(cartQuantity);

          // Check if stock is sufficient
          if (updatedQuantity > product.stock) {
            res.json({
              success: false,
              message: `You have already added ${existingProduct.qty} to the cart. The available stock is limited.`,
            });
            return;
          }

          const updatedTotalPrice = updatedQuantity * existingProduct.price;

          await Cart.updateOne(
            { userId: userId, "items.productId": productId },
            {
              $set: {
                "items.$.qty": updatedQuantity,
                "items.$.total_price": updatedTotalPrice,
              },
            }
          );
        } else {
          // Add new product to the cart
          if (cartQuantity > product.stock) {
            res.json({ success: false, message: "Insufficient stock." });
            return;
          }

          await Cart.updateOne(
            { userId: userId },
            {
              $push: {
                items: {
                  productId: productId,
                  qty: cartQuantity,
                  price: product.price,
                  total_price: cartQuantity * product.price,
                },
              },
            }
          );
        }
      } else {
        // Create a new cart and add the product
        if (cartQuantity > product.stock) {
          res.json({ success: false, message: "Insufficient stock." });
          return;
        }

        const newCart = new Cart({
          userId: userId,
          items: [
            {
              productId: productId,
              qty: cartQuantity,
              price: product.price,
              total_price: cartQuantity * product.price,
            },
          ],
        });

        await newCart.save();
      }

      res.json({ success: true, message: "Product added to the cart." });
    }
  } catch (err) {
    console.log("cart-error>>", err.message);
    res.status(500).json({ success: false, error: err.message });
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
      { $pull: { items: { productId: productid } } }
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

    const cartProduct = cart.items.find(
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
          { userId: userId, "items.productId": productId },
          {
            $inc: {
              "items.$.qty": 1,
              "items.$.total_price": product.price,
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
          { userId: userId, "items.productId": productId },
          {
            $inc: {
              "items.$.qty": -1,
              "items.$.total_price": -product.price,
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
