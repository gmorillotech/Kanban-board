import { useState, useRef, useEffect } from 'react'
import { useComments } from '../hooks/useComments'
import type { Task, Priority, Status } from '../types'
import LabelManager from './LabelManager'

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
  onUpdate: (id: string, updates: {
    title?: string
    description?: string
    priority?: Priority
    due_date?: string
    status?: Status
  }) => Promise<void>
  onLabelsChanged: () => void
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

export default function TaskDetailPanel({ task, onClose, onUpdate, onLabelsChanged }: Props) {
  const { comments, loading, addComment, deleteComment } = useComments(task.id)
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(task.title)
  const [editDesc, setEditDesc] = useState(task.description || '')
  const [editPriority, setEditPriority] = useState<Priority>(task.priority)
  const [editDueDate, setEditDueDate] = useState(task.due_date || '')
  const [editStatus, setEditStatus] = useState<Status>(task.status)
  const [saving, setSaving] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments])

  async function handleSave(){
    if(!editTitle.trim()) return
    try {
        setSaving(true)
        await onUpdate(task.id, {
            title: editTitle.trim(),
            description: editDesc.trim() || undefined,
            priority: editPriority,
            due_date: editDueDate || undefined,
            status: editStatus,
        })
        setEditing(false)
    }finally{
        setSaving(false)
    }
  }

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
      <div className="fixed inset-0 bg-black/10 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 w-[420px] bg-white border-l border-gray-100 z-50 flex flex-col shadow-xl">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {editing ? (
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full text-base font-semibold text-gray-900 border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-300"
                autoFocus
              />
            ) : (
              <h2 className="text-base font-semibold text-gray-900 leading-snug">{task.title}</h2>
            )}
            <p className="text-xs text-gray-400 mt-0.5">Created {timeAgo(task.created_at)}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {editing ? (
              <>
                <button
                  onClick={() => setEditing(false)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1 rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-gray-400 hover:text-brand-500 px-2 py-1 rounded-lg hover:bg-brand-50 transition-colors"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="text-gray-300 hover:text-gray-500 text-lg">✕</button>
          </div>
        </div>

        {/* Meta */}
        <div className="px-6 py-4 border-b border-gray-50 flex flex-wrap gap-2">
          {editing ? (
            <>
              <select
                value={editStatus}
                onChange={e => setEditStatus(e.target.value as Status)}
                className="text-xs border border-gray-200 rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-brand-300 text-gray-600"
              >
                {(Object.keys(STATUS_LABELS) as Status[]).map(s => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
              <select
                value={editPriority}
                onChange={e => setEditPriority(e.target.value as Priority)}
                className="text-xs border border-gray-200 rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-brand-300 text-gray-600"
              >
                <option value="low">Low priority</option>
                <option value="medium">Medium priority</option>
                <option value="high">High priority</option>
              </select>
              <input
                type="date"
                value={editDueDate}
                onChange={e => setEditDueDate(e.target.value)}
                className="text-xs border border-gray-200 rounded-full px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-brand-300 text-gray-600"
              />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Description */}
        <div className="px-6 py-4 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Description</p>
          {editing ? (
            <textarea
              value={editDesc}
              onChange={e => setEditDesc(e.target.value)}
              placeholder="Add a description..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-300 resize-none text-gray-600 placeholder-gray-300"
            />
          ) : (
            <p className="text-sm text-gray-600 leading-relaxed">
              {task.description || <span className="text-gray-300">No description</span>}
            </p>
          )}
        </div>

        {/* Labels */}
        <div className="px-6 py-4 border-b border-gray-50">
          <LabelManager taskId={task.id} onLabelsChanged={onLabelsChanged} />
        </div>

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
                  <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-0.5">G</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-gray-700">Guest</span>
                        <span className="text-xs text-gray-400">{timeAgo(comment.created_at)}</span>
                      </div>
                      <button
                        onClick={() => deleteComment(comment.id)}
                        className="opacity-0 group-hover:opacity-100 text-gray-200 hover:text-red-400 text-xs transition-all"
                      >✕</button>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">{comment.content}</p>
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
            <div className="w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold shrink-0 mt-1">G</div>
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