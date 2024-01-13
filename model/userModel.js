const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  mobilenumber: {
    type: Number,
    required: true,
    // unique: false,
  },
  email: {
    type: String,
    required: true,
    // unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    default: "unBlock",
  },
  verified: { type: Boolean },
  role: {
    type: String,
    default: "user",
  },
  address:[
    {
     name:{
        type:String,

     },
     mobile:
     {
        type:String,

     },
     pincode:
     {
        type:String,

     },
     address:
     {
        type:String,

     },
     landmark:{
      type:String
     },
     city:
     {
        type:String

     },
     state:
     {
        type:String
     }

    }
],
});

const Userdb = mongoose.model("userDb", schema);

module.exports = Userdb;
