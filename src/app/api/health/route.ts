import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      services: {
        database: 'localStorage', // We use client-side localStorage
        ai: !!process.env.OPENAI_API_KEY ? 'connected' : 'not_configured'
      }
    }

    return NextResponse.json(healthCheck, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'ERROR', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed' 
      }, 
      { status: 503 }
    )
  }
}