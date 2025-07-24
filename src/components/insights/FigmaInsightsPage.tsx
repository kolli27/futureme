"use client"

import * as React from "react"
import { List, House, Users, User, BarChart3 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useDailyActions } from "@/hooks/useDailyActions"
import { useVictory } from "@/hooks/useVictory"
import { generatePersonalizedInsights } from "@/lib/ai"
import { cn } from "@/lib/utils"

interface FigmaInsightsPageProps {
  onUpgrade?: () => void
}

const recommendationImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAW9_mmbDdhXWrDx78aKsoshB2icX3EPhBcNefGsy-NmJtwIpQw5AbtEY4ugcQddFm5Y-KVkLcXcwxu2K6Bzdp6fT1BgDeft6olk013wPEosGF177uGQsvnW7gcCoUt57tQVmpnH0xZeeKoXbhlkGqY65QIfgWLckWpZXHxxWhkG_7O9KXEIhgDxIQkX2B0A8O5gHmRL3p__KXfIEDy0ER11nXUDh_ngdtGHXf0NpCIcV98qtaGzjMiAomZasRgl0cl8FLZpGvLJslt",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjLySrNGcSblw8Ukf8g14Ai2m3cSajnNS8SDADHLGzIhVxKbrDMH_L_kMRkVTxg9ZVJPipqtcbTkRk3D5hKSLh0Oqj5uZD8c-HwBvzjBnxBYz2v6HvzP3JUgdTsRG-Vu0PMrH7KLJzz8h3Op240eCY_3NFCdyorac-onXYb7XlFjFm3zmHXAS7uJhUEt5vroMtVrNAAs8yZfS1-Y7is5Ci2c9vtZnK6L7y6fruusWIbIT05_7p-f6TMDR5SzKrP86yq4JMEk7LcTzj"
]

const premiumBgImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuBp53p6POL5gdDov_BZgp8yr_yZ_A7VNXl5CxbIHXE1brCDV3aJ-9-9WwyrV2wa3LgL7GPtoQY2DZcT2BwXP2XxR1vMxPrmS85WpBWMobVVhPVi3mWop40Xn9dxhEJAz7-A1UXUIDASBUQQ8Ylbmh471EEJK03Wn5pA7VGxpHTjWvKI0-ZhIdDF8RNIBwUdWAlYAdq8hxbCfE4A-gamaZxSkQqh8sEM3lpaMIReoxnol1b2-5McnMHZKZW6BK_naIiCAtd0aWm2qUUh"

