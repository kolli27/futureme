"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Users, MessageCircle, Heart, Star, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import AccessibleBottomNavigation from "@/components/navigation/AccessibleBottomNavigation"

// Mock community data
const communityPosts = [
  {
    id: 1,
    author: "Sarah M.",
    avatar: "SM",
    content: "Just completed my 30th day! The daily running habit has completely transformed my energy levels. Who else is working on fitness goals?",
    likes: 24,
    comments: 8,
    timeAgo: "2h ago",
    category: "health"
  },
  {
    id: 2,
    author: "Mike R.",
    avatar: "MR",
    content: "Finally launched my side project after 90 days of consistent daily work! The key was breaking it down into 45-minute focused sessions.",
    likes: 47,
    comments: 15,
    timeAgo: "4h ago",
    category: "career"
  },
  {
    id: 3,
    author: "Emma L.",
    avatar: "EL",
    content: "Reading for 30 minutes every morning before work has been a game-changer. Already finished 8 books this quarter! 📚",
    likes: 19,
    comments: 6,
    timeAgo: "1d ago",
    category: "personal-growth"
  },
  {
    id: 4,
    author: "Alex K.",
    avatar: "AK",
    content: "Weekly family game night is now a cherished tradition. Sometimes the smallest consistent actions create the biggest impact on relationships. ❤️",
    likes: 32,
    comments: 12,
    timeAgo: "2d ago",
    category: "relationships"
  }
]

const categoryColors = {
  health: "bg-green-500/20 text-green-400",
  career: "bg-blue-500/20 text-blue-400",
  "personal-growth": "bg-purple-500/20 text-purple-400",
  relationships: "bg-pink-500/20 text-pink-400"
}

export default function CommunityPage() {
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
        <div className="flex items-center bg-[#1d1023] p-4 pb-2 justify-center">
          <h1 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            Community
          </h1>
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

          {/* Community Feed */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-bold mb-4">Recent Updates</h3>
            <div className="space-y-4">
              {communityPosts.map((post) => (
                <div key={post.id} className="p-4 bg-[#2b1834] border border-[#3c2249] rounded-lg">
                  {/* Post Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-[#a50cf2] to-[#563168] rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{post.avatar}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-medium">{post.author}</h4>
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium",
                          categoryColors[post.category as keyof typeof categoryColors]
                        )}>
                          {post.category.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-[#b790cb] text-xs">{post.timeAgo}</p>
                    </div>
                  </div>

                  {/* Post Content */}
                  <p className="text-white text-sm mb-4 leading-relaxed">
                    {post.content}
                  </p>

                  {/* Post Actions */}
                  <div className="flex items-center justify-between">
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