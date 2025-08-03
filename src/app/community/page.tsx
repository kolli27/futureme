"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, MessageCircle, Heart, Star, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { AuthGuard } from "@/components/auth/AuthGuard"
import AccessibleBottomNavigation from "@/components/navigation/AccessibleBottomNavigation"

// Mock community data - Victory posts as specified in PRD
const victoryPosts = [
  {
    id: 1,
    author: "Ethan",
    avatar: "/api/placeholder/user-ethan.jpg",
    victoryType: "Day 45 toward marathon runner, completed!",
    likes: 23,
    comments: 5,
    timeAgo: "2h ago"
  },
  {
    id: 2,
    author: "Sophia", 
    avatar: "/api/placeholder/user-sophia.jpg",
    victoryType: "Day 10 of meditation streak!",
    likes: 18,
    comments: 3,
    timeAgo: "4h ago"
  },
  {
    id: 3,
    author: "Liam",
    avatar: "/api/placeholder/user-liam.jpg", 
    victoryType: "Reached 1000 steps today!",
    likes: 35,
    comments: 8,
    timeAgo: "6h ago"
  },
  {
    id: 4,
    author: "Olivia",
    avatar: "/api/placeholder/user-olivia.jpg",
    victoryType: "Completed my first yoga session!",
    likes: 28,
    comments: 6,
    timeAgo: "1d ago"
  }
]

const categoryColors = {
  health: "bg-green-500/20 text-green-400",
  career: "bg-blue-500/20 text-blue-400",
  "personal-growth": "bg-purple-500/20 text-purple-400",
  relationships: "bg-pink-500/20 text-pink-400"
}

function CommunityPage() {
  const router = useRouter()
  const [likedPosts, setLikedPosts] = React.useState<Set<number>>(new Set())

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1d1023] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1d1023] p-4 pb-2 justify-between">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Community
          </h1>
          <button 
            onClick={() => alert('Share your victory feature coming soon!')}
            className="text-white flex size-10 shrink-0 items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Add victory post"
          >
            <span className="text-xl font-bold">+</span>
          </button>
        </div>

        {/* Community Stats */}
        <div className="px-4 py-6">
          <div className="bg-gradient-to-r from-[#a50cf2]/20 to-[#563168]/20 rounded-xl p-6 mb-6 border border-[#a50cf2]/30">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-lg font-bold">Community Impact</h2>
              <Users size={24} className="text-[#a50cf2]" />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-[#a50cf2] text-2xl font-bold">12.4K</p>
                <p className="text-[#b790cb] text-xs">Active Members</p>
              </div>
              <div className="text-center">
                <p className="text-[#a50cf2] text-2xl font-bold">847</p>
                <p className="text-[#b790cb] text-xs">Goals Achieved Today</p>
              </div>
              <div className="text-center">
                <p className="text-[#a50cf2] text-2xl font-bold">2.1M</p>
                <p className="text-[#b790cb] text-xs">Total Actions Completed</p>
              </div>
            </div>
          </div>

          {/* Trending Topics */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-[#a50cf2]" />
              Trending This Week
            </h3>
            <div className="flex gap-2 flex-wrap">
              {["Morning Routines", "Productivity Tips", "Fitness Journey", "Reading Challenge", "Side Projects"].map((topic) => (
                <span key={topic} className="px-3 py-1 bg-[#2b1834] border border-[#3c2249] rounded-full text-[#b790cb] text-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Victory Feed */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-bold mb-4">Victory Feed</h3>
            <div className="space-y-4">
              {victoryPosts.map((post) => (
                <div key={post.id} className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
                  {/* Victory Post Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#a50cf2]/30">
                      <div className="w-full h-full bg-gradient-to-br from-[#a50cf2] to-[#563168] flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {post.author.slice(0, 2).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{post.author}'s Victory</h4>
                        <div className="px-2 py-1 bg-[#a50cf2]/20 rounded-full">
                          <span className="text-[#a50cf2] text-xs font-medium">🎉</span>
                        </div>
                      </div>
                      <p className="text-[#b790cb] text-xs">{post.timeAgo}</p>
                    </div>
                  </div>

                  {/* Victory Content */}
                  <div className="ml-15 mb-4">
                    <p className="text-white text-sm font-medium leading-relaxed">
                      {post.victoryType}
                    </p>
                  </div>

                  {/* Victory Actions */}
                  <div className="flex items-center justify-between ml-15">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={cn(
                          "flex items-center gap-2 text-sm transition-colors",
                          likedPosts.has(post.id) ? "text-red-400" : "text-[#b790cb] hover:text-red-400"
                        )}
                      >
                        <Heart size={16} className={likedPosts.has(post.id) ? "fill-current" : ""} />
                        {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                      </button>
                      <button className="flex items-center gap-2 text-[#b790cb] text-sm hover:text-white transition-colors">
                        <MessageCircle size={16} />
                        {post.comments}
                      </button>
                    </div>
                    <button className="text-[#b790cb] hover:text-[#a50cf2] transition-colors">
                      <Star size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Your Success */}
          <div className="bg-[#2b1834] border border-[#3c2249] rounded-lg p-6 text-center">
            <h3 className="text-white text-lg font-bold mb-2">Share Your Success</h3>
            <p className="text-[#b790cb] text-sm mb-4">
              Inspire others by sharing your daily wins and breakthrough moments!
            </p>
            <button 
              onClick={() => alert('Sharing feature coming soon! Keep making progress and we\'ll notify you when it\'s ready.')}
              className="px-6 py-2 bg-[#a50cf2] text-white rounded-lg hover:bg-[#9305d9] transition-colors"
            >
              Share Your Story
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <AccessibleBottomNavigation />
    </div>
  )
}

export default function CommunityPageWithAuth() {
  return (
    <AuthGuard>
      <CommunityPage />
    </AuthGuard>
  )
}