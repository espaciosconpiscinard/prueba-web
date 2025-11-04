import React from 'react';
import { useCart } from '../context/CartContext';

const CartButton = () => {
  const { getCartCount, openCart } = useCart();
  const count = getCartCount();

  if (count === 0) return null;

  return (
    <button
      onClick={openCart}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #080644 0%, #CFA57D 100%)',
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.5rem',
        zIndex: 1000,
        transition: 'transform 0.2s',
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      title="Ver villas de interés"
    >
      🛒
      {count > 0 && (
        <span style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          background: '#ef4444',
          color: 'white',
          borderRadius: '50%',
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          border: '2px solid white'
        }}>
          {count}
        </span>
      )}
    </button>
  );
};

export default CartButton;
