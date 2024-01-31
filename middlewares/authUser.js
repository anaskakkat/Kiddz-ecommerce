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
const isBlocked =async (req, res, next) => {
  if(req.session.user_id){
    const user= await Userdb.findOne({_id:req.session.user_id})
    if(user.status=='block'){
      req.session.destroy()
      console.log('seession worked');
      res.redirect('/userLogin')

    }else{
      next();
    }
  }else{
    next();
  }
    
 
};

module.exports={
  isLogin,
    isLogout,
isBlocked,
} 