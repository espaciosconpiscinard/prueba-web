import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import WhatsAppButton from './components/WhatsAppButton';
import ChatBot from './components/ChatBot';
import Home from './pages/Home';
import Villas from './pages/Villas';
import Services from './pages/Services';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/villas" element={<Villas />} />
          <Route path="/servicios" element={<Services />} />
          <Route path="/cotizar" element={<div style={{paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h1>Sistema de Cotización - Próximamente</h1></div>} />
          <Route path="/contacto" element={<div style={{paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h1>Contacto - Próximamente</h1></div>} />
        </Routes>
        <WhatsAppButton />
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;
