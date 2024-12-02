const SubSection= require("../models/SubSection");
const Section =require("../models/Section");
const {uploadImageToCloudinary} = require("../utils/imageUploader");
//create section 

exports.createSubSection = async (req,res)=>{
    try{
//data fetch
const {sectionId,title, timeDuration, description}= req.body;
//extract file
const video = req.files.videoFile;
//validation
if(!sectionId || !title || !timeDuration || !description){
    return res.staus(400).json({
        success:false,
        message:"all fields are required",
    });
}
//upload video to cloudinary
const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME);
//create a subsection
const subSectionDetails= await SubSection.create({
    title:title,
    timeDuration:timeDuration,
    description:description,
    videoUrl:uploadDetails.secure_url,
})
//update section with this sub section objectid
const updatedSection= await Section.findByIdAndUpdate({
    _id:sectionId},
{$pusj:{
    subSection:subSectionDetails,_id
}},
{new:true});

//home work __ log updated section here, after addign populate query

//response
return res.status(200).json({
    success:true,
    message:"sub section created successfully",
    updatedSection,
});
    }catch(error){
return res.status(400).json({
    success:false,
    message:"internal server error",
})
    }
};

//home word : updated section
exports.updateSubSection= async (req,res)=>{
    try{
        const {sectionId,title, timeDuration, description, videoUrl}= req.body;
        //extract file
        const video = req.files.videoFile;
        //validation
        if(!sectionId || !title || !timeDuration || !description || !videoUrl){
            return res.staus(400).json({
                success:false,
                message:"all fields are required",
            });
        }

        return res.status(200).json({
            success:true,
            message:"sub section updated successfully",
        });



    }catch(error){
        return res.status(400).json({
            success:false,
            message:"something went wrong",
        });
    }
}


//delete subsection
exports.deleteSubSection= async (req,res)=>{
    try{
        //data fetch

        //return response
        return res.status(200).json({
            success:true,
            message:"sub section updated successfully",
        });

    }catch(error){
        return res.status(400).json({
            success:false,
            message:"something went wrong",
        });
    }
}