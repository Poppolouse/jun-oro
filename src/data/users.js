import { API_BASE_URL } from "@/utils/apiBaseUrl";

// Kullanıcı Database'i
export const users = [
  {
    id: 1,
    username: "poppolouse",
    password: "123Ardat123", // Gerçek uygulamada hash'lenmiş olmalı
    email: "admin@arkade.com",
    role: "admin",
    avatar: "P",
    status: "online",
    createdAt: "2024-01-01",
    lastLogin: "2024-01-15",
    profile: {
      firstName: "Admin",
      lastName: "User",
      bio: "Arkade platformunun yöneticisi",
      profileImage:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      preferences: {
        theme: "dark",
        language: "tr",
        notifications: true,
      },
    },
    stats: {
      totalGames: 156,
      hoursPlayed: 2847,
      achievements: 89,
      level: 42,
    },
    dataUsage: {
      totalDownloaded: "45.2 GB",
      totalUploaded: "12.8 GB",
      monthlyUsage: "8.7 GB",
      lastActivity: "2024-01-15 14:30",
    },
    security: {
      lastPasswordChange: "2023-12-01",
      passwordStrength: "Güçlü",
      twoFactorEnabled: true,
      loginAttempts: 0,
      accountLocked: false,
    },
  },
];

// Kullanıcı rolleri
export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
};

// Kullanıcı durumları
export const USER_STATUS = {
  ONLINE: "online",
  OFFLINE: "offline",
  GAMING: "gaming",
  AWAY: "away",
};

// Kullanıcı işlemleri
export const userService = {
  // Kullanıcı girişi
  login: async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: "POST",
        credentials: 'include',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const raw = await response.text();
        console.error("Non-JSON response from API:", raw);
        return { success: false, message: "Sunucudan beklenmeyen yanıt" };
      }

      const data = await response.json();

      if (response.ok && data.success) {
        // Token ve sessionId'yi localStorage'a kaydet
        if (data.data.token) {
          localStorage.setItem('arkade_token', data.data.token);
        }
        if (data.data.sessionId) {
          localStorage.setItem('sessionId', data.data.sessionId);
        }
        
        // Return user data with token for AuthContext
        return { 
          success: true, 
          user: data.data,
          token: data.data.token
        };
      } else {
        return { success: false, message: data.message || "Giriş başarısız" };
      }
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Bağlantı hatası" };
    }
  },

  // Kullanıcı kaydı
  register: async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userData.username,
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const raw = await response.text();
        console.error("Non-JSON response from API:", raw);
        return { success: false, message: "Sunucudan beklenmeyen yanıt" };
      }

      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, user: data.data, message: data.message };
      } else {
        return { success: false, message: data.message || "Kayıt başarısız" };
      }
    } catch (error) {
      console.error("Register error:", error);
      return { success: false, message: "Bağlantı hatası" };
    }
  },

  // Tüm kullanıcıları getir (sadece admin)
  getAllUsers: () => {
    return users.map((user) => {
      // eslint-disable-next-line no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  },

  // Tüm kullanıcıları şifreler dahil getir (sadece admin için)
  getAllUsersWithPasswords: () => {
    return [...users];
  },

  // Kullanıcı güncelle
  updateUser: (userId, updateData) => {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: "Kullanıcı bulunamadı" };
    }

    users[userIndex] = { ...users[userIndex], ...updateData };
    // eslint-disable-next-line no-unused-vars
    const { password: _, ...userWithoutPassword } = users[userIndex];
    return { success: true, user: userWithoutPassword };
  },

  // Kullanıcı sil
  deleteUser: (userId) => {
    const userIndex = users.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return { success: false, message: "Kullanıcı bulunamadı" };
    }

    users.splice(userIndex, 1);
    return { success: true, message: "Kullanıcı başarıyla silindi" };
  },

  // ID ile kullanıcı getir
  getUserById: (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      // eslint-disable-next-line no-unused-vars
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }
    return null;
  },
};
