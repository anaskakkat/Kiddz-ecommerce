const Userdb =require("../model/userModel");

const isLogin=async(req,res,next)=>{
    try {
      if (req.session.user_id){
       
          next();
      }else{
        res.redirect('/userLogin')
      }

  
    } catch (error) {
      console.log(error.message)
    }
}
//------------------------------------------------------------------------------------------
const isLogout = async (req, res, next) => {
  try {
      if (req.session.user_id) {
          res.redirect('/');

      } else {
          next();
      }
  } catch (error) {
      console.log(error.message);
  }
}



// is Blocked in 
const isBlocked = async (req, res, next) => {
  try {
    if (req.session.user_id) {
      const user = await Userdb.findOne({ _id: req.session.user_id });
      if (user) {
        if (user.status === 'block') {
          req.session.destroy();
          console.log('Session destroyed in isBlocked middleware');
          return res.redirect('/userLogin');
        } else {
          next();
        }
      } else {
        // User not found in the database
        console.log('User not found in the database in isBlocked middleware');
        next();
      }
    } else {
      // No user session
      next();
    }
  } catch (error) {
    console.log('Error in isBlocked middleware:', error.message);
    next(error); // Pass the error to the error handler middleware
  }
};

module.exports={
  isLogin,
    isLogout,
isBlocked,
} 