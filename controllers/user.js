const User=require('../models/user')
const {errorHandler}=require('../helpers/dbErrorHandler')
const jwt=require('jsonwebtoken')//to generate signed token
const expressJwt=require('express-jwt')//for authorization check



exports.signup=(req,res)=>{
    const user=new User(req.body)
    user.save((err,user)=>{
        if(err){
            return res.status(400)({
                err:errorHandler(err)
            })
        }
        user.salt=undefined
        user.hashed_password=undefined
        res.json({
            user
        })
    })
}


exports.signin=(req,res)=>{
    //find the user based on email
    const {email,password}=req.body
    User.findOne({email},(err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:'User with that email does not exist.Please signup!!'
            })
        }
        //if user is found make sure that the email and the password match
        //create authenticate method in user model
        if(!user.authenticate(password)){
            return res.status(401).json({
                error:"Email and Password dont match!!"
            })
        }
        
        //generate a signed token with user id and secret
        const token=jwt.sign({_id:user._id},process.env.JWT_SECRET)

        //persist the token 't' in cookie with expiry date
        res.cookie('t',token,{expire:new Date()+9999})

        //return res with user and token to frontend client
        const {_id,name,email}=user
        return res.json({token,user:{_id,email,name}})
    })
}

exports.signout=(req,res)=>{
    res.clearCookie('t')
    res.json({message:"Signout Success!!"})
}


exports.requireSignin=expressJwt({
    secret:process.env.JWT_SECRET,
    userProperty:'auth'
})


exports.userById=(req,res,next,id)=>{
    User.findById(id).exec((err,user)=>{
      if(err || !user){
          return res.status(400).json({
              error:'User not Found!!'
          })
      }  
      req.profile=user
      next();//as the upper is a middleware that is why next is used to move ahead
    })
    }
   

    exports.read=(req,res)=>{
        req.profile.hashed_password=undefined
        req.profile.salt=undefined
        return res.json(req.profile)
        }

        
        exports.update = (req, res) => {
            // console.log('UPDATE USER - req.user', req.user, 'UPDATE DATA', req.body);
            const { name, password } = req.body;
        
            User.findOne({ _id: req.profile._id }, (err, user) => {
                if (err || !user) {
                    return res.status(400).json({
                        error: 'User not found'
                    });
                }
                if (!name) {
                    return res.status(400).json({
                        error: 'Name is required'
                    });
                } else {
                    user.name = name;
                }
        
                if (password) {
                    if (password.length < 6) {
                        return res.status(400).json({
                            error: 'Password should be min 6 characters long'
                        });
                    } else {
                        user.password = password;
                    }
                }
        
                user.save((err, updatedUser) => {
                    if (err) {
                        console.log('USER UPDATE ERROR', err);
                        return res.status(400).json({
                            error: 'User update failed'
                        });
                    }
                    updatedUser.hashed_password = undefined;
                    updatedUser.salt = undefined;
                    res.json(updatedUser);
                });
            });
        };
