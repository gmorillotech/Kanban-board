import {useState, useEffect} from 'react'
import { supabase } from '../lib/supabase'
import type { Task, Status, Priority } from '../types'

export function useTasks() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        fetchTasks()

    }, [])

    async function fetchTasks() {
        try{
            setLoading(true)
            const {data, error} = await supabase
                .from('tasks')
                .select(`
                *,
                task_labels(
                    labels(*)
                )
            `)
            .order('created_at', { ascending: true })
                
            if(error) throw error

            const tasks = (data || []).map((task:any) => ({
                ...task,
                labels: (task.task_labels || []).map((tl:any) => tl.labels)
            }))

            setTasks(tasks)
        } catch(err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function createTask(task: {
        title: string
        description?: string
        priority: Priority
        due_date?: string
    }) {
        const {data: {user} } = await supabase.auth.getUser()
        if(!user) throw new Error('No user session')

        const {data, error} = await supabase
            .from('tasks')
            .insert({
                ...task,
                status: 'todo',
                user_id: user.id
            })
            .select()
            .single()

            if (error) throw error
            setTasks(prev => [...prev, data])
            return data
    }

    async function updateTaskStatus(id: string, status: Status){
        const {error} = await supabase
            .from('tasks')
            .update({status})
            .eq('id', id)

        if(error) throw error
        setTasks(prev => prev.map(t => t.id === id ? {...t, status} : t))
    }
    
    async function updateTask(id: string, updates: {
        title?: string
        description?: string
        priority?: Priority
        due_date?: string
        status?: Status
    }) {
        const {data, error} = await supabase
            .from('tasks')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if(error) throw error
        setTasks(prev => prev.map(t => t.id === id ? {...t, ...data} : t))
        return data
    }

    async function deleteTask(id: string){
        const {error} = await supabase
            .from('tasks')
            .delete()
            .eq('id', id)

        if(error) throw error
        setTasks(prev => prev.filter(t => t.id !== id))
    }
    return {tasks, loading, error, createTask, updateTaskStatus, updateTask, deleteTask, refreshTasks: fetchTasks}

}