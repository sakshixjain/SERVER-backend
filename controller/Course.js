const Course= require("../models/Course");
const Tag= require("../models/Tags");
const User= require("../models/User");

const uploadImageToCloudinary= require("../utils/imageUploader");

//create course handler function
exports.createCourse= async (req,res)=>{
    try{
      //data fetch from body
        const {courseName, courseDescription, whatYouWillLearn,price,tag}= req.body;

        //get thumbnail
        const thumbNail = req.files.thumbNailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag){
            return res.status(400).json({
                success:false,
                messgae:"all fields are required",
            })
        }

        //check for instructor

        const userId= req.user.id;
        const instructorDetails= await User.findById(userId);

        console.log("Instructor Details :", instructorDetails);

        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:"Instructor details not found",
            });
        }

        //check given tag is valid or not
        const tagDetails= await Tag.findById(tag);

        if(!tagDetails){
            return res.status(400).json({
                success:false,
                message:"Tag details details not found",
            });
        }

        //upload image to top cloudinary
        const thumbnailImage= await uploadImageToCloudinary(thumbNail, process.env.FOLDER_NAME);

        //entry create for new course
        const newCourse= await Course.create({
            courseName, courseDescription, instructor:instructorDetails._id,whatYouWillLearn: whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbNail:thumbnailImage.secure_url,

        })

        //add the new course to the user shcema of instructor
        await User.findByIdAndUpdate({
            _id:instructorDetails._id,
        },
    {
        $push:{
            courses:newCourse._id
        }

    },
{new:true},
);

//update the tag ka shcema :todo

//return res
return res.status(200).json({
    success:true,
    messgae:"Course created successfully",
});

            }catch(error){
        return res.staus(400).json({
            success:false,
            message:error.message, 
        })
    }
};

//get all courses handler function

exports.showAllCourses= async (req,res)=>{
    try{

const allCourses= await Course.find({},{courseName:true,
    price:true,
    thumbNail:true,
    instructor:true,
    ratingAndReview:true,
    studenstEnrolled:true,
}).populate("instructor")
.exec();

return res.status(200).json({
    success:true,
    message:"data for all courses fetch successfully",
    data:allCourses,
})

    }catch(error){
        console.log(error);
        return res.staus(400).json({
            success:false,
            messgae:"can not fetch course data",
            message:error.message, 
        })
    }
}


//get course details 
exports.getcourseDetails= async (req,res)=>{
    try {
        // get fetch course id
     const {courseId} = req.body;
     
     //find course details
     const courseDetails= await Course.find({
        _id:courseId}
    ).populate({
        path:"instructor",
        populate:{
            path:"additionalDetails",
        },
    })
    .populate("Category")
    .populate("ratingAndReview")
    .populate({
        path:"courseContent",
        populate:{
            path:"subSection",
        },
    })
    .exec();


    //validation
    if(!couseDetails ){
        return res.status(400).json({
         success:false,
         message:`could not find the course with ${courseId}`,
})    
}

//return response
return res.status(200).json({
    success:true,
    message:"course details fetched successfully",
    data:courseDetails,
})

    } catch (error) {
        return res.status(400).json({
            success:false,
        message:error.message,
        })
    }
}
