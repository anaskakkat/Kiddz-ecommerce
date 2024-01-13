
const Userdb = require("../../model/userModel");

//user profile-------------------------------------------->
const userProfile = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    res.render("userProfile", { user });
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
      { _id: userid},
      { $pull:{address:{_id:addressid}} }
    );
    req.flash("message", "Address Deleted ");
    console.log("address deleted");
    res.redirect("/address");
  } catch (err) {
    console.log("cart-error>>", err.message);
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
};
