"use client"

import React, { useState } from 'react'
import AddPostForm from './AddPostForm'
import EditPostForm from './EditPostForm'

export default function ClientDashboard({ initialPosts }: { initialPosts: any[] }){
  const [posts, setPosts] = useState(initialPosts ?? [])
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleAdded(post: any){
    setPosts(prev => [post, ...prev])
  }

  function handleSaved(updated: any){
    setPosts(prev => prev.map(p=> p.id === updated.id ? updated : p))
    setEditingId(null)
  }

  async function handleDelete(id: string){
    if(!confirm('Delete this post?')) return
    const res = await fetch(`/api/posts/${id}`, { method: 'DELETE' })
    if(res.ok){
      setPosts(prev => prev.filter(p=> p.id !== id))
    } else {
      alert('Failed to delete')
    }
  }

  return (
    <div>
      <AddPostForm onAdded={handleAdded} />

      <ul className="mt-4 list-disc pl-6">
        {posts.map(p=> (
          <li key={p.id} className="py-2">
            {editingId === p.id ? (
              <EditPostForm post={p} onSaved={handleSaved} onCancel={()=>setEditingId(null)} />
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold">{p.title}</div>
                  <div className="text-sm text-gray-600">{p.content}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>setEditingId(p.id)} className="rounded border px-2 py-1 text-sm">Edit</button>
                  <button onClick={()=>handleDelete(p.id)} className="rounded border px-2 py-1 text-sm text-red-600">Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
