const  {instance} = require("../config/razorpay");
const Course= require("../models/Course");
const User= require("../models/User") ;
const mailSender= require("../utils/mailSender");

const  {courseEnrollmentEmail}= require("../mail/templates/courseEnrollmentEmail");


//capture the payment and initiate the razorpaay order

exports.capturePayment= async(req,res)=>{
   
//get course id and user id

const {course_id}= req.body;
const {userId}= req.body;
//validation 
//valid course id
if(!course_id){
    return res.status(400).json({
        success:false,
        message:"Please provie valid course id",

    })
};

//valid course details
let course;
try{
 course = await Course.findById(course_id);
 if(!course){
    return res.json({
        success:false,
        message:"could not find the course",
    });
 }
//user already pay for the same course
const userid= new mongoose.Types.ObjectId(userId);
if(Course.studentsEnrolled.invludes(userid)){
    return res.status(200).json({
        success:false,
        message:"student is already enrolled",
    });
}


    }catch(error){
      return res.status(400).json({
        success:false,
        message:error.message,
      });
    }

//order create
const amount= course.price;
const currency= "INR";

const options={
    amount:amount*100,
    currency,
    receipt:Math.random(Date.now()).toString(),
    notes:{
        course_id:course_id,
        userId,
    }
};
try {
    //initate the payment using razorpay

    const PaymentResponse= await instance.orders.create(options);
    console.log(PaymentResponse);

    //return response
    return res.status(200).json({
        success:true,
        courseName:course.courseName,
        courseEnrollmentEmail:course.courseDescription,
        thumbnail:course.thumbnail,
        orderId:PaymentResponse.id,
        currency:PaymentResponse.currency,
        amount:PaymentResponse.amount,
    });
} catch (error) {
    console.log(error);
    res.json({
        success:false,
message:"could not initate order",
    });
}

};



//verify signature of razorpay and server

exports.
