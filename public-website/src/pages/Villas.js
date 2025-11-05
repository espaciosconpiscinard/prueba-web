import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const Villas = () => {
  const { addToCart } = useCart();
  const [villasByZone, setVillasByZone] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedVilla, setSelectedVilla] = useState(null); // Para el modal
  const [currentImageIndex, setCurrentImageIndex] = useState({}); // Para controlar el slide de cada villa
  const [showModalitySelector, setShowModalitySelector] = useState(null); // Para mostrar selector de modalidad

  useEffect(() => {
    fetchVillas();
  }, []);

  const fetchVillas = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/public/villas`);
      setVillasByZone(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching villas:', error);
      setLoading(false);
    }
  };

  const zones = Object.keys(villasByZone);

  const nextImage = (villaId, e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [villaId]: ((prev[villaId] || 0) + 1)
    }));
  };

  const prevImage = (villaId, e) => {
    e.stopPropagation();
    setCurrentImageIndex(prev => ({
      ...prev,
      [villaId]: Math.max((prev[villaId] || 0) - 1, 0)
    }));
  };

  const openVillaDetails = (villa) => {
    setSelectedVilla(villa);
    setCurrentImageIndex(prev => ({ ...prev, [villa.id]: 0 }));
  };

  const closeModal = () => {
    setSelectedVilla(null);
  };

  const handleAddToCart = (villa, modality) => {
    const success = addToCart(villa, modality);
    if (success) {
      alert(`✅ ${villa.code} agregada a tu lista de interés`);
    }
    setShowModalitySelector(null);
  };

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Cargando villas...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      <section style={{ background: 'linear-gradient(135deg, #080644 0%, #CFA57D 100%)', color: 'white', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Catálogo de Villas</h1>
          <p style={{ fontSize: '1.2rem' }}>Encuentra el espacio perfecto para tu evento</p>
        </div>
      </section>

      {/* Zone Filter */}
      <section style={{ padding: '20px 0', background: '#f5f5f5' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
            <label style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#080644' }}>
              Filtrar por zona:
            </label>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              style={{
                padding: '12px 40px 12px 20px',
                fontSize: '1rem',
                border: '2px solid #080644',
                borderRadius: '10px',
                background: 'white',
                color: '#080644',
                cursor: 'pointer',
                fontWeight: 'bold',
                outline: 'none',
                minWidth: '250px'
              }}
            >
              <option value="all">📍 Todas las Zonas ({Object.values(villasByZone).reduce((sum, villas) => sum + villas.length, 0)} villas)</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>
                  📍 {zone} ({villasByZone[zone]?.length || 0} villas)
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Villas by Zone */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          {zones.map(zone => {
            if (selectedZone !== 'all' && selectedZone !== zone) return null;
            
            return (
              <div key={zone} style={{ marginBottom: '60px' }}>
                <h2 style={{ fontSize: '2rem', color: '#080644', marginBottom: '30px', borderLeft: '5px solid #CFA57D', paddingLeft: '15px' }}>
                  {zone}
                </h2>
                
                <div className="cards-grid">
                  {console.log('🏘️ ZONA:', zone, 'Villas:', villasByZone[zone])}
                  {villasByZone[zone].map(villa => {
                    console.log('🏠 Renderizando villa:', villa.code, 'pasadia_prices:', villa.pasadia_prices);
                    const currentIdx = currentImageIndex[villa.id] || 0;
                    const hasImages = villa.images && villa.images.length > 0;
                    const currentImage = hasImages ? villa.images[currentIdx % villa.images.length] : null;
                    
                    return (
                    <div key={villa.id} className="card" onClick={() => openVillaDetails(villa)} style={{ cursor: 'pointer' }}>
                      {/* Carrusel de imágenes */}
                      {hasImages ? (
                        <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
                          {currentImage.startsWith('data:video') ? (
                            <video 
                              src={currentImage}
                              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                            />
                          ) : (
                            <img 
                              src={currentImage} 
                              alt={villa.code}
                              className="card-image"
                              style={{ width: '100%', height: '160px', objectFit: 'cover' }}
                            />
                          )}
                          
                          {/* Controles del carrusel */}
                          {villa.images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => prevImage(villa.id, e)}
                                style={{
                                  position: 'absolute',
                                  left: '5px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '28px',
                                  height: '28px',
                                  fontSize: '16px',
                                  cursor: 'pointer',
                                  display: currentIdx > 0 ? 'flex' : 'none',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ‹
                              </button>
                              <button
                                onClick={(e) => nextImage(villa.id, e)}
                                style={{
                                  position: 'absolute',
                                  right: '5px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '28px',
                                  height: '28px',
                                  fontSize: '16px',
                                  cursor: 'pointer',
                                  display: currentIdx < villa.images.length - 1 ? 'flex' : 'none',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                ›
                              </button>
                              {/* Indicador de posición */}
                              <div style={{
                                position: 'absolute',
                                bottom: '5px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                fontSize: '0.75rem'
                              }}>
                                {currentIdx + 1} / {villa.images.length}
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div 
                          className="card-image" 
                          style={{ 
                            background: 'linear-gradient(135deg, #080644 0%, #EDDEBB 100%)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white', 
                            fontSize: '3rem',
                            height: '160px'
                          }}
                        >
                          🏠
                        </div>
                      )}
                      
                      <div className="card-content">
                        <h3 className="card-title" style={{ fontSize: '1.2rem', textAlign: 'center', color: '#080644', marginBottom: '8px' }}>
                          {villa.code}
                        </h3>
                        
                        {/* Información de catálogo dividida por modalidad */}
                        <div style={{ marginTop: '10px', fontSize: '0.75rem' }}>
                          {console.log('🔍 Villa:', villa.code, 'pasadia_prices:', villa.pasadia_prices)}
                          {/* PASADÍA - Precios */}
                          {villa.pasadia_prices && villa.pasadia_prices.length > 0 && (
                            <div style={{ marginBottom: '8px', padding: '8px', background: '#eff6ff', borderRadius: '6px', border: '1px solid #3b82f6' }}>
                              <div style={{ fontWeight: 'bold', color: '#1e40af', marginBottom: '4px', fontSize: '0.8rem' }}>
                                ☀️ Pasadía
                              </div>
                              {villa.pasadia_prices.map((price, idx) => (
                                <div key={idx} style={{ marginBottom: '2px', fontSize: '0.7rem' }}>
                                  <span style={{ color: '#666' }}>{price.label}:</span>{' '}
                                  <span style={{ fontWeight: 'bold', color: '#CFA57D' }}>
                                    RD$ {parseFloat(price.client_price || 0).toLocaleString('es-DO', {minimumFractionDigits: 0})}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* AMANECIDA - Precios */}
                          {villa.amanecida_prices && villa.amanecida_prices.length > 0 && (
                            <div style={{ marginBottom: '8px', padding: '8px', background: '#eef2ff', borderRadius: '6px', border: '1px solid #6366f1' }}>
                              <div style={{ fontWeight: 'bold', color: '#4338ca', marginBottom: '4px', fontSize: '0.8rem' }}>
                                🌙 Amanecida
                              </div>
                              {villa.amanecida_prices.map((price, idx) => (
                                <div key={idx} style={{ marginBottom: '2px', fontSize: '0.7rem' }}>
                                  <span style={{ color: '#666' }}>{price.label}:</span>{' '}
                                  <span style={{ fontWeight: 'bold', color: '#CFA57D' }}>
                                    RD$ {parseFloat(price.client_price || 0).toLocaleString('es-DO', {minimumFractionDigits: 0})}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          {/* Amenidades - solo 2 */}
                          {villa.amenities && villa.amenities.length > 0 && (
                            <div style={{ marginTop: '6px', textAlign: 'center' }}>
                              {villa.amenities.slice(0, 2).map((amenity, idx) => (
                                <span 
                                  key={idx}
                                  style={{
                                    display: 'inline-block',
                                    background: '#080644',
                                    color: 'white',
                                    fontSize: '0.6rem',
                                    padding: '2px 5px',
                                    borderRadius: '8px',
                                    margin: '1px'
                                  }}
                                >
                                  ✓ {amenity}
                                </span>
                              ))}
                              {villa.amenities.length > 2 && (
                                <span style={{ fontSize: '0.65rem', color: '#666' }}> +{villa.amenities.length - 2}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Botón Agregar a Lista de Interés */}
                        <div style={{ position: 'relative', marginTop: '15px' }}>
                          <button 
                            onClick={(e) => { 
                              e.stopPropagation(); 
                              setShowModalitySelector(showModalitySelector === villa.id ? null : villa.id);
                            }}
                            style={{ 
                              width: '100%',
                              padding: '8px',
                              background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              fontSize: '0.85rem',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            🛒 Agregar a mi Lista
                          </button>

                          {/* Selector de modalidad */}
                          {showModalitySelector === villa.id && (
                            <div style={{
                              position: 'absolute',
                              bottom: '45px',
                              left: '0',
                              right: '0',
                              background: 'white',
                              border: '2px solid #080644',
                              borderRadius: '8px',
                              padding: '10px',
                              zIndex: 100,
                              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                            }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '8px', color: '#080644' }}>
                                Selecciona modalidad:
                              </div>
                              {villa.has_pasadia && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(villa, 'pasadia'); }}
                                  style={{
                                    width: '100%',
                                    padding: '6px',
                                    marginBottom: '5px',
                                    background: '#eff6ff',
                                    border: '1px solid #3b82f6',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                >
                                  ☀️ Pasadía
                                </button>
                              )}
                              {villa.has_amanecida && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(villa, 'amanecida'); }}
                                  style={{
                                    width: '100%',
                                    padding: '6px',
                                    marginBottom: '5px',
                                    background: '#eef2ff',
                                    border: '1px solid #6366f1',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                >
                                  🌙 Amanecida
                                </button>
                              )}
                              {villa.has_pasadia && villa.has_amanecida && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleAddToCart(villa, 'ambas'); }}
                                  style={{
                                    width: '100%',
                                    padding: '6px',
                                    marginBottom: '5px',
                                    background: '#f0fdf4',
                                    border: '1px solid #22c55e',
                                    borderRadius: '4px',
                                    fontSize: '0.75rem',
                                    cursor: 'pointer',
                                    textAlign: 'left'
                                  }}
                                >
                                  ☀️🌙 Ambas
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleAddToCart(villa, 'evento'); }}
                                style={{
                                  width: '100%',
                                  padding: '6px',
                                  background: '#fef3c7',
                                  border: '1px solid #f59e0b',
                                  borderRadius: '4px',
                                  fontSize: '0.75rem',
                                  cursor: 'pointer',
                                  textAlign: 'left'
                                }}
                              >
                                🎉 Evento
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              </div>
            );
          })}

          {zones.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ fontSize: '1.2rem', color: '#666' }}>
                No hay villas disponibles en este momento. Por favor contáctanos para más información.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Modal de Detalles de Villa */}
      {selectedVilla && (
        <div 
          onClick={closeModal}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
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
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              position: 'relative'
            }}
          >
            {/* Botón cerrar */}
            <button
              onClick={closeModal}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                fontSize: '24px',
                cursor: 'pointer',
                zIndex: 10
              }}
            >
              ×
            </button>

            {/* Carrusel de imágenes grande */}
            {selectedVilla.images && selectedVilla.images.length > 0 && (
              <div style={{ position: 'relative', height: '400px', background: '#000' }}>
                {selectedVilla.images[currentImageIndex[selectedVilla.id] || 0].startsWith('data:video') ? (
                  <video 
                    src={selectedVilla.images[currentImageIndex[selectedVilla.id] || 0]}
                    controls
                    style={{ width: '100%', height: '400px', objectFit: 'contain' }}
                  />
                ) : (
                  <img 
                    src={selectedVilla.images[currentImageIndex[selectedVilla.id] || 0]}
                    alt={selectedVilla.code}
                    style={{ width: '100%', height: '400px', objectFit: 'contain' }}
                  />
                )}
                
                {selectedVilla.images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => prevImage(selectedVilla.id, e)}
                      style={{
                        position: 'absolute',
                        left: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        fontSize: '28px',
                        cursor: 'pointer',
                        display: (currentImageIndex[selectedVilla.id] || 0) > 0 ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ‹
                    </button>
                    <button
                      onClick={(e) => nextImage(selectedVilla.id, e)}
                      style={{
                        position: 'absolute',
                        right: '20px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        fontSize: '28px',
                        cursor: 'pointer',
                        display: (currentImageIndex[selectedVilla.id] || 0) < selectedVilla.images.length - 1 ? 'flex' : 'none',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ›
                    </button>
                    <div style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(0,0,0,0.7)',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      fontSize: '1rem'
                    }}>
                      {(currentImageIndex[selectedVilla.id] || 0) + 1} / {selectedVilla.images.length}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Contenido del modal */}
            <div style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '1.8rem', color: '#080644', marginBottom: '10px', marginTop: '0' }}>
                {selectedVilla.code}
              </h2>
              
              {/* Sección PASADÍA */}
              {(selectedVilla.has_pasadia && selectedVilla.pasadia_prices && selectedVilla.pasadia_prices.length > 0) && (
                <div style={{ marginBottom: '15px', padding: '15px', background: '#eff6ff', borderRadius: '10px', border: '2px solid #3b82f6' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#1e40af', marginBottom: '10px', fontWeight: 'bold' }}>
                    ☀️ Pasadía
                  </h3>
                  
                  {/* Descripción Detallada Pasadía */}
                  {selectedVilla.public_description_pasadia && (
                    <div style={{ marginBottom: '12px', padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
                      <p style={{ 
                        fontSize: '0.9rem', 
                        lineHeight: '1.6', 
                        color: '#1e40af',
                        margin: 0,
                        whiteSpace: 'pre-line'
                      }}>
                        {selectedVilla.public_description_pasadia}
                      </p>
                    </div>
                  )}
                  
                  {/* Horarios */}
                  {selectedVilla.check_in_time_pasadia && selectedVilla.check_out_time_pasadia && (
                    <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#1e3a8a' }}>
                      <strong>🕐 Horario:</strong> {selectedVilla.check_in_time_pasadia} - {selectedVilla.check_out_time_pasadia}
                    </p>
                  )}
                  
                  {/* Capacidad */}
                  {selectedVilla.max_guests && (
                    <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#1e3a8a' }}>
                      <strong>👥 Capacidad:</strong> Hasta {selectedVilla.max_guests} personas
                    </p>
                  )}
                  
                  {/* Precios Flexibles */}
                  {selectedVilla.pasadia_prices && selectedVilla.pasadia_prices.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#1e40af' }}>💰 Precios:</strong>
                      {selectedVilla.pasadia_prices.map((price, idx) => (
                        <div key={idx} style={{ marginLeft: '10px', marginTop: '5px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#666' }}>{price.label}:</span>{' '}
                          <span style={{ fontWeight: 'bold', color: '#CFA57D' }}>
                            RD$ {parseFloat(price.client_price || 0).toLocaleString('es-DO', {minimumFractionDigits: 0})}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sección AMANECIDA */}
              {(selectedVilla.has_amanecida && selectedVilla.amanecida_prices && selectedVilla.amanecida_prices.length > 0) && (
                <div style={{ marginBottom: '15px', padding: '15px', background: '#eef2ff', borderRadius: '10px', border: '2px solid #6366f1' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#4338ca', marginBottom: '10px', fontWeight: 'bold' }}>
                    🌙 Amanecida
                  </h3>
                  
                  {/* Descripción Detallada Amanecida */}
                  {selectedVilla.public_description_amanecida && (
                    <div style={{ marginBottom: '12px', padding: '10px', background: 'white', borderRadius: '6px', border: '1px solid #c7d2fe' }}>
                      <p style={{ 
                        fontSize: '0.9rem', 
                        lineHeight: '1.6', 
                        color: '#4338ca',
                        margin: 0,
                        whiteSpace: 'pre-line'
                      }}>
                        {selectedVilla.public_description_amanecida}
                      </p>
                    </div>
                  )}
                  
                  {/* Horarios */}
                  {selectedVilla.check_in_time_amanecida && selectedVilla.check_out_time_amanecida && (
                    <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#312e81' }}>
                      <strong>🕐 Horario:</strong> {selectedVilla.check_in_time_amanecida} - {selectedVilla.check_out_time_amanecida}
                    </p>
                  )}
                  
                  {/* Capacidad */}
                  {selectedVilla.max_guests && (
                    <p style={{ fontSize: '0.9rem', marginBottom: '8px', color: '#312e81' }}>
                      <strong>👥 Capacidad:</strong> Hasta {selectedVilla.max_guests} personas
                    </p>
                  )}
                  
                  {/* Precios Flexibles */}
                  {selectedVilla.amanecida_prices && selectedVilla.amanecida_prices.length > 0 && (
                    <div style={{ marginBottom: '10px' }}>
                      <strong style={{ fontSize: '0.95rem', color: '#4338ca' }}>💰 Precios:</strong>
                      {selectedVilla.amanecida_prices.map((price, idx) => (
                        <div key={idx} style={{ marginLeft: '10px', marginTop: '5px', fontSize: '0.9rem' }}>
                          <span style={{ color: '#666' }}>{price.label}:</span>{' '}
                          <span style={{ fontWeight: 'bold', color: '#CFA57D' }}>
                            RD$ {parseFloat(price.client_price || 0).toLocaleString('es-DO', {minimumFractionDigits: 0})}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Amenidades */}
              {selectedVilla.amenities && selectedVilla.amenities.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1rem', color: '#080644', marginBottom: '8px', fontWeight: 'bold' }}>
                    ✨ Amenidades
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {selectedVilla.amenities.map((amenity, idx) => (
                      <span 
                        key={idx}
                        style={{
                          background: '#080644',
                          color: 'white',
                          fontSize: '0.8rem',
                          padding: '5px 10px',
                          borderRadius: '15px'
                        }}
                      >
                        ✓ {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Características */}
              {selectedVilla.features && selectedVilla.features.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <h3 style={{ fontSize: '1rem', color: '#080644', marginBottom: '8px', fontWeight: 'bold' }}>
                    ⭐ Características Destacadas
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {selectedVilla.features.map((feature, idx) => (
                      <li key={idx} style={{ fontSize: '0.85rem', color: '#CFA57D', marginBottom: '5px' }}>
                        ★ {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Botón Agregar al Carrito */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    setShowModalitySelector(showModalitySelector === selectedVilla.id ? null : selectedVilla.id);
                  }}
                  style={{ 
                    width: '100%',
                    padding: '15px',
                    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '10px',
                    fontSize: '1.1rem',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🛒 Agregar a mi Lista de Interés
                </button>

                {/* Selector de modalidad para el modal */}
                {showModalitySelector === selectedVilla.id && (
                  <div style={{
                    position: 'absolute',
                    bottom: '70px',
                    left: '0',
                    right: '0',
                    background: 'white',
                    border: '2px solid #080644',
                    borderRadius: '8px',
                    padding: '15px',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                  }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px', color: '#080644' }}>
                      Selecciona modalidad:
                    </div>
                    {selectedVilla.has_pasadia && (
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleAddToCart(selectedVilla, 'pasadia');
                          closeModal();
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          marginBottom: '8px',
                          background: '#eff6ff',
                          border: '1px solid #3b82f6',
                          borderRadius: '5px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        ☀️ Pasadía
                      </button>
                    )}
                    {selectedVilla.has_amanecida && (
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleAddToCart(selectedVilla, 'amanecida');
                          closeModal();
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          marginBottom: '8px',
                          background: '#eef2ff',
                          border: '1px solid #6366f1',
                          borderRadius: '5px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        🌙 Amanecida
                      </button>
                    )}
                    {selectedVilla.has_pasadia && selectedVilla.has_amanecida && (
                      <button
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          handleAddToCart(selectedVilla, 'ambas');
                          closeModal();
                        }}
                        style={{
                          width: '100%',
                          padding: '10px',
                          marginBottom: '8px',
                          background: '#f0fdf4',
                          border: '1px solid #22c55e',
                          borderRadius: '5px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        ☀️🌙 Ambas
                      </button>
                    )}
                    <button
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleAddToCart(selectedVilla, 'evento');
                        closeModal();
                      }}
                      style={{
                        width: '100%',
                        padding: '10px',
                        background: '#fef3c7',
                        border: '1px solid #f59e0b',
                        borderRadius: '5px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      🎉 Evento
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Villas;
