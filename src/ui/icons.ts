export const Icons = {
  logo: `<svg class="mopuzzle-logo-svg" viewBox="0 0 128 128" width="100%" height="100%" aria-hidden="true" focusable="false">
    <defs>
      <!-- Background Gradient -->
      <linearGradient id="p6Bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0F172A" />
        <stop offset="45%" stop-color="#1E2E56" />
        <stop offset="100%" stop-color="#0A1020" />
      </linearGradient>

      <!-- Outer Frame Stroke -->
      <linearGradient id="p6Frame" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#A1E3F9" stop-opacity="0.9" />
        <stop offset="50%" stop-color="#38BDF8" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#A1E3F9" stop-opacity="0.8" />
      </linearGradient>

      <!-- Center Glow -->
      <radialGradient id="p6Core" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#A1E3F9" />
        <stop offset="55%" stop-color="#243A73" />
        <stop offset="100%" stop-color="#0F172A" />
      </radialGradient>

      <!-- Sector Gradients -->
      <linearGradient id="p6Grad_sudoku" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3B82F6" />
        <stop offset="100%" stop-color="#1D4ED8" />
      </linearGradient>
      <linearGradient id="p6Grad_pipe" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#06B6D4" />
        <stop offset="100%" stop-color="#0284C7" />
      </linearGradient>
      <linearGradient id="p6Grad_lights" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FBBF24" />
        <stop offset="100%" stop-color="#D97706" />
      </linearGradient>
      <linearGradient id="p6Grad_memory" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#A78BFA" />
        <stop offset="100%" stop-color="#7C3AED" />
      </linearGradient>
      <linearGradient id="p6Grad_box" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#10B981" />
        <stop offset="100%" stop-color="#047857" />
      </linearGradient>
      <linearGradient id="p6Grad_mines" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F87171" />
        <stop offset="100%" stop-color="#DC2626" />
      </linearGradient>
    </defs>

    <!-- Base Badge -->
    <rect width="128" height="128" rx="28" fill="url(#p6Bg)" />
    <rect x="3.5" y="3.5" width="121" height="121" rx="24.5" fill="none" stroke="url(#p6Frame)" stroke-width="2" />

    <!-- Outer Orbit Guide Ring -->
    <circle cx="64" cy="64" r="51.5" fill="none" stroke="#A1E3F9" stroke-width="1" stroke-opacity="0.15" stroke-dasharray="2 3" />

    <!-- 6 Interconnected Puzzle Segments -->
    <g id="emblem-sectors">
      <path d="M 56.15 49.49 A 16.5 16.5 0 0 1 71.85 49.49 L 87.07 21.34 A 48.5 48.5 0 0 0 40.93 21.34 Z" fill="url(#p6Grad_sudoku)" stroke="#0F172A" stroke-width="1.2" />
      <path d="M 72.65 49.95 A 16.5 16.5 0 0 1 80.49 63.54 L 112.48 62.65 A 48.5 48.5 0 0 0 89.41 22.69 Z" fill="url(#p6Grad_pipe)" stroke="#0F172A" stroke-width="1.2" />
      <path d="M 80.49 64.46 A 16.5 16.5 0 0 1 72.65 78.05 L 89.41 105.31 A 48.5 48.5 0 0 0 112.48 65.35 Z" fill="url(#p6Grad_lights)" stroke="#0F172A" stroke-width="1.2" />
      <path d="M 71.85 78.51 A 16.5 16.5 0 0 1 56.15 78.51 L 40.93 106.66 A 48.5 48.5 0 0 0 87.07 106.66 Z" fill="url(#p6Grad_memory)" stroke="#0F172A" stroke-width="1.2" />
      <path d="M 55.35 78.05 A 16.5 16.5 0 0 1 47.51 64.46 L 15.52 65.35 A 48.5 48.5 0 0 0 38.59 105.31 Z" fill="url(#p6Grad_box)" stroke="#0F172A" stroke-width="1.2" />
      <path d="M 47.51 63.54 A 16.5 16.5 0 0 1 55.35 49.95 L 38.59 22.69 A 48.5 48.5 0 0 0 15.52 62.65 Z" fill="url(#p6Grad_mines)" stroke="#0F172A" stroke-width="1.2" />
    </g>

    <!-- Game-Specific Iconic Motifs -->
    <!-- 1. Sudoku: 2x2 Logic Grid (Top) -->
    <g transform="translate(64, 33)">
      <rect x="-8" y="-6.5" width="7" height="5.5" rx="1.5" fill="#FFFFFF" />
      <rect x="1" y="-6.5" width="7" height="5.5" rx="1.5" fill="#93C5FD" />
      <rect x="-8" y="1" width="7" height="5.5" rx="1.5" fill="#93C5FD" />
      <rect x="1" y="1" width="7" height="5.5" rx="1.5" fill="#FFFFFF" />
    </g>

    <!-- 2. Pipe Connect: Conduit Curve (Top-Right) -->
    <g transform="translate(90.5, 48)">
      <path d="M -6 -5 A 9 9 0 0 1 5 4" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" />
      <circle cx="5" cy="4" r="2.5" fill="#67E8F9" />
    </g>

    <!-- 3. Lights Out: Radiant 4-Point Star (Bottom-Right) -->
    <g transform="translate(90.5, 80)">
      <polygon points="0,-7 2,-2 7,0 2,2 0,7 -2,2 -7,0 -2,-2" fill="#FFFFFF" />
      <circle cx="0" cy="0" r="1.8" fill="#FDE68A" />
    </g>

    <!-- 4. Memory Flip: Dual Overlapping Cards (Bottom) -->
    <g transform="translate(64, 95)">
      <rect x="-8" y="-5.5" width="9" height="11" rx="2" fill="#5B21B6" stroke="#DDD6FE" stroke-width="0.8" transform="rotate(-14)" />
      <rect x="-1" y="-5.5" width="9" height="11" rx="2" fill="#FFFFFF" stroke="#A78BFA" stroke-width="0.8" transform="rotate(8)" />
      <circle cx="3.5" cy="0" r="2" fill="#7C3AED" />
    </g>

    <!-- 5. Box Pusher: Movable Crate & Target Bracket (Bottom-Left) -->
    <g transform="translate(37.5, 80)">
      <path d="M -6.5 6.5 L -6.5 -2.5 L 2.5 -2.5" fill="none" stroke="#A7F3D0" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      <rect x="-3" y="-1" width="9" height="9" rx="1.5" fill="#FFFFFF" stroke="#047857" stroke-width="1" />
      <line x1="-3" y1="-1" x2="6" y2="8" stroke="#10B981" stroke-width="1" />
    </g>

    <!-- 6. Minesweeper: Detection Flag & Safe Node (Top-Left) -->
    <g transform="translate(37.5, 48)">
      <line x1="-3" y1="-7" x2="-3" y2="6" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round" />
      <polygon points="-3,-7 5,-3 -3,1" fill="#FFFFFF" />
      <circle cx="-3" cy="6" r="2" fill="#FECACA" />
    </g>

    <!-- Central Logic Core Hub -->
    <circle cx="64" cy="64" r="15" fill="url(#p6Core)" stroke="#A1E3F9" stroke-width="2.5" />
    <circle cx="64" cy="64" r="6.5" fill="#FFFFFF" />
    <circle cx="64" cy="64" r="3" fill="#243A73" />
  </svg>`,

  play: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`,
  pause: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`,
  restart: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>`,
  undo: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"></path><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"></path></svg>`,
  redo: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21 7v6h-6"></path><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"></path></svg>`,
  hint: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path></svg>`,
  notes: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`,
  flag: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`,
  close: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
  settings: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>`,
  stats: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"></line><line x1="12" y1="20" x2="12" y2="4"></line><line x1="6" y1="20" x2="6" y2="14"></line></svg>`,
  trophy: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34"></path><path d="M6 4h12v6a6 6 0 0 1-12 0V4z"></path></svg>`,
  home: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`,
  info: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
  help: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
  github: `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
  chevronLeft: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`,
  chevronRight: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
  check: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
  star: `<svg viewBox="0 0 24 24" width="18" height="18" fill="#F59E0B" stroke="#D97706" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  starEmpty: `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
  clock: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
  footstep: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 16v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"></path><circle cx="8" cy="6" r="2"></circle><circle cx="16" cy="6" r="2"></circle></svg>`,
};
