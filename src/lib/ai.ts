import { Vision, DailyAction } from '@/types'

// AI Configuration
const AI_CONFIG = {
  provider: 'openai',
  model: 'gpt-4o-mini', // Cost-effective option for production
  maxTokens: 500,
  temperature: 0.7,
}

// Rate limiting and caching
const AI_CACHE = new Map<string, { data: any; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const RATE_LIMIT = new Map<string, number>()
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_MINUTE = 10

interface AIResponse<T> {
  success: boolean
  data?: T
  error?: string
  cached?: boolean
}

// Helper function to check rate limits
function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userRequests = RATE_LIMIT.get(userId) || 0
  
  if (userRequests >= MAX_REQUESTS_PER_MINUTE) {
    return false
  }
  
  RATE_LIMIT.set(userId, userRequests + 1)
  
  // Clean up old rate limit entries
  setTimeout(() => {
    RATE_LIMIT.delete(userId)
  }, RATE_LIMIT_WINDOW)
  
  return true
}

// Helper function to check cache
function getFromCache<T>(key: string): T | null {
  const cached = AI_CACHE.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data
  }
  AI_CACHE.delete(key)
  return null
}

// Helper function to set cache
function setCache(key: string, data: any): void {
  AI_CACHE.set(key, { data, timestamp: Date.now() })
}

// OpenAI API call wrapper
async function callOpenAI(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: AI_CONFIG.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.choices[0]?.message?.content || ''
}

// AI Service for Daily Actions Generation
export async function generateDailyActions(
  visions: Vision[], 
  userId: string = 'default',
  userBehaviorData?: {
    completionTimes: number[]
    preferredActionTypes: string[]
    successfulActions: string[]
  }
): Promise<AIResponse<DailyAction[]>> {
  try {
    // Check rate limit
    if (!checkRateLimit(userId)) {
      return { 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.' 
      }
    }

    // Check cache
    const cacheKey = `actions_${userId}_${JSON.stringify(visions.map(v => v.id))}`
    const cachedActions = getFromCache<DailyAction[]>(cacheKey)
    if (cachedActions) {
      return { success: true, data: cachedActions, cached: true }
    }

    // Prepare context for AI
    const visionsContext = visions.map(v => ({
      category: v.category,
      description: v.description,
      priority: v.priority,
      timeAllocation: v.timeAllocation
    }))

    const behaviorContext = userBehaviorData ? `
User behavior patterns:
- Average completion times: ${userBehaviorData.completionTimes.join(', ')} minutes
- Preferred action types: ${userBehaviorData.preferredActionTypes.join(', ')}
- Most successful actions: ${userBehaviorData.successfulActions.join(', ')}
` : ''

    const systemPrompt = `You are an AI life coach that generates personalized daily actions for life transformation. 

Your role:
- Analyze user visions and create specific, actionable daily tasks
- Ensure actions are realistic and achievable within the time allocated
- Make actions specific, measurable, and aligned with long-term identity goals
- Consider user behavior patterns when available

Guidelines:
- Generate exactly 2 actions maximum
- Each action should be 5-25 minutes
- Focus on highest priority visions first
- Use clear, motivating language
- Make actions specific and concrete (not vague)
- Consider time allocation balance across visions

Response format: Return a JSON array with objects containing:
{
  "description": "Specific action description",
  "estimatedTime": number_in_minutes,
  "visionId": "vision_id",
  "category": "vision_category",
  "reasoning": "Brief explanation of why this action was chosen"
}`

    const userPrompt = `Generate personalized daily actions for this user:

Visions:
${visionsContext.map(v => `
- Category: ${v.category}
- Vision: "${v.description}"
- Priority: ${v.priority}
- Time Allocated: ${v.timeAllocation} minutes
`).join('')}

${behaviorContext}

Generate 2 specific, actionable tasks that will move this user toward their transformation goals today.`

    // Call OpenAI
    const aiResponse = await callOpenAI(userPrompt, systemPrompt)
    
    // Parse AI response
    let parsedActions: any[]
    try {
      // Extract JSON from response (in case AI adds extra text)
      const jsonMatch = aiResponse.match(/\[[\s\S]*\]/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
      parsedActions = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse)
      throw new Error('Invalid AI response format')
    }

    // Transform to DailyAction format
    const dailyActions: DailyAction[] = parsedActions.map((action, index) => ({
      id: `ai_action_${Date.now()}_${index}`,
      visionId: action.visionId || visions[0]?.id || 'unknown',
      description: action.description,
      estimatedTime: Math.min(Math.max(action.estimatedTime, 5), 60), // Clamp between 5-60 minutes
      completed: false,
      date: new Date().toISOString().split('T')[0],
      aiGenerated: true,
      aiReasoning: action.reasoning
    }))

    // Cache the result
    setCache(cacheKey, dailyActions)

    return { success: true, data: dailyActions }

  } catch (error) {
    console.error('AI Actions Generation Error:', error)
    
    // Fallback to mock actions on AI failure
    const fallbackActions = await generateFallbackActions(visions)
    return { 
      success: false, 
      data: fallbackActions,
      error: 'AI temporarily unavailable, using fallback actions'
    }
  }
}

