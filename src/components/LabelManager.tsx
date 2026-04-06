import { useState, useEffect } from 'react'
import { useLabels } from '../hooks/useLabels'
import type { Label } from '../types'

const PRESET_COLORS = [
  '#6366f1', '#ef4444', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6',
]

interface Props {
  taskId: string
  onLabelsChanged: () => void
}

export default function LabelManager({ taskId, onLabelsChanged }: Props) {
  const { labels, createLabel, addLabelToTask, removeLabelFromTask, getTaskLabels } = useLabels()
  const [taskLabels, setTaskLabels] = useState<Label[]>([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newColor, setNewColor] = useState('#6366f1')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    getTaskLabels(taskId).then(setTaskLabels)
  }, [taskId])

  const isAttached = (labelId: string) => taskLabels.some(l => l.id === labelId)

  async function toggleLabel(label: Label) {
    if (isAttached(label.id)) {
      await removeLabelFromTask(taskId, label.id)
      setTaskLabels(prev => prev.filter(l => l.id !== label.id))
    } else {
      await addLabelToTask(taskId, label.id)
      setTaskLabels(prev => [...prev, label])
    }
    onLabelsChanged()
  }

  async function handleCreate() {
    if (!newName.trim()) return
    try {
      setCreating(true)
      const label = await createLabel(newName.trim(), newColor)
      await addLabelToTask(taskId, label.id)
      setTaskLabels(prev => [...prev, label])
      setNewName('')
      setShowCreate(false)
      onLabelsChanged()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Labels</p>

      {/* Existing labels */}
      <div className="flex flex-wrap gap-2 mb-3">
        {labels.map(label => (
          <button
            key={label.id}
            onClick={() => toggleLabel(label)}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-all ${
              isAttached(label.id)
                ? 'border-transparent opacity-100'
                : 'border-gray-200 opacity-50 hover:opacity-75'
            }`}
            style={isAttached(label.id) ? {
              backgroundColor: label.color + '20',
              borderColor: label.color + '40',
              color: label.color,
            } : {}}
          >
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: label.color }}
            />
            {label.name}
            {isAttached(label.id) && <span className="ml-0.5">✓</span>}
          </button>
        ))}

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="text-xs text-gray-400 hover:text-brand-500 px-2.5 py-1 rounded-full border border-dashed border-gray-200 hover:border-brand-300 transition-all"
        >
          + New label
        </button>
      </div>

      {/* Create label form */}
      {showCreate && (
        <div className="bg-gray-50 rounded-xl p-3 flex flex-col gap-3">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Label name..."
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-300 bg-white"
            autoFocus
          />
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                onClick={() => setNewColor(color)}
                className={`w-6 h-6 rounded-full transition-transform ${
                  newColor === color ? 'scale-125 ring-2 ring-offset-1 ring-gray-400' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-1.5 text-xs text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={creating || !newName.trim()}
              className="flex-1 py-1.5 text-xs text-white bg-brand-500 hover:bg-brand-600 rounded-lg disabled:opacity-50"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* Attached labels preview */}
      {taskLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {taskLabels.map(label => (
            <span
              key={label.id}
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: label.color + '20',
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}