import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

// LocalStorage key
const STORAGE_KEY = "junoro:updatesRoadmap";

// Default sample data
const defaultRoadmap = {
  current: [
    {
      id: "feature-import-tutorials",
      title: "Tutorial İçe Aktarma (.txt) ve Editor Entegrasyonu",
      description:
        "Admin panelden .txt ile içe aktarma ve düzenleme akışının tamamlanması",
      progress: 85,
      status: "in_progress", // in_progress | paused | blocked | done
      subtasks: [
        {
          id: "parser-dsl",
          title: "DSL Parser ve Normalizasyon",
          progress: 100,
          status: "done",
        },
        {
          id: "import-modal",
          title: "Import Modal UI ve Akış",
          progress: 100,
          status: "done",
        },
        {
          id: "admin-button",
          title: "Admin Import (.txt) Butonu & ERS",
          progress: 100,
          status: "done",
        },
        {
          id: "edit-draft",
          title: "Editör Taslak Yükleme",
          progress: 75,
          status: "in_progress",
        },
      ],
    },
  ],
  upcoming: [
    {
      id: "roadmap-card",
      title: "Güncel Geliştirmeler Kartı",
      description: "Ana sayfada canlı ilerleme kartı",
      priority: "high",
      plannedQuarter: "2025-Q1",
    },
    {
      id: "activity-feed",
      title: "Son Aktiviteler",
      description: "Kullanıcı aktiviteleri akışı",
      priority: "medium",
      plannedQuarter: "2025-Q1",
    },
    {
      id: "discover",
      title: "Keşfet Bölümü",
      description: "Öneriler ve keşif",
      priority: "medium",
      plannedQuarter: "2025-Q2",
    },
  ],
  lastUpdated: Date.now(),
};

export function useUpdates() {
  const { isAdmin } = useAuth();
  const [updates, setUpdates] = useState(defaultRoadmap);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
          setUpdates(parsed);
        }
      } else {
        // initialize with defaults
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRoadmap));
      }
    } catch (e) {
      console.warn("Updatesロードマップ parse error, using defaults", e);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultRoadmap));
    } finally {
      setInitialized(true);
    }
  }, []);

  const saveUpdates = (next) => {
    const payload = { ...next, lastUpdated: Date.now() };
    setUpdates(payload);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {}
    return true;
  };

  // CRUD helpers
  const addCurrent = (item) => {
    const next = { ...updates, current: [...(updates.current || []), item] };
    return saveUpdates(next);
  };

  const updateCurrent = (id, partial) => {
    const next = {
      ...updates,
      current: (updates.current || []).map((it) =>
        it.id === id ? { ...it, ...partial } : it,
      ),
    };
    return saveUpdates(next);
  };

  const removeCurrent = (id) => {
    const next = {
      ...updates,
      current: (updates.current || []).filter((it) => it.id !== id),
    };
    return saveUpdates(next);
  };

  const addSubtask = (parentId, subtask) => {
    const next = {
      ...updates,
      current: (updates.current || []).map((it) =>
        it.id === parentId
          ? { ...it, subtasks: [...(it.subtasks || []), subtask] }
          : it,
      ),
    };
    return saveUpdates(next);
  };

  const updateSubtask = (parentId, subId, partial) => {
    const next = {
      ...updates,
      current: (updates.current || []).map((it) => {
        if (it.id !== parentId) return it;
        return {
          ...it,
          subtasks: (it.subtasks || []).map((st) =>
            st.id === subId ? { ...st, ...partial } : st,
          ),
        };
      }),
    };
    return saveUpdates(next);
  };

  const removeSubtask = (parentId, subId) => {
    const next = {
      ...updates,
      current: (updates.current || []).map((it) => {
        if (it.id !== parentId) return it;
        return {
          ...it,
          subtasks: (it.subtasks || []).filter((st) => st.id !== subId),
        };
      }),
    };
    return saveUpdates(next);
  };

  const addUpcoming = (item) => {
    const next = { ...updates, upcoming: [...(updates.upcoming || []), item] };
    return saveUpdates(next);
  };

  const updateUpcoming = (id, partial) => {
    const next = {
      ...updates,
      upcoming: (updates.upcoming || []).map((it) =>
        it.id === id ? { ...it, ...partial } : it,
      ),
    };
    return saveUpdates(next);
  };

  const removeUpcoming = (id) => {
    const next = {
      ...updates,
      upcoming: (updates.upcoming || []).filter((it) => it.id !== id),
    };
    return saveUpdates(next);
  };

  return {
    updates,
    initialized,
    saveUpdates,
    addCurrent,
    updateCurrent,
    removeCurrent,
    addSubtask,
    updateSubtask,
    removeSubtask,
    addUpcoming,
    updateUpcoming,
    removeUpcoming,
    isAdmin: isAdmin(),
  };
}
