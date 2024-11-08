
const mongoose= require("mongoose");

const profileSchema= new mongoose.Schema({

   gender:{
    type:String,
    required:true,
   },

   dataOfBirth:{
    type:String,
   },

   about:{
    type:String,
   },

   contactNumber:{
    type:Number,
    trim:true,
   }
});

module.exports= mongoose.model("Profile",profileSchema);