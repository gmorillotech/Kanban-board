import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import type { Label } from '../types'

export function useLabels() {
  const [labels, setLabels] = useState<Label[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLabels()
  }, [])

  async function fetchLabels() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      setLabels(data || [])
    } finally {
      setLoading(false)
    }
  }

  async function createLabel(name: string, color: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No user session')

    const { data, error } = await supabase
      .from('labels')
      .insert({ name, color, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setLabels(prev => [...prev, data])
    return data
  }

  async function deleteLabel(id: string) {
    const { error } = await supabase
      .from('labels')
      .delete()
      .eq('id', id)

    if (error) throw error
    setLabels(prev => prev.filter(l => l.id !== id))
  }

  async function addLabelToTask(taskId: string, labelId: string) {
    const { error } = await supabase
      .from('task_labels')
      .insert({ task_id: taskId, label_id: labelId })

    if (error) throw error
  }

  async function removeLabelFromTask(taskId: string, labelId: string) {
    const { error } = await supabase
      .from('task_labels')
      .delete()
      .eq('task_id', taskId)
      .eq('label_id', labelId)

    if (error) throw error
  }

  async function getTaskLabels(taskId: string): Promise<Label[]> {
    const { data, error } = await supabase
      .from('task_labels')
      .select('label_id, labels(*)')
      .eq('task_id', taskId)

    if (error) throw error
    return (data || []).map((row: any) => row.labels)
  }

  return { labels, loading, createLabel, deleteLabel, addLabelToTask, removeLabelFromTask, getTaskLabels }
}