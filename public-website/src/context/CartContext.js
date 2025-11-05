import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    const savedCart = localStorage.getItem('villaCart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('villaCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (villa, modality) => {
    const newItem = {
      id: `${villa.id}-${modality}`,
      villaId: villa.id,
      code: villa.code,
      zone: villa.zone,
      modality: modality, // 'pasadia', 'amanecida', 'ambas', 'evento'
      addedAt: new Date().toISOString()
    };

    // Verificar si ya existe esta combinación villa-modalidad
    const exists = cartItems.find(item => item.id === newItem.id);
    if (exists) {
      alert('Esta villa con esta modalidad ya está en tu lista de interés');
      return false;
    }

    setCartItems([...cartItems, newItem]);
    return true;
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.length;
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      getCartCount,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
};
