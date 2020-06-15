const Image=require('../models/image')
const formidable=require('formidable')
const _=require('lodash')
//const Jimp = require('jimp');
const sharp = require('sharp');
const fs=require('fs')
const {errorHandler}=require('../helpers/dbErrorHandler')
const homedir = require('os').homedir();
var cloudinary = require('cloudinary').v2;

const supported_renditions={
    "original":1,
    "240p":2,
    "720p":3
}


exports.imageById=(req,res,next,id)=>{
    Image.findById(id).exec((err,image)=>{//any time when there image id param we get the req.image of image
        if(err||!image){
            return res.status(400).json({
                error:"Image not Found!!"
            }) 
        }
        req.image=image
        next();
    })
}

exports.upload= async(req,res,next)=>{
    try{
    let form =new formidable.IncomingForm()
    form.keepExtensions=true//for image extensions
    form.maxFieldsSize=10*1024*1024 //10 MB
    form.multiples=false;
    form.parse(req, async (err,fields,form)=>{
              if(err){
                  return res.status(400).json({
                      error:"Image could not uploaded"
                  })
                }

             //check for all fields
            //  const{title,description,uploadedBy,tags}=fields
            //  if(!title || !description || !tags){
            //     return res.status(400).json({
            //         error:"All fields are required!!"
            //     })  
            //  } 

            var photo = form.file

          //  await this.uploadPhoto(photo)
              
           var img = await this.resize(photo);
           var doc = await img.save()

            
       
                return    res.json("ImageId: " + doc.id)})
        

        
    }catch(e){
              return  res.status(400).json({
                e
            })
                }

}

exports.resize= async (photo)=>{

                let image=new Image()

                  if(photo.size>10000000){//TODO: chan=ge to 1024
                    // return res.status(400).json({
                    //     error:"Image should be less than 10MB in size"
                    // })   
                  }
                  image.photos.push({
                        renditionType: 'original',
                        data: fs.readFileSync(photo.path),
                        contentType: photo.type
                  })


                  const resized_240p =  await sharp(photo.path)
                        .resize(426,240)
                        .toBuffer()

                  image.photos.push({
                    renditionType: '240p',
                    data: resized_240p  ,
                    contentType: photo.type
                  })
                
                  const resized_720p =  await sharp(photo.path)
                        .resize(1280,720)
                        .toBuffer()

                  image.photos.push({
                    renditionType: '720p',
                    data: resized_720p  ,
                    contentType: photo.type
                  })

                  return image;

}

exports.uploadPhoto = async(photoPath)=>{
  //  const formData = new FormData();

    
    cloudinary.uploader.upload(photoPath, 
        function(error, result) 
        {
            console.log(result, error)
            return result.url
        });

}




exports.read=(req,res)=>{
    req.image.photo=undefined
    return res.json(req.image)
    
}

exports.remove=(req,res)=>{
    let image =req.image
    image.remove((err,deletedImage)=>{
        if(err){
            return res.status(400).json({
                error:errorHandler(err)
            })
    }
    res.json({
        message:"Image deleted successfully!!"
    })
    })
 }

    exports.update=(req,res)=>{
        let form =new formidable.IncomingForm()
        form.keepExtensions=true//for image extensions
        form.parse(req,(err,fields,files)=>{
                  if(err){
                      return res.status(400).json({
                          error:"Image could not uploaded"
                      })
                  }

    
    
    
                 let image=req.image
                 image=_.extend(image,fields)//function is used for updating images using the lodash module
   
                    //1kb=1000
                    //1mb=1000000
    
                  if(files.photo){
                      if(files.photo.size>10000000){
                        return res.status(400).json({
                            error:"Image should be less than 10MB in size"
                        })   
                      }

                      image.photo.data=fs.readFileSync(files.photo.path)
                      image.photo.contentType=files.photo.type

                     

                  }
                  image.save((err,result)=>{
                      if(err){
                          return res.status(400).json({
                              error:errorHandler(err)
                          })
                      }
                      res.json(result)
                  })
        })
    
    }
    exports.photo=(req,res,next)=>{
        let order =req.query.renditionType ? 0 : -1
        if(order==0){
            if(req.query.renditionType == "240p")order=1
            else if(req.query.renditionType == "720p")order=2
            else order=0
        }

        if(req.image.photos[order].data){
            res.set('Content-Type',req.image.photos[order].contentType)//we will save any image type ex:-jpeg,png etc
            return res.send(req.image.photos[order].data)
        }
        next()
    }

/**
 * Filter image possibilities
 * By time/limit
 * by time=/images?sortBy=createdAt&orderBy=desc&limit=30
 */
 
exports.view=(req,res)=>{
    let order =req.query.orderBy ? req.query.orderBy : 'desc'
    let sortBy=req.query.sortBy ? req.query.sortBy : 'createdAt'
    let offset=req.query.offset ? parseInt(req.query.offset) : 0
    let limit=req.query.limit ? parseInt(req.query.limit) : 30 // we need to parse it to INT 

    Image.find()
           .select("-photos")//we are deselecting photo as it is a large string so sending it will make the process
           .populate('image')//slow so we will make another req for photo ,to make it faster
           .sort([[sortBy,order]])
           .skip(offset)
           .limit(limit)
           .exec((err,images)=>{
               if(err){
                   console.log(err)
                   return res.status(400).json({
                       error:'Products not Found!!'
                   })
               }
               res.json(images)
           })
}





