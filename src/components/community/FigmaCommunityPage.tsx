"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Heart, MessageCircle, House, List, BarChart3, Users, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface FigmaCommunityPageProps {
  onCreatePost?: () => void
}

interface CommunityPost {
  id: string
  userName: string
  userAvatar: string
  victoryTitle: string
  victoryDescription: string
  likes: number
  comments: number
  isLiked?: boolean
}

const mockCommunityPosts: CommunityPost[] = [
  {
    id: "1",
    userName: "Ethan",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF1vRPXiVWcCOIG0jcksq32uMDqVXjfUSQII62lm-E5r9hGD5CCj8TzN6YsSmliKsmWlsPCU_loNF1vIaSZW9Jx4N3NyokEN8RBoHidAcjtQdFVgJByrMjhLtBvZbTFvb3rFpDeGEUs29yjBYozxi3nXiCTGraNwwZKiuHO2zRhpFX4IBk_ANlzneQlFVrSEpTd05N3tg-p6RRZFe8oNLWFkcyUI3K-kdv1nDLjdEzTFFhJYheAMx1oqu-C3Itc6hXUF_fwURwlw5T",
    victoryTitle: "Ethan's Victory",
    victoryDescription: "Day 45 toward marathon runner, completed!",
    likes: 23,
    comments: 5,
    isLiked: false
  },
  {
    id: "2",
    userName: "Sophia",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBsFVByuynazN5XXjj_9kzSHO2z6dslqkRxloFDlWx5Q63BunBnA6-B7CcMbKsZzx2AZgNHb8fwl3tKqepqI6HpvliXkHOhccJadu4nNOC4rXv6PAJ1RuuI8H-7YW18lOSIqM6bbTCq3OFpotY-YkJjpmySiUxcDSZM54Un6ZEQd3FEHPCL2ydkK-w3KCbopH5riGSeRN_BQYPTgZFHGSLYtGH4XSyKWRszsvtw8YXZgkdTYTOG0DLON0XAT_whb91_LjzN_tSflcUr",
    victoryTitle: "Sophia's Victory",
    victoryDescription: "Day 10 of meditation streak!",
    likes: 18,
    comments: 3,
    isLiked: false
  },
  {
    id: "3",
    userName: "Liam",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDKXMy4k0RvP8WNnBSQdGEuVJqOieGnI2QdFo1L4-W8Re760VKTAFQDewy6lydXGTWVDZXbNKsGbQAt_OWG1HGTANyJat1V8AgPVrgJb10B4QUn_ph9gJXnzfmYUZqK86NLo4pL8gMdiPjzP5JAar3TdoK7MCtZAS1-kzQ5h4JQ_oyX0dFegXFTsZlJc-f8rvelUtXltzWv84xS971XRCyEwxuR9RuqxfAFzGsSIH5qoWWVdzaTGOXKY_9Nh3blaCSYcHqAlj3GL0nf",
    victoryTitle: "Liam's Victory",
    victoryDescription: "Reached 1000 steps today!",
    likes: 35,
    comments: 8,
    isLiked: false
  },
  {
    id: "4",
    userName: "Olivia",
    userAvatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAu9DL3trznecMifcQFglXqKW6I6EWc5Ydo7iVG1zvjmHkcllDft6C-qkYYTqVl4wYQZyuyCHzc5dmtn16pZnlgIwISxVs3RdJ9gdNqua33MvVmGjG92ACkH0MObaieJYw4yNKawjkq8PZsmq7VCvBP1lIkHFnYLyi-NHeCmjmpRkGqP8Qegd6eXyNHrPcm57pzR9h9RwIYIKZ6OUxOa-sAugjFJt6BJncyaLvbhSKU3HntM8J_NLLbrvL98UuoGbRViIVeswKzHiMf",
    victoryTitle: "Olivia's Victory",
    victoryDescription: "Completed my first yoga session!",
    likes: 28,
    comments: 6,
    isLiked: false
  }
]

