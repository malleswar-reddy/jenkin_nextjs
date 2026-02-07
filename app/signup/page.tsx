"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SignupPage(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try{
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
      })
      const data = await res.json()
      if(!res.ok){
        setError(data.error || 'Signup failed')
        return
      }
      router.push('/dashboard')
    }catch(err){
      setError('Network error')
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Sign up</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex max-w-md flex-col gap-3">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="rounded border px-3 py-2" />
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="rounded border px-3 py-2" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" className="rounded border px-3 py-2" />
        <button className="rounded bg-blue-600 px-4 py-2 text-white">Sign up</button>
        {error && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  )
}
