"use client"

import * as React from "react"
import { AuthGuard } from "@/components/auth/AuthGuard"
import FigmaActionsPage from "@/components/daily-actions/FigmaActionsPage"

function ActionsPage() {
  return <FigmaActionsPage />
}

export default function ActionsPageWithAuth() {
  return (
    <AuthGuard>
      <ActionsPage />
    </AuthGuard>
  )
}