const Section = require("../models/Section");
const Course= require("../models/Course.js");

exports.createSection = async (req,res)=>{
    try{
//data fetch
const {sectionName, courseId}= req.body;
//data validation 
if(!sectionName || !courseId){
    return res.status(400).json({
        success:false,
         message:"Missing properties",
    });

}
//create section
const newSection =await Section.create({sectionName});
//update course with section objectId
const updatedCourse= await Course.findByIdAndUpdate(courseId,
    {
        $push:{
            courseContent:newSection._id,
        }
    },
    {new:true},
);
//home work use populate to replace section , subsection both in the updated course in details
return res.status(200).json({
    success:true,
    message:"section created successfully",
    updatedCourse,
})
    }catch(error){
return res.status(400).json({
    success:false,
    messgae:"unable to cretae section , please try again",
    updatedCourse,
})
    }
}



exports.updateSection = async (req,res)=>{
    try{
        //data input
        const {sectionName,sectionId}= req.body; 
        //data validation 
        if(sectionName || !sectionId){
            return res.status(400).json({
                success:false,
                 message:"Missing properties",
            });
        }

        //update data
        const section= await Section.findByIdAndUpdate(sectionId,{sectionName},
            {new:true},
        )

        //return response
        return res.status(200).json({
            success:true,
            message:"section updated successfully",
            updatedCourse,
        });


    }catch(error){
        return res.status(400).json({
            success:false,
            messgae:"unable to update section , please try again",
            error:error.message,
        })  ;
    }
}



exports.deleteSection= async (req,res)=>{
    try{

        //get id-assuming that we are sending id in parameters
        const {sectionId}=req.body;

        //use find by id and delete
        await Section.findByIdAndDelete(sectionId);
        
        //todo: do we need to delte the entry from the course schema ??
        
        //return resopnse
        return res.status(200).json({
            success:true,
            message:"section delete successfully",
            updatedCourse,
        });

    }catch(error){
        return res.status(400).json({
            success:false,
            messgae:"unable to delete section , please try again",
            error:error.message,
        });
    }
}