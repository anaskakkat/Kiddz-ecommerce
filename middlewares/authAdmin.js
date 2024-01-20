const isLogin=async(req,res,next)=>{
  try {
    
    if (req.session.admin_id){
      console.log("is login worked");
        next();
    }else{
      res.redirect('/admin/login')
    }


  } catch (error) {
    console.log(error.message)
  }
}
//------------------------------------------------------------------------------------------
const isLogout = async (req, res, next) => {
try {
    if (req.session.admin_id) {
        res.redirect('/admin/dashboard');

    } else {
        next();
    }
} catch (error) {
    console.log(error.message);
}
}

module.exports={
isLogin,
    isLogout
}