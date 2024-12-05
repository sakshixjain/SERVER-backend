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
exports.updateSubSection = async (req, res) => {
    try {
      const { sectionId, subSectionId, title, description } = req.body
      const subSection = await SubSection.findById(subSectionId)
  
      if (!subSection) {
        return res.status(404).json({
          success: false,
          message: "SubSection not found",
        })
      }
  
      if (title !== undefined) {
        subSection.title = title
      }
  
      if (description !== undefined) {
        subSection.description = description
      }
      if (req.files && req.files.video !== undefined) {
        const video = req.files.video
        const uploadDetails = await uploadImageToCloudinary(
          video,
          process.env.FOLDER_NAME
        )
        subSection.videoUrl = uploadDetails.secure_url
        subSection.timeDuration = `${uploadDetails.duration}`
      }
  
      await subSection.save()
  
      // find updated section and return it
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      )
  
      console.log("updated section", updatedSection)
  
      return res.json({
        success: true,
        message: "Section updated successfully",
        data: updatedSection,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while updating the section",
      })
    }
  }
  


//delete subsection
exports.deleteSubSection = async (req, res) => {
    try {
      const { subSectionId, sectionId } = req.body
      await Section.findByIdAndUpdate(
        { _id: sectionId },
        {
          $pull: {
            subSection: subSectionId,
          },
        }
      )
      const subSection = await SubSection.findByIdAndDelete({ _id: subSectionId })
  
      if (!subSection) {
        return res
          .status(404)
          .json({ success: false, message: "SubSection not found" })
      }
  
      // find updated section and return it
      const updatedSection = await Section.findById(sectionId).populate(
        "subSection"
      )
  
      return res.json({
        success: true,
        message: "SubSection deleted successfully",
        data: updatedSection,
      })
    } catch (error) {
      console.error(error)
      return res.status(500).json({
        success: false,
        message: "An error occurred while deleting the SubSection",
      })
    }
  }