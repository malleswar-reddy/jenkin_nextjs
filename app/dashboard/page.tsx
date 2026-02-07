import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import ClientDashboard from './ClientDashboard'

export default async function DashboardPage(){
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value

  if(!token) {
    redirect('/login')
  }

  let payload: any = null
  try{
    payload = verifyToken(token!)
  }catch(e){
    redirect('/login')
  }

  if(!payload?.id) {
    redirect('/login')
  }

  const posts = await prisma.post.findMany({ where: { authorId: payload.id }, orderBy: { createdAt: 'desc' } })

  return (
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="mt-2">Welcome back — here are your posts:</p>

      <div className="mt-4">
        <ClientDashboard initialPosts={posts} />
      </div>
    </div>
  )
}
