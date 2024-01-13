const Userdb = require("../../model/userModel");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// admin login -------------------------------------------------->/
const adminLogin = async (req, res) => {
  try {
    const messages = req.flash("message");
    res.render("adminLogin", { messages });
  } catch (err) {
    console.log(err, err.message);
  }
};
// -verify admin--------------------------------------------------->
const checkAdmin = async (req, res) => {
  try {
    const { adminEmail, adminPassword } = req.body;

    // Validate that email and password are provided
    if (!adminEmail || !adminPassword) {
      req.flash("message", "Please provide both email and password");
      console.log("Please provide both email and password");
      return res.render("adminLogin");
    }

    const userdata = await Userdb.findOne({ email: adminEmail });
    if (!userdata) {
      req.flash("message", "Email Invalid: you are not an admin.");
      console.log("Admin login failed: user not found");
      return res.redirect("/admin/login");
    }
    // Check if user exists
    if (userdata) {
      const passwordMatch = await bcrypt.compare(
        adminPassword,
        userdata.password
      );

      // Check if the password matches
      if (passwordMatch) {
        // Check if the user is an admin
        if (userdata.role === "admin") {
          console.log("Admin logged in");
          req.session.user_id = userdata._id;
          console.log('id===>',req.session.user_id );
          return res.render("adminDashboard");
        } else {
          req.flash("message", "Login failed: you are not an admin.");
          console.log("Logging failed: not an admin");
          return res.redirect("/admin/login");
        }
      } else {
        req.flash("message", "Password Incorrect");
        console.log("Admin password does not match");
        return res.redirect("/admin/login");
      }
    } else {
      console.log("Admin login failed: user not found");
      return res.redirect("/admin/login");
    }
  } catch (err) {
    console.error("Error in checkAdmin:", err.message);
    req.flash("message", "Internal Server Error");
    // res.status(500).send("Internal Server Error");
    res.redirect("/admin/login");
  }
};

// -------logout admin------------------------------------------------------------->
const adminLogout = async (req, res) => {
  try {
    req.session.destroy();

    res.redirect("/admin/login");
  } catch (err) {
    console.log(err.message);
  }
};

// -----render-dashbord --------------------------------------------------->
const adminDash = async (req, res) => {
  try {
    res.render("adminDashboard");
  } catch (err) {
    console.log(err.message);
  }
};

// users show_page ------------------------------------------->
const showUser = async (req, res) => {
  try {
    message = req.flash("message");

    const user = await Userdb.find({ role: "user" });
    res.render("showUser", { user, message });
  } catch (err) {
    console.log(err.message);
  }
};
// bloack user  -------------------------------------->

const blockUser = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    await Userdb.findByIdAndUpdate({ _id: id }, { $set: { status: "block" } });
    req.flash((messageType = "error"));
    req.flash("message", " user blocked");
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error);
  }
};
// unblock user-------------------------------->
const unblockUser = async (req, res) => {
  try {
    const id = req.params.id;
    // console.log(id);
    const objectId = new mongoose.Types.ObjectId(id);
    // console.log(objectId+'new obj id');
    await Userdb.findByIdAndUpdate(
      { _id: objectId },
      { $set: { status: "unblock" } }
    );
    req.flash((messageType = "success"));
    req.flash("message", " Unblocked");
    res.redirect("/admin/users");
  } catch (error) {
    console.log(error);
  }
};




module.exports = {
  adminLogin,

  checkAdmin,
  adminDash,
  adminLogout,

  showUser,
  blockUser,
  unblockUser,

};
