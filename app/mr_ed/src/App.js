import React from 'react';
 import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
 import Login from './components/Login';
 import Register from './components/Register';
 import Homepage from './components/Homepage';
 import Navbar from './components/Navbar';
function App() {
 return (
 <Router>
 <Navbar />
 <div className="container">
 <Routes>
 <Route path="/" element={<Homepage />} />
 <Route path="/login" element={<Login />} />
 <Route path="/register" element={<Register />} />
 </Routes>
 </div>
 </Router>
 );
 }
export default App;