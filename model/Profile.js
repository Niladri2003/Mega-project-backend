const mongoose=require("mongoose");

const profileSchmea= new mongoose.Schema({
    gender:{
        type:String,

    },
    dateOfBrith:{
        type:String,
    },
    about:{
        type:String,
        trim:true,
    },
    contactNumber:{
        type:Number,
        trim:true,
    }
})
module.exports=mongoose.model("Profile",profileSchmea);