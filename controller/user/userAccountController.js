const Product = require("../../model/productModal");
const Cart = require("../../model/cartModal");
const Userdb = require("../../model/userModel");
const Order = require("../../model/orderModel");
const bcrypt = require("bcrypt");
const path = require("path");
const PDFDocument = require("pdfkit");

// ---------------------------------------------------
function generateTableRow(
  doc,
  y,
  item,
  description,
  unitCost,
  quantity,
  lineTotal
) {
  doc
    .fontSize(10)
    .text(item, 50, y)
    .text(description, 150, y)
    .text(unitCost, 280, y, { width: 90, align: "right" })
    .text(quantity, 370, y, { width: 90, align: "right" })
    .text(lineTotal, 0, y, { align: "right" });
}

function generateHr(doc, y) {
  doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
}

// ------------------------------------------------------------------
const generatePdf = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });

    // Assuming there is an Order model in your application
    const order = await Order.findById(orderId).populate("items.productId");
    console.log("order:>", order);
    if (!order) {
      return res.status(404).send("Order not found");
    }

    // Create a new PDF document
    let doc = new PDFDocument({ size: "A4", margin: 50 });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${orderId}.pdf`);

    // Pipe the PDF content to the response stream
    doc.pipe(res);

    // Add content to the PDF
    doc
      // .image("logo.png", 50, 45, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text("Shopin Pvt Ltd.", 110, 57)
      .fontSize(10)
      .text("123 Main Street", 200, 65, { align: "right" })
      .text("India,KL,0494", 200, 80, { align: "right" })
      .moveDown();
    //body

    doc.fillColor("#444444").fontSize(20).text("Invoice", 50, 160);

    generateHr(doc, 185);

    const customerInformationTop = 200;

    doc
      .fontSize(10)
      .text("Invoice Number:", 50, customerInformationTop)
      .font("Helvetica-Bold")
      .text(order.orderId, 150, customerInformationTop)
      .font("Helvetica")
      .text("Invoice Date:", 50, customerInformationTop + 15)
      .text(order.date, 150, customerInformationTop + 15)

      .font("Helvetica")
      .text("Shipping Address", 300, customerInformationTop)
      .text(order.delivery_address, 300, customerInformationTop + 15)
      .moveDown();

    generateHr(doc, 252);
    //table
    let i;
    const invoiceTableTop = 330;

    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "#",
      "Product",
      "Unit Cost",
      "Quantity",
      "Total"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");

    for (i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      const position = invoiceTableTop + (i + 1) * 30;
      const serialNumber = String.fromCharCode("1".charCodeAt(0) + (i % 26));

      const productName = item.productId ? item.productId.productName : "N/A";
      console.log("productName::", productName);
      generateTableRow(
        doc,
        position,
        serialNumber,
        productName,
        item.price,
        item.qty,
        item.total_price
      );

      generateHr(doc, position + 20);
    }

    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "Total Amount",
      "",
      order.total_amount
    );

    doc.font("Helvetica");
    //footer
    doc.fontSize(10).text(" Thank you for your business.", 50, 780, {
      align: "center",
      width: 500,
    });
    doc.end();

    console.log("PDF created and sent");
  } catch (err) {
    console.error("generatePdf error:", err.message);
    // Handle the error as needed
    res.status(500).send("Error generating PDF");
  }
};
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
//load changepassword-------------------------------------------->
const changePassword = async (req, res) => {
  try {
    const userid = req.session.user_id;
    const user = await Userdb.findOne({ _id: userid });
    const messages = req.flash("message");
    res.render("changePassword", { user, messages });
  } catch (err) {
    // res.render('')
    console.log("error>>", err.message);
  }
};
//save  change password-------------------------------------------->
const saveChangePassword = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const oldPassword = req.body.old_password;
    const newPassword = req.body.new_password;
    const confirmPassword = req.body.confirm_password;

    const user = await Userdb.findById(userId);

    // Check if the old password matches the hashed password in the database
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordMatch) {
      req.flash("message", "Invalid old password");
      console.log("Invalid old password");
      return res.redirect("/changePassword");
    }

    // Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      req.flash("message", "New password and confirm password do not match");
      console.log("New password and confirm password do not match");
      return res.redirect("/changePassword");
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    const updatedUser = await Userdb.findOneAndUpdate(
      { _id: userId },
      { $set: { password: hashedNewPassword } },
      { new: true }
    );

    req.flash("message", "Password updated successfully!");
    res.redirect("/changePassword");
  } catch (err) {
    console.error("Error:", err.message);
    req.flash("message", "Error updating password");
    res.redirect("/changePassword");
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

    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 6;
    const totalOrders = await Order.countDocuments();
    const totalPages = Math.ceil(totalOrders / pageSize);

    const orderDetails = await Order.find({ userId: userid })
      .sort({ _id: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize);
    // console.log('orderDetails',orderDetails);
    res.render("orderPage", {
      user,
      orderDetails,
      currentPage: page,
      totalPages,
    });
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
    console.log("item returned ");
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
    console.log(orderId, "cancele reaosn", cancelReason);
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
    res.json({ success: true });
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
    req.flash("message", "profile updated succussfully");
    console.log("profile updated succussfully");
    res.json("succuss:true");
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
  changePassword,
  saveChangePassword,
  generatePdf,
};
