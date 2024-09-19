# scalonetapp

## How to run this project locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## My notes

- Create an empty sqlite db by executing:

  ```bash
  sqlite3 scalonetapp.db "VACUUM;"
  ```

- Updating local DB

  ```bash
    # Update prisma/schema.prisma, then run:
    npx prisma generate && npx prisma db push
  ```

- Updating prod DB from local

  ```bash
    # Update prisma/prod.schema.prisma, then run:
    npx prisma migrate dev --name MIGRATION_NAME --schema=./prisma/prod.schema.prisma
  ```
