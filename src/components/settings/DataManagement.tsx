"use client"

import * as React from "react"
import { Download, Upload, RefreshCw, Trash2, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { exportUserData, importUserData, getDataSummary } from "@/utils/dataExport"
import { resetAllUserData } from "@/utils/dataMigration"
import { useRouter } from "next/navigation"

interface DataManagementProps {
  className?: string
}

export default function DataManagement({ className }: DataManagementProps) {
  const router = useRouter()
  const [isExporting, setIsExporting] = React.useState(false)
  const [isImporting, setIsImporting] = React.useState(false)
  const [showResetConfirm, setShowResetConfirm] = React.useState(false)
  const [notification, setNotification] = React.useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  const dataSummary = React.useMemo(() => getDataSummary(), [])

  const handleExport = async () => {
    try {
      setIsExporting(true)
      exportUserData()
      showNotification('success', 'Data exported successfully!')
    } catch (error) {
      showNotification('error', 'Export failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsExporting(false)
    }
  }

  const handleImport = async () => {
    try {
      setIsImporting(true)
      const result = await importUserData()
      
      if (result.success) {
        showNotification('success', 'Data imported successfully! Refreshing app...')
        // Refresh the page to apply imported data
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        showNotification('error', result.error || 'Import failed')
      }
    } catch (error) {
      showNotification('error', 'Import failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsImporting(false)
    }
  }

  const handleReset = () => {
    try {
      resetAllUserData()
      showNotification('success', 'All data reset! Redirecting to welcome...')
      
      // Redirect to welcome page after reset
      setTimeout(() => {
        router.push('/welcome')
      }, 1500)
    } catch (error) {
      showNotification('error', 'Reset failed: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
    setShowResetConfirm(false)
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className={className}>
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Data Summary */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Data Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{dataSummary.visions}</div>
              <div className="text-sm text-muted-foreground">Visions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{dataSummary.completedDays}</div>
              <div className="text-sm text-muted-foreground">Days Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{dataSummary.currentStreak}</div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatTime(dataSummary.totalTimeSpent)}
              </div>
              <div className="text-sm text-muted-foreground">Time Invested</div>
            </div>
          </div>
        </Card>

        {/* Export/Import */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Backup & Restore</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex-1"
                variant="outline"
              >
                {isExporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
              
              <Button 
                onClick={handleImport}
                disabled={isImporting}
                className="flex-1"
                variant="outline"
              >
                {isImporting ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {isImporting ? 'Importing...' : 'Import Data'}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Export your data as a JSON file for backup or transfer to another device. 
              Import will restore all your visions, progress, and settings.
            </p>
          </div>
        </Card>

        {/* Reset Data */}
        <Card className="p-6 border-destructive/20">
          <h3 className="text-lg font-semibold mb-4 text-destructive">Danger Zone</h3>
          
          {!showResetConfirm ? (
            <div className="space-y-4">
              <Button 
                onClick={() => setShowResetConfirm(true)}
                variant="destructive"
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Reset All Data
              </Button>
              <p className="text-sm text-muted-foreground">
                This will permanently delete all your visions, progress, and settings. 
                Make sure to export your data first if you want to keep it.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  <span className="font-medium text-destructive">Are you absolutely sure?</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  This action cannot be undone. All your data will be permanently deleted:
                </p>
                <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                  <li>• {dataSummary.visions} visions and their AI analysis</li>
                  <li>• {dataSummary.completedDays} days of progress history</li>
                  <li>• Your {dataSummary.currentStreak}-day streak</li>
                  <li>• All time budget and action data</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleReset}
                  variant="destructive"
                  className="flex-1"
                >
                  Yes, Delete Everything
                </Button>
                <Button 
                  onClick={() => setShowResetConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}