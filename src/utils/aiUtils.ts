import { Vision, DailyAction } from '@/types'

// Mock AI recommendations - will be replaced with real AI later
export const mockAI = {
  generateDailyActions: (visions: Vision[], date: string): DailyAction[] => {
    const actions: DailyAction[] = []
    
    // Select up to 2 visions based on priority and time allocation
    const prioritizedVisions = visions
      .sort((a, b) => b.priority - a.priority || b.timeAllocation - a.timeAllocation)
      .slice(0, 2)

    prioritizedVisions.forEach(vision => {
      const action = generateActionForVision(vision, date)
      if (action) actions.push(action)
    })

    return actions
  },

  getMotivationalMessage: (visionDescription: string, dayCount: number): string => {
    const messages = [
      `Amazing progress toward becoming ${visionDescription}! Day ${dayCount} complete!`,
      `You're building the habits that will make you ${visionDescription}! Day ${dayCount} done!`,
      `Every day brings you closer to ${visionDescription}! Day ${dayCount} conquered!`,
      `Your future self as ${visionDescription} is proud! Day ${dayCount} finished!`
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }
}

function generateActionForVision(vision: Vision, date: string): DailyAction {
  const actionTemplates = getActionTemplatesForCategory(vision.category)
  const template = actionTemplates[Math.floor(Math.random() * actionTemplates.length)]
  
  return {
    id: `action_${vision.id}_${Date.now()}`,
    visionId: vision.id,
    description: template.description,
    estimatedTime: template.estimatedTime,
    completed: false,
    date
  }
}

function getActionTemplatesForCategory(category: Vision['category']) {
  const templates = {
    health: [
      { description: "Take a 15-minute walk outside", estimatedTime: 15 },
      { description: "Do 10 minutes of stretching", estimatedTime: 10 },
      { description: "Drink 3 glasses of water", estimatedTime: 5 },
      { description: "Practice 5 minutes of deep breathing", estimatedTime: 5 }
    ],
    career: [
      { description: "Read one article in your field", estimatedTime: 20 },
      { description: "Update your LinkedIn profile", estimatedTime: 15 },
      { description: "Practice a new skill for 20 minutes", estimatedTime: 20 },
      { description: "Network with one professional contact", estimatedTime: 10 }
    ],
    relationships: [
      { description: "Call a friend or family member", estimatedTime: 15 },
      { description: "Write a thoughtful message to someone", estimatedTime: 10 },
      { description: "Practice active listening in conversations", estimatedTime: 5 },
      { description: "Plan a quality time activity", estimatedTime: 20 }
    ],
    'personal-growth': [
      { description: "Journal for 10 minutes", estimatedTime: 10 },
      { description: "Read for 20 minutes", estimatedTime: 20 },
      { description: "Practice gratitude - list 3 things", estimatedTime: 5 },
      { description: "Learn something new for 15 minutes", estimatedTime: 15 }
    ]
  }
  
  return templates[category] || templates['personal-growth']
}