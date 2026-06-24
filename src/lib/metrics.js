// The 10 SECCEWLMMS metrics, in sheet column order (columns C..L).
// Headers in the sheet repeat letters, so metrics are mapped by POSITION.
export const METRICS = [
  { key: 'sleep', name: 'Sleep', letter: 'S', weight: 1.5, desc: 'Try to sleep well (>8h = 10).' },
  { key: 'eat', name: 'Eat', letter: 'E', weight: 1.0, desc: 'Eat / drink well; penalties for over/under-eating, alcohol, takeaway.' },
  { key: 'clean', name: 'Clean', letter: 'C', weight: 1.0, desc: 'Clean self & environment (brushing, dishes, bed, shower, skincare).' },
  { key: 'curtail', name: 'Curtail Internet', letter: 'C', weight: 1.5, desc: 'Curtail internet use (IG / YouTube / X / LinkedIn limits).' },
  { key: 'exercise', name: 'Exercise', letter: 'E', weight: 1.5, desc: 'Work out, take stairs, walk outside, posture changes.' },
  { key: 'work', name: 'Work', letter: 'W', weight: 1.5, desc: 'Work a productive ~7–8h; penalties for over/under and holiday work.' },
  { key: 'laugh', name: 'Laugh', letter: 'L', weight: 0.5, desc: 'Overall mood of the day (great day = 10).' },
  { key: 'meditate', name: 'Meditate', letter: 'M', weight: 1.0, desc: 'Meditate + journal, read a bit, LinkedIn challenges.' },
  { key: 'music', name: 'Music', letter: 'M', weight: 0.5, desc: 'Listen to music + sing, add a new song to a playlist.' },
  { key: 'socialize', name: 'Socialize', letter: 'S', weight: 0.5, desc: 'Socialize (a real conversation with someone).' },
];

// Pastel / retro palette for metric lines.
export const METRIC_COLORS = {
  sleep: '#e8998d',
  eat: '#e6c86e',
  clean: '#9ccc9c',
  curtail: '#7fb5c4',
  exercise: '#9a9ae6',
  work: '#c4a3d6',
  laugh: '#f0a6c2',
  meditate: '#7fa6d6',
  music: '#e89a86',
  socialize: '#6fc0ad',
};

// Cycling pastel palette for sport bars.
export const SPORT_PALETTE = [
  '#e8998d', '#e6c86e', '#9ccc9c', '#7fb5c4', '#9a9ae6',
  '#c4a3d6', '#f0a6c2', '#7fa6d6', '#6fc0ad', '#e0b07a',
  '#b5d99c', '#d69ab5', '#86c5e8', '#caa6e0', '#e6b86e',
];
