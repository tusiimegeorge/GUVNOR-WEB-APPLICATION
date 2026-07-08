"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"

interface Comment {
  id: string
  user_id: string
  user_name: string
  comment: string
  is_approved: boolean
  admin_reply: string | null
  created_at: string
}

export function PerformanceMetrics() {
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [userLoading, setUserLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user || null)
        await loadComments(user?.id)
      } catch (error) {
        console.error("[v0] Error initializing:", error)
        setUser(null)
        setComments([])
      } finally {
        setUserLoading(false)
      }
    }
    
    initializeComponent()
  }, [])

  const loadComments = async (userId?: string) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/public/comments?userId=${userId || ''}`)
      if (!response.ok) {
        console.error("[v0] Failed to load comments:", response.status)
        setComments([])
        return
      }
      const data = await response.json()
      if (data.comments && Array.isArray(data.comments)) {
        setComments(data.comments)
      } else {
        setComments([])
      }
    } catch (err) {
      console.error("[v0] Exception loading comments:", err)
      setComments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setErrorMessage("You must be logged in to submit feedback")
      return
    }

    if (!newComment.trim()) {
      setErrorMessage("Please enter a comment")
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const supabase = await createClient()
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single()

      const { error } = await supabase
        .from("comments")
        .insert([
          {
            user_id: user.id,
            user_name: profile?.full_name || user.email || "Guest",
            comment: newComment,
          },
        ])

      if (error) {
        setErrorMessage("Failed to submit feedback")
      } else {
        setSubmitted(true)
        setNewComment("")
        setTimeout(() => setSubmitted(false), 3000)
        await loadComments(user.id)
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit feedback")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Submit Form */}
      {userLoading ? (
        <Card className="border-2">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : user ? (
        <Card className="border-2">
          <CardContent className="p-6">
            {submitted && (
              <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm">
                Thank you! Your feedback has been submitted and is awaiting approval!
              </div>
            )}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                {errorMessage}
              </div>
            )}
            <Textarea
              placeholder="Share your experience at Club Guvnor..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={4}
              className="mb-4"
            />
            <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2">
          <CardContent className="p-8">
            <div className="text-center">
              <p className="text-muted-foreground mb-6">
                Have something to share? Your feedback helps us create better experiences for everyone.
              </p>
              <Link href="/auth/login">
                <Button size="lg" className="w-full">
                  Login to Leave a Comment
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Feedback */}
      <div>
        <h3 className="text-2xl font-bold mb-6">Recent Feedback</h3>
        {isLoading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">Loading feedback...</p>
            </CardContent>
          </Card>
        ) : comments.length > 0 ? (
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-4 min-w-min">
              {comments.map((comment) => (
                <Card key={comment.id} className="flex-shrink-0 w-[clamp(300px,30vw,500px)]">
                  <CardContent className="p-6 h-full flex flex-col">
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div>
                        <p className="font-semibold text-sm sm:text-base">{comment.user_name}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <p className="mb-4 text-sm sm:text-base flex-grow">{comment.comment}</p>
                    {comment.admin_reply && (
                      <div className="bg-primary/5 p-3 sm:p-4 rounded-lg border-l-4 border-primary mt-auto">
                        <p className="text-xs sm:text-sm font-semibold mb-1">Management Response:</p>
                        <p className="text-xs sm:text-sm">{comment.admin_reply}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <p className="text-muted-foreground">No feedback yet. Be the first to share your experience!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
