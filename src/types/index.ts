export type Status = 'todo' | 'in_progress' | 'in_review' | 'done'
export type Priority = 'low' | 'medium' | 'high'

export interface Task 
{
  id: string
  title: string
  description?: string
  status: Status
  priority: Priority
  due_date?: string
  user_id: string
  created_at: string
}

export interface Comment
{
    id: string
    task_id: string
    user_id: string
    content: string
    created_at: string
}

export const COLUMNS: {id: Status, title: string}[] = 
[
    {id: 'todo', title: 'To Do'},
    {id: 'in_progress', title: 'In Progress'},
    {id: 'in_review', title: 'In Review'},
    {id: 'done', title: 'Done'},
]