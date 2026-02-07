const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main(){
  // Create sample users
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      password: await bcrypt.hash('pass123', 10),
      name: 'Alice'
    }
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      password: await bcrypt.hash('password', 10),
      name: 'Bob'
    }
  })

  // Create sample posts
  await prisma.post.upsert({
    where: { id: 'post1' },
    update: {},
    create: {
      id: 'post1',
      title: 'Hello World',
      content: 'This is a seeded post for Alice',
      published: true,
      authorId: alice.id
    }
  })

  await prisma.post.upsert({
    where: { id: 'post2' },
    update: {},
    create: {
      id: 'post2',
      title: 'Second Post',
      content: 'Another seeded post for Bob',
      published: false,
      authorId: bob.id
    }
  })

  console.log('Seed done')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
