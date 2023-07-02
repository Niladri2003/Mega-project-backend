const mongoose=require("mongoose");
const mailSender = require("../utils/mailSender");

const OTPSchema= new mongoose.Schema(
    {
        email:{
            type:String,
            required:true,
        },
        otp:{
            type:Number,
            required:true,
        },
        createdAt:{
            type:Date,
            default:Date.now(),
            expires:5*60,
        }
    }
);

// a function -> Email Send

async function sendVerificationEmail(email,otp){
    try{
        const mailResponse= await mailSender(email,"Verification email for StudyNotion",otp);
        console.log("Email send Succesfully",mailResponse);

    }catch(error){
        console.log("Error occured while sending mail");
        console.log(error);
    }

}


OTPSchema.pre("save", async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})




module.exports= mongoose.model("OTP",OTPSchema);