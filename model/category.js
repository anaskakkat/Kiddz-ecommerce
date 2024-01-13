const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({ 
  categoryName: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String, 
    required: true,
  },
  status: {
    type: String,
    required: true,
    default:"Unblock"
  },
   
   
 
});

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
