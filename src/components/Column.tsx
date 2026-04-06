import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Task, Status } from '../types'
import TaskCard from './TaskCard'

const COLUMN_CONFIG: Record<Status, {
  dot: string
  countBg: string
  countText: string
  dropBg: string
}> = {
  todo:        { dot: 'bg-gray-400',   countBg: 'bg-gray-100',    countText: 'text-gray-600',  dropBg: 'bg-gray-50' },
  in_progress: { dot: 'bg-brand-500',  countBg: 'bg-brand-50',    countText: 'text-brand-600', dropBg: 'bg-brand-50/40' },
  in_review:   { dot: 'bg-amber-400',  countBg: 'bg-amber-50',    countText: 'text-amber-600', dropBg: 'bg-amber-50/40' },
  done:        { dot: 'bg-green-500',  countBg: 'bg-green-50',    countText: 'text-green-600', dropBg: 'bg-green-50/40' },
}

interface Props {
  id: Status
  label: string
  tasks: Task[]
  onDelete: (id: string) => void
  onAddTask: () => void
  isFiltering?: boolean
}

export default function Column({ id, label, tasks, onDelete, onAddTask, isFiltering }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const cfg = COLUMN_CONFIG[id]

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3 card-shadow flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <h2 className="text-sm font-semibold text-gray-700">{label}</h2>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.countBg} ${cfg.countText}`}>
          {tasks.length}
        </span>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex flex-col gap-2 flex-1 min-h-[200px] rounded-lg p-1.5 transition-colors ${
          isOver ? cfg.dropBg + ' ring-1 ring-inset ring-brand-200' : ''
        }`}
      >
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={onDelete} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center min-h-[120px]">
            <p className="text-xs text-gray-200">
              {isFiltering ? 'No matches': 'Drop tasks here'}</p>
          </div>
        )}
      </div>

      {/* Add task */}
      <button
        onClick={onAddTask}
        className="mt-2 flex items-center gap-1.5 text-xs text-gray-300 hover:text-brand-500 px-2 py-1.5 rounded-lg hover:bg-brand-50 transition-colors w-full"
      >
        <span className="text-base leading-none">+</span> Add task
      </button>
    </div>
  )
}
