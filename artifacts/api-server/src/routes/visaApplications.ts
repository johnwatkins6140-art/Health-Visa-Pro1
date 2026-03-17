import { Router } from "express";
import { db, visaApplicationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/visa-applications", async (req, res) => {
  try {
    const body = req.body;

    const required = [
      "referenceNumber","paymentReference","visaType","title","firstName",
      "lastName","dateOfBirth","nationality","email","phone","address","city",
      "country","passportNumber","passportExpiry","cosReference","sponsorName",
      "jobTitle","occupationGroup","annualSalary","employmentStartDate",
      "contractType","englishLevel","englishEvidence","visaDuration",
      "processingSpeed","totalFeePaid",
    ];
    const missing = required.filter((k) => !body[k] && body[k] !== 0);
    if (missing.length > 0) {
      res.status(400).json({ error: "Missing required fields", fields: missing });
      return;
    }

    const [application] = await db
      .insert(visaApplicationsTable)
      .values({
        referenceNumber: body.referenceNumber,
        paymentReference: body.paymentReference,
        visaType: body.visaType,
        title: body.title,
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: body.dateOfBirth,
        nationality: body.nationality,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        country: body.country,
        postcode: body.postcode ?? null,
        passportNumber: body.passportNumber,
        passportExpiry: body.passportExpiry,
        cosReference: body.cosReference,
        sponsorName: body.sponsorName,
        sponsorLicenceNumber: body.sponsorLicenceNumber ?? null,
        jobTitle: body.jobTitle,
        occupationGroup: body.occupationGroup,
        annualSalary: body.annualSalary,
        employmentStartDate: body.employmentStartDate,
        workLocation: body.workLocation ?? null,
        contractType: body.contractType,
        englishLevel: body.englishLevel,
        englishEvidence: body.englishEvidence,
        qualificationLevel: body.qualificationLevel ?? null,
        qualificationSubject: body.qualificationSubject ?? null,
        visaDuration: body.visaDuration,
        processingSpeed: body.processingSpeed,
        ihsYears: body.ihsYears ?? null,
        totalFeePaid: Number(body.totalFeePaid),
      })
      .returning();

    console.log(`[visa-application] Saved application ${application.referenceNumber}`);
    res.status(201).json({ success: true, referenceNumber: application.referenceNumber, id: application.id });
  } catch (err: any) {
    console.error("[visa-application] POST error:", err?.message ?? err);
    res.status(500).json({ error: "Failed to save application. Please contact UKVI." });
  }
});

router.get("/visa-applications/:ref", async (req, res) => {
  try {
    const { ref } = req.params;
    const [application] = await db
      .select()
      .from(visaApplicationsTable)
      .where(eq(visaApplicationsTable.referenceNumber, ref));

    if (!application) {
      res.status(404).json({ error: "Application not found" });
      return;
    }

    res.json(application);
  } catch (err: any) {
    console.error("[visa-application] GET error:", err?.message ?? err);
    res.status(500).json({ error: "Failed to retrieve application" });
  }
});

export default router;
