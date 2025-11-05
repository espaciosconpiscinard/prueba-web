import React, { useState } from 'react';
import { X, Loader } from 'lucide-react';
import { Button } from './ui/button';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const VillaPublicInfo = ({ villa, onClose, onUpdate }) => {
  const [publicData, setPublicData] = useState({
    public_images: villa.public_images || [],
    default_public_image_index: villa.default_public_image_index !== undefined ? villa.default_public_image_index : 0
  });
  const [uploading, setUploading] = useState(false);

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
            📸 Fotos de la Villa - {villa.code}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={24} />
          </button>
        </div>

        <p style={{ fontSize: '0.95rem', color: '#666', marginBottom: '20px' }}>
          📝 <strong>Nota:</strong> Los precios, descripciones y demás configuraciones se editan directamente en el formulario principal de la villa. Este modal es SOLO para gestionar fotos.
        </p>

        {/* SECCIÓN DE FOTOS */}
        <div style={{ marginBottom: '25px', padding: '20px', background: '#fef3c7', borderRadius: '10px', border: '3px solid #f59e0b' }}>
          <h3 style={{ fontSize: '1.3rem', color: '#92400e', marginBottom: '15px', fontWeight: 'bold' }}>
            📋 INFORMACIÓN DEL CATÁLOGO (Vista Previa)
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#78350f', marginBottom: '15px' }}>
            Esta información se mostrará en la card del catálogo (antes de hacer clic)
          </p>

          {/* Control de visibilidad global */}
          <div style={{ marginBottom: '15px', padding: '12px', background: 'white', borderRadius: '8px' }}>
            <label style={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={publicData.catalog_show_price}
                onChange={(e) => setPublicData({ ...publicData, catalog_show_price: e.target.checked })}
                style={{ marginRight: '8px', width: '18px', height: '18px' }}
              />
              <span style={{ fontWeight: 'bold' }}>💰 Mostrar Precios en Catálogo</span>
            </label>
          </div>

          {/* SECCIÓN PASADÍA */}
          <div style={{ marginBottom: '15px', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#1e40af', fontWeight: 'bold' }}>☀️ PASADÍA</h4>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={publicData.catalog_show_pasadia}
                  onChange={(e) => setPublicData({ ...publicData, catalog_show_pasadia: e.target.checked })}
                  style={{ marginRight: '8px', width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Mostrar en Catálogo</span>
              </label>
            </div>
            
            {publicData.catalog_show_pasadia && (
              <>
                {/* Descripción Corta Pasadía */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
                    Descripción Corta (Catálogo)
                  </label>
                  <textarea
                    value={publicData.catalog_description_pasadia}
                    onChange={(e) => setPublicData({ ...publicData, catalog_description_pasadia: e.target.value })}
                    placeholder="Descripción breve para mostrar en la card del catálogo (2-3 líneas)"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      minHeight: '50px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Precio Pasadía */}
                {publicData.catalog_show_price && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
                        Precio
                      </label>
                      <input
                        type="number"
                        value={publicData.catalog_price_pasadia}
                        onChange={(e) => setPublicData({ ...publicData, catalog_price_pasadia: e.target.value })}
                        placeholder="Ej: 5000"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
                        Moneda
                      </label>
                      <select
                        value={publicData.catalog_currency_pasadia}
                        onChange={(e) => setPublicData({ ...publicData, catalog_currency_pasadia: e.target.value })}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                      >
                        <option value="RD$">RD$</option>
                        <option value="USD$">USD$</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* SECCIÓN AMANECIDA */}
          <div style={{ marginBottom: '0', padding: '15px', background: 'white', borderRadius: '8px', border: '2px solid #6366f1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#4338ca', fontWeight: 'bold' }}>🌙 AMANECIDA</h4>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input
                  type="checkbox"
                  checked={publicData.catalog_show_amanecida}
                  onChange={(e) => setPublicData({ ...publicData, catalog_show_amanecida: e.target.checked })}
                  style={{ marginRight: '8px', width: '18px', height: '18px' }}
                />
                <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Mostrar en Catálogo</span>
              </label>
            </div>
            
            {publicData.catalog_show_amanecida && (
              <>
                {/* Descripción Corta Amanecida */}
                <div style={{ marginBottom: '10px' }}>
                  <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
                    Descripción Corta (Catálogo)
                  </label>
                  <textarea
                    value={publicData.catalog_description_amanecida}
                    onChange={(e) => setPublicData({ ...publicData, catalog_description_amanecida: e.target.value })}
                    placeholder="Descripción breve para mostrar en la card del catálogo (2-3 líneas)"
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ddd',
                      borderRadius: '5px',
                      minHeight: '50px',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>

                {/* Precio Amanecida */}
                {publicData.catalog_show_price && (
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
                        Precio
                      </label>
                      <input
                        type="number"
                        value={publicData.catalog_price_amanecida}
                        onChange={(e) => setPublicData({ ...publicData, catalog_price_amanecida: e.target.value })}
                        placeholder="Ej: 8000"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontWeight: 'bold', fontSize: '0.9rem', display: 'block', marginBottom: '5px' }}>
                        Moneda
                      </label>
                      <select
                        value={publicData.catalog_currency_amanecida}
                        onChange={(e) => setPublicData({ ...publicData, catalog_currency_amanecida: e.target.value })}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '5px' }}
                      >
                        <option value="RD$">RD$</option>
                        <option value="USD$">USD$</option>
                      </select>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
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

        {/* Descripciones Detalladas para Modal */}
        <div style={{ marginBottom: '20px', padding: '20px', background: '#ede9fe', borderRadius: '10px', border: '2px solid #8b5cf6' }}>
          <h3 style={{ fontSize: '1.2rem', color: '#5b21b6', marginBottom: '15px', fontWeight: 'bold' }}>
            📝 DESCRIPCIONES DETALLADAS (Modal - Al hacer clic en villa)
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#6b21a8', marginBottom: '15px' }}>
            Estas descripciones se mostrarán cuando el usuario haga clic en la villa del catálogo
          </p>

          {/* Descripción Detallada Pasadía */}
          <div style={{ marginBottom: '15px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #3b82f6' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#1e40af' }}>
              ☀️ Descripción Completa - Pasadía
            </label>
            <textarea
              value={publicData.public_description_pasadia}
              onChange={(e) => setPublicData({ ...publicData, public_description_pasadia: e.target.value })}
              placeholder="Descripción completa y detallada para la modalidad de Pasadía. Incluye horarios, servicios incluidos, restricciones, etc."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                minHeight: '120px',
                fontSize: '0.95rem'
              }}
            />
          </div>

          {/* Descripción Detallada Amanecida */}
          <div style={{ padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #6366f1' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', color: '#4338ca' }}>
              🌙 Descripción Completa - Amanecida
            </label>
            <textarea
              value={publicData.public_description_amanecida}
              onChange={(e) => setPublicData({ ...publicData, public_description_amanecida: e.target.value })}
              placeholder="Descripción completa y detallada para la modalidad de Amanecida. Incluye horarios, servicios incluidos, restricciones, etc."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '5px',
                minHeight: '120px',
                fontSize: '0.95rem'
              }}
            />
          </div>
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
              <div key={idx} style={{ position: 'relative', border: publicData.default_public_image_index === idx ? '3px solid gold' : 'none', borderRadius: '5px' }}>
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
                    fontWeight: 'bold',
                    zIndex: 2
                  }}
                >
                  ×
                </button>
                <button
                  onClick={() => setPublicData({ ...publicData, default_public_image_index: idx })}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    background: publicData.default_public_image_index === idx ? 'gold' : 'rgba(255,255,255,0.8)',
                    color: publicData.default_public_image_index === idx ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '50%',
                    width: '25px',
                    height: '25px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    zIndex: 2
                  }}
                  title="Marcar como imagen de catálogo"
                >
                  ⭐
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
                {publicData.default_public_image_index === idx && (
                  <span style={{
                    position: 'absolute',
                    bottom: '5px',
                    right: '5px',
                    background: 'gold',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold'
                  }}>
                    CATÁLOGO
                  </span>
                )}
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
