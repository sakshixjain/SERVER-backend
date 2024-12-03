const Catogary = require("../models/Catogary");
const Tag= require("../models/Catogary");

//create tag ka handler function

exports.createCategory= async (req,res)=>{
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

exports.showAllCategory= async (req,res)=>{
    try{
        const allCatos= await Catogary.find({},{name:true, description:description});


        res.status(200).json({
            success:true,
            messgae:"All tags returned successfully",
            showAllCategory,
        })
 
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}

//category page details 

exports.categoryPageDetails = async (req,res)=>{
    try {
        
        // get category id
        const {categoryId} = req.body;
        //get courses for specified category id

        const selectedCategory = await categoryId.findById(categoryId)
        .populate("courses")
        .exec();

        // validation 
 if(!selectedCategory){
    return res.status(400).json({
        success:false,
        message:"data not found",
    });
 }
        //get courses for diffrent courses
        const differentCategories = await categoryId.find({
            _id:{$ne:categoryId},
        })
    .populate("courses")
    .exec();

        // get top selling courses

//hw - write iton your own 

        //return response
          res.status(200).json({
            success:true,
            data:{
                selectedCategory,
                differentCategories,
            },
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}