const Product = require("../../model/productModal");
const Cart = require("../../model/cartModal");
const Userdb = require("../../model/userModel");
const Order = require("../../model/orderModel");
const WishList = require("../../model/wishlistModel");

// load wishlist-------------------------------->
const wishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await Userdb.findOne({ _id: userId });
    const wishlistList = await WishList.find({ orderby: userId }).populate(
      "products.product"
    );
    if (wishlistList.length === 0) {
      // If wishlist is empty, handle this scenario (e.g., show a message to the user)
      console.log("Wishlist is empty");
      res.render("wishlist", { user, wishlistList });
      return;
    }
    // console.log(wishlistList[0].products);
    // console.log("wishlistList::", wishlistList);

    res.render("wishlist", { user, wishlistList });
  } catch (err) {
    console.log("error", err.message);
  }
};
// addToWishlist-------------------------------->
const addToWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.body.productId;
    const price = req.body.price;
    console.log("userId:", userId, "productId:", productId, "price:", price);

    // Check if the user has an existing wishlist
    const existingWishlist = await WishList.findOne({ orderby: userId });

    if (existingWishlist) {
      // Check if the product already exists in the wishlist
      const isProductAlreadyInWishlist = existingWishlist.products.some(
        (product) => product.product.toString() === productId
      );

      if (isProductAlreadyInWishlist) {
        return res.json({
          success: false,
          message: "Product already exists in the wishlist",
        });
      }

      // Add the new product to the existing wishlist
      existingWishlist.products.push({
        product: productId,
        price: price,
      });

      // Save the updated wishlist
      const updatedWishlist = await existingWishlist.save();

      return res.json({
        success: true,
        message: "Item added to wishlist successfully",
        wishlist: updatedWishlist,
      });
    } else {
      // If the user doesn't have a wishlist, create a new one
      const wishlistItem = new WishList({
        products: [
          {
            product: productId,
            price: price,
          },
        ],
        orderby: userId,
      });

      const savedWishlistItem = await wishlistItem.save();
      return res.json({
        success: true,
        message: "Item added to wishlist successfully",
        wishlist: savedWishlistItem,
      });
    }
  } catch (err) {
    console.error("Error:", err.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
//delete whishlist
const deleteWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const productIdToRemove = req.body.productId;
    console.log("productIdToRemove:", productIdToRemove);

    const updatedWishlist = await WishList.findOneAndUpdate(
      { orderby: userId },
      { $pull: { products: { product: productIdToRemove } } },
      { new: true }
    );
    res.json({ success: true, message: "Product removed from wishlist" });
  } catch (err) {
    console.log("error", err.message);
  }
};
module.exports = {
  addToWishlist,
  wishlist,
  deleteWishlist,
};
