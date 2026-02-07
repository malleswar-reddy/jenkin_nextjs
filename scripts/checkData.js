const { PrismaClient } = require('@prisma/client')
;(async ()=>{
  const prisma = new PrismaClient()
  try{
    const users = await prisma.user.findMany()
    const posts = await prisma.post.findMany()
    console.log('users', users.length)
    console.log('posts', posts.length)
    console.log(users.map(u=>u.email))
    console.log(posts.map(p=>({ id: p.id, title: p.title, authorId: p.authorId })))
  }catch(e){
    console.error(e)
    process.exit(1)
  }finally{
    await prisma.$disconnect()
  }
})()
