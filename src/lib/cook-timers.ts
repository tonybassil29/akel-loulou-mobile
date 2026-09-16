/**
 * Detection des durees dans une etape de preparation.
 * « Cuire les oeufs 6 min » -> proposition d'un minuteur de 6 minutes.
 */
const DURATION = /(\d+(?:[.,]\d+)?)\s*(h|heures?|min(?:utes?)?|secondes?|sec|s)\b/gi;

export interface DetectedTimer {
  label: string;
  seconds: number;
}

export function detectTimers(step: string): DetectedTimer[] {
  if (!step) return [];
  const found: DetectedTimer[] = [];

  for (const match of step.matchAll(DURATION)) {
    const value = parseFloat(match[1].replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) continue;

    const unit = match[2].toLowerCase();
    const seconds = unit.startsWith('h')
      ? value * 3600
      : unit.startsWith('min')
        ? value * 60
        : unit.startsWith('sec') || unit === 's'
          ? value
          : 0;

    // Au-dela de 4 h, c'est un temps de repos, pas un minuteur utile.
    if (seconds > 0 && seconds <= 4 * 3600) {
      found.push({ label: match[0].trim(), seconds: Math.round(seconds) });
    }
  }

  // Une meme duree citee deux fois dans l'etape ne donne qu'un minuteur.
  return found.filter((t, i) => found.findIndex((o) => o.seconds === t.seconds) === i);
}

export function formatDuration(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rest = s % 60;
  return `${String(m).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}
