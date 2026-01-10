'use client';

import { useRouter } from 'next/navigation';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)', // Fondo oscuro transparente
      zIndex: 9999, // Para que flote sobre todo
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(5px)' // Efecto borroso elegante
    }}>
      <div style={{
        background: 'white',
        padding: '30px',
        borderRadius: '16px',
        width: '90%',
        maxWidth: '400px',
        textAlign: 'center',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔒</div>
        <h2 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Modo Vista Previa</h2>
        <p style={{ color: '#64748b', marginBottom: '25px', lineHeight: '1.5' }}>
          Puedes navegar y probar las plantillas libremente. <br/>
          Para <strong>editar textos, subir fotos o guardar</strong>, necesitas activar tu prueba gratuita.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button 
            onClick={() => router.push('/configuracion')}
            style={{
              padding: '12px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '14px',
              boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.5)'
            }}
          >
            🚀 Elegir Plan (14 días Gratis)
          </button>
          
          <button 
            onClick={onClose}
            style={{
              padding: '10px',
              background: 'transparent',
              color: '#94a3b8',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Seguir mirando
          </button>
        </div>
      </div>
    </div>
  );
}