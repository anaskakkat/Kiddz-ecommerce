const Cart = require("../model/cartModal");

const fetchCartCount = async (req, res, next) => {
  try {
    const userid = req.session.user_id;
    const cartDetails = await Cart.findOne({ userId: userid });
    const cartCount = cartDetails ? cartDetails.items.length : 0;

    res.locals.cartCount = cartCount;
    next();
  } catch (err) {
    console.log("fetchCartCount error:", err.message);
    next(err);
  }
};

module.exports = { fetchCartCount };
