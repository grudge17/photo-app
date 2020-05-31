const express=require('express')
const router=express.Router()

const {signup,signin,signout,userById,requireSignin,read,update}=require('../controllers/user')
const{userSignupValidator}=require('../validator/index')

router.post('/signup',userSignupValidator,signup)
router.post('/signin',signin)
router.get('/signout',signout)

router.get('/user/:userId',requireSignin,read)
router.put('/user/:userId',requireSignin,update)


router.param('userId',userById)

module.exports=router