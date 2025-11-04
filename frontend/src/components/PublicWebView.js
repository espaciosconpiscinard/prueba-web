import React from 'react';

const PublicWebView = () => {
  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden' }}>
      <iframe
        src="https://piscinapp-1.preview.emergentagent.com:3001"
        style={{
          width: '100%',
          height: '100%',
          border: 'none'
        }}
        title="Página Web Pública"
      />
    </div>
  );
};

export default PublicWebView;
