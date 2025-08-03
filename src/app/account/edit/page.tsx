"use client"

import * as React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  User, 
  Camera, 
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { AuthGuard } from "@/components/auth/AuthGuard"

interface ProfileFormData {
  name: string
  email: string
  bio: string
}

function EditProfilePage() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [formData, setFormData] = useState<ProfileFormData>({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    bio: ''
  })

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // In a real app, this would call the API to update the profile
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update the session data
      await update({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          email: formData.email
        }
      })
      
      setMessage({
        type: 'success',
        text: 'Profile updated successfully!'
      })
      
      // Redirect back to account page after a delay
      setTimeout(() => {
        router.push('/account')
      }, 1500)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update profile. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#1d1023] text-white">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/account")}
              className="text-white flex size-10 shrink-0 items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Edit Profile</h1>
              <p className="text-white/70 text-sm">Update your profile information</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {message && (
          <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/30 text-green-400' 
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="bg-[#2b1834] border border-[#563168] rounded-lg p-6">
          {/* Profile Picture Section */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-br from-[#a50cf2] to-[#563168] rounded-full flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#a50cf2] rounded-full flex items-center justify-center hover:bg-[#9305d9] transition-colors">
                <Camera size={16} className="text-white" />
              </button>
            </div>
            <p className="text-white/70 text-sm mt-2">Click to update profile picture</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 bg-[#1d1023] border border-[#563168] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent"
                placeholder="Enter your full name"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 bg-[#1d1023] border border-[#563168] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent"
                placeholder="Enter your email address"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Bio (Optional)
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-[#1d1023] border border-[#563168] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent resize-none"
                placeholder="Tell us a bit about yourself..."
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => router.push('/account')}
              disabled={isLoading}
              className="flex-1 bg-transparent border border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <GradientButton
              onClick={handleSave}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EditProfilePageWithAuth() {
  return (
    <AuthGuard>
      <EditProfilePage />
    </AuthGuard>
  )
}