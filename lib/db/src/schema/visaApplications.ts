import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";

export const visaApplicationsTable = pgTable("visa_applications", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
  paymentReference: text("payment_reference").notNull(),
  paystackReference: text("paystack_reference"),
  visaType: text("visa_type").notNull(),
  status: text("status").notNull().default("submitted"),

  title: text("title").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  nationality: text("nationality").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  postcode: text("postcode"),

  passportNumber: text("passport_number").notNull(),
  passportExpiry: text("passport_expiry").notNull(),

  cosReference: text("cos_reference").notNull(),
  sponsorName: text("sponsor_name").notNull(),
  sponsorLicenceNumber: text("sponsor_licence_number"),
  jobTitle: text("job_title").notNull(),
  occupationGroup: text("occupation_group").notNull(),
  annualSalary: text("annual_salary").notNull(),
  employmentStartDate: text("employment_start_date").notNull(),
  workLocation: text("work_location"),
  contractType: text("contract_type").notNull(),

  englishLevel: text("english_level").notNull(),
  englishEvidence: text("english_evidence").notNull(),
  qualificationLevel: text("qualification_level"),
  qualificationSubject: text("qualification_subject"),

  visaDuration: text("visa_duration").notNull(),
  processingSpeed: text("processing_speed").notNull(),
  ihsYears: integer("ihs_years"),
  totalFeePaid: integer("total_fee_paid").notNull(),

  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export type InsertVisaApplication = typeof visaApplicationsTable.$inferInsert;
export type VisaApplication = typeof visaApplicationsTable.$inferSelect;
