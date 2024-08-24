import path from "path";
import sqlite3 from "sqlite3";

const DB_PATH = path.join(process.cwd(), "scalonetapp.db");

export const db = new sqlite3.Database(
  DB_PATH,
  sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
  (error) => {
    if (error) {
      console.error(error.message);
    }

    console.log("Connected to the database.");
  }
);

export const apiGet = async (query: string) => {
  return await new Promise((resolve, reject) => {
    db.all(query, (error, rows) => {
      if (error) {
        console.log(error);

        return reject(error);
      }

      return resolve(rows);
    });
  });
};

export const apiPost = async (query: string, values: string[]) => {
  return await new Promise((resolve, reject) => {
    db.run(query, values, (error) => {
      if (error) {
        console.log(error);

        return reject(error);
      }

      return resolve(null);
    });
  });
};
