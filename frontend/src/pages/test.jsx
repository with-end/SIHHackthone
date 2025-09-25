
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';


function test() {
  const [reports, setReports] = useState([]);
  const [title, setTitle] = useState('');
  const nagarId = localStorage.getItem("nagarId") ;

  // Fetch initial reports using Axios
  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/reports/${nagarId}`)
      .then(res => setReports(res.data))
      .catch(err => console.error("Error fetching reports:", err));
  }, []);

  // Listen for new reports
  useEffect(() => {
    const socket = io(import.meta.env.VITE_BACKEND) ;
    socket.on('nagarId', (nagarId1) => {
      console.log("Received Nagar ID:", nagarId1);
    });

    return () => {
      socket.off('nagarId');
    };
  }, []);

  // Submit a new report using Axios
  const submitReport = async () => {
    if (!title) return;

    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reports`, { title });
      setTitle('');
    } catch (err) {
      console.error("Error submitting report:", err);
    }
  };



  return (
    <div style={{ padding: 20 }}>
      <h1>Real-time Reports</h1>
      <input
        type="text"
        value={title}
        placeholder="Report title"
        onChange={e => setTitle(e.target.value)}
      />
      <button onClick={submitReport}>Submit</button>
      <ul>
        {reports.map(r => (
            
          <li key={r._id}>{r.title}</li>
        ))}
      </ul>
    </div>
  );
}

export default test;


// for creating a new report :
// CREATE REPORT
// router.post("/:nagarId", upload.fields([{ name: "image" }]), async (req, res) => {
//   try {
//     const { reporterEmail, title, description, location } = req.body;
//     const { image } = req.files || {};
    
//     if (!reporterEmail || !title || !description || !location || !image) {
//       return res.status(400).json({ error: "missing required Fields" });
//     }
//     console.log("hellow123") ;
//     const { nagarId } = req.params;
//     const [lng, lat] = JSON.parse(location).coordinates;
//     const department = await classifyDepartment(description);
//     const descVector = await generateTextVector(description);
    
//     let priority = 0;

//     const { secure_url, public_id } = await uploadImage(
//       `data:${image[0].mimetype};base64,${image[0].buffer.toString("base64")}`
//     );

//     // check duplicates
//     const nearbyReports = await Report.find({
//       nagarId,
//       department,
//       location: {
//         $near: {
//           $geometry: { type: "Point", coordinates: [lng, lat] },
//           $maxDistance: 800,
//         },
//       },
//     });

//     for (const candidate of nearbyReports) {
//       if (!candidate.descriptionVector.length) continue;
//       const descSim = cosineSimilarity(descVector, candidate.descriptionVector);
//       if (descSim > 0.8) {
//         await Report.findByIdAndUpdate(candidate._id, { $inc: { priority: 20 } });
//         return res.json({ duplicateOf: candidate._id, message: "Duplicate report merged" });
//       }
//     }

//     // importance check
//     const nearImportant = await hasHospitalOrSchool(lat, lng);
//     if (nearImportant) priority += 50;

//     let givenOfficer = null;

//     if (nearbyReports.length > 0) {
//       givenOfficer = nearbyReports[0].assignedOfficer;
//       priority = nearbyReports[0].priority;
//     } else {
//       const nagar = await NagarPalika.findOne({ nagarId }).populate(`${department}.officers`);
//       const officers = nagar[department].officers;

//       for (const officer of officers) {
//         if (officer.status === "active") {
//           givenOfficer = officer._id;
//           await Officer.findByIdAndUpdate(officer._id, { status: "busy" });
          
//           break;
//         }
//       }
//     }
//     const io = req.app.get("io");
//     // Create report
//     const repId = (await Report.countDocuments()) + 1;
//     const report = await Report.create({
//       reporterEmail,
//       title,
//       description,
//       imageUrl: secure_url,
//       imageId: public_id,
//       descriptionVector: descVector,
//       priority,
//       department,
//       nagarId,
//       location: JSON.parse(location),
//       reportId: `ISSUE-${repId}`,
//       assignedOfficer: givenOfficer,
//     });
//     console.log(reporterEmail , report.reportId)
//     sendMail(reporterEmail , "submitted" , report.reportId ) ;

//     // if no officer → push into pendingReports of department
//     if (!givenOfficer) {
//       await NagarPalika.findOneAndUpdate(
//         { nagarId },
//         { $push: { [`${department}.pendingReports`]: report._id ,  [`${department}.reports`]: report._id } ,  $inc: { [`${department}.stats.pending`]: 1 }}
//       );
//       io.emit("assigned", report);
//     } else {
//       await Officer.findByIdAndUpdate(givenOfficer, {
//         $push: { assignedReports: report._id },
//       });
//       io.emit("assigned", report);
//       await NagarPalika.findOneAndUpdate(
//         { nagarId },
//         { $push: { [`${department}.reports`]: report._id } , $inc: { [`${department}.stats.pending`]: 1 } }
//       );
//     }

//     res.json({ success: true, reportId: report._id, message: "Report submitted" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Report creation failed" });
//   }
// });