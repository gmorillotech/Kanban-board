import {useState, useEffect} from 'react'
import { supabase } from '../lib/supabase'
import type { Comment } from '../types'

export function useComments(taskId: string) {
    const [comments, setComments] = useState<Comment[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchComments()
    }, [taskId])

    async function fetchComments() {
        try {
            setLoading(true)
            const {data, error} = await supabase
                .from('comments')
                .select('*')
                .eq('task_id', taskId)
                .order('created_at', {ascending: true})

            if(error) throw error
            setComments(data || [])
        }finally{
            setLoading(false)
        }
    }

    async function addComment(content: string) {
        const {data: {user}} = await supabase.auth.getUser()
        if(!user) throw new Error('No user session')
            
        const {data, error} = await supabase
            .from('comments')
            .insert({
                task_id: taskId,
                user_id: user.id,
                content
            })
            .select()
            .single()

        if(error) throw error
        setComments(prev => [...prev, data])
        return data
    }

    async function deleteComment(id: string) {
        const {error} = await supabase
            .from('comments')
            .delete()
            .eq('id', id)

        if(error) throw error
        setComments(prev => prev.filter(c => c.id !== id))
    }

    return {comments, loading, addComment, deleteComment}
}