import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "@/utils/apiBaseUrl";
import { apiKeyService } from "../services/apiKeys";
import igdbApi from "../services/igdbApi";

export default function useSettingsData() {
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [r2Stats, setR2Stats] = useState(null);
  const [changelogs, setChangelogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLogsPagination, setAuditLogsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 20,
  });
  const [notificationHistory, setNotificationHistory] = useState([]);
  const [userReadStats, setUserReadStats] = useState({});
  const [trafficLogs, setTrafficLogs] = useState([]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.filter((u) => u.status !== "pending"));
        setPendingUsers(data.data.filter((u) => u.status === "pending"));
      } else {
        console.warn(
          "loadUsers: backend returned no success, falling back to empty list",
        );
        setUsers([]);
        setPendingUsers([]);
      }
    } catch (err) {
      console.error("loadUsers error", err);
      setUsers([]);
      setPendingUsers([]);
    }
  }, []);

  const loadNotificationHistory = useCallback(() => {
    try {
      const history = JSON.parse(
        localStorage.getItem("notificationHistory") || "[]",
      );
      setNotificationHistory(history);
    } catch (e) {
      console.error("loadNotificationHistory", e);
    }
  }, []);

  const sendNotification = useCallback(
    async ({ title, message, type = "info", recipients = "all" }) => {
      const notification = {
        id: Date.now(),
        title,
        message,
        type,
        timestamp: new Date().toISOString(),
        read: false,
        sender: "Admin",
      };
      try {
        const existing = JSON.parse(
          localStorage.getItem("notifications") || "[]",
        );
        const updated = [notification, ...existing];
        localStorage.setItem("notifications", JSON.stringify(updated));
        const historyItem = {
          ...notification,
          recipients: recipients === "all" ? "Tüm Kullanıcılar" : recipients,
          sentAt: new Date().toLocaleString("tr-TR"),
        };
        const updatedHistory = [
          historyItem,
          ...JSON.parse(localStorage.getItem("notificationHistory") || "[]"),
        ];
        localStorage.setItem(
          "notificationHistory",
          JSON.stringify(updatedHistory),
        );
        setNotificationHistory(updatedHistory);
        return { success: true };
      } catch (err) {
        console.error("sendNotification", err);
        return { success: false, error: err.message };
      }
    },
    [],
  );

  const loadApiKeys = useCallback(async () => {
    try {
      const res = await apiKeyService.getApiKeys();
      setApiKeys(res.data || []);
    } catch (err) {
      console.error("loadApiKeys", err);
      setApiKeys([]);
    }
  }, []);

  const loadR2Stats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/r2/stats`);
      const data = await res.json();
      if (data.success) setR2Stats(data.data);
    } catch (err) {
      console.error("loadR2Stats", err);
    }
  }, []);

  const loadChangelogs = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/changelog?published=all&limit=50`,
      );
      if (!res.ok) throw new Error("changelogs load failed");
      const data = await res.json();
      setChangelogs(data.changelogs || []);
    } catch (err) {
      console.error("loadChangelogs", err);
      setChangelogs([]);
    }
  }, []);

  const loadAuditLogs = useCallback(async (page = 1) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/users/admin/audit-logs?page=${page}&limit=20`,
      );
      if (!res.ok) throw new Error("audit logs failed");
      const data = await res.json();
      const logs = data?.data?.logs || data?.logs || [];
      setAuditLogs(logs);
      // Map backend pagination { page, limit, total, pages } → UI state
      const pageMeta = {
        currentPage: data?.data?.page ?? data?.page ?? page,
        totalPages: data?.data?.pages ?? data?.pages ?? 1,
        totalItems: data?.data?.total ?? data?.total ?? logs.length,
        limit: data?.data?.limit ?? data?.limit ?? 20,
      };
      setAuditLogsPagination(pageMeta);
    } catch (err) {
      console.error("loadAuditLogs", err);
      setAuditLogs([]);
      setAuditLogsPagination((prev) => ({ ...prev, currentPage: page }));
    }
  }, []);

  const generateMockTrafficLogs = useCallback(() => {
    const actions = [
      "login",
      "logout",
      "page_view",
      "game_add",
      "game_remove",
      "search",
      "profile_update",
    ];
    const pages = [
      "/",
      "/arkade",
      "/library",
      "/settings",
      "/stats",
      "/wishlist",
      "/gallery",
    ];
    const userAgents = ["Chrome", "Firefox", "Safari", "Edge"];
    const logs = [];
    const now = new Date();
    for (let i = 0; i < 100; i++) {
      const randomUser = users.length
        ? users[Math.floor(Math.random() * users.length)]
        : { id: 0, username: "guest" };
      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const randomPage = pages[Math.floor(Math.random() * pages.length)];
      const randomUA =
        userAgents[Math.floor(Math.random() * userAgents.length)];
      const randomTime = new Date(
        now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      );
      logs.push({
        id: i + 1,
        userId: randomUser.id,
        username: randomUser.username || "guest",
        action: randomAction,
        page: randomPage,
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: randomUA,
        timestamp: randomTime.toISOString(),
        duration: Math.floor(Math.random() * 300) + 10,
      });
    }
    return logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [users]);

  const loadTrafficLogs = useCallback(() => {
    setTrafficLogs(generateMockTrafficLogs());
  }, [generateMockTrafficLogs]);

  const loadUserSecurity = useCallback(async (userId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/security`);
      const data = await res.json();
      if (data.success) {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === userId
              ? {
                  ...u,
                  password: data.data.password,
                  security: data.data.security,
                }
              : u,
          ),
        );
      }
    } catch (err) {
      console.error("loadUserSecurity", err);
    }
  }, []);

  const loadUserReadStats = useCallback(
    (notificationId) => {
      try {
        const stats = {};
        users.forEach((user) => {
          const userReadStatus = JSON.parse(
            localStorage.getItem(`notificationReadStatus_${user.id}`) || "{}",
          );
          stats[user.id] = {
            ...user,
            hasRead: !!userReadStatus[notificationId],
            readAt: userReadStatus[`${notificationId}_readAt`] || null,
          };
        });
        setUserReadStats(stats);
      } catch (err) {
        console.error("loadUserReadStats", err);
      }
    },
    [users],
  );

  useEffect(() => {
    loadUsers();
    loadNotificationHistory();
  }, [loadUsers, loadNotificationHistory]);

  // User management: create / update / delete / approve / reject
  const deleteUser = useCallback(
    async (userId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await loadUsers();
          return { success: true, data };
        }
        return { success: false, error: data };
      } catch (err) {
        console.error("deleteUser", err);
        return { success: false, error: err.message };
      }
    },
    [loadUsers],
  );

  const saveUser = useCallback(
    async (user) => {
      try {
        const isNew = user.id === null || user.id === undefined;
        const url = isNew
          ? `${API_BASE_URL}/users`
          : `${API_BASE_URL}/users/${user.id}`;
        const method = isNew ? "POST" : "PUT";
        const payload = {
          name:
            user.profile?.firstName && user.profile?.lastName
              ? `${user.profile.firstName} ${user.profile.lastName}`.trim()
              : user.username || user.name,
          username: user.username,
          email: user.email,
          role: user.role,
          ...(user.password && user.password.trim() !== ""
            ? { password: user.password }
            : {}),
        };
        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await loadUsers();
          return { success: true, data };
        }
        return { success: false, error: data };
      } catch (err) {
        console.error("saveUser", err);
        return { success: false, error: err.message };
      }
    },
    [loadUsers],
  );

  const approveUser = useCallback(
    async (userId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}/approve`, {
          method: "PUT",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await loadUsers();
          return { success: true, data };
        }
        return { success: false, error: data };
      } catch (err) {
        console.error("approveUser", err);
        return { success: false, error: err.message };
      }
    },
    [loadUsers],
  );

  const rejectUser = useCallback(
    async (userId) => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
          method: "DELETE",
        });
        const data = await res.json();
        if (res.ok && data.success) {
          await loadUsers();
          return { success: true, data };
        }
        return { success: false, error: data };
      } catch (err) {
        console.error("rejectUser", err);
        return { success: false, error: err.message };
      }
    },
    [loadUsers],
  );

  // Changelog CRUD helpers
  const saveChangelog = useCallback(async (changelog, editingId = null) => {
    try {
      const url = editingId
        ? `${API_BASE_URL}/changelog/${editingId}`
        : `${API_BASE_URL}/changelog`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changelog),
      });
      if (!res.ok) throw new Error("changelog save failed");
      const saved = await res.json();
      if (editingId) {
        setChangelogs((prev) =>
          prev.map((c) => (c.id === editingId ? saved : c)),
        );
      } else {
        setChangelogs((prev) => [saved, ...prev]);
      }
      return { success: true, saved };
    } catch (err) {
      console.error("saveChangelog", err);
      return { success: false, error: err.message };
    }
  }, []);

  const deleteChangelog = useCallback(async (changelogId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/changelog/${changelogId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("changelog delete failed");
      setChangelogs((prev) => prev.filter((c) => c.id !== changelogId));
      return { success: true };
    } catch (err) {
      console.error("deleteChangelog", err);
      return { success: false, error: err.message };
    }
  }, []);

  // R2 test helper
  const testR2Connection = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/r2/test`);
      const data = await res.json();
      return {
        success: data.success,
        data: data.data || null,
        message: data.message || null,
      };
    } catch (err) {
      console.error("testR2Connection", err);
      return { success: false, error: err.message };
    }
  }, []);

  // IGDB credentials helper
  const saveIgdbCredentials = useCallback(async (clientId, accessToken) => {
    try {
      if (!apiKeyService?.setIgdbCredentials) {
        console.warn("apiKeyService.setIgdbCredentials not available");
        return { success: false, error: "service missing" };
      }
      await apiKeyService.setIgdbCredentials(clientId, accessToken);
      // update igdb api stats if available
      try {
        if (igdbApi.getApiStats) {
          igdbApi.getApiStats();
        }
      } catch (e) {
        // Silently ignore IGDB API stats errors
      }
      return { success: true };
    } catch (err) {
      console.error("saveIgdbCredentials", err);
      return { success: false, error: err.message };
    }
  }, []);

  return {
    users,
    pendingUsers,
    apiKeys,
    r2Stats,
    changelogs,
    auditLogs,
    auditLogsPagination,
    notificationHistory,
    userReadStats,
    trafficLogs,
    loadUsers,
    loadApiKeys,
    loadR2Stats,
    loadChangelogs,
    loadAuditLogs,
    loadTrafficLogs,
    loadNotificationHistory,
    sendNotification,
    loadUserSecurity,
    loadUserReadStats,
    deleteUser,
    saveUser,
    approveUser,
    rejectUser,
    saveChangelog,
    deleteChangelog,
    testR2Connection,
    saveIgdbCredentials,
    setUsers,
    setPendingUsers,
  };
}
