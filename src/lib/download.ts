/**
 * Trigger a browser download of a Lottie clip as a JSON file.
 * The clip is read from the in-memory data we already have.
 */
export function downloadLottie(name: string, data: object): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  // Make sure the filename ends with .json — most Lottie players expect it.
  const safe = name.toLowerCase().endsWith('.json') ? name : `${name}.json`;
  a.download = safe;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Defer revoke so the click handler in some browsers has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}