const Course= require("../models/Course");
const Category= require("../models/Category");
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
        const tagDetails= await Category.findById(tag);

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


exports.editCourse = async (req, res) => {
    try {
      const { courseId } = req.body
      const updates = req.body
      const course = await Course.findById(courseId)
  
      if (!course) {
        return res.status(404).json({ error: "Course not found" })
      }
  
      // If Thumbnail Image is found, update it
      if (req.files) {
        console.log("thumbnail update")
        const thumbnail = req.files.thumbnailImage
        const thumbnailImage = await uploadImageToCloudinary(
          thumbnail,
          process.env.FOLDER_NAME
        )
        course.thumbnail = thumbnailImage.secure_url
      }
  
      // Update only the fields that are present in the request body
      for (const key in updates) {
        if (updates.hasOwnProperty(key)) {
          if (key === "tag" || key === "instructions") {
            course[key] = JSON.parse(updates[key])
          } else {
            course[key] = updates[key]
          }
        }
      }
  
      await course.save()
  
      const updatedCourse = await Course.findOne({
        _id: courseId,
      })
        .populate({
          path: "instructor",
          populate: {
            path: "additionalDetails",
          },
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
          path: "courseContent",
          populate: {
            path: "subSection",
          },
        })
        .exec()
  
      res.json({
        success: true,
        message: "Course updated successfully",
        data: updatedCourse,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      })
    }
  }


  exports.getInstructorCourses = async (req, res) => {
    try {
      // Get the instructor ID from the authenticated user or request body
      const instructorId = req.user.id
  
      // Find all courses belonging to the instructor
      const instructorCourses = await Course.find({
        instructor: instructorId,
      }).sort({ createdAt: -1 })
  
      // Return the instructor's courses
      res.status(200).json({
        success: true,
        data: instructorCourses,
      })
    } catch (error) {
      console.error(error)
      res.status(500).json({
        success: false,
        message: "Failed to retrieve instructor courses",
        error: error.message,
      })
    }
  }


  // Delete the Course
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.body

    // Find the course
    const course = await Course.findById(courseId)
    if (!course) {
      return res.status(404).json({ message: "Course not found" })
    }

    // Unenroll students from the course
    const studentsEnrolled = course.studentsEnroled
    for (const studentId of studentsEnrolled) {
      await User.findByIdAndUpdate(studentId, {
        $pull: { courses: courseId },
      })
    }

    // Delete sections and sub-sections
    const courseSections = course.courseContent
    for (const sectionId of courseSections) {
      // Delete sub-sections of the section
      const section = await Section.findById(sectionId)
      if (section) {
        const subSections = section.subSection
        for (const subSectionId of subSections) {
          await SubSection.findByIdAndDelete(subSectionId)
        }
      }

      // Delete the section
      await Section.findByIdAndDelete(sectionId)
    }

    // Delete the course
    await Course.findByIdAndDelete(courseId)

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    })
  }
}