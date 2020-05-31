const mongoose=require('mongoose')
const {ObjectId}=mongoose.Schema

const imageSchema=new mongoose.Schema({
    title:{
        type:String,
        trim:true,
        required:true,
        maxlength:32
    },
    description:{
        type:String,
        required:true,
        maxlength:2000
    },

    uploadedBy:{
       type:ObjectId,//when we refer to user and its objectid
       ref:'User',
       required:false,
    },
    photo:{
        data:Buffer,
        contentType:String,
        photo1:{data:Buffer,contentType:String},//for rendition 1
        photo2:{data:Buffer,contentType:String},//for rendition 2
    },
    // photo1:{
    //     type= a,
    //     data:Buffer,
    //     contentType:String
    // },
    // photo2:{
    //     data:Buffer,
    //     contentType:String
    // },
    tags:{
        type:String,
        required:true,
        maxlength:2000
    }
},
{timestamps:true}
)



module.exports=mongoose.model("Image",imageSchema)