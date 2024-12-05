const express= require("express");
const app= express();

const userRoutes = require("./routes/User");
const courseRoutes = require("./routes/Course");
const profileRoutes= require("./routes/Profile");
const paymentRoutes= require("./routes/Payment");

const database= require("./config/database");
const cookieParser= require("cookie-parser");
const cors = require("cors");
const {cloudinaryConnect}= require("./config/Cloudinary");
const fileUpload= require("express-fileupload");
const dotenv= require("dotenv");

const PORT= process.env.PORT || 4000;

//database connect
 
database.connect();
//middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:3000",
    credentials:true,
})
)

app.use(
    fileUpload({
        useTempFiles:true,
        tempFileDir:"/tmp"
    })
)

//cloudinary
cloudinaryConnect();

//routes
app.use("api/v1/auth",userRoutes);
app.use("api/v1/course", courseRoutes);
app.use("api/v1/payment", paymentRoutes);
app.use("api/v1/proflie",profileRoutes);

app.get("/",(req,res)=>{
    return res.json({
        success:true,
        message:"your server is running....",
    });
});

app.listen(PORT,(req,res)=>{
    console.log(`your port is running at ${PORT}`);
})