export default function FigmaInsightsPage({ onUpgrade }: FigmaInsightsPageProps) {
  const router = useRouter()
  const { totalActions, completedActions, totalTimeSpent } = useDailyActions()
  const { getVictoryStats } = useVictory()
  
  // State for AI insights
  const [aiInsights, setAiInsights] = React.useState<any>(null)
  const [isLoadingInsights, setIsLoadingInsights] = React.useState(true)
  
  // Get real stats from user data
  const victoryStats = getVictoryStats()
  const completionRate = totalActions > 0 ? Math.round((completedActions.length / totalActions) * 100) : 75
  const avgCompletionTime = totalTimeSpent > 0 ? Math.round(totalTimeSpent / Math.max(completedActions.length, 1)) : 12
  
  // Generate AI insights on component mount
  React.useEffect(() => {
    const generateInsights = async () => {
      setIsLoadingInsights(true)
      
      // Prepare user stats for AI analysis
      const userStats = {
        completionRate,
        averageCompletionTime: avgCompletionTime,
        streakCount: victoryStats.currentStreak,
        preferredTimes: [9, 10, 11], // Mock preferred hours - would come from real data
        visionProgress: {} // Would come from actual vision tracking
      }
      
      try {
        const response = await generatePersonalizedInsights(userStats, 'default')
        if (response.success && response.data) {
          setAiInsights(response.data)
        } else if (response.data) {
          // Use fallback insights
          setAiInsights(response.data)
        }
      } catch (error) {
        console.error('Failed to generate AI insights:', error)
        // Set fallback insights
        setAiInsights({
          recommendations: [
            {
              title: "Optimize your morning routine",
              description: "Based on your completion pattern, you tend to be more productive in the morning. Try scheduling important actions earlier in the day.",
              confidence: 0.8,
              type: "timing"
            }
          ],
          insights: [
            {
              metric: "Completion Rate",
              value: `${completionRate}%`,
              trend: "stable",
              interpretation: "Your consistency is building strong habits"
            }
          ]
        })
      } finally {
        setIsLoadingInsights(false)
      }
    }
    
    generateInsights()
  }, [completionRate, avgCompletionTime, victoryStats.currentStreak])

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade()
    } else {
      // Navigate to upgrade page or show upgrade modal
      console.log('Upgrade to premium')
    }
  }

  // Mock data for charts - in real app this would come from analytics
  const weeklyData = [30, 90, 10, 50] // Week 1-4 percentages for bar chart
  const weekLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4']

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1d1023] p-4 pb-2 justify-between">
          <div className="text-white flex size-12 shrink-0 items-center justify-center">
            <List size={24} />
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Insights
          </h2>
        </div>

        {/* Smart Recommendations */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Smart Recommendations
        </h2>

        {/* AI-Generated Recommendations */}
        {isLoadingInsights ? (
          <div className="p-4">
            <div className="flex items-stretch justify-between gap-4 rounded-xl">
              <div className="flex flex-col gap-1 flex-[2_2_0px]">
                <div className="h-4 bg-[#3c2249] rounded animate-pulse mb-2" />
                <div className="h-3 bg-[#2b1834] rounded animate-pulse mb-1" />
                <div className="h-3 bg-[#2b1834] rounded animate-pulse w-3/4" />
              </div>
              <div className="w-full aspect-video bg-[#3c2249] rounded-xl flex-1 animate-pulse" />
            </div>
          </div>
        ) : (
          aiInsights?.recommendations?.map((recommendation: any, index: number) => (
            <div key={index} className="p-4">
              <div className="flex items-stretch justify-between gap-4 rounded-xl">
                <div className="flex flex-col gap-1 flex-[2_2_0px]">
                  <p className="text-white text-base font-bold leading-tight">
                    {recommendation.title}
                  </p>
                  <p className="text-[#b790cb] text-sm font-normal leading-normal">
                    {recommendation.description}
                  </p>
                  {recommendation.confidence && (
                    <div className="flex items-center gap-1 mt-1">
                      <div className="w-full bg-[#2b1834] rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-teal-400 to-purple-500 h-1.5 rounded-full transition-all duration-500" 
                          style={{ width: `${recommendation.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-[#b790cb] text-xs font-medium">
                        {Math.round(recommendation.confidence * 100)}% confidence
                      </span>
                    </div>
                  )}
                </div>
                <div
                  className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                  style={{ backgroundImage: `url("${recommendationImages[index % recommendationImages.length]}")` }}
                />
              </div>
            </div>
          )) ?? (
            // Fallback static recommendations if AI fails
            <>
              <div className="p-4">
                <div className="flex items-stretch justify-between gap-4 rounded-xl">
                  <div className="flex flex-col gap-1 flex-[2_2_0px]">
                    <p className="text-white text-base font-bold leading-tight">
                      Focus on consistency over perfection
                    </p>
                    <p className="text-[#b790cb] text-sm font-normal leading-normal">
                      Building daily habits is more about showing up consistently than achieving perfect results every time.
                    </p>
                  </div>
                  <div
                    className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl flex-1"
                    style={{ backgroundImage: `url("${recommendationImages[0]}")` }}
                  />
                </div>
              </div>
            </>
          )
        )}

        {/* Performance Analytics */}
        <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">
          Performance Analytics
        </h2>

        {/* Action Completion Rate Chart */}
        <div className="flex flex-wrap gap-4 px-4 py-6">
          <div className="flex min-w-72 flex-1 flex-col gap-2">
            <p className="text-white text-base font-medium leading-normal">Action Completion Rate</p>
            <p className="text-white tracking-tight text-[32px] font-bold leading-tight truncate">
              {completionRate}%
            </p>
            <div className="flex gap-1">
              <p className="text-[#b790cb] text-base font-normal leading-normal">Last 30 Days</p>
              <p className="text-[#0bda76] text-base font-medium leading-normal">+10%</p>
            </div>
            <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
              {/* Line Chart SVG */}
              <svg width="100%" height="148" viewBox="-3 0 478 150" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z"
                  fill="url(#paint0_linear_1131_5935)"
                />
                <path
                  d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25"
                  stroke="#b790cb"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="paint0_linear_1131_5935" x1="236" y1="1" x2="236" y2="149" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#3c2249" />
                    <stop offset="1" stopColor="#3c2249" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="flex justify-around">
                {weekLabels.map((week) => (
                  <p key={week} className="text-[#b790cb] text-[13px] font-bold leading-normal tracking-[0.015em]">
                    {week}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Average Run Duration Bar Chart */}
        <div className="flex flex-wrap gap-4 px-4 py-6">
          <div className="flex min-w-72 flex-1 flex-col gap-2">
            <p className="text-white text-base font-medium leading-normal">Average Action Duration</p>
            <p className="text-white tracking-tight text-[32px] font-bold leading-tight truncate">
              {avgCompletionTime} min
            </p>
            <div className="flex gap-1">
              <p className="text-[#b790cb] text-base font-normal leading-normal">Last 30 Days</p>
              <p className="text-[#0bda76] text-base font-medium leading-normal">+5%</p>
            </div>
            <div className="grid min-h-[180px] grid-flow-col gap-6 grid-rows-[1fr_auto] items-end justify-items-center px-3">
              {weeklyData.map((height, index) => (
                <React.Fragment key={index}>
                  <div 
                    className="border-[#b790cb] bg-[#3c2249] border-t-2 w-full transition-all duration-500 hover:bg-[#4a2d57]" 
                    style={{ height: `${height}%` }}
                  />
                  <p className="text-[#b790cb] text-[13px] font-bold leading-normal tracking-[0.015em]">
                    {weekLabels[index]}
                  </p>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade Section */}
      <div>
        <div className="p-4">
          <div
            className="bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl pt-[132px]"
            style={{
              backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 100%), url("${premiumBgImage}")`
            }}
          >
            <div className="flex w-full items-end justify-between gap-4 p-4">
              <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                <p className="text-white tracking-tight text-2xl font-bold leading-tight max-w-[440px]">
                  Unlock Advanced AI Insights
                </p>
                <p className="text-white text-base font-medium leading-normal">
                  Upgrade to premium for personalized recommendations, deeper analytics, and more.
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-[#a50cf2] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#9305d9] transition-colors duration-200 active:scale-95 transform"
              >
                <span className="truncate">Upgrade Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="flex gap-2 border-t border-[#3c2249] bg-[#2b1834] px-4 pb-3 pt-2">
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <House size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Dashboard</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/actions')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <List size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Actions</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/insights')}
            className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-white"
          >
            <div className="text-white flex h-8 items-center justify-center">
              <BarChart3 size={24} fill="currentColor" />
            </div>
            <p className="text-white text-xs font-medium leading-normal tracking-[0.015em]">Insights</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/community')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <Users size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Community</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/profile')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b790cb]"
          >
            <div className="text-[#b790cb] flex h-8 items-center justify-center">
              <User size={24} />
            </div>
            <p className="text-[#b790cb] text-xs font-medium leading-normal tracking-[0.015em]">Profile</p>
          </button>
        </div>
        <div className="h-5 bg-[#2b1834]" />
      </div>
    </div>
  )
}