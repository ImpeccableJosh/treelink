'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { createClient } from '@/lib/supabase/client'

interface ApplicationFormProps {
  application: any
  isAuthenticated: boolean
  isOwner: boolean
}

export function ApplicationForm({ application, isAuthenticated, isOwner }: ApplicationFormProps) {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  
  const applicationType = application.application_types
  const questions = applicationType?.questions || []
  
  useEffect(() => {
    if (application.payload && typeof application.payload === 'object') {
      setAnswers(application.payload.answers || {})
    }
  }, [application])
  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      const supabase = createClient()
      const callbackUrl = `${window.location.origin}/apply/complete?token=${application.public_token}`
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: callbackUrl,
        },
      })
      
      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        setEmailSent(true)
        setMessage({
          type: 'success',
          text: 'Check your email for a magic link to continue!',
        })
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setLoading(false)
    }
  }
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch(`/api/applications/${application.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payload: { answers },
          token: application.public_token,
        }),
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to submit application')
      }
      
      setMessage({
        type: 'success',
        text: 'Application submitted successfully! Thank you.',
      })
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message })
    } finally {
      setLoading(false)
    }
  }
  
  // If not authenticated and email not sent, show email form
  if (!isAuthenticated && !emailSent) {
    return (
      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <Input
          type="email"
          label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="your@email.com"
        />
        
        {message && (
          <div
            className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
          >
            {message.text}
          </div>
        )}
        
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending...' : 'Continue with Email'}
        </Button>
      </form>
    )
  }
  
  // Show application form
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      {questions.length > 0 ? (
        questions.map((question: any, index: number) => (
          <div key={question.id || index}>
            {question.type === 'textarea' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {question.label} {question.required && <span className="text-red-500">*</span>}
                </label>
                <textarea
                  value={answers[question.id] || ''}
                  onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                  required={question.required}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-[#4ECDC4] focus:ring-2 focus:ring-[#4ECDC4]/20"
                />
              </div>
            ) : (
              <Input
                label={question.label}
                type={question.type || 'text'}
                value={answers[question.id] || ''}
                onChange={(e) => setAnswers({ ...answers, [question.id]: e.target.value })}
                required={question.required}
              />
            )}
          </div>
        ))
      ) : (
        <div className="text-center py-8 text-gray-600">
          <p>No additional questions. Click submit to complete your application.</p>
        </div>
      )}
      
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-700'
              : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  )
}

