import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import WhatsAppButton from './components/WhatsAppButton';
import Home from './pages/Home';
import Villas from './pages/Villas';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/villas" element={<Villas />} />
          <Route path="/servicios" element={<div style={{paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h1>Servicios - Próximamente</h1></div>} />
          <Route path="/cotizar" element={<div style={{paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h1>Cotización - Próximamente</h1></div>} />
          <Route path="/contacto" element={<div style={{paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h1>Contacto - Próximamente</h1></div>} />
        </Routes>
        <WhatsAppButton />
      </div>
    </Router>
  );
}

export default App;
