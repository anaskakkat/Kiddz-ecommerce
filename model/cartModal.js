const mongoose = require("mongoose");

const cartSchema =new  mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Userdbs",
    required: true,
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "products",
        required: true,
      },
      qty: {
        type: Number,
        required: true,
        default: 1,
      },
      total_price : {
        type : Number,
        required : true
    },
    price : {
      type : Number,
      required: true
  },
  status: {
    type:String,
    default:"pending"
},
    },
  ],
  
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
