"use client"

import * as React from "react"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Lock,
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { AuthGuard } from "@/components/auth/AuthGuard"

interface PasswordFormData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

function ChangePasswordPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleInputChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error message when user starts typing
    if (message?.type === 'error') {
      setMessage(null)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const validateForm = (): string | null => {
    if (!formData.currentPassword) {
      return 'Current password is required'
    }
    if (!formData.newPassword) {
      return 'New password is required'
    }
    if (formData.newPassword.length < 8) {
      return 'New password must be at least 8 characters long'
    }
    if (formData.newPassword === formData.currentPassword) {
      return 'New password must be different from current password'
    }
    if (formData.newPassword !== formData.confirmPassword) {
      return 'Password confirmation does not match'
    }
    return null
  }

  const handleSave = async () => {
    const error = validateForm()
    if (error) {
      setMessage({ type: 'error', text: error })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // In a real app, this would call the API to change the password
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate API response
      const success = Math.random() > 0.2 // 80% success rate for demo
      
      if (success) {
        setMessage({
          type: 'success',
          text: 'Password changed successfully!'
        })
        
        // Clear form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        
        // Redirect after a delay
        setTimeout(() => {
          router.push('/account')
        }, 2000)
      } else {
        setMessage({
          type: 'error',
          text: 'Current password is incorrect. Please try again.'
        })
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to change password. Please try again.'
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
              <h1 className="text-2xl font-bold">Change Password</h1>
              <p className="text-white/70 text-sm">Update your account password</p>
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
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-[#a50cf2]" />
            <h2 className="text-xl font-semibold">Password Security</h2>
          </div>

          {/* Form Fields */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-[#1d1023] border border-[#563168] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent"
                  placeholder="Enter your current password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-[#1d1023] border border-[#563168] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent"
                  placeholder="Enter your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-white/60 text-xs mt-1">
                Password must be at least 8 characters long
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full px-4 py-3 pr-12 bg-[#1d1023] border border-[#563168] rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#a50cf2] focus:border-transparent"
                  placeholder="Confirm your new password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {/* Security Tips */}
          <div className="mt-6 p-4 bg-[#1d1023] border border-[#563168] rounded-lg">
            <h3 className="text-sm font-medium text-white mb-2">Password Security Tips:</h3>
            <ul className="text-xs text-white/70 space-y-1">
              <li>• Use at least 8 characters with a mix of letters, numbers, and symbols</li>
              <li>• Avoid using personal information like names or birthdays</li>
              <li>• Don't reuse passwords from other accounts</li>
              <li>• Consider using a password manager for stronger security</li>
            </ul>
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
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Change Password
                </>
              )}
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ChangePasswordPageWithAuth() {
  return (
    <AuthGuard>
      <ChangePasswordPage />
    </AuthGuard>
  )
}