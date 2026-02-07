"use client"

import { useState } from 'react'

export default function AddPostForm({ onAdded }: { onAdded?: (post: any) => void }){
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent){
    e.preventDefault()
    setError(null)
    setLoading(true)
    try{
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content })
      })
      const data = await res.json()
      if(!res.ok){
        setError(data.error || 'Error creating post')
      } else {
        setTitle('')
        setContent('')
        onAdded?.(data)
      }
    }catch(err){
      setError('Network error')
    }finally{setLoading(false)}
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" className="rounded border px-3 py-2" />
      <textarea value={content} onChange={e=>setContent(e.target.value)} placeholder="Content" className="rounded border px-3 py-2" />
      <div className="flex gap-2">
        <button disabled={loading} className="rounded bg-green-600 px-3 py-2 text-white">{loading ? 'Adding...' : 'Add post'}</button>
      </div>
      {error && <p className="text-red-600">{error}</p>}
    </form>
  )
}
