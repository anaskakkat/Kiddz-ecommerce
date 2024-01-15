const Cart = require("../model/cartModal");

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



// is logged in 
// const isLoggedIn = (req, res, next) => {
//   res.locals.user = req.session.user_id ? req.session.user_id :null;
//   next();
// };

module.exports={
  isLogin,
    isLogout,
// isLoggedIn
} 