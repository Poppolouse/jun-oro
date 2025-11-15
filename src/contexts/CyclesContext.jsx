import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CyclesContext = createContext();

export const useCycles = () => {
  const context = useContext(CyclesContext);
  if (!context) {
    throw new Error('useCycles hook, CyclesProvider içinde kullanılmalıdır');
  }
  return context;
};

export const CyclesProvider = ({ children }) => {
  const { user } = useAuth();
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Aktif döngüyü bul
  const activeCycle = cycles.find(c => c.status === 'active') || null;

  // Döngüleri yükle
  const fetchCycles = async () => {
    if (!user) {
      setCycles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Döngüler yükleniyor:', `${API_BASE_URL}/cycles`);
      
      const response = await fetch(`${API_BASE_URL}/cycles`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      console.log('API yanıtı:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API hata detayı:', errorData);
        
        if (errorData.migrationRequired) {
          throw new Error('Veritabanı güncellemesi gerekiyor. Render backend\'inde Cycle tablosu yok.');
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Döngüler yüklenemedi`);
      }

      const data = await response.json();
      console.log('Döngüler yüklendi:', data);
      setCycles(data.cycles || []);
      setError(null);
    } catch (err) {
      console.error('Döngüler yüklenirken hata:', err);
      
      // Network hatası vs. detaylı mesaj
      if (err.message.includes('fetch')) {
        setError(`Backend bağlantı hatası: ${API_BASE_URL} erişilebilir değil`);
      } else {
        setError(err.message);
      }
      setCycles([]);
    } finally {
      setLoading(false);
    }
  };

  // Yeni döngü oluştur
  const createCycle = async (cycleData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cycles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(cycleData)
      });

      if (!response.ok) {
        throw new Error('Döngü oluşturulamadı');
      }

      const newCycle = await response.json();
      setCycles(prev => [...prev, newCycle]);
      return newCycle;
    } catch (err) {
      console.error('Döngü oluşturma hatası:', err);
      throw err;
    }
  };

  // Döngüyü güncelle
  const updateCycle = async (cycleId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cycles/${cycleId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Döngü güncellenemedi');
      }

      const updatedCycle = await response.json();
      setCycles(prev => 
        prev.map(c => c.id === cycleId ? updatedCycle : c)
      );
      return updatedCycle;
    } catch (err) {
      console.error('Döngü güncelleme hatası:', err);
      throw err;
    }
  };

  // Döngüyü sil
  const deleteCycle = async (cycleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cycles/${cycleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Döngü silinemedi');
      }

      setCycles(prev => prev.filter(c => c.id !== cycleId));
    } catch (err) {
      console.error('Döngü silme hatası:', err);
      throw err;
    }
  };

  // Döngüyü aktif et (diğerleri 'planned' olur)
  const activateCycle = async (cycleId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cycles/${cycleId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Döngü aktifleştirilemedi');
      }

      await fetchCycles(); // Tüm döngüleri yeniden yükle
    } catch (err) {
      console.error('Döngü aktivasyon hatası:', err);
      throw err;
    }
  };

  // Oyunun durumunu güncelle (backlog, playing, completed)
  const updateGameStatus = async (gameId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/${gameId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Oyun durumu güncellenemedi');
      }

      return await response.json();
    } catch (err) {
      console.error('Oyun durumu güncelleme hatası:', err);
      throw err;
    }
  };

  // Kullanıcı değiştiğinde döngüleri yükle
  useEffect(() => {
    fetchCycles();
  }, [user]);

  const value = {
    cycles,
    activeCycle,
    loading,
    error,
    fetchCycles,
    createCycle,
    updateCycle,
    deleteCycle,
    activateCycle,
    updateGameStatus
  };

  return (
    <CyclesContext.Provider value={value}>
      {children}
    </CyclesContext.Provider>
  );
};
