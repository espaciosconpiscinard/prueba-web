import React, { useState } from 'react';
import { useCart } from '../context/CartContext';

const CartModal = () => {
  const { cartItems, removeFromCart, clearCart, isCartOpen, closeCart } = useCart();
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    fechaInteres: '',
    cantidadPersonas: '',
    modalidadGeneral: '',
    tipoActividad: '',
    notaAdicional: ''
  });

  if (!isCartOpen) return null;

  const getModalityLabel = (modality) => {
    switch(modality) {
      case 'pasadia': return '☀️ Pasadía';
      case 'amanecida': return '🌙 Amanecida';
      case 'ambas': return '☀️🌙 Ambas';
      case 'evento': return '🎉 Evento';
      default: return modality;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que haya villas en el carrito
    if (cartItems.length === 0) {
      alert('Por favor, agrega al menos una villa a tu lista de interés');
      return;
    }

    // Validar campos requeridos
    if (!formData.nombre || !formData.telefono || !formData.fechaInteres || !formData.cantidadPersonas) {
      alert('Por favor, completa todos los campos obligatorios (Nombre, Teléfono, Fecha, Cantidad de Personas)');
      return;
    }

    // Construir mensaje para WhatsApp
    let mensaje = `*SOLICITUD DE COTIZACIÓN*\n\n`;
    mensaje += `*Datos del Cliente:*\n`;
    mensaje += `👤 Nombre: ${formData.nombre}\n`;
    mensaje += `📱 Teléfono: ${formData.telefono}\n`;
    mensaje += `📅 Fecha de Interés: ${formData.fechaInteres}\n`;
    
    if (formData.modalidadGeneral) {
      mensaje += `⏰ Modalidad: ${formData.modalidadGeneral}\n`;
    }
    
    if (formData.tipoActividad) {
      mensaje += `🎊 Tipo de Actividad: ${formData.tipoActividad}\n`;
    }

    mensaje += `\n*Villas de Interés (${cartItems.length}):*\n\n`;

    cartItems.forEach((item, index) => {
      mensaje += `${index + 1}. *${item.code}*\n`;
      mensaje += `   📍 Zona: ${item.zone}\n`;
      mensaje += `   ${getModalityLabel(item.modality)}\n`;
      if (item.price > 0) {
        mensaje += `   💰 Precio: ${item.currency} ${item.price.toLocaleString()}\n`;
      }
      mensaje += `\n`;
    });

    mensaje += `_Enviado desde: ${window.location.origin}/pagina-web_`;

    // Enviar solicitud al backend
    try {
      const backendUrl = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${backendUrl}/api/quote-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          telefono: formData.telefono,
          fecha_interes: formData.fechaInteres,
          cantidad_personas: formData.cantidadPersonas,
          modalidad_general: formData.modalidadGeneral,
          tipo_actividad: formData.tipoActividad,
          nota_adicional: formData.notaAdicional,
          villas: cartItems.map(item => ({
            code: item.code,
            zone: item.zone,
            modality: item.modality,
            price: item.price,
            currency: item.currency
          }))
        })
      });

      const result = await response.json();

      if (response.ok) {
        // Mostrar modal de confirmación grande
        const confirmationModal = document.createElement('div');
        confirmationModal.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
        `;
        
        confirmationModal.innerHTML = `
          <div style="
            background: white;
            padding: 40px;
            border-radius: 20px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
          ">
            <div style="font-size: 4rem; margin-bottom: 20px;">✅</div>
            <h2 style="color: #080644; margin-bottom: 20px; font-size: 1.8rem;">¡Gracias ${result.nombre}!</h2>
            <p style="color: #666; font-size: 1.1rem; line-height: 1.6; margin-bottom: 20px;">
              Tu solicitud ha sido enviada exitosamente.<br/>
              Nos comunicaremos contigo lo más pronto posible.
            </p>
            <div style="
              background: linear-gradient(135deg, #080644 0%, #CFA57D 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              margin-bottom: 20px;
            ">
              <div style="font-size: 0.9rem; margin-bottom: 5px;">Tu número de solicitud es:</div>
              <div style="font-size: 2.5rem; font-weight: bold;">#${result.request_number}</div>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" style="
              background: #080644;
              color: white;
              border: none;
              padding: 15px 40px;
              border-radius: 10px;
              font-size: 1.1rem;
              cursor: pointer;
              font-weight: bold;
            ">
              Cerrar
            </button>
          </div>
        `;
        
        document.body.appendChild(confirmationModal);
        
        // Limpiar carrito y formulario
        clearCart();
        setFormData({
          nombre: '',
          telefono: '',
          fechaInteres: '',
          cantidadPersonas: '',
          modalidadGeneral: '',
          tipoActividad: '',
          notaAdicional: ''
        });
        closeCart();
      } else {
        alert('❌ Error al enviar la solicitud. Por favor, intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al enviar solicitud:', error);
      alert('❌ Error de conexión. Por favor, verifica tu internet e intenta nuevamente.');
    }
  };

  return (
    <div 
      onClick={closeCart}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
        overflow: 'auto'
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'white',
          borderRadius: '15px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}
      >
        {/* Botón cerrar */}
        <button
          onClick={closeCart}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '35px',
            height: '35px',
            fontSize: '20px',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          ×
        </button>

        <div style={{ padding: '30px' }}>
          <h2 style={{ fontSize: '1.8rem', color: '#080644', marginBottom: '20px' }}>
            🛒 Mis Villas de Interés ({cartItems.length})
          </h2>

          {/* Lista de villas */}
          {cartItems.length > 0 ? (
            <div style={{ marginBottom: '30px' }}>
              {cartItems.map((item) => (
                <div 
                  key={item.id}
                  style={{
                    background: '#f9fafb',
                    padding: '15px',
                    borderRadius: '10px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#080644', marginBottom: '5px' }}>
                      {item.code}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '3px' }}>
                      📍 {item.zone}
                    </div>
                    <div style={{ fontSize: '0.9rem', color: '#666', marginBottom: '3px' }}>
                      {getModalityLabel(item.modality)}
                    </div>
                    {item.price > 0 && (
                      <div style={{ fontSize: '0.95rem', color: '#CFA57D', fontWeight: 'bold' }}>
                        💰 {item.currency} {item.price.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      padding: '8px 15px',
                      cursor: 'pointer',
                      fontSize: '0.9rem'
                    }}
                  >
                    Eliminar
                  </button>
                </div>
              ))}
              <button
                onClick={clearCart}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #ef4444',
                  borderRadius: '5px',
                  padding: '8px 15px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  marginTop: '10px'
                }}
              >
                Limpiar todas
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
              <p style={{ fontSize: '1.2rem', marginBottom: '10px' }}>🛒</p>
              <p>No has agregado villas aún</p>
              <p style={{ fontSize: '0.9rem' }}>Explora nuestro catálogo y agrega las que te interesen</p>
            </div>
          )}

          {/* Formulario */}
          <form onSubmit={handleSubmit}>
            <h3 style={{ fontSize: '1.3rem', color: '#080644', marginBottom: '15px' }}>
              📋 Información de Contacto
            </h3>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>
                Nombre completo *
              </label>
              <input
                type="text"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>
                Teléfono *
              </label>
              <input
                type="tel"
                required
                value={formData.telefono}
                onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
                placeholder="Ej: 809-555-1234"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>
                Fecha de interés *
              </label>
              <input
                type="date"
                required
                value={formData.fechaInteres}
                onChange={(e) => setFormData({...formData, fechaInteres: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>
                Cantidad de personas *
              </label>
              <input
                type="text"
                required
                value={formData.cantidadPersonas}
                onChange={(e) => setFormData({...formData, cantidadPersonas: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
                placeholder="Ej: 10 personas, 15 adultos y 5 niños, etc."
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>
                Modalidad preferida
              </label>
              <select
                value={formData.modalidadGeneral}
                onChange={(e) => setFormData({...formData, modalidadGeneral: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
              >
                <option value="">Selecciona una opción</option>
                <option value="Pasadía">☀️ Pasadía</option>
                <option value="Amanecida">🌙 Amanecida</option>
                <option value="Ambas">☀️🌙 Ambas</option>
                <option value="Evento">🎉 Evento</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>
                Tipo de actividad
              </label>
              <input
                type="text"
                value={formData.tipoActividad}
                onChange={(e) => setFormData({...formData, tipoActividad: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem'
                }}
                placeholder="Ej: Cumpleaños, Reunión familiar, etc."
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', fontSize: '0.9rem' }}>
                Nota o requerimiento adicional
              </label>
              <textarea
                value={formData.notaAdicional}
                onChange={(e) => setFormData({...formData, notaAdicional: e.target.value})}
                rows="3"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Ej: Necesito decoración especial, música, etc."
              />
            </div>

            <button
              type="submit"
              disabled={cartItems.length === 0}
              style={{
                width: '100%',
                padding: '15px',
                background: cartItems.length === 0 ? '#d1d5db' : 'linear-gradient(135deg, #080644 0%, #CFA57D 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '10px',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                cursor: cartItems.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <span style={{ fontSize: '1.3rem' }}>📧</span>
              Enviar Solicitud
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CartModal;
