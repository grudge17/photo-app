const mongoose=require('mongoose')
const {ObjectId}=mongoose.Schema

const photoSchema=new mongoose.Schema({
    renditionType:{
        type:String,
        trim:true,
        required:true
    },
    data:Buffer,
    contentType:String
})
const imageSchema=new mongoose.Schema({
    // title:{
    //     type:String,
    //     trim:true,
    //     required:true,
    //     maxlength:32
    // },
    // description:{
    //     type:String,
    //     required:true,
    //     maxlength:2000
    // },

    uploadedBy:{
       type:ObjectId,//when we refer to user and its objectid
       ref:'User',
       required:false,
    },
    photos:[photoSchema],
    
    // tags:{
    //     type:String,
    //     required:true,
    //     maxlength:2000
    // }
},
{timestamps:true}
)



module.exports=mongoose.model("Image",imageSchema)