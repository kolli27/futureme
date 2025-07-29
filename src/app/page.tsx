"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { ArrowRight, CheckCircle, Star, Users, Brain, Target, Zap, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { DevBypass } from "@/components/auth/DevBypass"

export default function LandingPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  const handleGetStarted = () => {
    if (session) {
      router.push('/dashboard')
    } else {
      router.push('/auth/signup')
    }
  }

  const handleLogin = () => {
    router.push('/auth/signin')
  }

  const handleLogout = () => {
    signOut({ callbackUrl: '/' })
  }

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Personalized transformation plans based on your unique goals and lifestyle"
    },
    {
      icon: Target,
      title: "Vision-Driven Actions",
      description: "Daily habits that align with your 5-year vision across health, career, and relationships"
    },
    {
      icon: Zap,
      title: "Smart Time Allocation",
      description: "Optimize your daily schedule to maximize progress toward your future self"
    }
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Software Engineer",
      content: "FutureMe helped me transform my health and career simultaneously. The AI recommendations are spot-on!",
      rating: 5
    },
    {
      name: "Marcus Johnson",
      role: "Entrepreneur",
      content: "Finally, a system that connects my daily actions to my long-term vision. Game-changer.",
      rating: 5
    },
    {
      name: "Elena Rodriguez",
      role: "Marketing Director",
      content: "The time budgeting feature alone has revolutionized how I approach personal growth.",
      rating: 5
    }
  ]

  return (
    <div className="min-h-screen bg-[#1d1023] text-white">
      {/* Navigation */}
      <nav className="relative z-50 bg-[#1d1023]/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold bg-gradient-to-r from-[#a50cf2] to-purple-400 bg-clip-text text-transparent">
                FutureMe
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Features</a>
              <a href="#testimonials" className="text-white/80 hover:text-white transition-colors">Reviews</a>
              <a href="#pricing" className="text-white/80 hover:text-white transition-colors">Pricing</a>
              
              {!session ? (
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={handleLogin}
                    className="text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                  <GradientButton onClick={handleGetStarted}>
                    Get Started
                  </GradientButton>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/dashboard')}
                    className="text-white hover:bg-white/10"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#2b1834] border-t border-white/10">
            <div className="px-4 py-4 space-y-4">
              <a href="#features" className="block text-white/80 hover:text-white">Features</a>
              <a href="#testimonials" className="block text-white/80 hover:text-white">Reviews</a>
              <a href="#pricing" className="block text-white/80 hover:text-white">Pricing</a>
              
              {!session ? (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <Button 
                    variant="ghost" 
                    onClick={handleLogin}
                    className="w-full justify-start text-white hover:bg-white/10"
                  >
                    Sign In
                  </Button>
                  <GradientButton onClick={handleGetStarted} className="w-full">
                    Get Started
                  </GradientButton>
                </div>
              ) : (
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => router.push('/dashboard')}
                    className="w-full justify-start text-white hover:bg-white/10"
                  >
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="w-full border-white/20 text-white hover:bg-white/10"
                  >
                    Sign Out
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#a50cf2]/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
                Become Your
                <span className="block bg-gradient-to-r from-[#a50cf2] to-purple-400 bg-clip-text text-transparent">
                  Future Self
                </span>
              </h1>
              <p className="text-xl sm:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                AI-powered daily habits that align with your future identity. Transform your health, career, and relationships with personalized action plans.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <GradientButton 
                onClick={handleGetStarted}
                className="text-lg px-8 py-4"
              >
                Start Your Transformation
                <ArrowRight className="ml-2 h-5 w-5" />
              </GradientButton>
              <Button 
                variant="outline" 
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4"
              >
                Watch Demo
              </Button>
            </div>

            <div className="flex items-center justify-center gap-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>10,000+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span>4.9/5 rating</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Free to start</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Transform Your Life with AI
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Our intelligent system creates personalized transformation plans that adapt to your lifestyle and goals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-[#a50cf2]/50 transition-all duration-300 hover:shadow-lg hover:shadow-[#a50cf2]/10"
                >
                  <div className="w-14 h-14 bg-gradient-to-br from-[#a50cf2] to-purple-600 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 bg-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Loved by Thousands
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              See how FutureMe is helping people transform their lives every day.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/10"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-white/60">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-8">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
              Ready to Transform Your Life?
            </h2>
            <p className="text-xl text-white/80">
              Join thousands of people who are already becoming their future selves.
            </p>
            <GradientButton 
              onClick={handleGetStarted}
              className="text-lg px-8 py-4"
            >
              Start Your Transformation Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </GradientButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-2xl font-bold bg-gradient-to-r from-[#a50cf2] to-purple-400 bg-clip-text text-transparent">
              FutureMe
            </div>
            <div className="flex gap-6 text-white/60">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/60">
            <p>&copy; 2024 FutureMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
      
      {/* Development bypass for testing */}
      <DevBypass />
    </div>
  )
}