// AI Service for Insights & Recommendations
export async function generatePersonalizedInsights(
  userStats: {
    completionRate: number
    averageCompletionTime: number
    streakCount: number
    preferredTimes: number[] // Hours of day when most active
    visionProgress: { [visionId: string]: number }
  },
  userId: string = 'default'
): Promise<AIResponse<{
  recommendations: Array<{
    title: string
    description: string
    confidence: number
    type: 'timing' | 'duration' | 'frequency' | 'strategy'
  }>
  insights: Array<{
    metric: string
    value: string
    trend: 'up' | 'down' | 'stable'
    interpretation: string
  }>
}>> {
  try {
    // Check rate limit
    if (!checkRateLimit(userId)) {
      return { 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.' 
      }
    }

    // Check cache
    const cacheKey = `insights_${userId}_${JSON.stringify(userStats)}`
    const cachedInsights = getFromCache<any>(cacheKey)
    if (cachedInsights) {
      return { success: true, data: cachedInsights, cached: true }
    }

    const systemPrompt = `You are an AI productivity analyst that generates personalized insights and recommendations based on user behavior data.

Your role:
- Analyze user performance patterns and identify optimization opportunities
- Generate specific, actionable recommendations with confidence scores
- Provide data-driven insights that help users improve their transformation journey
- Use encouraging, motivational language while being specific and practical

Guidelines:
- Generate 2-3 recommendations maximum
- Include confidence scores (0.0-1.0) based on data strength  
- Focus on actionable improvements
- Use specific percentages and metrics when possible
- Be encouraging but realistic

Response format: Return JSON with:
{
  "recommendations": [
    {
      "title": "Brief recommendation title",
      "description": "Detailed explanation with specific guidance",
      "confidence": confidence_score_0_to_1,
      "type": "timing|duration|frequency|strategy"
    }
  ],
  "insights": [
    {
      "metric": "Metric name",
      "value": "Formatted value with context",
      "trend": "up|down|stable",
      "interpretation": "What this means for the user"
    }
  ]
}`

    const userPrompt = `Analyze this user's performance data and generate personalized insights:

Performance Stats:
- Completion Rate: ${userStats.completionRate}%
- Average Completion Time: ${userStats.averageCompletionTime} minutes
- Current Streak: ${userStats.streakCount} days
- Most Active Hours: ${userStats.preferredTimes.join(', ')}
- Vision Progress: ${JSON.stringify(userStats.visionProgress)}

Generate specific recommendations and insights to help this user optimize their transformation journey.`

    // Call OpenAI
    const aiResponse = await callOpenAI(userPrompt, systemPrompt)
    
    // Parse AI response
    let parsedInsights: any
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
      parsedInsights = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse AI insights response:', aiResponse)
      throw new Error('Invalid AI response format')
    }

    // Cache the result
    setCache(cacheKey, parsedInsights)

    return { success: true, data: parsedInsights }

  } catch (error) {
    console.error('AI Insights Generation Error:', error)
    
    // Fallback to static insights
    const fallbackInsights = generateFallbackInsights(userStats)
    return { 
      success: false, 
      data: fallbackInsights,
      error: 'AI temporarily unavailable, using fallback insights'
    }
  }
}

