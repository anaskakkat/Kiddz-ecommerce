const getUserCart = async (req, res) => {
  const isAuthenticated = req.cookies.userAccessToken || false;
  let cartQty = req.cookies.cartQty;
  const userId = req.user;
  const cartItems = await CartModel.findOne({ userId: userId }).populate("items.productId");
  const totalQty = cartItems.items.reduce((sum,item)=>{
    return sum += item.quantity;
  },0)
  const totalPrice = cartItems.items.reduce((sum,item)=>{
    return sum += item.productId.price;
  },0)
  res.render("./user/cart", { isAuthenticated, cartQty, cartItems,totalQty,totalPrice });
};




const addToCart = async (req, res) => {
  const productId = req.params.productId;
  const cartQuantity = req.body.cartQuantity;
  console.log(cartQuantity);
  let userAccessToken = req.cookies.userAccessToken;
  const userId = userConfig.getUserId(userAccessToken);
  const updateCart = await CartModel.updateOne(
    { userId: userId, "items.productId": productId },
    { $inc: { "items.$.quantity": 1 } },
  );
  if (updateCart.matchedCount === 0) {
    await CartModel.updateOne(
      { userId: userId },
      {
        $addToSet: { items: { productId: productId, quantity: cartQuantity } },
      },
      { upsert: true },
    );
  }
  res.redirect("back");
};

const removeFromCart = async (req, res) => {
  const productId = req.params.productId;
  const userId = userConfig.getUserId(req.cookies.userAccessToken);
  console.log(productId, userId);
  const updateCart = await CartModel.updateOne(
    { userId: userId },
    { $pull: { items: { productId: productId } } },
  );
  res.redirect("back");
};