// Tutorial Import Parser
// .txt dosyasından tutorial verisini içeri aktarmak için yardımcı fonksiyonlar
// Desteklenen formatlar:
// 1) JSON: Dosya içeriği doğrudan tutorial şemasına uygun JSON
// 2) DSL: Bölümlere ayrılmış satır tabanlı format
//    [TUTORIAL], [TARGET_PAGE], [SETTINGS], [STEP]
//    key = value satırları, content.* ve overlay.*, highlight.*, modal.* için noktalı alanlar desteklenir

import { TUTORIAL_TYPES, PAGE_CATEGORIES } from "./tutorialTypes";

const defaultSettings = {
  autoStart: true,
  showProgress: true,
  allowSkip: true,
  overlay: {
    color: "rgba(0, 0, 0, 0.7)",
    blur: true,
  },
  highlight: {
    color: "#8b5cf6",
    borderWidth: 3,
    borderRadius: 8,
    padding: 8,
  },
  modal: {
    maxWidth: 400,
    borderRadius: 12,
    backgroundColor: "rgba(17, 24, 39, 0.95)",
    textColor: "#ffffff",
  },
};

const defaultStep = () => ({
  id: `step-${Date.now()}`,
  title: "",
  description: "",
  target: "",
  position: "bottom",
  highlightType: "outline",
  content: {
    text: "",
    image: null,
    buttons: [{ text: "Devam", action: "next", style: "primary" }],
  },
});

const toBoolean = (val) => {
  if (typeof val === "boolean") return val;
  if (typeof val !== "string") return false;
  return val.trim().toLowerCase() === "true";
};

const toNumber = (val) => {
  const n = Number(val);
  return Number.isNaN(n) ? undefined : n;
};

const slugify = (str) => {
  return String(str || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
};

const resolvePagePath = (categoryId, pageId) => {
  const category = Object.values(PAGE_CATEGORIES).find(
    (c) => c.id === categoryId,
  );
  const page = category?.pages.find((p) => p.id === pageId);
  return page ? { pageName: page.name, pagePath: page.path } : null;
};

const normalizeTarget = (value) => {
  if (!value) return "";
  const v = String(value).trim();
  // ERS id desteği: registryId:XYZ veya sadece XYZ
  if (v.startsWith("registryId:")) {
    const id = v.split(":")[1];
    return `[data-registry="${id}"]`;
  }
  if (v.startsWith("data-registry:")) {
    const id = v.split(":")[1];
    return `[data-registry="${id}"]`;
  }
  // [data-registry="XYZ"] veya #id/.class gibi direkt selector ise aynen döndür
  return v;
};

const mapType = (value) => {
  const v = String(value || "").toLowerCase();
  if (v === "page_guide" || v === "page-guide")
    return TUTORIAL_TYPES.PAGE_GUIDE;
  if (v === "sub_guide" || v === "sub-guide") return TUTORIAL_TYPES.SUB_GUIDE;
  return TUTORIAL_TYPES.PAGE_GUIDE;
};

function tryParseJSON(text) {
  try {
    const obj = JSON.parse(text);
    return obj;
  } catch (e) {
    return null;
  }
}

// Basit DSL parser
function parseDSL(text) {
  const lines = text.split(/\r?\n/);
  let section = null;
  const tutorial = {
    id: "",
    title: "",
    description: "",
    version: "1.0.0",
    type: TUTORIAL_TYPES.PAGE_GUIDE,
    targetPage: null,
    steps: [],
    settings: JSON.parse(JSON.stringify(defaultSettings)),
  };

  let currentStep = null;

  const assignNested = (obj, keyPath, rawValue) => {
    const keys = keyPath.split(".");
    let targetObj = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!targetObj[k] || typeof targetObj[k] !== "object") {
        targetObj[k] = {};
      }
      targetObj = targetObj[k];
    }
    const lastKey = keys[keys.length - 1];
    let value = rawValue;
    // Tip dönüşümleri
    if (/^(true|false)$/i.test(rawValue)) {
      value = toBoolean(rawValue);
    } else if (/^\d+$/.test(rawValue)) {
      const num = toNumber(rawValue);
      if (num !== undefined) value = num;
    } else if (
      (rawValue && rawValue.trim().startsWith("{")) ||
      rawValue.trim().startsWith("[")
    ) {
      // JSON string
      try {
        value = JSON.parse(rawValue);
      } catch {}
    }
    targetObj[lastKey] = value;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("//") || line.startsWith("#")) continue;

    // Section değişimi
    const m = line.match(/^\[(.+?)\]$/);
    if (m) {
      section = m[1].toUpperCase();
      if (section === "STEP") {
        currentStep = defaultStep();
        tutorial.steps.push(currentStep);
      }
      continue;
    }

    // key = value
    const kv = line.match(/^(.*?)\s*=\s*(.+)$/);
    if (!kv) continue;
    const key = kv[1].trim();
    const value = kv[2].trim();

    switch (section) {
      case "TUTORIAL": {
        if (key === "id") tutorial.id = value;
        else if (key === "title") tutorial.title = value;
        else if (key === "description") tutorial.description = value;
        else if (key === "version") tutorial.version = value;
        else if (key === "type") tutorial.type = mapType(value);
        break;
      }
      case "TARGET_PAGE": {
        if (!tutorial.targetPage) tutorial.targetPage = {};
        if (key === "categoryId") tutorial.targetPage.categoryId = value;
        else if (key === "pageId") tutorial.targetPage.pageId = value;
        else if (key === "pagePath") tutorial.targetPage.pagePath = value;
        else if (key === "pageName") tutorial.targetPage.pageName = value;
        break;
      }
      case "SETTINGS": {
        if (
          key.startsWith("overlay.") ||
          key.startsWith("highlight.") ||
          key.startsWith("modal.")
        ) {
          assignNested(tutorial.settings, key, value);
        } else {
          if (key === "autoStart")
            tutorial.settings.autoStart = toBoolean(value);
          else if (key === "showProgress")
            tutorial.settings.showProgress = toBoolean(value);
          else if (key === "allowSkip")
            tutorial.settings.allowSkip = toBoolean(value);
        }
        break;
      }
      case "STEP": {
        if (!currentStep) {
          currentStep = defaultStep();
          tutorial.steps.push(currentStep);
        }
        if (key === "id") currentStep.id = value;
        else if (key === "title") currentStep.title = value;
        else if (key === "description") currentStep.description = value;
        else if (key === "target") currentStep.target = normalizeTarget(value);
        else if (key === "position") currentStep.position = value;
        else if (key === "highlightType") currentStep.highlightType = value;
        else if (key.startsWith("content."))
          assignNested(currentStep, key, value);
        break;
      }
      default:
        // Boş veya tanımsız bölüm
        break;
    }
  }

  // targetPage için path ve name'i doldur
  if (tutorial.targetPage?.categoryId && tutorial.targetPage?.pageId) {
    const resolved = resolvePagePath(
      tutorial.targetPage.categoryId,
      tutorial.targetPage.pageId,
    );
    if (resolved) {
      tutorial.targetPage.pageName =
        tutorial.targetPage.pageName || resolved.pageName;
      tutorial.targetPage.pagePath =
        tutorial.targetPage.pagePath || resolved.pagePath;
    }
  }

  return tutorial;
}

