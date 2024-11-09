const User= require("../models/User");
const mailSender= require("../utils/mailSender");
const bcrypt= require("bcrypt");
//reset password token
exports.resetPasswordToken= async (req, res)=>{

   try{
 //fetch data
 const {email}= req.body;
 // check user for this emqil
 const user= await User.findOne({email:email});
 if(!user){
     return res.status(400).json({
         success:false,
         message:"your email is not registered",
     })
 } 
//generate token
const token= crypto.randomUUID();
//update user by dding token
const updatedDetails= await User.findOneAndUpdate(
 {email:email},
{
 token:token,
 resetPasswordExpires:Date.now()+5*60*1000,
},
{new:true});

//create url
 const url= `http://localhost:3000/update-password/${token}`;

///send mail containing url
await mailSender(email, "Password reset link",
 `Password Reset Link: ${url}`
)
//return response 
return res.status(200).json({
 success:true,
 message:"email sent successfully",
})
   }catch(error){
    console.log(error);
  return res.status(402).json({
    success:false,
    messgae:"Something went wrong while reset email , please try again",
  });
   }
}
// reset password

exports.resetPassword= async(req,res)=>{
    try{
  //data fetc
  const {password,confirmPassword, token}=req.body;
  //validation
  if(password !== confirmPassword){
    return res.status(400).json({
        success:false,
        messgae:"password is not matching",
    });
  } 
  //get userdetails from db using token
  const userDetails = await User.findOne({token:token});
  //if no entry - invalid token
  if(!userDetails){
    return res.json({
        success:false,
        message:"token is invalid",
    });
  }
  //token time check
  if(userDetails.resetPasswordExpires < Date.now()){
    return res.json({
        success:false,
        message:"token is expired",
    });
  }
  //hashed password
  const hashedPassword= await bcrypt.hash(password,10);

   //update password
  await User.findOneAndUpdate(
    {token:token},
    {password:hashedPassword},
  {new:true},
  );
 
//return response
return res.json({
    success:true,
    messgae:"password reset successfully",
});

    }catch(error){
return res.status(500).json({
    success:false,
    message:"something wnet wront while rest the password",
});
    }
}