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
        courseId:course_id,
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

exports.verifySignature= async (req,res)=>{

       //server ke ander secret andd razor pay ke secret ki..matching


    const webhookSecret = "12345678";

    const signature= req.header["x-razorpay-signature"];

  const shasum = crypto.createHmac("sha256", webhookSecret);
  
  shasum.update(JSON.stringify(req.body));

  const digest= shasum.digest("hex");

  if(signature===digest){
    console.log("payment is authorized");

    const {courseId,userId}= req.body.payload.payment.entity.notes;

    try {
        
        //fulfill the action

        //find the course and enrooll student in the course

        const enrolledCourse = await Course.findByIdAndUpdate(
          {  _id: courseId},
          {$push:{studentsEnrolled: userId}},
          {new:true},
        );

        if(!enrolledCourse){
         return res.json({
            success:false,
            message:error.message,
         });
        }

        console.log(enrolledCourse);

        //find the srtudent and the course to thier list enrolled courses

        const enrolledStudent = await User.findOneAndUpdate({_id:userId},
            {$push:{
                courses:courseId}},
                {new:true},
        );

        console.log(enrolledStudent);

        //mail send krdo

        const emailResponse= await mailSender(enrolledStudent.email,
            "Congratulations from codehelp", 
            "you are onborded into new codehelp"
        );

        console.log(emailResponse);

        return res.status(200).json({
            success:true,
            message:"signature verifed and course added",
        });
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
  }
  else{
    return res.status(400).json({
        success:false,
        message:"invalid request",
    });

  }
}
