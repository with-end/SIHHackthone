const express = require("express") ;
const cors = require("cors") ;
const  app = express() ;
const dbConnect = require("./config/dbConnect.js") ;
const cloudinaryConfig = require("./config/cloudinaryConfig.js") ;
const dotenv = require("dotenv") ;
const { PORT, FRONTEND_URL } = require("./config/dotenv.config.js");
dotenv.config() ; // we can also do like that => require("dotenv").config() ;
const nagarPalikaRoutes = require("./routes/nagarPalika.js") ;
const bodyParser = require("body-parser") ;
const ReportRoutes = require("./routes/Report.js") ;
const nagarpalikaRoutes = require("./routes/department.js") ;
const departmentRoutes = require("./routes/department.js") ; 


app.use(express.json()) ;
app.use(cors({

    origin : FRONTEND_URL // origin which can support the server 
}));

app.get("/" , (req , res) =>{ res.send("Backend is live now updated")}) ;
app.use("/api/nagarpalika" , nagarPalikaRoutes) ;
app.use("/api/reports" , ReportRoutes) ;
app.use("/api" , departmentRoutes) ;




app.listen( PORT , () =>{
    console.log("my server is started yar "); 
    dbConnect(); 
    cloudinaryConfig() ; 
})