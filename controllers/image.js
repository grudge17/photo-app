const Image=require('../models/image')
const formidable=require('formidable')
const _=require('lodash')
const Jimp = require('jimp');
//const sharp = require('sharp');
const fs=require('fs')
const {errorHandler}=require('../helpers/dbErrorHandler')


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

exports.upload=(req,res,next)=>{
    let form =new formidable.IncomingForm()
    form.keepExtensions=true//for image extensions
    form.multiples=true;
    form.parse(req,(err,fields,files)=>{
              if(err){
                  return res.status(400).json({
                      error:"Image could not uploaded"
                  })
              }
             //check for all fields
             const{title,description,uploadedBy,tags}=fields
             if(!title || !description || !tags){
                return res.status(400).json({
                    error:"All fields are required!!"
                })  
             }

            
            //  fields.uploadedBy = userId



              let image=new Image(fields)
                //1kb=1000
                //1mb=1000000    
            //   const pic= files.photo;;
            if(files.photo>10000000){}
              if(files.photo){
                  if(files.photo.size>10000000){//TODO: chan=ge to 1024
                    return res.status(400).json({
                        error:"Image should be less than 10MB in size"
                    })   
                  }
                //  const homedir = require('os').homedir();
                //  sharp(files.photo.path)
                     //  .resize(1280,720)
                     //  .toFile(homedir+'/tmp/output/'+ image._id +'_resized.png',(err,pic)=>{
                      //  image.photo.photo1.data=fs.readFile(homedir+'/tmp/output/'+ image._id +'_resized.png')
                      //  image.photo.photo1.contentType=files.photo.type
                       //  if(err){
                             //     return res.status(400).json({
                            //        error:errorHandler(err)
                            //     })
                            // }
                             //files.photo.photo1.path=homedir+'/tmp/output/'+ image._id +'_resized.png'
                            //  image.photo.photo1.data=fs.readFileSync(homedir+'/tmp/output/'+ image._id +'_resized.png')
                            //  image.photo.photo1.contentType=files.photo.type
                       //})
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

// function saveDB(image,result){
//     image.save((err,result)=>{
//         if(err){
//             return res.status(400).json({
//                 error:errorHandler(err)
//             })
//         }
//        return result;
//     })   
// }

// exports.rendition=(req,res)=>{
//     const homedir = require('os').homedir();
//     let resized_image = req.image
//       Jimp.read(resized_image.photo.path, (err, lenna) => {
//         if(err){
//             return res.status(400).json({
//                 error:errorHandler(err)
//             })
//         }
//         lenna
//           .resize(1028, 720) // resize
//           .write(homedir+'/tmp/output/'+ image._id +'_resized.png'); // save
//           resized_image.photo.data=fs.readFileSync(homedir+'/tmp/output/'+ image._id +'_resized.png')
//           resized_image.photo.contentType=files.photo.type
//         //   saveDB(resized_image,res);
//         resized_image.save((err,result)=>{
//             if(err){
//                 return res.status(400).json({
//                     error:errorHandler(err)
//                 })
//             }
//            res.json(result);
//         })   
// })
// }


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
                 //check for all fields
                 const{title,description,uploadedBy,tags}=fields
                 if(!title || !description || !tags){
                    return res.status(400).json({
                        error:"All fields are required!!"
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
        if(req.image.photo.data){
            res.set('Content-Type',req.image.photo.contentType)//we will save any image type ex:-jpeg,png etc
            return res.send(req.image.photo.data)
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
    let limit=req.query.limit ? parseInt(req.query.limit) : 30 // we need to parse it to INT 

    Image.find()
           .select("-photo")//we are deselecting photo as it is a large string so sending it will make the process
           .populate('image')//slow so we will make another req for photo ,to make it faster
           .sort([[sortBy,order]])
           .limit(limit)
           .exec((err,images)=>{
               if(err){
                   return res.status(400).json({
                       error:'Products not Found!!'
                   })
               }
               res.json(images)
           })
}