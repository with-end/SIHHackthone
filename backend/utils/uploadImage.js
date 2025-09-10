const cloudinary = require("cloudinary").v2 ;

async function uploadImage(imagePath){ 

    try{
     const result = await cloudinary.uploader.upload(imagePath , {  //uploads the image to the cloudinary and returns  the important results for the image like url and public id of image 
        folder : "blog app" ,
         
     });

   return result ;

   }catch(error){

    console.log("error is" , error ) ;
}}

async function deleteImageFromCloudinary(imageId){
    try{
      await cloudinary.uploader.destroy(imageId) ; // to remove the image from cloudinary 

    }catch(error){
        console.log("an error occured while deletion " , error) ;
    }
}




module.exports = { uploadImage , deleteImageFromCloudinary } ;