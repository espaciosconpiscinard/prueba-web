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
    public_has_amanecida: villa.public_has_amanecida !== undefined ? villa.public_has_amanecida : villa.has_amanecida || false,
    // Datos de catálogo
    catalog_description: villa.catalog_description || '',
    catalog_show_price: villa.catalog_show_price || false,
    catalog_price: villa.catalog_price || '',
    catalog_show_pasadia: villa.catalog_show_pasadia || false,
    catalog_show_amanecida: villa.catalog_show_amanecida || false
  });
  const [newAmenity, setNewAmenity] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);
  const [generatingCatalogAI, setGeneratingCatalogAI] = useState(false);

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

  const generateCatalogDescription = async () => {
    if (!publicData.public_description.trim()) {
      alert('Primero necesitas agregar la descripción completa');
      return;
    }

    setGeneratingCatalogAI(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/ai/generate-catalog-description`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          full_description: publicData.public_description,
          villa_code: villa.code,
          amenities: publicData.public_amenities
        })
      });

      if (response.ok) {
        const data = await response.json();
        setPublicData({
          ...publicData,
          catalog_description: data.catalog_description || ''
        });
        alert('¡Descripción de catálogo generada!');
      } else {
        alert('Error al generar descripción.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al conectar con la IA');
    } finally {
      setGeneratingCatalogAI(false);
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

        {/* AI Generator from Airbnb */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f0f9ff', borderRadius: '8px', border: '2px dashed #3b82f6' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px', color: '#1e40af' }}>
            🤖 Generar Descripción con IA desde Airbnb
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              type="url"
              value={airbnbLink}
              onChange={(e) => setAirbnbLink(e.target.value)}
              placeholder="https://www.airbnb.com/rooms/..."
              style={{ flex: 1, padding: '10px', border: '1px solid #3b82f6', borderRadius: '5px' }}
            />
            <Button 
              onClick={generateDescriptionFromAirbnb} 
              disabled={generatingAI}
              style={{ background: '#3b82f6', color: 'white', minWidth: '120px' }}
            >
              {generatingAI ? <><Loader className="animate-spin" size={16} /> Generando...</> : 'Generar'}
            </Button>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '5px' }}>
            Pega el link de Airbnb y la IA extraerá la información automáticamente
          </p>
        </div>

        {/* Capacity Configuration */}
        <div style={{ marginBottom: '20px', padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
          <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>
            👥 Capacidad de Personas
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={publicData.public_has_pasadia}
                  onChange={(e) => setPublicData({ ...publicData, public_has_pasadia: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: 'bold' }}>Pasadía</span>
              </label>
              {publicData.public_has_pasadia && (
                <input
                  type="number"
                  value={publicData.public_max_guests_pasadia}
                  onChange={(e) => setPublicData({ ...publicData, public_max_guests_pasadia: parseInt(e.target.value) || 0 })}
                  placeholder="Máximo de personas"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              )}
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <input
                  type="checkbox"
                  checked={publicData.public_has_amanecida}
                  onChange={(e) => setPublicData({ ...publicData, public_has_amanecida: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontWeight: 'bold' }}>Amanecida</span>
              </label>
              {publicData.public_has_amanecida && (
                <input
                  type="number"
                  value={publicData.public_max_guests_amanecida}
                  onChange={(e) => setPublicData({ ...publicData, public_max_guests_amanecida: parseInt(e.target.value) || 0 })}
                  placeholder="Máximo de personas"
                  style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              )}
            </div>
          </div>
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

        {/* Images and Videos */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <label style={{ fontWeight: 'bold' }}>
              📸 Fotos y Videos de la Villa
            </label>
            <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: 'bold' }}>
              {publicData.public_images.length}/20
            </span>
          </div>
          <input
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleImageUpload}
            disabled={publicData.public_images.length >= 20}
            style={{ marginBottom: '10px' }}
          />
          {uploading && <p style={{ color: '#666' }}>Subiendo archivos...</p>}
          {publicData.public_images.length >= 20 && (
            <p style={{ color: '#ef4444', fontSize: '0.9rem' }}>Límite de 20 archivos alcanzado</p>
          )}
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '10px', marginTop: '10px' }}>
            {publicData.public_images.map((media, idx) => (
              <div key={idx} style={{ position: 'relative' }}>
                {media.startsWith('data:video') ? (
                  <video src={media} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} controls />
                ) : (
                  <img src={media} alt={`Villa ${idx + 1}`} style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px' }} />
                )}
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
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  ×
                </button>
                <span style={{
                  position: 'absolute',
                  bottom: '5px',
                  left: '5px',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  fontSize: '0.75rem'
                }}>
                  {idx + 1}
                </span>
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
