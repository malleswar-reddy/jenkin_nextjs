This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Docker (Runtime-only image)

This project uses a runtime-only Docker image that expects prebuilt Next.js artifacts. Build locally first, then build the container.

### Prerequisites
- Docker Desktop installed (macOS)
- Optional: Increase Docker Desktop memory to 4–6 GB for heavy builds; not required for runtime-only image.

### 1) Build on host

```bash
npm ci
npx prisma generate
npm run build
```

This produces `.next/standalone`, `.next/static`, and `public/`.

### 2) Build the Docker image

```bash
docker build -t jenkin_nextjs:latest .
```

The provided `.dockerignore` allows the prebuilt `.next` artifacts to be included in the build context.

### 3) Run the container

Set required environment variables:
- `DATABASE_URL` — MySQL connection string
- `JWT_SECRET` — secret for signing JWT tokens

```bash
docker run \
  -e NODE_ENV=production \
  -e DATABASE_URL="mysql://root:password@127.0.0.1:3306/jenkin_nextjs" \
  -e JWT_SECRET="replace-with-a-strong-secret" \
  -p 3000:3000 \
  jenkin_nextjs:latest
```

Then open http://localhost:3000.

### Notes
- The Dockerfile copies `.next/standalone`, `.next/static`, and `public` and runs `server.js` from the standalone output.
- If you prefer building inside Docker, you may need to increase Docker memory. The runtime-only approach avoids build-time OOMs.

## Docker Compose (MySQL)

A simple MySQL service is defined in `docker-compose.yml`.

```yaml
version: '3.8'
services:
  db:
    image: mysql:8.0
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: jenkin_nextjs
    ports:
      - "3306:3306"
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

### Start MySQL

```bash
docker compose up -d db
```

Wait a few seconds for MySQL to initialize, then set your `DATABASE_URL` accordingly, for example:

```
mysql://root:password@127.0.0.1:3306/jenkin_nextjs
```

### Run the app container against Compose MySQL

After building the runtime image:

```bash
docker run \
  -e NODE_ENV=production \
  -e DATABASE_URL="mysql://root:password@host.docker.internal:3306/jenkin_nextjs" \
  -e JWT_SECRET="replace-with-a-strong-secret" \
  -p 3000:3000 \
  jenkin_nextjs:latest
```

On macOS, `host.docker.internal` allows the container to connect to the MySQL service exposed on the host (or use the container name/bridge network if you add an app service to compose).

### Prisma migrations and seed

Run locally (outside Docker) while connected to the Compose MySQL:

```bash
npx prisma generate
npx prisma migrate dev --name init
npm run seed
```

Alternatively, you can run `prisma migrate deploy` in CI/CD before starting the app.

## Troubleshooting
- Build OOM inside Docker: Use the runtime-only Dockerfile and build on host, or increase Docker Desktop memory.
- COPY errors for `.next`: ensure you ran `npm run build` first, and that `.dockerignore` includes `!.next/standalone` and `!.next/static` lines.
- MySQL connection failures: confirm `DATABASE_URL` points to the right host/port, and the DB is initialized by Compose.
