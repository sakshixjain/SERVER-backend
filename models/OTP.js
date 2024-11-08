const mongoose= require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema= new mongoose.Schema({
    email:{
        type:String,
        required:true,
    },
    otp:{
        type:String,
        required:True,
    },
    createdAt:{
        type:Date,
        default:Date.now(),
        expires:5*60,
    }
});


//a function -> to send email for OTP

async function sendVerificationEmail(email,otp){
    try{

        const mailResponse= await mailSender(email, "Verification email from studyNotion ", otp);
        console.log("Email sent successfully" , mailResponse);
    }catch(error){
        console.log("error occured while sending mails");
        throw error;
    }
}

OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email, this.otp);
    next();
})
module.exports= mongoose.model("OTP", OTPSchema);