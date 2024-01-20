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
      res.render("otp", { email ,messages});
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
  
        res.render("otp",{email,messages});
      }
    } catch (err) {
      // Handle errors
      console.error(err);
      res.redirect("/otp");
    }
  };