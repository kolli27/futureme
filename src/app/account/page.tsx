"use client"

import * as React from "react"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { 
  User, 
  Mail, 
  Shield, 
  Trash2, 
  Download, 
  Settings,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { AuthGuard } from "@/components/auth/AuthGuard"

interface DeleteAccountModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading: boolean
}

function DeleteAccountModal({ isOpen, onClose, onConfirm, isLoading }: DeleteAccountModalProps) {
  const [confirmText, setConfirmText] = useState("")
  const requiredText = "DELETE MY ACCOUNT"

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1d1023] border border-red-500/30 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Delete Account</h2>
            <p className="text-red-400 text-sm">This action cannot be undone</p>
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-white/80 text-sm">
            Deleting your account will permanently remove:
          </p>
          <ul className="text-white/70 text-sm space-y-1 ml-4">
            <li>• All your personal data and preferences</li>
            <li>• Your visions and daily actions</li>
            <li>• Progress tracking and achievements</li>
            <li>• Account history and settings</li>
          </ul>
          <p className="text-white/80 text-sm">
            Type <strong className="text-red-400">{requiredText}</strong> to confirm:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full px-3 py-2 bg-[#2b1834] border border-red-500/30 rounded text-white placeholder:text-red-300/50 focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder={requiredText}
            disabled={isLoading}
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading || confirmText !== requiredText}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Account"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

function AccountPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleExportData = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      // In a real app, this would trigger a data export
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setMessage({
        type: 'success',
        text: 'Data export request submitted. You\'ll receive an email when it\'s ready.'
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to export data. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsLoading(true)

    try {
      // In a real app, this would call the delete account API
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Sign out and redirect
      await signOut({ callbackUrl: '/?message=Account deleted successfully' })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to delete account. Please try again.'
      })
      setIsLoading(false)
      setShowDeleteModal(false)
    }
  }

  const formatDate = (date: string | Date) => {
    if (!date) return 'Not available'
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#1d1023] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#a50cf2]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#1d1023] text-white">
      {/* Header */}
      <div className="border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard")}
              className="text-white flex size-10 shrink-0 items-center justify-center hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Account Settings</h1>
              <p className="text-white/70 text-sm">Manage your account and privacy settings</p>
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

        <div className="grid gap-6">
          {/* Profile Information */}
          <div className="bg-[#2b1834] border border-[#563168] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-6 h-6 text-[#a50cf2]" />
              <h2 className="text-xl font-semibold">Profile Information</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70">Full Name</label>
                <div className="mt-1 px-4 py-3 bg-[#1d1023] border border-[#563168] rounded-lg text-white">
                  {session?.user?.name || 'Not provided'}
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70">Email Address</label>
                <div className="mt-1 px-4 py-3 bg-[#1d1023] border border-[#563168] rounded-lg text-white flex items-center justify-between">
                  <span>{session?.user?.email}</span>
                  {session?.user?.emailVerified ? (
                    <span className="flex items-center gap-1 text-green-400 text-sm">
                      <CheckCircle className="w-4 h-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="text-yellow-400 text-sm">Unverified</span>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm text-white/70">Member Since</label>
                <div className="mt-1 px-4 py-3 bg-[#1d1023] border border-[#563168] rounded-lg text-white">
                  {formatDate((session as any)?.user?.createdAt || new Date())}
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => router.push('/account/edit')}
                className="bg-[#a50cf2] hover:bg-[#9305d9] text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-[#2b1834] border border-[#563168] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-[#a50cf2]" />
              <h2 className="text-xl font-semibold">Security & Privacy</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-white/70">Change your account password</p>
                </div>
                <Button
                  onClick={() => router.push('/account/change-password')}
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Change Password
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                  <p className="text-sm text-white/70">Add an extra layer of security</p>
                </div>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  disabled
                >
                  Coming Soon
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Login Sessions</h3>
                  <p className="text-sm text-white/70">Manage your active sessions</p>
                </div>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                  disabled
                >
                  View Sessions
                </Button>
              </div>
            </div>
          </div>

          {/* Data & Privacy */}
          <div className="bg-[#2b1834] border border-[#563168] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Download className="w-6 h-6 text-[#a50cf2]" />
              <h2 className="text-xl font-semibold">Data & Privacy</h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Export Your Data</h3>
                  <p className="text-sm text-white/70">Download a copy of your personal data</p>
                </div>
                <GradientButton
                  onClick={handleExportData}
                  disabled={isLoading}
                  className="bg-[#a50cf2] hover:bg-[#9305d9]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </>
                  )}
                </GradientButton>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-red-400">Delete Account</h3>
                    <p className="text-sm text-white/70">Permanently delete your account and all data</p>
                  </div>
                  <Button
                    onClick={() => setShowDeleteModal(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isLoading={isLoading}
      />
    </div>
  )
}

export default function AccountPageWithAuth() {
  return (
    <AuthGuard>
      <AccountPage />
    </AuthGuard>
  )
}