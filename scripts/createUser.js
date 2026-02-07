const { PrismaClient } = require('@prisma/client');
(async ()=>{
  const prisma = new PrismaClient();
  const existing = await prisma.user.findUnique({ where: { email: 'devuser@example.com' } });
  if(existing){
    console.log('already exists', existing.id);
    process.exit(0);
  }
  const u = await prisma.user.create({ data: { email: 'devuser@example.com', password: '$2a$10$abcdefghijklmnopqrstuv', name: 'Dev User' } });
  console.log('created user', u.id);
  await prisma.$disconnect();
})();
