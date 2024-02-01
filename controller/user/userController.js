const Userdb = require("../../model/userModel");
const Products = require("../../model/productModal");
const Otp = require("../../model/otpVerification");
const WishList = require("../../model/wishlistModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const Category = require("../../model/category");
const { returnProduct } = require("./userAccountController");

// const validator = require("validator");

function isValidEmail(email) {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}
// render home page--------------------------------->
const sendHome = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await Userdb.findOne({ _id: userId });

    const proCat = await Category.find({ status: "Unblock" });
    const proDatas = await Products.aggregate([
      { $match: { isListed: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 8 },
    ]);

    res.render("userHome", { user, proCat, proDatas });
  } catch (err) {
    console.log("home error", err.message);
  }
};

//render  user sign up----------------------->
const signupUser = async (req, res) => {
  try {
    messages = req.flash("message");
    res.render("registration", { messages });
  } catch (err) {
    console.error(err);
  }
};

//  user verifyc otp  andcreate and save new User-------------->
// ceaste Otp --
const createOTP = () => {
  // Generate a random 4-digit OTP
  return Math.floor(1000 + Math.random() * 9000);
};
// ------send mail----------------------------------------------------
const sendOTPEmail = async (email, otp) => {
  // Configure nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.AUTH_MAIL,
      pass: process.env.AUTH_MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.AUTH_MAIL,
    to: email,
    subject: "OTP Verification",
    html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #3498db;">OTP Verification</h2>
      <p style="font-size: 16px;">Your OTP for registration is: <strong style="color: #e74c3c;">${otp}</strong></p>
      <p style="font-size: 14px; color: #777;">Please use this OTP to complete your registration process.</p>
    </div>
  `,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};
//  resentOtp------------------------------------------------->
const resentOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if the email exists in the database
    const existingUser = await Userdb.findOne({ email: email });

    if (!existingUser) {
      req.flash("message", "Email not found");
      return res.redirect("/resentOtp"); // Redirect to the resend OTP page
    }

    // Generate and save a new OTP
    const newOtpValue = createOTP();

    const otp = new Otp({
      email_id: email,
      otp: newOtpValue,
    });
    await Otp.findOneAndUpdate(
      { email_id: email },
      { $set: { otp: newOtpValue } },
      { upsert: true, new: true }
    );
    req.flash("message", "OTP resent successfully");
    // Send the new OTP via email
    await sendOTPEmail(email, newOtpValue);

    // Redirect to the resend OTP page with a success message
  } catch (err) {
    console.error(err);
    req.flash("message", "An error occurred during OTP resend");
    res.redirect("/resentOtp"); // Redirect to the resend OTP page with an error message
  }
};
//create user------------------------------------------------------------>
const createUser = async (req, res) => {
  try {
    if (!req.body) {
      return res.redirect("/registration");
    }
    // hash the password
    const email = req.body.userEmail;
    const existingEmail = await Userdb.findOne({ email: email });
    // console.log(email);
    if (existingEmail) {
      req.flash("message", "Email already in use");
      return res.redirect("/registration");
    }
    // Check if the mobile number is already in use
    const existingMobile = await Userdb.findOne({
      mobilenumber: req.body.userMobilenumber,
    });
    if (existingMobile) {
      req.flash("message", "Mobile number already in use");
      return res.redirect("/registration");
    }
    const hashedpassword = await bcrypt.hash(req.body.userPassword, 10);

    // create a new user
    const user = new Userdb({
      name: req.body.userName,
      mobilenumber: req.body.userMobilenumber,
      email: req.body.userEmail,
      password: hashedpassword,
      verified: false,
    });

    // save user in the database
    const savedUser = await user.save();
    console.log(savedUser);

    // Generate and save OTP
    const otpValue = createOTP();

    const otp = new Otp({
      email_id: email,
      otp: otpValue,
    });
    await Otp.deleteMany({});
    await otp.save();

    // Send OTP via email
    await sendOTPEmail(email, otpValue);
    console.log(email + "email for render");
    // res.redirect(`/otp?email=${req.body.userEmail}`);
    messages = req.flash("message");
    res.render("otp", { email, messages });
  } catch (err) {
    // handle error
    console.error(err);
    req.flash("message", "An error occurred during registration");
    res.redirect(`/registration`);
  }
};

// otp verifyrender  -------------------------------------------->
const verifyOtpPage = async (req, res) => {
  try {
    const { email, digit1, digit2, digit3, digit4 } = req.body;
    const enteredOtp = `${digit1}${digit2}${digit3}${digit4}`;
    console.log("otp verify email:----> " + email);

    const storedOtpData = await Otp.findOne({ email_id: email });
    const storedOtp = storedOtpData ? storedOtpData.otp : null;

    // console.log("new", enteredOtp, "old", storedOtp);

    if (enteredOtp === storedOtp) {
      await Userdb.updateOne({ email: email }, { $set: { verified: true } });
      console.log("otp successfully verified");
      req.flash("message", "Registered successfully");
      res.redirect("/userLogin");
    } else {
      req.flash("message", "Incorrect OTP. Please try again.");
      console.log("Incorrect OTP");
      const messages = req.flash("message"); // Retrieve flash messages

      res.render("otp", { email, messages });
    }
  } catch (err) {
    // Handle errors
    console.error(err);
    res.redirect("/otp");
  }
};

//  user login----------------------------------------->
const loginUser = async (req, res) => {
  try {
    messages = req.flash("message");
    res.render("userLogin", { messages });
  } catch (err) {
    console.log(err, err.message);
  }
};
//  user forget password otp----------------------------------------->

//  user logout----------------------------------------->
const userLogout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (err) {
    console.log("logout error", err.message);
  }
};

// user verify to login ///------------------------------->

const login = async (req, res) => {
  try {
    const email = req.body.loginEmail;
    const user = await Userdb.findOne({ email: email });
    // console.log('user email=>',user);
    if (!user) {
      req.flash("message", "invalid Email");
      return res.redirect("/userLogin");
    }

    if (user.verified === "false") {
      req.flash("message", "user not verifed please verify");

      console.log("user not verifed please verify");

      return res.redirect("/userLogin");
    }
    if (user.status == "block") {
      req.flash("message", "your blocked");

      return res.redirect("/userLogin");
    }
    const passwordMatch = await bcrypt.compare(
      req.body.loginPassword,
      user.password
    );

    if (passwordMatch) {
      req.session.user_id = user._id;
      // console.log('user.session-id==>',req.session.user_id);
      console.log("login succusfully");
      res.redirect("/");
    } else {
      console.log("login failed");
      req.flash("message", "Password Incorrect");
      res.redirect("/userLogin");
    }
  } catch (err) {
    // Handle other errors
    console.error(err);
    res.send("Error during login");
  }
};

// ------------------------------------------------------------------>
// show product in page/
const showProducts = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await Userdb.findOne({ _id: userId });
    const sortBy = req.query.sortBy || "default";

    const proCat = await Category.find({ status: "Unblock" });
    const proDatas = await Products.find({ isListed: true }).sort(
      sortBy === "priceLow"
        ? { price: 1 }
        : sortBy === "priceHigh"
        ? { price: -1 }
        : sortBy === "newest"
        ? { createdAt: 1 }
        : {}
    );
    res.render("showproducts", { proDatas, proCat, user, sortBy });
  } catch (err) {
    console.log("home error", err);
  }
};

// single product showing ----------------------------->

const singleProducts = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const user = await Userdb.findOne({ _id: userId });
    const id = req.query.id;

    // console.log('iddd----'+id);
    const singleproducts = await Products.findOne({ _id: id });
    // console.log("datas in products=> "+ singleproducts);
    const messages = req.flash("message");
    res.render("singleProductPage", { singleproducts, user, messages });
  } catch (err) {
    console.log("home error", err.message);
  }
};

//category wise product show]---------------------------------->
const catShowProducts = async (req, res) => {
  try {
    const catShow = req.params.categoryName;
    const sortBy = req.query.sortBy || "default";

    console.log("catname:=>", catShow, "sortBy", sortBy);
    const proCat = await Category.find({ status: "Unblock" });

    // const proDatas = await Products.find({ isListed: true, category: catShow });
    const proDatas = await Products.find({
      isListed: true,
      category: catShow,
    }).sort(
      sortBy === "priceLow"
        ? { price: 1 }
        : sortBy === "priceHigh"
        ? { price: -1 }
        : sortBy === "newest"
        ? { createdAt: 1 }
        : {}
    );
    console.log("proDatas::", proDatas);

    res.render("showProducts", { proDatas, proCat, sortBy });
  } catch (err) {
    console.log("home error", err.message);
  }
};
// ------forgotPassword------------------------------------------------------------------------>
//forget mail page show
const forgotPassword = async (req, res) => {
  try {
    messages = req.flash("message");
    res.render("forgetMail", { messages });
  } catch (err) {
    console.log(err, err.message);
  }
};
//forget mail page post check
const forgetEmailCheck = async (req, res) => {
  try {
    const enteredEmail = req.body.email;
    // console.log(enteredEmail);
    const existUser = await Userdb.findOne({ email: enteredEmail });
    // console.log(existUser);
    if (!existUser || !isValidEmail(enteredEmail)) {
      req.flash("message", "No User Found");
      return res.redirect("/forgotPassword");
    }

    const otpValue = createOTP();

    const otp = new Otp({
      email_id: enteredEmail,
      otp: otpValue,
    });
    await Otp.deleteMany({});
    await otp.save();

    // Send OTP via email
    await sendOTPEmail(enteredEmail, otpValue);
    // console.log(enteredEmail + "email for render");
    // res.redirect(`/otp?email=${req.body.userEmail}`);
    messages = req.flash("message");
    res.render("forgetOtp", { messages, enteredEmail });
  } catch (err) {
    console.log(err, err.message);
  }
};
// otp verifyrender  -------------------------------------------->
const forgetVerifyOtpPage = async (req, res) => {
  try {
    const { email, digit1, digit2, digit3, digit4 } = req.body;
    console.log("otp email", email);
    const enteredOtp = `${digit1}${digit2}${digit3}${digit4}`;

    const storedOtpData = await Otp.findOne({ email_id: email });
    const storedOtp = storedOtpData ? storedOtpData.otp : null;

    // console.log("new", enteredOtp, "old", storedOtp);

    if (enteredOtp === storedOtp) {
      console.log("otp successfully verified");
      console.log("email for render", email);
      res.render("NewPassword", { email, messages });
    } else {
      console.log("Incorrect OTP");
      req.flash("message", "Incorrect OTP. Please submit again.");
      return res.redirect("/forgotPassword");
    }
  } catch (err) {
    // Handle errors
    console.error(err);
    // res.redirect("/otp");
  }
};

//  user new password verifyning save----------------------------------------->
const newPasswordVerify = async (req, res) => {
  try {
    const email = req.body.email;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    console.log(
      "newPassword  ",
      newPassword,
      "   confirmPassword  ",
      confirmPassword,
      "   email  ",
      email
    );
    // Example server-side validation
    if (newPassword.trim() !== confirmPassword.trim()) {
      req.flash("message", "Passwords do not match");
      return res.redirect("/newPassword");
    }
    const hashedpassword = await bcrypt.hash(newPassword, 10);

    await Userdb.updateOne(
      { email: email },
      { $set: { password: hashedpassword } }
    );
    console.log("Password Changed");
    req.flash("message", "Password Changed");
    res.redirect("/userLogin");
  } catch (err) {
    console.log(err, err.message);
    return res.redirect("/newPassword");
  }
};

// live_search-------------------------------->
const live_search = async (req, res) => {
  console.log("Live search route called");

  try {
    const searchTerm = req.query.q;
    console.log("Search Term:", searchTerm);
    const regex = new RegExp(searchTerm, "i"); // 'i' for case-insensitive search

    const results = await Products.find({ productName: regex });
    console.log("Query Results:", results);

    res.json(results);
  } catch (err) {
    console.log("error", err.message);
  }
};


module.exports = {
  createUser,
 
  live_search,
  showProducts,
  sendHome,
  loginUser,
  signupUser,
  login,
  userLogout,
  resentOtp,
  verifyOtpPage,
  singleProducts,
  catShowProducts,
  forgotPassword,
  forgetEmailCheck,
  forgetVerifyOtpPage,
  newPasswordVerify,
};
