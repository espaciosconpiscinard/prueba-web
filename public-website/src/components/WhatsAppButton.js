import React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

const WhatsAppButton = () => {
  const whatsappNumber = process.env.REACT_APP_WHATSAPP_NUMBER;
  const message = encodeURIComponent('Hola! Me gustaría obtener más información sobre sus servicios.');
  const whatsappURL = `https://wa.me/${whatsappNumber.replace(/\+/g, '')}?text=${message}`;

  return (
    <a 
      href={whatsappURL}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-btn"
      title="Contáctanos por WhatsApp"
    >
      <FaWhatsapp />
    </a>
  );
};

export default WhatsAppButton;
