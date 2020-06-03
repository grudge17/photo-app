require('dotenv').config()

const express=require('express')
const mongoose=require('mongoose')
const morgan=require('morgan') //used for logging request details
const bodyParser=require('body-parser')//it parses JSON,string,URL encoded data submitted using HTTP POST
const cookieParser=require('cookie-parser') //used for saving users cred in cookie
const expressValidator=require('express-validator')
const cors=require('cors')


//app
const app=express()//we invoke express in our variable app

//import routes
const userRoutes=require('./routes/user')
const imageRoutes=require('./routes/image')

//db connection
mongoose.connect(
  process.env.MONGO_URI,
  {useNewUrlParser: true},
)
.then(() => console.log('DB Connected'))
 
mongoose.connection.on('error', err => {
  console.log(`DB connection error: ${err.message}`)
});
// middlewares
app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(cookieParser())
app.use(expressValidator())
app.use(cors('https://https://photo-app-demo.herokuapp.com'))

//routes middlewares
app.use('/',userRoutes)
app.use('/',imageRoutes)

const port=process.env.PORT || 8000

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})

