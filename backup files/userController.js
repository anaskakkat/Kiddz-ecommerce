const Userdb = require("../../model/userModel");
const Otp = require("../../model/otpVerification");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

// const validator = require("validator");

// render home page--------------------------------->
const sendHome = async (req, res) => {
  try {
    console.log('session id==>',req.session.user_id);
    res.render("userHome", { user: req.session.user_id });
  } catch (err) {
    console.log("home error", err.message);
  }
};

//render  user sign up-------------->
const signupUser = async (req, res) => {
  try {
    messages = req.flash("message");
    res.render("registration", { messages });
  } catch (err) {
    console.error(err);
  }
};
// otp rendr --------------------------------------->

const otpPage = async (req, res) => {
  try {
    const email = req.query.email;

    res.render("otp", { email });
  } catch (err) {
    console.log("home error", err.message);
  }
};

//  user verifyc otp  andcreate and save new User-------------->

const createOTP = () => {
  // Generate a random 4-digit OTP
  return Math.floor(1000 + Math.random() * 9000);
};

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
    text: `Your OTP for registration is: ${otp}`,
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

const createUser = async (req, res) => {
  try {
    if (!req.body) {
      const messages = req.flash("message");
      return res.redirect("/registration", { messages });
    }
    // hash the password
    const hashedpassword = await bcrypt.hash(req.body.userPassword, 10);
    const email = req.body.userEmail;
    const existingEmail = await Userdb.findOne({ email: email });
    // console.log(email);
    if (existingEmail === true) {
      req.flash("message", "content cannot error");
      return res.redirect("/registration");
    }

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
    res.redirect(`/otp?email=${req.body.userEmail}`); // Render a page for OTP verification
  } catch (err) {
    // handle error
    console.error(err);
    res.redirect(`/registration`);
  }
};

// otp verifyrender  -------------------------------------------->
const verifyOtpPage = async (req, res) => {
  try {
    const { email, digit1, digit2, digit3, digit4 } = req.body;
    const enteredOtp = `${digit1}${digit2}${digit3}${digit4}`;
    console.log("otp verify email:----> " + email);

    // Retrieve stored OTP from the database

    const storedOtpData = await Otp.findOne({ email_id: email });
    const storedOtp = storedOtpData ? storedOtpData.otp : null;

    console.log("new==>", enteredOtp, "old==>", storedOtp);
    // Compare entered OTP with stored OTP
    if (enteredOtp === storedOtp) {
      await Userdb.updateOne({ email: email }, { $set: { verified: true } });
      console.log("otp successfully verified");
      res.render("userLogin"); // Render a success page
    } else {
      // Incorrect OTP
      req.flash("message", "Incorrect OTP. Please try again.");
      console.log("Incorrect OTP");
      res.redirect("/otp"); // Redirect the user back to the OTP verification page
    }
  } catch (err) {
    // Handle errors
    console.error(err);
    res.redirect("/otp");
  }
};




//  user login-------------->
const loginUser = async (req, res) => {
  try {
    messages = req.flash("message");
    res.render("userLogin", { messages });
    console.log(messages, "log flash");
  } catch (err) {
    console.log(err, err.message);
  }
};

//  user logout-------------->
const userLogout = (req, res) => {
  try {
    req.session.destroy();
    res.redirect("/");
  } catch (err) {
    console.log("logout error", err.message);
  }
};

// user verify to login ///---------------------->

const login = async (req, res) => {
  try {
    const user = await Userdb.findOne({ email: req.body.loginEmail });

    if (!user) {
      req.flash("message", "invalid Email");
      return res.redirect("/userLogin");
    }
    if (user.status === "block") {
      req.flash("message", "Your account is blocked. Please contact support.");
      return res.redirect("/userLogin");
    }

    if(user.verified==='false'){
      req.flash("message", "Your account not verified pls verify");

      return res.redirect('/userLogin')
    }

    const passwordMatch = await bcrypt.compare(
      req.body.loginPassword,
      user.password
    );

    if (passwordMatch) {
      req.session.user_id = user._id;
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

module.exports = {
  createUser,
  sendHome,
  loginUser,
  signupUser,
  login,
  userLogout,
  otpPage,
  verifyOtpPage,
};
