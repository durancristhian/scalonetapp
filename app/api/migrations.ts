import { db } from "@/app/api/database";

const migrate = () => {
  db.serialize(() => {
    db.run(
      `
        CREATE TABLE IF NOT EXISTS players (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL
        );
    `,
      (err) => {
        if (err) {
          console.error(err.message);
        }

        console.log('"players" table created successfully.');
      }
    );
  });
};

migrate();
