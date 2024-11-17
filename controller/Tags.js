const Tag= require("../models/Tags");

//create tag ka handler function

exports.createTag= async (req,res)=>{
    try{

        const {name, description}= req.body;

        if(!name || !description){
            return res.status(400).json({
                success:false,
                messgae:"all fields are required",
            })
        }

        //create entry in db
        const tagDetails = await Tag.create({
            name:name,
            description:description,
        });
        console.log(tagDetails);

        //response
        return res.staus(200).json({
            success:true,
            messgae:"Tag cretaed successfully",
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
};

///get all of the tags

exports.showAlltags= async (req,res)=>{
    try{
        const allTags= await Tag.find({},{name:true, description:description});
        res.status(200).json({
            success:true,
            messgae:"All tags returned successfully",
            allTags,
        })
 
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}