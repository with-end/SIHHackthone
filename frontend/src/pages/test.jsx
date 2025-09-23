
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:3000'); // backend socket server

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
      await axios.post('http://localhost:3000/api/reports', { title });
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
