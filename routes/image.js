const express=require('express')
const router=express.Router()

const {upload,imageById,read,remove,update,photo,view}=require('../controllers/image')
const {requireSignin,userById}=require('../controllers/user')

router.get('/image/:imageId',read)
router.post('/image/upload/:userId',requireSignin,upload)
router.delete('/image/:imageId/:userId',requireSignin,remove)
router.put('/image/:imageId/:userId',requireSignin,update)
router.get('/image/photo/:imageId',photo)
router.get('/images',view)

router.param('userId',userById)
router.param('imageId',imageById)

module.exports=router