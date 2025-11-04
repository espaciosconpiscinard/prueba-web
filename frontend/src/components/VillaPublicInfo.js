import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { Button } from './ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const VillaPublicInfo = ({ villa, onClose, onUpdate }) => {
  const [publicData, setPublicData] = useState({
    public_description: villa.public_description || '',
    public_images: villa.public_images || [],
    public_amenities: villa.public_amenities || [],
    public_features: villa.public_features || [],
    public_max_guests_pasadia: villa.public_max_guests_pasadia || villa.max_guests || 0,
    public_max_guests_amanecida: villa.public_max_guests_amanecida || villa.max_guests || 0,
    public_has_pasadia: villa.public_has_pasadia !== undefined ? villa.public_has_pasadia : villa.has_pasadia || false,
    public_has_amanecida: villa.public_has_amanecida !== undefined ? villa.public_has_amanecida : villa.has_amanecida || false
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);
  const [airbnbLink, setAirbnbLink] = useState('');
  const [generatingAI, setGeneratingAI] = useState(false);

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Verificar límite de 20
    if (publicData.public_images.length + files.length > 20) {
      alert('Solo puedes subir un máximo de 20 fotos/videos');
      return;
    }

    setUploading(true);
    const newImages = [];

    for (let file of files) {
      // Verificar que sea imagen o video
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        alert(`${file.name} no es una imagen o video válido`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        newImages.push(event.target.result);
        if (newImages.length === files.length || newImages.length + publicData.public_images.length >= 20) {
          setPublicData({
            ...publicData,
            public_images: [...publicData.public_images, ...newImages].slice(0, 20)
          });
          setUploading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index) => {
    const updated = publicData.public_images.filter((_, i) => i !== index);
    setPublicData({ ...publicData, public_images: updated });
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setPublicData({
        ...publicData,
        public_amenities: [...publicData.public_amenities, newAmenity.trim()]
      });
      setNewAmenity('');
    }
  };

  const removeAmenity = (index) => {
    const updated = publicData.public_amenities.filter((_, i) => i !== index);
    setPublicData({ ...publicData, public_amenities: updated });
  };

  const addFeature = () => {
    if (newFeature.trim()) {
      setPublicData({
        ...publicData,
        public_features: [...publicData.public_features, newFeature.trim()]
      });
      setNewFeature('');
    }
  };

  const removeFeature = (index) => {
    const updated = publicData.public_features.filter((_, i) => i !== index);
    setPublicData({ ...publicData, public_features: updated });
  };

  const generateDescriptionFromAirbnb = async () => {
    if (!airbnbLink.trim()) {
      alert('Por favor ingresa un link de Airbnb');
      return;
    }

    setGeneratingAI(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/ai/generate-description`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: airbnbLink })
      });

      if (response.ok) {
        const data = await response.json();
        setPublicData({
          ...publicData,
          public_description: data.description || '',
          public_amenities: data.amenities || publicData.public_amenities,
          public_features: data.features || publicData.public_features
        });
        alert('¡Descripción generada exitosamente!');
      } else {
        alert('Error al generar descripción. Verifica el link.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con la IA');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/villas/${villa.id}/public-info`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(publicData)
      });

      if (response.ok) {
        alert('Información pública actualizada exitosamente');
        onUpdate();
        onClose();
      } else {
        const errorData = await response.json();
        alert(`Error al actualizar: ${errorData.detail || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar los cambios');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      overflow: 'auto'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '10px',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        padding: '30px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#080644' }}>
            Información Pública - {villa.code}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        {/* Description */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '5px' }}>
            Descripción Pública
          </label>
          <textarea
            value={publicData.public_description}
            onChange={(e) => setPublicData({ ...publicData, public_description: e.target.value })}
            placeholder="Escribe una descripción atractiva para mostrar en la web..."
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              minHeight: '100px',
              fontSize: '1rem'
            }}
          />
        </div>

        {/* Images */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
            Fotos de la Villa
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            style={{ marginBottom: '10px' }}
          />
          {uploading && <p style={{ color: '#666' }}>Subiendo imágenes...</p>}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
            {publicData.public_images.map((img, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                <img src={img} alt={`Villa ${idx + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} />
                <button
                  onClick={() => removeImage(idx)}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '25px',
                    height: '25px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
            Amenidades (Piscina, Jacuzzi, BBQ, etc.)
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={newAmenity}
              onChange={(e) => setNewAmenity(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addAmenity()}
              placeholder="Ej: Piscina privada"
              style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
            <Button onClick={addAmenity}>Agregar</Button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {publicData.public_amenities.map((amenity, idx) => (
              <span
                key={idx}
                style={{
                  background: '#080644',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {amenity}
                <button
                  onClick={() => removeAmenity(idx)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
            Características Destacadas
          </label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addFeature()}
              placeholder="Ej: Vista al mar"
              style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
            <Button onClick={addFeature}>Agregar</Button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {publicData.public_features.map((feature, idx) => (
              <span
                key={idx}
                style={{
                  background: '#CFA57D',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {feature}
                <button
                  onClick={() => removeFeature(idx)}
                  style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '30px' }}>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} style={{ background: '#080644', color: 'white' }}>
            Guardar Cambios
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VillaPublicInfo;
