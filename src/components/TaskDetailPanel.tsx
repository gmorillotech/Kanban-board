import { useState, useRef, useEffect } from 'react'
import { useComments } from '../hooks/useComments'
import type { Task } from '../types'

const PRIORITY_STYLES = {
  high:   'bg-red-50 text-red-600',
  medium: 'bg-blue-50 text-blue-600',
  low:    'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<string, string> = {
  todo:        'To Do',
  in_progress: 'In Progress',
  in_review:   'In Review',
  done:        'Done',
}

interface Props {
  task: Task
  onClose: () => void
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export default function TaskDetailPanel({ task, onClose }: Props) {
  const { comments, loading, addComment, deleteComment } = useComments(task.id)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    try {
      setSubmitting(true)
      await addComment(input.trim())
      setInput('')
    } finally {
      setSubmitting(false)
    }
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date()

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/10 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white border-l border-gray-100 z-50 flex flex-col shadow-xl">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-gray-900 leading-snug">
              {task.title}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Created {timeAgo(task.created_at)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-300 hover:text-gray-500 transition-colors text-lg shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Task meta */}
        <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap gap-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
            {STATUS_LABELS[task.status]}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
            {task.priority} priority
          </span>
          {task.due_date && (
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
              isOverdue ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
            }`}>
              {isOverdue ? '⚠ ' : ''}Due {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
        </div>

        {/* Description */}
        {task.description && (
          <div className="px-6 py-4 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Description
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Comments */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
            Comments {comments.length > 0 && `(${comments.length})`}
          </p>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-gray-300">No comments yet</p>
              <p className="text-xs text-gray-200 mt-1">Be the first to comment</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {comments.map(comment => (
                <div key={comment.id} className="group flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5">
                    G
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">Guest</span>
                        <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-200 hover:text-red-400 text-xs transition-all"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="px-6 py-4 border-t border-gray-100">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-1">
              G
            </div>
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent placeholder-gray-300"
              />
              <button
                type="submit"
                disabled={submitting || !input.trim()}
                className="bg-brand-500 hover:bg-brand-600 disabled:opacity-40 text-white text-sm px-3 py-2 rounded-lg transition-colors"
              >
                {submitting ? '...' : '↑'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}