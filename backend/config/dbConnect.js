const mongoose = require("mongoose") ;
const { DB_URL } = require("./dotenv.config");
require("dotenv").config() ;

 async function dbConnect(){
  try{
    

    
    mongoose.connect(DB_URL);
    console.log("db is connected successfully") ; 

  }catch(err){
    console.log("error while connecting db");
    console.log(err) ; 
  }
}


module.exports = dbConnect 
