"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { BackButton } from "@/components/back-button"
import type { Comment } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { Trash2, MessageSquare, CheckCircle, XCircle } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { approveComment, disapproveComment, deleteComment as deleteCommentAction } from "@/lib/server-actions/admin-operations"

export default function AdminCommentsClient() {
  const [comments, setComments] = useState<Comment[]>([])
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const supabase = createClient()

  useEffect(() => {
    loadComments()
  }, [])

  async function loadComments() {
    const { data: commentsData } = await supabase.from("comments").select("*").order("created_at", { ascending: false })

    if (commentsData) {
      setComments(commentsData)
    }
  }

  async function handleDelete(commentId: string) {
    setLoading(true)
    try {
      const result = await deleteCommentAction(commentId)
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete comment",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Comment deleted successfully",
        })
        loadComments()
      }
    } catch (err) {
      console.error('[v0] Error deleting comment:', err)
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(commentId: string) {
    setLoading(true)
    try {
      const result = await approveComment(commentId)
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to approve comment",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Comment approved and will now be visible to the public",
        })
        loadComments()
      }
    } catch (err) {
      console.error('[v0] Error approving comment:', err)
      toast({
        title: "Error",
        description: "Failed to approve comment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleDisapprove(commentId: string) {
    setLoading(true)
    try {
      const result = await disapproveComment(commentId)
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to disapprove comment",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Comment is now hidden from public view",
        })
        loadComments()
      }
    } catch (err) {
      console.error('[v0] Error disapproving comment:', err)
      toast({
        title: "Error",
        description: "Failed to disapprove comment",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleReply(commentId: string) {
    const reply = replyText[commentId]
    if (!reply?.trim()) return

    setLoading(true)
    const { error } = await supabase
      .from("comments")
      .update({
        admin_reply: reply,
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Reply sent successfully",
      })
      setReplyText({ ...replyText, [commentId]: "" })
      loadComments()
    }
    setLoading(false)
  }

  async function handleUpdateReply(commentId: string, currentReply: string) {
    setLoading(true)
    const updatedReply = replyText[commentId] || currentReply

    const { error } = await supabase
      .from("comments")
      .update({
        admin_reply: updatedReply,
        replied_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update reply",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Reply updated successfully",
      })
      setReplyText({ ...replyText, [commentId]: "" })
      loadComments()
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen p-8 relative">
      <div className="absolute top-4 left-4 z-10">
        <BackButton fallbackUrl="/admin" />
      </div>
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Manage Comments & Feedback</h1>
          <p className="text-muted-foreground">Review pending comments, approve them for public display, and reply to feedback</p>
        </div>

        <div className="space-y-6">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Card key={comment.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 flex-wrap">
                        <MessageSquare className="w-5 h-5" />
                        {comment.user_name || "Guest"}
                        {comment.is_approved && <Badge variant="default">Public</Badge>}
                        {!comment.is_approved && <Badge variant="secondary">Pending</Badge>}
                        {comment.admin_reply && <Badge variant="outline">Replied</Badge>}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {comment.is_approved ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisapprove(comment.id)}
                          disabled={loading}
                          className="gap-1"
                          title="Hide from public view"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          Hide
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleApprove(comment.id)}
                          disabled={loading}
                          className="gap-1"
                          title="Approve and show to public"
                        >
                          <XCircle className="w-4 h-4 text-red-600" />
                          Approve
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" disabled={loading}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to permanently delete this comment? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(comment.id)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold mb-2">User Comment:</p>
                      <p className="text-sm bg-muted p-3 rounded-lg">{comment.comment_text || comment.comment}</p>
                    </div>

                    {comment.admin_reply && (
                      <div className="bg-primary/5 p-4 rounded-lg border-l-4 border-primary">
                        <p className="text-sm font-semibold mb-2">Your Reply:</p>
                        <p className="text-sm mb-3">{comment.admin_reply}</p>
                        <div className="space-y-2">
                          <Textarea
                            placeholder="Update your reply..."
                            value={replyText[comment.id] ?? comment.admin_reply}
                            onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                            rows={3}
                          />
                          <Button
                            size="sm"
                            onClick={() => handleUpdateReply(comment.id, comment.admin_reply!)}
                            disabled={loading}
                          >
                            Update Reply
                          </Button>
                        </div>
                      </div>
                    )}

                    {!comment.admin_reply && (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Add Your Reply:</p>
                        <Textarea
                          placeholder="Type your reply to this user..."
                          value={replyText[comment.id] || ""}
                          onChange={(e) => setReplyText({ ...replyText, [comment.id]: e.target.value })}
                          rows={3}
                        />
                        <Button onClick={() => handleReply(comment.id)} disabled={loading || !replyText[comment.id]}>
                          Send Reply
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">No comments yet</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
