import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="logo">
          Espacios Con Piscina
        </div>
        <ul className="nav-menu">
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/villas">Villas</Link></li>
          <li><Link to="/servicios">Servicios</Link></li>
          <li><Link to="/cotizar">Cotizar</Link></li>
          <li><Link to="/contacto">Contacto</Link></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
