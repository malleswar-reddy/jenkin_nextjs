"use client"

import { useState } from 'react'

export default function EditPostForm({ post, onSaved, onCancel }: { post: any, onSaved?: (p:any)=>void, onCancel?: ()=>void }){
  const [title, setTitle] = useState(post.title)
  const [content, setContent] = useState(post.content ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSave(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })
      const data = await res.json()
      if(!res.ok){
        setError(data.error || 'Error updating')
      } else {
        onSaved?.(data)
      }
    }catch(err){
      setError('Network error')
    }finally{setLoading(false)}
  }

  return (
    <form onSubmit={handleSave} className="mb-4 flex flex-col gap-2">
      <input value={title} onChange={e=>setTitle(e.target.value)} className="rounded border px-3 py-2" />
      <textarea value={content} onChange={e=>setContent(e.target.value)} className="rounded border px-3 py-2" />
      <div className="flex gap-2">
        <button disabled={loading} className="rounded bg-blue-600 px-3 py-2 text-white">{loading ? 'Saving...' : 'Save'}</button>
        <button type="button" onClick={onCancel} className="rounded border px-3 py-2">Cancel</button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}
