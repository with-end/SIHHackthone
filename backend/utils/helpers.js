const axios = require("axios");
const { EMAIL_USER, FRONTEND_URL } = require("../config/dotenv.config");
const  transporter  = require("../utils/transporter.js");


function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}




async function hasHospitalOrSchool(lat, lng) {
  const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:500,${lat},${lng});
      node["amenity"="school"](around:500,${lat},${lng});
    );
    out 1;
  `;

  try {
    const res = await axios.get("https://overpass-api.de/api/interpreter", {
      params: { data: query }
    });
    return res.data.elements.length > 0;
  } catch (err) {
    console.error("OSM check failed:", err.message);
    return false;
  }
}

// send email function 
async function sendMail( email , status , issueId ) {
  try {
    let text  ;
    if( status==="submitted" ){ text = `your request has been accepted and your issueId is ${issueId}` ; }
    else{ text = `now status of your Issue ${issueId} is ${status}` ;}
    const info = await transporter.sendMail({
      from: `"CivicConnect" <${EMAIL_USER}>`, // sender name + email
      to : email , // receiver email
      subject : "regarding your civic Issue",
      text , // plain text
      html : `<h1> Click on the link to check Status of ${issueId} 
                 <a href="${FRONTEND_URL}/public/track"> check status </a> </h1>`
    });

    console.log("Email sent:", info.messageId);
  } catch (err) {
    console.error("Error sending email:", err);
  }
}




module.exports = {cosineSimilarity , hasHospitalOrSchool , sendMail}
