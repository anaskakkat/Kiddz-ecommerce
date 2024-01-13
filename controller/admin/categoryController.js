const Product = require("../../model/productModal");
const Category = require("../../model/category");



//show  category----------------------------->
const category = async (req, res) => {
    try {
      message = req.flash("message");
      const messageType = req.flash("messageType");
      const categories = await Category.find();
  
      // Render the admin panel view with the categories data
      res.render("category", { categories, message, messageType });
    } catch (error) {
      console.log("error lodaing ejs", error);
    }
  };
  
  // adding category ----------------------------->
  
  const addCategory = async (req, res) => {
    try {
      const { name, description } = req.body;
  
      const regexPattern = new RegExp(`^${name}$`, "i"); // 'i' flag for case-insensitivity
      const existingCategory = await Category.findOne({
        categoryName: regexPattern,
      });
  
      if (existingCategory) {
        console.log("Category already exists");
        req.flash((messageType = "error"));
        req.flash("message", "Category already exists");
  
        return res.status(409).redirect("/admin/Category");
      } else {
        const newCategory = new Category({
          categoryName: name,
          description: description,
        });
  
        await newCategory.save();
  
        console.log("Category added successfully");
        req.flash((messageType = "success"));
        req.flash("message", "Category added successfully");
        return res.redirect("/admin/category");
      }
    } catch (err) {
      console.error(err);
      req.flash("error", "Internal Server Error");
      return res.status(500).send("Internal Server Error");
    }
  };
  
  // block category -------------------------->
  const blockCategory = async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
  
      // Check category exists
      const existingCategory = await Category.findById(categoryId);
  
      if (!existingCategory) {
        req.flash((messageType = "error"));
        req.flash("message", "Category not found");
        return res.status(404).send("Category not found");
      }
  
      // block
      existingCategory.status = "block";
      await existingCategory.save();
      console.log("blocked-category ");
      req.flash((messageType = "error"));
      req.flash("message", "Category UnListed");
      res.status(200).redirect("/admin/category");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  // UnBlock category----------------------------------->
  const unBlockCategory = async (req, res) => {
    try {
      const categoryId = req.params.categoryId;
      console.log(categoryId + "unblock id");
  
      // Check category exists
      const existingCategory = await Category.findById(categoryId);
  
      if (!existingCategory) {
        req.flash((messageType = "error"));
        req.flash("message", "Category not found");
        return res.status(404).send("Category not found");
      }
  
      // unblock
      existingCategory.status = "Unblock";
      await existingCategory.save();
      req.flash((messageType = "success"));
      req.flash("message", "Category Listed");
      res.status(200).redirect("/admin/category");
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal Server Error");
    }
  };
  // EDIT CATEGORY ------------------------------->
  const editCategory = async (req, res) => {
    try {
      const id = req.params.id;
      // console.log(id);
      const category = await Category.findOne({ _id: id });
      // console.log(category);
      res.render("editCategory", { category });
    } catch (err) {
      console.log(err.message);
    }
  };
  
  // update category ------------------------------->
  const updateCategory = async (req, res) => {
    const categoryId = req.params.id;
    const updatedName = req.body.name;
    const updatedDescription = req.body.description;
  
    try {
      const category = await Category.findById(categoryId);
  
      if (!category) {
        return res.status(404).send("Category not found");
      }
  
      // Check if the updated name is different from the existing name
      if (updatedName.toLowerCase() !== category.categoryName.toLowerCase()) {
        // Check for case-insensitive uniqueness using regex
        const existingCategory = await Category.findOne({
          categoryName: { $regex: new RegExp(updatedName, 'i') },
        });
  
        if (existingCategory) {
          console.log("Category with updated name already exists");
          req.flash("messageType", "error");
          req.flash("message", "Category with updated name already exists");
          return res.status(409).redirect("/admin/category");
        }
      }
  
      // Update the category
      category.categoryName = updatedName;
      category.description = updatedDescription;
  
      // Save the updated category to the database
      const updatedCategory = await category.save();
  
      console.log("Updated category:", updatedCategory);
      req.flash("messageType", "success");
      req.flash("message", "Category Updated");
      res.redirect("/admin/category");
    } catch (err) {
      console.log(err.message);
      req.flash("messageType", "error");
      res.status(500).send("Internal Server Error");
    }
  };
  




module.exports = {
  
    category,
    addCategory,
    blockCategory,
    editCategory,
    updateCategory,
    unBlockCategory,
  };