function normalizeTutorial(obj) {
  const tutorial = {
    id:
      obj.id ||
      (obj.title ? `${slugify(obj.title)}-tutorial` : `tutorial-${Date.now()}`),
    title: obj.title || "Yeni Tutorial",
    description: obj.description || "",
    version: obj.version || "1.0.0",
    type: mapType(obj.type),
    targetPage: obj.targetPage || null,
    steps:
      Array.isArray(obj.steps) && obj.steps.length > 0
        ? obj.steps.map((s, i) => ({
            id: s.id || `step-${Date.now()}-${i}`,
            title: s.title || `Adım ${i + 1}`,
            description: s.description || "",
            target: normalizeTarget(s.target || ""),
            position: s.position || "bottom",
            highlightType: s.highlightType || "outline",
            content: {
              text: s.content?.text || "",
              image: s.content?.image || null,
              buttons:
                Array.isArray(s.content?.buttons) &&
                s.content.buttons.length > 0
                  ? s.content.buttons
                  : [{ text: "Devam", action: "next", style: "primary" }],
            },
          }))
        : [defaultStep()],
    settings: { ...defaultSettings, ...(obj.settings || {}) },
  };

  if (tutorial.targetPage?.categoryId && tutorial.targetPage?.pageId) {
    const resolved = resolvePagePath(
      tutorial.targetPage.categoryId,
      tutorial.targetPage.pageId,
    );
    if (resolved) {
      tutorial.targetPage.pageName =
        tutorial.targetPage.pageName || resolved.pageName;
      tutorial.targetPage.pagePath =
        tutorial.targetPage.pagePath || resolved.pagePath;
    }
  }

  return tutorial;
}

export function parseTutorialText(text) {
  const errors = [];
  let rawObj = tryParseJSON(text);
  if (!rawObj) {
    try {
      rawObj = parseDSL(text);
    } catch (e) {
      errors.push("DSL parse edilirken hata oluştu: " + e.message);
    }
  }

  if (!rawObj) {
    return {
      tutorial: null,
      errors: errors.length
        ? errors
        : ["Geçersiz dosya formatı. JSON veya DSL kullanın."],
    };
  }

  try {
    const tutorial = normalizeTutorial(rawObj);
    // Basit doğrulamalar
    if (!tutorial.id) errors.push("ID üretilemedi");
    if (!tutorial.title) errors.push("Başlık eksik");
    if (!Array.isArray(tutorial.steps) || tutorial.steps.length === 0)
      errors.push("En az bir adım olmalı");

    return { tutorial, errors };
  } catch (e) {
    errors.push("Normalize edilirken hata oluştu: " + e.message);
    return { tutorial: null, errors };
  }
}
