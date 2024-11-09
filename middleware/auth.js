const jwt= require("jsonwebtoken");
require("dotenv").config();
const user= require("../models/User");


//auth
exports.auth= async (req,res,next)=>{
try{
   //extract token
   const token= req.cookies.token 
   || req.body.token 
   || req.header("Authorisation").replace("bearer ","");

   //if token missing , then return response

   if(!token ){
    return res.status(401).json({
        success:false,
        message:"Token is missing",
    });
   }

   //verify the token
   try{
  const decode= await jwt.verify(token, process.env.JWT_SECRET);
  console.log(decode);
  req.user= decode;

   }catch(error){
    return res.status(401).json({
        success:false,
        message:"token is invalid",
    });
   }
   next();
}catch(error){
 return res.status(401).json({
    success:false,
    message:"something wnet wrong while validating the token",
 });
}
}

//isStudent
exports.isStudent= async (req,res)=>{
    try{
    //fetch 
     if(req.user.accountType !== "Student"){
        return res.status(401).json({
            success:false,
            message:"this is a protected route for student only",
        });
     }
     next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"user role can not be modified",
         });
    }
}
// isInstructor
exports.isInstructor  = async (req,res)=>{
    try{
    //fetch 
     if(req.user.accountType !== "Instructor"){
        return res.status(401).json({
            success:false,
            message:"this is a protected route for instructor only",
        });
     }
     next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"user role can not be modified",
         });
    }
}
//isAdmin
exports.isAdmin= async (req,res)=>{
    try{
    //fetch 
     if(req.user.accountType !== "Admin"){
        return res.status(401).json({
            success:false,
            message:"this is a protected route for admin only",
        });
     }
     next();
    }catch(error){
        return res.status(401).json({
            success:false,
            message:"user role can not be modified",
         });
    }
}