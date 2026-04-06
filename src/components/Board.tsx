import { useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import { COLUMNS,type Status, type Priority } from '../types'
import { useTasks } from '../hooks/useTasks'
import Column from './Column'
import CreateTaskModal from './CreateTaskModal'

export default function Board() {
  const { tasks, loading, error, createTask, updateTaskStatus, deleteTask } = useTasks()
  const [showModal, setShowModal] = useState(false)
  const [search, setSearch] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'all'>('all')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

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

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
    return matchesSearch && matchesPriority})

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

        {/* Stats + Search bar */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
        {/* Stats */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm card-shadow">
            <span className="font-semibold text-gray-900">{totalTasks}</span>
            <span className="text-gray-400">total</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-3 py-1.5 text-sm card-shadow">
            <span className="font-semibold text-green-600">{doneTasks}</span>
            <span className="text-gray-400">done</span>
        </div>
        {overdueTasks > 0 && (
        <div className="flex items-center gap-1.5 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 text-sm card-shadow">
            <span className="font-semibold text-red-600">{overdueTasks}</span>
            <span className="text-red-400">overdue</span>
        </div>
        )}

  {/* Divider */}
  <div className="w-px h-5 bg-gray-200 mx-1" />

  {/* Search */}
  <div className="relative">
    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
    <input
      type="text"
      placeholder="Search tasks..."
      value={search}
      onChange={e => setSearch(e.target.value)}
      className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent w-48 placeholder-gray-300"
    />
  </div>

    {/* Priority filter */}
    <select
        value={priorityFilter}
        onChange={e => setPriorityFilter(e.target.value as Priority | 'all')}
        className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-300 focus:border-transparent text-gray-600"
    >
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
    </select>

    {/* Clear filters */}
    {(search || priorityFilter !== 'all') && (
        <button
        onClick={() => { setSearch(''); setPriorityFilter('all') }}
        className="text-xs text-brand-500 hover:text-brand-600 font-medium"
        >
        Clear filters
        </button>
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
              tasks={filteredTasks.filter(t => t.status === col.id)}
              onDelete={deleteTask}
              onAddTask={() => setShowModal(true)}
              isFiltering={search !== '' || priorityFilter !== 'all'}
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