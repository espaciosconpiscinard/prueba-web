import React from 'react';
import Hero from '../components/Hero';

const Home = () => {
  return (
    <div className="home">
      <Hero />
      
      {/* Services Preview Section */}
      <section className="services-preview" style={{ background: '#f5f5f5' }}>
        <div className="container">
          <h2 className="section-title">Nuestros Servicios</h2>
          <p className="section-subtitle">
            Ofrecemos una amplia gama de servicios para hacer de tu evento algo memorable
          </p>
          
          <div className="cards-grid">
            <div className="card">
              <div className="card-image" style={{ background: 'linear-gradient(135deg, #080644 0%, #EDDEBB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem' }}>
                🏠
              </div>
              <div className="card-content">
                <h3 className="card-title">Villas & Espacios</h3>
                <p className="card-description">
                  Alquiler de villas exclusivas en las mejores zonas de República Dominicana
                </p>
                <a href="/villas" className="btn-primary">Ver Catálogo</a>
              </div>
            </div>

            <div className="card">
              <div className="card-image" style={{ background: 'linear-gradient(135deg, #CFA57D 0%, #EDDEBB 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem' }}>
                🎉
              </div>
              <div className="card-content">
                <h3 className="card-title">Eventos</h3>
                <p className="card-description">
                  Organización de eventos sociales y empresariales con decoración incluida
                </p>
                <a href="/servicios" className="btn-primary">Ver Servicios</a>
              </div>
            </div>

            <div className="card">
              <div className="card-image" style={{ background: 'linear-gradient(135deg, #080644 0%, #CFA57D 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '3rem' }}>
                🍽️
              </div>
              <div className="card-content">
                <h3 className="card-title">Catering & Mobiliario</h3>
                <p className="card-description">
                  Servicio de catering profesional y alquiler de mobiliario para eventos
                </p>
                <a href="/servicios" className="btn-primary">Más Información</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section style={{ background: 'linear-gradient(135deg, #080644 0%, #CFA57D 100%)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 className="section-title" style={{ color: 'white' }}>¿Listo para tu Evento Perfecto?</h2>
          <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
            Cotiza ahora y obtén las mejores ofertas para tu celebración
          </p>
          <a href="/cotizar" className="btn-primary">Solicitar Cotización</a>
        </div>
      </section>
    </div>
  );
};

export default Home;
