import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Villas = () => {
  const [villasByZone, setVillasByZone] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState('all');

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

  const getPriceRange = (villa) => {
    let prices = [];
    if (villa.pasadia_prices && villa.pasadia_prices.length > 0) {
      prices = [...prices, ...villa.pasadia_prices.map(p => p.client_price)];
    }
    if (villa.amanecida_prices && villa.amanecida_prices.length > 0) {
      prices = [...prices, ...villa.amanecida_prices.map(p => p.client_price)];
    }
    if (villa.evento_prices && villa.evento_prices.length > 0) {
      prices = [...prices, ...villa.evento_prices.map(p => p.client_price)];
    }
    
    if (prices.length === 0) return 'Precio bajo consulta';
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice === maxPrice) {
      return `RD$ ${minPrice.toLocaleString()}`;
    }
    return `Desde RD$ ${minPrice.toLocaleString()}`;
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
              <option value="all">📍 Todas las Zonas</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>
                  📍 {zone}
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
                  {villasByZone[zone].map(villa => (
                    <div key={villa.id} className="card">
                      <div 
                        className="card-image" 
                        style={{ 
                          background: 'linear-gradient(135deg, #080644 0%, #EDDEBB 100%)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          color: 'white', 
                          fontSize: '2rem',
                          flexDirection: 'column'
                        }}
                      >
                        🏠
                        <p style={{ fontSize: '1rem', marginTop: '10px' }}>{villa.code}</p>
                      </div>
                      <div className="card-content">
                        <h3 className="card-title">{villa.name}</h3>
                        {villa.description && (
                          <p className="card-description">{villa.description}</p>
                        )}
                        <div style={{ marginTop: '15px' }}>
                          <p style={{ fontSize: '0.9rem', color: '#666' }}>
                            👥 Hasta {villa.max_guests} personas
                          </p>
                          <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#080644', marginTop: '10px' }}>
                            {getPriceRange(villa)}
                          </p>
                        </div>
                        <a 
                          href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER.replace(/\+/g, '')}?text=${encodeURIComponent(`Hola! Me interesa la villa ${villa.name} (${villa.code}). ¿Podrían darme más información?`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary" 
                          style={{ marginTop: '15px', width: '100%', textAlign: 'center' }}
                        >
                          Consultar Disponibilidad
                        </a>
                      </div>
                    </div>
                  ))}
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
