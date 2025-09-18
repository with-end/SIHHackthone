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
const departmentRoutes = require("./routes/department.js") ; 
const officersRoutes = require("./routes/officer.js") ;
const translationRoutes = require("./routes/translation.js") ;




app.use(express.json()) ;
app.use(cors());

app.get("/" , (req , res) =>{ res.send("Backend is live now updated")}) ;
app.use("/api/nagarpalika" , nagarPalikaRoutes) ;
app.use("/api/reports" , ReportRoutes) ;
app.use("/api" , departmentRoutes) ;
app.use("/api/officer" , officersRoutes ) ;
app.use("/api" , translationRoutes ) ;
app.use(bodyParser.json()) ;




app.listen( PORT , () =>{
    console.log("my server is started yar "); 
    dbConnect(); 
    cloudinaryConfig() ; 
})