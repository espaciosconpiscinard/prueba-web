import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Hero = () => {
  const [content, setContent] = useState({
    title: 'Espacios Con Piscina',
    subtitle: 'Tu destino perfecto en República Dominicana',
    description: 'Alquiler de villas, hoteles, resort, decoración de eventos y más',
    button_text: 'Ver Villas',
    button_link: '/villas'
  });

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/cms/content?section=hero`);
      if (response.data && response.data.length > 0) {
        setContent(response.data[0]);
      }
    } catch (error) {
      console.log('Using default hero content');
    }
  };

  return (
    <section className="hero">
      <div className="container">
        <h1>{content.title}</h1>
        <p>{content.subtitle}</p>
        <p>{content.description}</p>
        <a href={content.button_link} className="btn-primary">
          {content.button_text}
        </a>
      </div>
    </section>
  );
};

export default Hero;
