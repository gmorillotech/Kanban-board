import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '../types'

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-600',
  medium: 'bg-blue-50 text-blue-600',
  low: 'bg-gray-100 text-gray-600',
}

interface Props {
  task: Task
  onDelete: (id: string) => void
}

export default function TaskCard({ task, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  }

  const isOverdue = task.due_date && new Date(task.due_date) < new Date()
  const isDone = task.status === 'done'

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        relative bg-white rounded-xl p-3 border cursor-grab active:cursor-grabbing group
        transition-shadow hover:card-shadow-hover
        ${isDragging ? 'card-shadow-hover' : 'card-shadow'}
        ${isDone ? 'border-gray-100 opacity-70' : 'border-gray-100'}
      `}
    >
      {task.status === 'in_progress' && (
        <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-brand-400 rounded-full" />
      )}

      <div className="flex items-start justify-between gap-2">
        <p className={`text-sm font-medium leading-snug ${
          isDone ? 'line-through text-gray-400' : 'text-gray-800'
        }`}>
          {task.title}
        </p>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}
          className="opacity-0 group-hover:opacity-100 text-gray-200 hover:text-red-400 transition-all shrink-0 text-xs mt-0.5"
        >
          ✕
        </button>
      </div>

      {task.description && (
        <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority]}`}>
          {task.priority}
        </span>
        {task.due_date && (
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
            isOverdue ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
          }`}>
            {isOverdue ? '⚠ ' : ''}
            {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        )}
      </div>
    </div>
  )
}