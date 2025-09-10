const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = require("./dotenv.config");

const cloudinary = require("cloudinary").v2 ;  // setup for the cloudinary in the code 
require("dotenv").config() ;

async function cloudinaryConfig(){
    try{
        await cloudinary.config({
            cloud_name : CLOUDINARY_CLOUD_NAME,
            api_key    : CLOUDINARY_API_KEY ,
            api_secret : CLOUDINARY_API_SECRET,
        })


        console.log("cloudinary configuration successfull ") ;

    }catch(err){
      console.log("error a gaya while config cloudinary") ;

    }
}

module.exports = cloudinaryConfig ;