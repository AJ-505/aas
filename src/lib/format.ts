// Money is stored as integer kobo (100 kobo = 1 naira) to avoid float errors.
// All money fields in the database and forms use kobo; display with formatNaira.

export function koboToNaira(kobo: number): number {
  return kobo / 100
}

export function nairaToKobo(naira: number): number {
  return Math.round(naira * 100)
}

export function formatNaira(kobo: number): string {
  const naira = koboToNaira(kobo)
  return `\u20a6${naira.toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatKoboInput(naira: number): number {
  return nairaToKobo(naira)
}

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleString('en-NG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
