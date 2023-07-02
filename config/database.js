const mongoose=require("mongoose");

require("dotenv").config();

exports.connect=()=>{
    mongoose.connect(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true,
    }).then(()=>console.log("Db connected"))
    .catch((e)=>{
        console.log("Db connect error");
        console.error(e);
        process.exit(1);
    })
}