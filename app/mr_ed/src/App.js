import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Homepage from './components/Homepage';
import EDNavbar from './components/EDNavbar';
import EnterVirtualTriage from './components/EnterVirtualTriage';

function App() {
  return (
    <Router>
      <EDNavbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/enter" element={<EnterVirtualTriage />} />
        </Routes>
      </div>
    </Router>
  );
}
export default App;