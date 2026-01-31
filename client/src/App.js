import React, { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import CSVUpload from "./components/CSVupload";
import './style/dashboard.css';

const App = () => {
  const [message, setMessage] =useState("");

  useEffect(()=>{
    fetch("http://localhost:5000")
    .then((res)=> res.text())
    .then((data) => setMessage(data));
  },[]);
  return (
    <div>
     
     
      <Dashboard/>
      <CSVUpload/>
      
    </div>
  )
}

export default App