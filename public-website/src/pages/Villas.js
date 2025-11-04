import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Villas = () => {
  const [villasByZone, setVillasByZone] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedVilla, setSelectedVilla] = useState(null); // Para el modal
  const [currentImageIndex, setCurrentImageIndex] = useState({}); // Para controlar el slide de cada villa

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
                  {villasByZone[zone].map(villa => {
                    const currentIdx = currentImageIndex[villa.id] || 0;
                    const hasImages = villa.images && villa.images.length > 0;
                    const currentImage = hasImages ? villa.images[currentIdx % villa.images.length] : null;
                    
                    return (
                    <div key={villa.id} className="card" onClick={() => openVillaDetails(villa)} style={{ cursor: 'pointer' }}>
                      {/* Carrusel de imágenes */}
                      {hasImages ? (
                        <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                          {currentImage.startsWith('data:video') ? (
                            <video 
                              src={currentImage}
                              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            />
                          ) : (
                            <img 
                              src={currentImage} 
                              alt={villa.code}
                              className="card-image"
                              style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                            />
                          )}
                          
                          {/* Controles del carrusel */}
                          {villa.images.length > 1 && (
                            <>
                              <button
                                onClick={(e) => prevImage(villa.id, e)}
                                style={{
                                  position: 'absolute',
                                  left: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '35px',
                                  height: '35px',
                                  fontSize: '18px',
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
                                  right: '10px',
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(0,0,0,0.6)',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '35px',
                                  height: '35px',
                                  fontSize: '18px',
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
                                bottom: '10px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                background: 'rgba(0,0,0,0.6)',
                                color: 'white',
                                padding: '3px 10px',
                                borderRadius: '12px',
                                fontSize: '0.85rem'
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
                            height: '200px'
                          }}
                        >
                          🏠
                        </div>
                      )}
                      
                      <div className="card-content">
                        <h3 className="card-title" style={{ fontSize: '1.8rem', textAlign: 'center', color: '#080644' }}>
                          {villa.code}
                        </h3>
                        
                        {villa.description && (
                          <p className="card-description" style={{ 
                            textAlign: 'center', 
                            marginTop: '10px',
                            whiteSpace: 'pre-line',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}>
                            {villa.description}
                          </p>
                        )}
                        
                        <div style={{ marginTop: '15px', textAlign: 'center' }}>
                          {/* Modalidades */}
                          {(villa.has_pasadia || villa.has_amanecida) && (
                            <div style={{ marginBottom: '10px', fontSize: '0.9rem' }}>
                              {villa.has_pasadia && villa.public_max_guests_pasadia && (
                                <span style={{ marginRight: '10px' }}>
                                  ☀️ Pasadía: {villa.public_max_guests_pasadia} personas
                                </span>
                              )}
                              {villa.has_amanecida && villa.public_max_guests_amanecida && (
                                <span>
                                  🌙 Amanecida: {villa.public_max_guests_amanecida} personas
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Amenidades - solo 2 */}
                          {villa.amenities && villa.amenities.length > 0 && (
                            <div style={{ marginTop: '10px' }}>
                              {villa.amenities.slice(0, 2).map((amenity, idx) => (
                                <span 
                                  key={idx}
                                  style={{
                                    display: 'inline-block',
                                    background: '#080644',
                                    color: 'white',
                                    fontSize: '0.75rem',
                                    padding: '3px 8px',
                                    borderRadius: '12px',
                                    margin: '2px'
                                  }}
                                >
                                  ✓ {amenity}
                                </span>
                              ))}
                              {villa.amenities.length > 2 && (
                                <span style={{ fontSize: '0.8rem', color: '#666' }}> +{villa.amenities.length - 2} más</span>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); openVillaDetails(villa); }}
                          className="btn-primary" 
                          style={{ marginTop: '20px', width: '100%', textAlign: 'center' }}
                        >
                          Ver Detalles Completos
                        </button>
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
    </div>
  );
};

export default Villas;
