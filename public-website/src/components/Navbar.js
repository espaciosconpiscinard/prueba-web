import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { getCartCount, openCart } = useCart();
  const count = getCartCount();

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
          <li>
            <button 
              onClick={openCart}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '1.5rem',
                position: 'relative',
                padding: '5px 10px'
              }}
              title="Mis villas de interés"
            >
              🏠
              {count > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-5px',
                  right: '0',
                  background: '#ef4444',
                  color: 'white',
                  borderRadius: '50%',
                  width: '20px',
                  height: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 'bold'
                }}>
                  {count}
                </span>
              )}
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
