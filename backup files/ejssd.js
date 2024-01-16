try {
    const productid = req.params.id;
    const cartQuantity = req.body.cartQuantity;
    const userid = req.session.user_id;
    if (!userid) {
      res.redirect("/userLogin");
    } else {
      const product = await Product.findOne({ _id: productid });
      const cart = await Cart.findOne({ userId: userid });

      if (cart) {
        const existProduct = cart.items.find((x) => x.productId.toString() === productid);          if (existProduct) {
            // Update existing product in the cart
            await Cart.findOneAndUpdate(
                { userId: userid, 'items.productId': productid },
                {
                    $inc: {
                        'items.$.qty': quantity,
                        'items.$.total_price': quantity * existProduct.price
                    }
                  }
        };
      }else{
// Add new product to the cart
await Cart.findOneAndUpdate(
  { userId: userid },
  {
      $push: {
          items: {
            productId: productid,
              qty: quantity,
              price: product.price,
              total_price: quantity * product.price
          }
      }
  }
);
      }else{
 // Create a new cart and add the product
 const newCart = new Cart({
  userId: userid,
  items: [{
    productId: productid,
      qty: quantity,
      price: product.price,
      total_price: quantity * product.price
  }]
});

await newCart.save();
      }
    



      
           

          

     
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};