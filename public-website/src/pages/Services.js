import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Services = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/cms/services`);
      setServices(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching services:', error);
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', name: 'Todos los Servicios', icon: '🎯' },
    { id: 'hoteles', name: 'Hoteles', icon: '🏨' },
    { id: 'resort', name: 'Resort', icon: '🏖️' },
    { id: 'decoracion', name: 'Decoración', icon: '🎨' },
    { id: 'eventos', name: 'Eventos', icon: '🎉' },
    { id: 'mobiliario', name: 'Mobiliario', icon: '🪑' },
    { id: 'catering', name: 'Catering', icon: '🍽️' },
  ];

  const filteredServices = selectedCategory === 'all' 
    ? services 
    : services.filter(s => s.category === selectedCategory);

  if (loading) {
    return (
      <div style={{ paddingTop: '80px', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Cargando servicios...</p>
      </div>
    );
  }

  return (
    <div style={{ paddingTop: '80px', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(135deg, #080644 0%, #CFA57D 100%)', color: 'white', padding: '60px 0', textAlign: 'center' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Nuestros Servicios</h1>
          <p style={{ fontSize: '1.2rem' }}>
            Todo lo que necesitas para hacer de tu evento algo extraordinario
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section style={{ padding: '20px 0', background: '#f5f5f5' }}>
        <div className="container">
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '20px',
                  background: selectedCategory === cat.id ? '#080644' : 'white',
                  color: selectedCategory === cat.id ? 'white' : '#080644',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section style={{ padding: '60px 0' }}>
        <div className="container">
          {filteredServices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
                {selectedCategory === 'all' 
                  ? '¡Próximamente agregaremos nuestros servicios aquí!' 
                  : 'No hay servicios disponibles en esta categoría.'}
              </p>
              <p style={{ color: '#999' }}>
                Mientras tanto, contáctanos por WhatsApp para conocer todos nuestros servicios
              </p>
              <a 
                href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER.replace(/\+/g, '')}?text=${encodeURIComponent('Hola! Me gustaría conocer sus servicios.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ marginTop: '20px' }}
              >
                Contactar por WhatsApp
              </a>
            </div>
          ) : (
            <div className="cards-grid">
              {filteredServices.map(service => (
                <div key={service.id} className="card">
                  {service.image_url ? (
                    <img 
                      src={service.image_url} 
                      alt={service.name}
                      className="card-image"
                    />
                  ) : (
                    <div 
                      className="card-image" 
                      style={{ 
                        background: 'linear-gradient(135deg, #080644 0%, #EDDEBB 100%)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: 'white', 
                        fontSize: '3rem'
                      }}
                    >
                      {categories.find(c => c.id === service.category)?.icon || '📦'}
                    </div>
                  )}
                  <div className="card-content">
                    <h3 className="card-title">{service.name}</h3>
                    {service.description && (
                      <p className="card-description">{service.description}</p>
                    )}
                    {service.price_range && (
                      <p style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#080644', marginTop: '10px' }}>
                        {service.price_range}
                      </p>
                    )}
                    {service.features && service.features.length > 0 && (
                      <ul style={{ marginTop: '15px', listStyle: 'none', padding: 0 }}>
                        {service.features.slice(0, 3).map((feature, idx) => (
                          <li key={idx} style={{ fontSize: '0.9rem', color: '#666', marginBottom: '5px' }}>
                            ✓ {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <a 
                      href={`https://wa.me/${process.env.REACT_APP_WHATSAPP_NUMBER.replace(/\+/g, '')}?text=${encodeURIComponent(`Hola! Me interesa el servicio de ${service.name}. ¿Podrían darme más información?`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ marginTop: '15px', width: '100%', textAlign: 'center' }}
                    >
                      Consultar
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ background: 'linear-gradient(135deg, #080644 0%, #CFA57D 100%)', color: 'white', textAlign: 'center', padding: '60px 0' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: 'white' }}>¿Necesitas un Servicio Personalizado?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Cotiza tu evento con todos los servicios que necesites
          </p>
          <a href="/cotizar" className="btn-primary">Solicitar Cotización Personalizada</a>
        </div>
      </section>
    </div>
  );
};

export default Services;
