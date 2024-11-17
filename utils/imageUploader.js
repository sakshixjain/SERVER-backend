const cloudinary= require("clodinary").v2;

exports.uploadImageToCloudinary= async(file,folder,height,quality)=>{
    try{
  const options= {folder};
  if(height){
    options.height= height;
  }
  if(quality){
    options.quality= quality;
  }
  options.resource_type= "auto";

  return await cloudinary.uplaoder.upload(file.tempFilePath,options);
    }catch(error){

    }
}