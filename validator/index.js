exports.userSignupValidator=(req,res,next)=>{
    req.check("name","Name is required").notEmpty();
    req.check("email","Email must be between 3 to 32 characters")
       .matches(/.+\@.+\..+/)
       .withMessage("Email must contain @")
       .isLength({
           min:4,
           max:32
       }) 
    req.check('password','Password is required').notEmpty();
    req.check("password")
       .isLength({
           min:6
       })
       .withMessage("Password must contain atleast 6 characters")
       .matches(/\d/)
       .withMessage("Password must contain a number")
       
       const errors=req.validationErrors()//errors object maps the error with the use of validationErrors
       if(errors){
           const firstError=errors.map(error=>error.msg)[0];//error looks up in the map and pick the first error
           return res.status(400).json({error:firstError})
       }
       next();//next is used so that if a error occurs and stucks it should move ahead and not hault the program
}