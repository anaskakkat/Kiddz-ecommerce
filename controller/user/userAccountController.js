const Product = require("../../model/productModal");
const Cart = require("../../model/cartModal");
const Userdb = require("../../model/userModel");
const Order = require("../../model/orderModel");

//user profile-------------------------------------------->
const userProfile = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });
    const messages = req.flash("message");
    res.render("userProfile", { user, messages });
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};

//  show  address-------------------------------------------->
const showAddress = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    const message = req.flash("message");
    res.render("address", { user, message });
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};

// add  address-------------------------------------------->
const addAddress = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    res.render("addAddress", { user });
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};
// save  address-------------------------------------------->
const saveAddress = async (req, res) => {
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
    res.redirect("/address");
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};
//-edit address------------------------->
const editAddress = async (req, res) => {
  try {
    const addressid = req.params.id;
    // console.log('address-id=>',addressid);
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });
    const users = await Userdb.findOne(
      { _id: userid, "address._id": addressid },
      { "address.$": 1 }
    );
    // console.log('user id =>',users);

    res.render("editAddress", { user, users });
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};
//update addresses-------------------------------->

const updateAddress = async (req, res) => {
  try {
    const addressid = req.params.id;
    // console.log('address-id=>',addressid);

    const userId = req.session.user_id;
    // console.log(userId);
    const { name, mobile, pincode, address, landmark, city, state } = req.body;
    // console.log("req.body=>", req.body);
    const user = await Userdb.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    await Userdb.updateOne(
      { _id: userId, "address._id": addressid },
      {
        $set: {
          "address.$.name": name,
          "address.$.mobile": mobile,
          "address.$.pincode": pincode,
          "address.$.address": address,
          "address.$.landmark": landmark,
          "address.$.city": city,
          "address.$.state": state,
        },
      }
    );
    req.flash("message", "address updated ");
    console.log("address updated...");
    res.redirect("/address");
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};
//delete address
const deleteAddress = async (req, res) => {
  try {
    const addressid = req.params.id;
    // console.log("address-id=>", addressid);
    const userid = req.session.user_id;
    // const user = await Userdb.findOne({ _id: userid });
    await Userdb.findOneAndUpdate(
      { _id: userid },
      { $pull: { address: { _id: addressid } } }
    );
    req.flash("message", "Address Deleted ");
    console.log("address deleted");
    res.redirect("/address");
  } catch (err) {
    console.log("cart-error>>", err.message);
  }
};
//user orders-------------------------------------------->
const ordePageUser = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    const orderDetails = await Order.find({ userId: userid });

    // console.log("orderDetails==>", orderDetails);
    res.render("orderPage", { user, orderDetails });
  } catch (err) {
    // res.render('')
    console.log("cart-error>>", err.message);
  }
};
//user orders details-------------------------------------------->
const userOrderDetails = async (req, res) => {
  try {
    const orderId = req.params.orderID;
    // console.log("orderId:::", orderId);
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });
    const orderLists = await Order.findOne({ _id: orderId })
      .populate("userId")
      .populate("items.productId");

    // console.log("orderLists==>", orderLists);
    res.render("userOrderDetails", { user, orderLists });
  } catch (err) {
    // res.render('')
    console.log("error>>", err.message);
  }
};
//user return orders-------------------------------------------->
const returnProduct = async (req, res) => {
  try {
    const { orderId, returnReason } = req.body;
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { returnReason: returnReason, status: "Returned" } },
      { upsert: true }
    );
    for (const item of order.items) {
      // Find the product by ID and update its quantity
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.qty },
      });
    }
    console.log("stock item updated");
    res.json("success:true");
    // res.redirect('back')
  } catch (err) {
    // res.render('')
    console.log("error>>", err.message);
  }
};
//user canceled orders-------------------------------------------->
const canceledProduct = async (req, res) => {
  try {
    const { orderId, cancelReason } = req.body;
    console.log(orderId, "cancle reaosn", cancelReason);
    const order = await Order.findOneAndUpdate(
      { _id: orderId },
      { $set: { cancelationReason: cancelReason, status: "Canceled" } },
      { upsert: true }
    );
    for (const item of order.items) {
      // Find the product by ID and update its quantity
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: item.qty },
      });
    }
    console.log("cancle updated");
    // res.json('success:true')
  } catch (err) {
    // res.render('')
    console.log("error>>", err.message);
  }
};
// update user details
const updateProfile = async (req, res) => {
  try {
    const { name, mobilenumber, email } = req.body;
    const user = await Userdb.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Update only the name and mobilenumber
    user.name = name;
    user.mobilenumber = mobilenumber;
    const updatedUser = await user.save();
    req.flash("message","profile updated succussfully");
    console.log("profile updated succussfully");
    res.json('succuss:true')
    } catch (err) {
    // res.render('')
    console.log("error>>", err.message);
  }
};

module.exports = {
  userProfile,
  addAddress,
  showAddress,
  saveAddress,
  editAddress,
  updateAddress,
  deleteAddress,
  ordePageUser,
  userOrderDetails,
  returnProduct,
  canceledProduct,
  updateProfile,
};
