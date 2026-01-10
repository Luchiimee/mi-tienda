'use client';
import { useState } from 'react';
import { useShop } from '../context/ShopContext';

export default function PlanSelector() {
  const { activateTrial } = useShop();
  const [selectedPlan, setSelectedPlan] = useState<'simple' | 'full' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const handleActivate = async () => {
    if (selectedPlan === 'full') {
        await activateTrial('full');
    } else if (selectedPlan === 'simple' && selectedTemplate) {
        await activateTrial('simple', selectedTemplate);
    }
  };

  return (
    <div style={{ padding: 40, background: 'white', borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <h2>🚀 Elige tu Plan para comenzar</h2>
      <p>Tienes 14 días de prueba gratis. Sin compromiso.</p>

      <div style={{ display: 'flex', gap: 20, marginTop: 30 }}>
        
        {/* --- PLAN BÁSICO --- */}
        <div 
            onClick={() => setSelectedPlan('simple')}
            style={{ 
                border: selectedPlan === 'simple' ? '2px solid #3b82f6' : '1px solid #ddd', 
                padding: 20, borderRadius: 8, flex: 1, cursor: 'pointer',
                opacity: (selectedPlan && selectedPlan !== 'simple') ? 0.5 : 1
            }}
        >
            <h3>Plan Básico</h3>
            <p>Elige 1 plantilla única.</p>
            
            {selectedPlan === 'simple' && (
                <div style={{ marginTop: 15 }}>
                    <p style={{fontSize: 12, fontWeight: 'bold'}}>Selecciona tu plantilla:</p>
                    <select 
                        value={selectedTemplate} 
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        style={{ width: '100%', padding: 8 }}
                    >
                        <option value="" disabled>-- Elige --</option>
                        <option value="tienda">Tienda Online</option>
                        <option value="catalogo">Catálogo</option>
                        <option value="menu">Gastronomía</option>
                        <option value="personal">Bio / Enlace</option>
                    </select>
                </div>
            )}
        </div>

        {/* --- PLAN FULL --- */}
        <div 
            onClick={() => { setSelectedPlan('full'); setSelectedTemplate(''); }}
            style={{ 
                border: selectedPlan === 'full' ? '2px solid #3b82f6' : '1px solid #ddd', 
                padding: 20, borderRadius: 8, flex: 1, cursor: 'pointer',
                opacity: (selectedPlan && selectedPlan !== 'full') ? 0.5 : 1
            }}
        >
            <h3>Plan Full</h3>
            <p>Acceso a TODAS las plantillas.</p>
        </div>

      </div>

      <button 
        onClick={handleActivate}
        disabled={!selectedPlan || (selectedPlan === 'simple' && !selectedTemplate)}
        style={{
            marginTop: 30, width: '100%', padding: 15, 
            background: (!selectedPlan || (selectedPlan === 'simple' && !selectedTemplate)) ? '#ccc' : '#16a34a',
            color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 'bold', cursor: 'pointer'
        }}
      >
        ✅ Comenzar Prueba Gratis (14 días)
      </button>

    </div>
  );
}