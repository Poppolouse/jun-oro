import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '@/utils/apiBaseUrl';
import { useAuth } from './AuthContext';

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

  // Debug log helper - spam önlemek için throttle
  const logDebug = (() => {
    let lastLog = {};
    return (key, message, data) => {
      const now = Date.now();
      if (!lastLog[key] || now - lastLog[key] > 2000) { // 2 saniye throttle
        console.log(`[CyclesContext:${key}]`, message, data || '');
        lastLog[key] = now;
      }
    };
  })();

  // Aktif döngüyü bul
  const activeCycle = cycles.find(c => c.status === 'active') || null;

  // Her cycles değişiminde log
  useEffect(() => {
    logDebug('state', 'Cycles state güncellendi:', {
      count: cycles.length,
      active: activeCycle?.id || 'yok',
      statuses: cycles.map(c => `${c.name}:${c.status}`).join(', ')
    });
  }, [cycles]);

  // Döngüleri yükle
  const fetchCycles = async () => {
    const token = localStorage.getItem('arkade_token');
    console.log('🔄 [fetchCycles] Başlatıldı', { user: user?.username, hasUser: !!user, hasToken: !!token });
    
    if (!user || !token) {
      console.log('⚠️ [fetchCycles] User veya Token yok, cycles temizleniyor');
      setCycles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const url = `${API_BASE_URL}/cycles`;
      console.log('📡 [fetchCycles] API isteği:', url);
      
      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arkade_token')}`
        }
      });

      console.log('📥 [fetchCycles] API yanıtı:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [fetchCycles] API hata detayı:', errorData);
        
        if (errorData.migrationRequired) {
          throw new Error('Veritabanı güncellemesi gerekiyor. Render backend\'inde Cycle tablosu yok.');
        }
        
        throw new Error(errorData.error || errorData.message || `HTTP ${response.status}: Döngüler yüklenemedi`);
      }

      const data = await response.json();
      console.log('✅ [fetchCycles] Döngüler alındı:', {
        count: data.cycles?.length || 0,
        cycles: data.cycles?.map(c => ({ id: c.id, name: c.name, status: c.status })) || []
      });
      
      setCycles(data.cycles || []);
      setError(null);
    } catch (err) {
      console.error('🚨 [fetchCycles] Hata:', {
        message: err.message,
        stack: err.stack?.split('\n')[0]
      });
      
      // Network hatası vs. detaylı mesaj - silent fail, kullanıcıya gösterme
      if (err.message.includes('fetch') || err.message.includes('Failed to fetch')) {
        console.log('🔌 [fetchCycles] Network hatası - silent fail');
        setError(null); // Error state'i temizle
      } else {
        setError(err.message);
      }
      setCycles([]);
    } finally {
      setLoading(false);
      console.log('🏁 [fetchCycles] Tamamlandı');
    }
  };

  // Yeni döngü oluştur
  const createCycle = async (cycleData) => {
    console.log('➕ [createCycle] Başlatıldı:', cycleData);
    
    try {
      const url = `${API_BASE_URL}/cycles`;
      console.log('📡 [createCycle] POST isteği:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arkade_token')}`
        },
        body: JSON.stringify(cycleData)
      });

      console.log('📥 [createCycle] API yanıtı:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [createCycle] Hata:', errorData);
        throw new Error('Döngü oluşturulamadı');
      }

      const newCycle = await response.json();
      console.log('✅ [createCycle] Yeni döngü oluşturuldu:', {
        id: newCycle.id,
        name: newCycle.name,
        status: newCycle.status
      });
      
      setCycles(prev => {
        const updated = [...prev, newCycle];
        console.log('📝 [createCycle] State güncellendi, yeni toplam:', updated.length);
        return updated;
      });
      
      return newCycle;
    } catch (err) {
      console.error('🚨 [createCycle] Hata:', err.message);
      throw err;
    }
  };

  // Döngüyü güncelle
  const updateCycle = async (cycleId, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/cycles/${cycleId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('arkade_token')}`
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
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('arkade_token')}`
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
    console.log('🎯 [activateCycle] Başlatıldı:', { cycleId });
    console.log('📊 [activateCycle] Mevcut state:', {
      totalCycles: cycles.length,
      currentActive: activeCycle?.id || 'yok',
      allStatuses: cycles.map(c => `${c.id}:${c.status}`)
    });
    
    try {
      const url = `${API_BASE_URL}/cycles/${cycleId}/activate`;
      console.log('📡 [activateCycle] POST isteği:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('arkade_token')}`
        }
      });

      console.log('📥 [activateCycle] API yanıtı:', {
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [activateCycle] Hata:', errorData);
        throw new Error('Döngü aktifleştirilemedi');
      }

      const responseData = await response.json();
      console.log('✅ [activateCycle] Backend yanıtı:', responseData);
      console.log('🔄 [activateCycle] fetchCycles çağrılıyor...');
      
      await fetchCycles(); // Tüm döngüleri yeniden yükle
      
      console.log('🏁 [activateCycle] Tamamlandı, yeni state:', {
        totalCycles: cycles.length,
        newActive: cycles.find(c => c.status === 'active')?.id || 'yok'
      });
    } catch (err) {
      console.error('🚨 [activateCycle] Hata:', {
        message: err.message,
        stack: err.stack?.split('\n')[0]
      });
      throw err;
    }
  };

  // Oyunun durumunu güncelle (backlog, playing, completed)
  const updateGameStatus = async (gameId, status) => {
    try {
      const response = await fetch(`${API_BASE_URL}/library/${gameId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('arkade_token')}`,
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
