export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function generateVisionId(category: string): string {
  return `vision_${category}_${generateId()}`
}

export function generateActionId(visionId: string): string {
  return `action_${visionId}_${generateId()}`
}