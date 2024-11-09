const User= required("../models/User.js");
const OTP= require("../models/OTP");
const otpGenerator= require("otp-generator");
const bcrypt= require("bcrypt");
const jwt= require("jsonwebtoken");
require("dotenv").config();

//otp handler
exports.sendOTP= async (req,res)=>{
try{
    
    //fetch email from requet ki body
    const {email}= req.body;

    //check if user already exist

    const checkUserPresent= await User.findOne({email});
 
if(checkUserPresent){
    return res.status(401).json({
        success:false,
        message:"user already registered",
    })
}

    //  generate otp
    var otp= otpGenerator.generate(6,{
        upperCaseAlphabets:false,
        lowerCaseAlphabets:false,
        specialChars:false,
    });
    console.log("OTP generated", otp);

    //chekc unique otp or not
    const result= await OTP.findOne({otp:otp});

    while(result){
        otp= otpGenerator(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated", otp);  
    }
 
    const otpPayload= {email,otp};

   //create entry for otp into db
   const otpBody= await OTP.create(otpPayload);
   console.log(otpBody);

   //return response
   res.status(200).json({
    success:true,
    message:"OTP sent successfully",
    otp,
   })

}catch(error){
 console.log(error);
 return res.status(400).json({
    success:false,
    message:error.message,
 })
}
}


              //signup handler

exports.signUp= async (req,res)=>{
    try{

        //data fetch from req body
        const {firstName, lastName, email, password, confirmPassword, accountType, contactNumber, otp}= req.body;

        //validate krna h
        if(!firstName || !lastName || !password || !confirmPassword || !email|| !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required",
            });
        }

        //password matching-> new pass and confirm pass
         if(password !== confirmPassword){
            return res.status(402).json({
                success:false,
                message:"Password doesn't match, Please try again"
            });
         }

        //check user already exist
        const existingUser= await User.findOne({email});
        if(existingUser){
            return res.status(401).json({
                success:false,
                message:"User is already registered",
            });
        } 
        //find most recent otp stored for the user
        const recentOtp= await OYP.find({email}).sort({created:-1}).limit(1);
        console.log(recentOtp);

        //validate otp
        if(recentOtp.length ==0){
            //otp is not found
            return res.status(400).json({
                success:false,
                message:"OTP is not found",
            })
        }
        else if(otp !== recentOtp.otp){
            //invalid otp
            return res.status(400).json({
                success:false,
                message:"Otp is invalid",
            });
        }
        //hash password
        const hashedPassword = await bcrypt.hash(password,10);

        //entry create in db

const ProfileDetails= await Profile.create({
    gender:null,
   dateOfBirth:null,
   about:null,
   contactNumber:null
});

        const user= await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:ProfileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        })
        //return res
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        })
    }catch(error){
       return res.status(401).json({
        success:false,
        message:"user can't be registered , please try again",
       })
    }
}              


               //login handler

exports.login= async (req,res)=>{
    try{
     //fetch data from req body
     const {email, password}= req.body;

     //validation data
     if(!email || !password){
        return res.status(403).json({
            success:false,
            messgae:"all field are required, please fill",
        });
     }
     //user check if exists or not
     const user= await User.findOne({email}).populate("addittionalDetails");
     if(!user){
        return res.status(400).json({
         success:false,
         messgae:"User is not registered",
        });
     }
     //generate token JWT, after password match
     if(await bcrypt.compare(password, user.password)){
        const payload= {
            email: user.email,
            id: user._id,
            accountType:user.accountType,
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET,{
        expiresIn:"2h",
        });
        user.token=token;
        user.password= undefined;

    //create cookie and send response
    const options={
        expires:new Date(Date.now() + 3*24*60*60*1000),
        httpOnly:true,
    }
    res.cookie("token", token, options).status(200).json({
        success:true,
        token,
        user,
        message:"logged in successfully"
    })
     } else{
        return res.status(400).json({
            success:false,
            message:"password is incorrect",
        });
     }

    
    }catch(error){
     return res.status(401).json({
        success:false,
        message:"login failure, please try again",
     })
    }
}

//change password handler

exports.changePassword= async (req,res)=>{
    try{
   //get deta from req body
   const {password}= req.body;
   //get oldPassword , newPassword, confirmPassword
   //validation
   //update pwd in db
   //send mail- password updated
   return response
    }catch(error){

    }
}