/**
 * TYPOGRAPHY - Font Sistemi
 * Font boyutları, ağırlıkları ve ailesi
 */

export const typography = {
  // Font Ailesi
  fontFamily: {
    base: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },

  // Font Boyutları
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
  },

  // Font Ağırlıkları
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
}

export default typography