export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  } else {
    return `${remainingSeconds}s`
  }
}

export function minutesToHoursMinutes(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`
  } else if (hours > 0) {
    return `${hours}h`
  } else {
    return `${remainingMinutes}m`
  }
}

export function parseTimeInput(input: string): number {
  // Parse inputs like "2h 30m", "90m", "1.5h" into minutes
  const hourMatch = input.match(/(\d*\.?\d+)h/)
  const minuteMatch = input.match(/(\d+)m/)
  
  let totalMinutes = 0
  
  if (hourMatch) {
    totalMinutes += parseFloat(hourMatch[1]) * 60
  }
  
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1])
  }
  
  return totalMinutes
}