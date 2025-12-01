import { Pool } from "pg";
import { config } from "../config/env.ts";

const pool = new Pool({ connectionString: config.DATABASE_URL });

export class DBService {
  static async saveReview(repo: string, pr_number: number, summary: string, details: string) {
    const query = `
      INSERT INTO reviews (repo, pr_number, summary, details, created_at)
      VALUES ($1, $2, $3, $4, NOW())
    `;
    await pool.query(query, [repo, pr_number, summary, details]);
  }

  static async getReviews() {
    const res = await pool.query(`SELECT * FROM reviews ORDER BY created_at DESC`);
    return res.rows;
  }
}
