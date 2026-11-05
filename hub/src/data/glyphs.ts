// Original 24 x 24 stroke drawings for guide graphics.
export const glyphs = {
  "wrench": [
    "M4 4l4 4-1 3-3 1-2-2 1-5 4-2 3 2-1 3 11 11-3 3L7 11"
  ],
  "clock": [
    "M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18",
    "M12 6v6l4 2"
  ],
  "compare": [
    "M4 7h15l-3-3m4 13H5l3 3",
    "M4 4v7m16 2v7"
  ],
  "bolt": [
    "M13 2L5 13h6l-1 9 9-13h-7z"
  ],
  "sparkle": [
    "M12 2l3 7 7 3-7 3-3 7-3-7-7-3 7-3z"
  ],
  "shield": [
    "M12 2l8 4v7q-2 6-8 9-6-3-8-9V6z",
    "M8 12l3 3 5-6"
  ],
  "chat": [
    "M3 4h18v13H9l-6 4z",
    "M7 8h10M7 12h7"
  ],
  "document": [
    "M5 2h10l4 4v16H5z",
    "M15 2v5h4M8 11h8M8 15h8M8 19h5"
  ],
  "photo": [
    "M3 4h18v16H3z",
    "M3 17l6-7 5 5 3-3 4 5M15 8h1"
  ],
  "mail": [
    "M3 5h18v14H3z",
    "M3 6l9 7 9-7"
  ],
  "calendar": [
    "M3 5h18v16H3z",
    "M7 2v6M17 2v6M3 10h18M7 14h2M13 14h3"
  ],
  "search": [
    "M10 3a7 7 0 1 0 0 14 7 7 0 1 0 0-14",
    "M15 15l7 7"
  ],
  "lock": [
    "M5 10h14v12H5z",
    "M8 10V6a4 4 0 0 1 8 0v4M12 14v4"
  ],
  "phone": [
    "M7 2h10v20H7z",
    "M10 5h4M11 19h2"
  ],
  "list": [
    "M8 5h13M8 12h13M8 19h13M3 5h1M3 12h1M3 19h1"
  ],
  "lightbulb": [
    "M8 16c0-3-3-4-3-8a7 7 0 0 1 14 0c0 4-3 5-3 8z",
    "M8 19h8M10 22h4"
  ],
  "translate": [
    "M2 5h12M8 2v3M4 8q3 6 9 8M12 5q-1 8-10 13",
    "M13 22l4-12 5 12M15 18h5"
  ],
  "microphone": [
    "M9 3a3 3 0 0 1 6 0v9a3 3 0 0 1-6 0z",
    "M5 11v1a7 7 0 0 0 14 0v-1M12 19v3M8 22h8"
  ],
  "chart": [
    "M3 2v20h19",
    "M7 18v-6h3v6M13 18V8h3v10M19 18V4h3v14"
  ],
  "checklist": [
    "M9 5h12M9 12h12M9 19h12",
    "M2 4l2 2 3-4M2 11l2 2 3-4M2 18l2 2 3-4"
  ]
} as const;
export type Glyph = keyof typeof glyphs;