export default function FigmaCommunityPage({ onCreatePost }: FigmaCommunityPageProps) {
  const router = useRouter()
  const [posts, setPosts] = useState<CommunityPost[]>(mockCommunityPosts)

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleCreatePost = () => {
    if (onCreatePost) {
      onCreatePost()
    } else {
      console.log('Create new post')
    }
  }

  const handleLike = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1
            }
          : post
      )
    )
  }

  const handleComment = (postId: string) => {
    console.log('Open comments for post:', postId)
  }

  return (
    <div 
      className="relative flex size-full min-h-screen flex-col bg-[#1b141f] justify-between overflow-x-hidden"
      style={{ fontFamily: 'Manrope, "Noto Sans", sans-serif' }}
    >
      <div>
        {/* Header */}
        <div className="flex items-center bg-[#1b141f] p-4 pb-2 justify-between">
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pl-12">
            Community
          </h2>
          <div className="flex w-12 items-center justify-end">
            <button
              onClick={handleCreatePost}
              className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-12 bg-transparent text-white gap-2 text-base font-bold leading-normal tracking-[0.015em] min-w-0 p-0 hover:bg-white/5 transition-colors duration-200"
            >
              <div className="text-white">
                <Plus size={24} />
              </div>
            </button>
          </div>
        </div>

        {/* Community Posts Feed */}
        <div className="space-y-0">
          {posts.map((post) => (
            <div key={post.id}>
              {/* Post Header */}
              <div className="flex items-center gap-4 bg-[#1b141f] px-4 min-h-[72px] py-2">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-14 w-fit"
                  style={{ backgroundImage: `url("${post.userAvatar}")` }}
                />
                <div className="flex flex-col justify-center">
                  <p className="text-white text-base font-medium leading-normal line-clamp-1">
                    {post.victoryTitle}
                  </p>
                  <p className="text-[#b29dbe] text-sm font-normal leading-normal line-clamp-2">
                    {post.victoryDescription}
                  </p>
                </div>
              </div>

              {/* Post Actions */}
              <div className="flex flex-wrap gap-4 px-4 py-2 justify-between">
                <button
                  onClick={() => handleLike(post.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors duration-200"
                >
                  <div className={cn(
                    "transition-colors duration-200",
                    post.isLiked ? "text-red-500" : "text-[#b29dbe]"
                  )}>
                    <Heart 
                      size={24} 
                      fill={post.isLiked ? "currentColor" : "none"}
                    />
                  </div>
                  <p className={cn(
                    "text-[13px] font-bold leading-normal tracking-[0.015em]",
                    post.isLiked ? "text-red-500" : "text-[#b29dbe]"
                  )}>
                    {post.likes}
                  </p>
                </button>
                
                <button
                  onClick={() => handleComment(post.id)}
                  className="flex items-center justify-center gap-2 px-3 py-2 hover:bg-white/5 rounded-lg transition-colors duration-200"
                >
                  <div className="text-[#b29dbe]">
                    <MessageCircle size={24} />
                  </div>
                  <p className="text-[#b29dbe] text-[13px] font-bold leading-normal tracking-[0.015em]">
                    {post.comments}
                  </p>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {posts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-[#b29dbe] text-center">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No community posts yet</p>
              <p className="text-sm opacity-75">Be the first to share your victory!</p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div>
        <div className="flex gap-2 border-t border-[#392b40] bg-[#291f2e] px-4 pb-3 pt-2">
          <button 
            onClick={() => handleNavigation('/dashboard')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b29dbe]"
          >
            <div className="text-[#b29dbe] flex h-8 items-center justify-center">
              <House size={24} />
            </div>
            <p className="text-[#b29dbe] text-xs font-medium leading-normal tracking-[0.015em]">Dashboard</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/actions')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b29dbe]"
          >
            <div className="text-[#b29dbe] flex h-8 items-center justify-center">
              <List size={24} />
            </div>
            <p className="text-[#b29dbe] text-xs font-medium leading-normal tracking-[0.015em]">Actions</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/insights')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b29dbe]"
          >
            <div className="text-[#b29dbe] flex h-8 items-center justify-center">
              <BarChart3 size={24} />
            </div>
            <p className="text-[#b29dbe] text-xs font-medium leading-normal tracking-[0.015em]">Insights</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/community')}
            className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-white"
          >
            <div className="text-white flex h-8 items-center justify-center">
              <Users size={24} fill="currentColor" />
            </div>
            <p className="text-white text-xs font-medium leading-normal tracking-[0.015em]">Community</p>
          </button>
          
          <button 
            onClick={() => handleNavigation('/profile')}
            className="flex flex-1 flex-col items-center justify-end gap-1 text-[#b29dbe]"
          >
            <div className="text-[#b29dbe] flex h-8 items-center justify-center">
              <User size={24} />
            </div>
            <p className="text-[#b29dbe] text-xs font-medium leading-normal tracking-[0.015em]">Profile</p>
          </button>
        </div>
        <div className="h-5 bg-[#291f2e]" />
      </div>
    </div>
  )
}