const RatingAndReview = require("../models/RatingAndReview");

const Course= require("../models/Course");
const { default: mongoose } = require("mongoose");

//creating rating 

exports.createRating = async (req,res)=>{
    try {
        // get data 
        const userId= req.user.id;
        // fetch from req body
        const {rating, review ,courseId} = req.body;
        // check if user is enrolled or not
        const courseDetails = await Course.findOne({_id:courseId,
            studentsEnroll:{$elemMatch:{$eq:userId}},
        });

        //check if user is already reviewsed or not
        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:"student is not enrolled in this course"
            });
        }
        //check is user already review

        const alreadyReviewed = await RatingAndReview.findOne({
            user:userId,
            course:courseId,
        });

          if(alreadyReviewed){
            return res.status(402).json({
                success:false,
                message:"course is already reviewed by the user",
            });
        }
        //create rating and rview
      
      const ratingReview = await  RatingAndReview.create({
        rating, review,course:courseId,
        user:userId,
      });

      //update course with this rating / review
     const updatedCourseDetails =  await Course.findByIdAndUpdate({_id:courseId}, {
        $push:{
            ratingAndReviews:ratingReview._id,
        }
      },
    {new:true});
    console.log(updatedCourseDetails);

        //return response
        return res.status(200).json({
            success:true,
            message:"rating and review created successfully",
            ratingReview
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


//get average rating 

exports.averageRating = async (req, res)=>{
    try {
        //get courseId
        const courseId= req.body.courseId;
        //calculate avg rating
        const result  = await RatingAndReview.aggregate([
            {
                $match:{
                    course:new mongoose.Types.ObjectId(courseId),
                },
            },
            {
                $group:{
                    _id:null,
                    averageRating: {$avg:"$rating"},
                }
            }
        ])

        //return rting
        if(result.length >0){
            return res.status(200).json({
                success:true,
                averageRating: result[0].averageRating,
            })
        }

        return res.status(200).json({
            success:true,
            message:"average rating is 0 , no ratings given till now",
            averageRating:0,
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message,
        })
    }
}


//get all rating 

exports.getAllRating = async (req,res)=>{
    try {
        
const allReviews= await RatingAndReview.find({}).sort({rating:"desc"}).populate({path:"User",
    select:"firstName lastName email image",
})
.populate({
    path:"Course",
    select:"courseName",
})
.exec();


return res.status(200).json({
    success:true,
message:"all review fetch successfully",
data:allReviews,
});
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success:false,
            message:error.message,
        })
    }
}
