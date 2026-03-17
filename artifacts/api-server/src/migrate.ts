import pg from "pg";

const { Pool } = pg;

export async function runMigrations(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set before running migrations");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS visa_applications (
        id                    SERIAL PRIMARY KEY,
        reference_number      TEXT NOT NULL UNIQUE,
        payment_reference     TEXT NOT NULL,
        paystack_reference    TEXT,
        visa_type             TEXT NOT NULL,
        status                TEXT NOT NULL DEFAULT 'submitted',
        title                 TEXT NOT NULL,
        first_name            TEXT NOT NULL,
        last_name             TEXT NOT NULL,
        date_of_birth         TEXT NOT NULL,
        nationality           TEXT NOT NULL,
        email                 TEXT NOT NULL,
        phone                 TEXT NOT NULL,
        address               TEXT NOT NULL,
        city                  TEXT NOT NULL,
        country               TEXT NOT NULL,
        postcode              TEXT,
        passport_number       TEXT NOT NULL,
        passport_expiry       TEXT NOT NULL,
        cos_reference         TEXT NOT NULL,
        sponsor_name          TEXT NOT NULL,
        sponsor_licence_number TEXT,
        job_title             TEXT NOT NULL,
        occupation_group      TEXT NOT NULL,
        annual_salary         TEXT NOT NULL,
        employment_start_date TEXT NOT NULL,
        work_location         TEXT,
        contract_type         TEXT NOT NULL,
        english_level         TEXT NOT NULL,
        english_evidence      TEXT NOT NULL,
        qualification_level   TEXT,
        qualification_subject TEXT,
        visa_duration         TEXT NOT NULL,
        processing_speed      TEXT NOT NULL,
        ihs_years             INTEGER,
        total_fee_paid        INTEGER NOT NULL,
        submitted_at          TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);

    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_name = 'visa_applications' AND column_name = 'paystack_reference'
        ) THEN
          ALTER TABLE visa_applications ADD COLUMN paystack_reference TEXT;
        END IF;
      END $$
    `);

    console.log("[migrate] Database schema is up to date");
  } finally {
    await pool.end();
  }
}
