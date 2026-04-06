import { useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { COLUMNS,type Status } from '../types'
import { useTasks } from '../hooks/useTasks'
import Column from './Column'
import CreateTaskModal from './CreateTaskModal'

export default function Board() {
  const { tasks, loading, error, createTask, updateTaskStatus, deleteTask } = useTasks()
  const [showModal, setShowModal] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    // over.id could be a column id or a task id
    const overId = over.id as string
    const overColumn = COLUMNS.find(c => c.id === overId)
    const overTask = tasks.find(t => t.id === overId)

    const newStatus: Status = overColumn
      ? overColumn.id
      : overTask
      ? overTask.status
      : activeTask.status

    if (newStatus !== activeTask.status) {
      updateTaskStatus(activeTask.id, newStatus)
    }
  }

  const totalTasks = tasks.length
  const doneTasks = tasks.filter(t => t.status === 'done').length
  const overdueTasks = tasks.filter(t => 
    t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done'
    ).length

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric'
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500 text-sm">Error: {error}</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Board</h1>
          <p className="text-sm text-gray-400 mt-0.5">{today} tasks</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <span className="text-lg leading-none">+</span> New Task
        </button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm card-shadow">
          <span className="font-semibold text-gray-900">{totalTasks}</span>
          <span className="text-gray-400">total</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white border boder-gray-100 rounded-lg px-3 py-1.5 text-sm card-shadow">
            <span className="font-semibold text-green-600">{doneTasks}</span>
            <span className="text-gray-400">done</span>
        </div>
        {overdueTasks > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm card-shadow">
                <span className="font-semibold text-red-600">{overdueTasks}</span>
                <span className="text-gray-400">overdue</span>
            </div>
        )}
    </div>

      {/* Board */}
      <DndContext 
      sensors={sensors} 
      collisionDetection={closestCorners} 
      onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-4 gap-4">
          {COLUMNS.map(col => (
            <Column
              key={col.id}
              id={col.id}
              label={col.title}
              tasks={tasks.filter(t => t.status === col.id)}
              onDelete={deleteTask}
              onAddTask={() => setShowModal(true)}
            />
          ))}
        </div>
      </DndContext>

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onCreate={createTask}
        />
      )}
    </div>
  )
}