// AI Service for Vision Processing & Understanding
export async function analyzeVisionDescription(
  visionDescription: string,
  category: string,
  userId: string = 'default'
): Promise<AIResponse<{
  themes: string[]
  keyGoals: string[]
  suggestedActions: string[]
  timeComplexity: 'low' | 'medium' | 'high'
  feasibilityScore: number
  improvements: string[]
}>> {
  try {
    // Check rate limit
    if (!checkRateLimit(userId)) {
      return { 
        success: false, 
        error: 'Rate limit exceeded. Please try again later.' 
      }
    }

    // Check cache
    const cacheKey = `vision_${visionDescription.slice(0, 50)}_${category}`
    const cachedAnalysis = getFromCache<any>(cacheKey)
    if (cachedAnalysis) {
      return { success: true, data: cachedAnalysis, cached: true }
    }

    const systemPrompt = `You are an AI vision analyst that helps users refine and understand their life transformation goals.

Your role:
- Analyze vision descriptions and extract key themes and goals
- Assess feasibility and complexity of achieving the vision
- Suggest specific actionable steps toward the vision
- Provide constructive feedback for improvement

Guidelines:
- Be encouraging and supportive while being realistic
- Focus on specific, measurable outcomes
- Consider the time and effort required
- Suggest concrete next steps

Response format: Return JSON with:
{
  "themes": ["key theme 1", "key theme 2"],
  "keyGoals": ["specific goal 1", "specific goal 2"],
  "suggestedActions": ["action 1", "action 2", "action 3"],
  "timeComplexity": "low|medium|high",
  "feasibilityScore": score_0_to_1,
  "improvements": ["suggestion 1", "suggestion 2"]
}`

    const userPrompt = `Analyze this life vision:

Category: ${category}
Vision Description: "${visionDescription}"

Provide analysis including themes, key goals, suggested actions, complexity assessment, and improvement suggestions.`

    // Call OpenAI
    const aiResponse = await callOpenAI(userPrompt, systemPrompt)
    
    // Parse AI response
    let parsedAnalysis: any
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      const jsonString = jsonMatch ? jsonMatch[0] : aiResponse
      parsedAnalysis = JSON.parse(jsonString)
    } catch (parseError) {
      console.error('Failed to parse AI vision analysis response:', aiResponse)
      throw new Error('Invalid AI response format')
    }

    // Cache the result
    setCache(cacheKey, parsedAnalysis)

    return { success: true, data: parsedAnalysis }

  } catch (error) {
    console.error('AI Vision Analysis Error:', error)
    
    // Fallback to basic analysis
    const fallbackAnalysis = generateFallbackVisionAnalysis(visionDescription, category)
    return { 
      success: false, 
      data: fallbackAnalysis,
      error: 'AI temporarily unavailable, using basic analysis'
    }
  }
}

// Fallback Functions (when AI is unavailable)
async function generateFallbackActions(visions: Vision[]): Promise<DailyAction[]> {
  // Import the existing mock AI as fallback
  const { mockAI } = await import('@/utils/aiUtils')
  return mockAI.generateDailyActions(visions, new Date().toISOString().split('T')[0])
}

function generateFallbackInsights(userStats: any) {
  return {
    recommendations: [
      {
        title: "Optimize your timing",
        description: `Based on your completion pattern, you seem most productive during certain hours. Try scheduling important actions during your peak times.`,
        confidence: 0.7,
        type: "timing" as const
      }
    ],
    insights: [
      {
        metric: "Completion Rate",
        value: `${userStats.completionRate}%`,
        trend: "stable" as const,
        interpretation: "Your consistency is building strong habits"
      }
    ]
  }
}

function generateFallbackVisionAnalysis(visionDescription: string, category: string) {
  return {
    themes: [category, "personal growth"],
    keyGoals: ["Build consistent habits", "Make measurable progress"],
    suggestedActions: ["Take small daily steps", "Track your progress", "Stay consistent"],
    timeComplexity: "medium" as const,
    feasibilityScore: 0.8,
    improvements: ["Be more specific about outcomes", "Set measurable milestones"]
  }
}

// Export type definitions for external use
export type { AIResponse }