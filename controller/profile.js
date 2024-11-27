const Profile= require("../models/Profile");
const User= require("../models/User");

exports.updateProfile= async (req,res)=>{
    try{

      //get data
      const {dateOfBirth="", about="", contactNumber, gender}= req.body;
      //get user id
      const id= req.user.id;
      //data validation
      if(!contactNumber || !gender){
        return res.status(400).json({
            success:false,
            message:"all fileds are required",
        });
      }
      //profile find
      const userDetails = await User.findById(id);
      const profileId= userDetails.additionalDetails;
      const profileDetails = await Profile.findById(profileId);
      //update profile
      profileDetails.dateOfBirth=dateOfBirth;
      profileDetails.about= about;
      profileDetails.gender= gender;
      profileDetails.contactNumber= contactNumber;

      await profileDetails.save();
      //return response
      return res.status(200).json({
        success:true,
        message:"profile updated successfully",
        profileDetails,
      })
    }catch(error){
        return res.status(400).json({
            success:false,
            error:error.message,
        });
    }
}

//delete accoutn
// explore how can we scheduled deletion operation

exports.deleteAccount= async (req,res)=>{
    try{
        //get id
        const id= req.user.id;
        //data validation
        const userDetails= await User.findById(id);
        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"user not found",
            });
        }
        //delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        
        //todo unroll user form all enrolled courses
        //delte user
        await User.findByIdAndDelete({_id:id});

        
        //retun response
        return res.status(200).json({
            success:true,
            message:"profile deleted successfully",
            profileDetails,
          })

    }catch(error){
        return res.status(400).json({
            success:false,
            message:"user can not be deleted",
        });
    }
}

exports.getAllUserDetails = async (req,res)=>{
    try{
  const id = req.user.id;
  const userDetails= await User.findById(id).populate("additionalDetails").exec();

  return res.sttaus(200).json({
    success:true,
    message:"user data fetched successfully",
  });
  
    }catch(error){
        return res.status(400).json({
            success:false,
            message:"user can not be",
        });
    }
}