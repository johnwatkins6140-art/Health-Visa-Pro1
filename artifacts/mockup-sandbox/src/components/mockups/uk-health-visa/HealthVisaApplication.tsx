import { useState } from "react";

const ukBlue = "#003078";
const ukRed = "#d4351c";
const ukGreen = "#00703c";

/* ─────────────────────────────────────────────────────────────────────────────
   REAL UK MEDICAL TREATMENT VISITOR VISA FEES (GOV.UK — 2024 / 2025)
   Source: https://www.gov.uk/visa-fees
   ───────────────────────────────────────────────────────────────────────────── */
const FEES = {
  visaApplication: 115,           // Standard 6-month Medical Treatment Visitor visa
  visaApplicationLong: 200,       // Extended stay (over 6 months, exceptional cases)
  tuberculosisTest: 115,          // Where required — per person (varies by clinic)
  documentTranslation: 65,        // Per page — certified translation estimate
  biometric: 0,                   // Included in application fee
  ihs: 0,                        // Not applicable — visitors do NOT pay IHS
};

/* ═══════════════════════════════════════════════════════════════════════════ */

export function HealthVisaApplication() {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stayDuration, setStayDuration] = useState<"short" | "long">("short");
  const [needsTB, setNeedsTB] = useState(false);
  const [docCount, setDocCount] = useState(0);

  const [form, setForm] = useState({
    title: "",
    firstName: "",
    lastName: "",
    dob: "",
    nationality: "",
    passportNumber: "",
    passportExpiry: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postcode: "",
    purposeOfVisit: "",
    hospitalName: "",
    hospitalAddress: "",
    treatmentType: "",
    arrivalDate: "",
    departureDate: "",
    consultant: "",
    consultantGMC: "",
    sponsorName: "",
    sponsorRelation: "",
    sponsorContact: "",
    sponsorAddress: "",
    declaration: false,
    dataConsent: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const totalFee =
    (stayDuration === "short" ? FEES.visaApplication : FEES.visaApplicationLong) +
    (needsTB ? FEES.tuberculosisTest : 0) +
    docCount * FEES.documentTranslation;

  const steps = [
    "Personal Details",
    "Passport & Travel",
    "Medical Information",
    "Sponsor Details",
    "Fees & Costs",
    "Declaration",
  ];

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 1) {
      if (!form.title) e.title = "Select a title";
      if (!form.firstName.trim()) e.firstName = "Enter your first name";
      if (!form.lastName.trim()) e.lastName = "Enter your last name";
      if (!form.dob) e.dob = "Enter your date of birth";
      if (!form.nationality) e.nationality = "Select your nationality";
      if (!form.email.trim()) e.email = "Enter your email address";
      if (!form.phone.trim()) e.phone = "Enter your phone number";
      if (!form.address.trim()) e.address = "Enter your address";
      if (!form.city.trim()) e.city = "Enter your city";
      if (!form.country.trim()) e.country = "Enter your country";
    }
    if (s === 2) {
      if (!form.passportNumber.trim()) e.passportNumber = "Enter your passport number";
      if (!form.passportExpiry) e.passportExpiry = "Enter your passport expiry date";
      if (!form.arrivalDate) e.arrivalDate = "Enter your intended arrival date";
      if (!form.departureDate) e.departureDate = "Enter your intended departure date";
    }
    if (s === 3) {
      if (!form.purposeOfVisit) e.purposeOfVisit = "Select a purpose of visit";
      if (!form.hospitalName.trim()) e.hospitalName = "Enter the hospital or clinic name";
      if (!form.consultant.trim()) e.consultant = "Enter the consultant's name";
      if (!form.treatmentType.trim()) e.treatmentType = "Describe the treatment required";
    }
    if (s === 4) {
      if (!form.sponsorName.trim()) e.sponsorName = "Enter the sponsor's name";
      if (!form.sponsorRelation) e.sponsorRelation = "Select the relationship";
      if (!form.sponsorContact.trim()) e.sponsorContact = "Enter sponsor's contact number";
    }
    if (s === 6) {
      if (!form.declaration) e.declaration = "You must confirm the declaration to submit";
      if (!form.dataConsent) e.dataConsent = "You must consent to data processing";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => s + 1);
  };

  const back = () => {
    setErrors({});
    setStep((s) => s - 1);
  };

  const handleSubmit = () => {
    if (validateStep(6)) setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="bg-white border border-gray-200 shadow-sm max-w-2xl w-full mx-4 rounded-sm">
            <div className="h-2 rounded-t-sm" style={{ backgroundColor: ukGreen }} />
            <div className="p-10">
              <div className="flex items-start gap-5 mb-6">
                <div
                  className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: ukGreen }}
                >
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{ color: ukBlue }}>
                    Application Submitted Successfully
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your UK Medical Treatment Visitor Visa application has been received by the Home Office.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-sm p-5 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Application reference</p>
                    <p className="font-mono font-bold text-lg" style={{ color: ukBlue }}>
                      HV-{Date.now().toString(36).toUpperCase().slice(-8)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Submission date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Applicant</p>
                    <p className="font-semibold text-gray-800">{form.title} {form.firstName} {form.lastName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Application fee paid</p>
                    <p className="font-semibold text-gray-800">£{totalFee.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                <p className="text-sm font-semibold text-gray-900">What happens next</p>
                <div className="space-y-2">
                  {[
                    ["Email confirmation", "You will receive an email within 2 working hours confirming your submission."],
                    ["Biometric appointment", "You will be contacted within 5 working days to book your biometric enrolment at your nearest Visa Application Centre."],
                    ["Decision", "Standard processing: 3 weeks. Priority processing: 5 working days (additional fee applies). Keep your reference number for all correspondence."],
                  ].map(([title, desc], i) => (
                    <div key={i} className="flex gap-3 text-sm">
                      <div
                        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold mt-0.5"
                        style={{ backgroundColor: ukBlue }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{title}</p>
                        <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-xs text-amber-900">
                <strong>Important:</strong> Do not travel to the UK until you have received your visa decision. Travelling without a valid visa may result in refusal of entry and a ban from future applications.
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div style={{ backgroundColor: "#1d70b8" }} className="py-2 px-4">
        <div className="max-w-5xl mx-auto">
          <span className="text-white text-xs font-semibold bg-white/20 px-2 py-0.5 rounded mr-2">BETA</span>
          <span className="text-white text-xs">
            This is a new service —{" "}
            <a href="#" className="underline text-white">your feedback</a> will help us improve it.
          </span>
        </div>
      </div>

      <main className="flex-1 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-xs text-gray-500 mb-5 flex items-center gap-1.5">
            <a href="#" className="text-blue-700 hover:underline">Home</a>
            <span>›</span>
            <a href="#" className="text-blue-700 hover:underline">Visas and immigration</a>
            <span>›</span>
            <a href="#" className="text-blue-700 hover:underline">Visit the UK</a>
            <span>›</span>
            <span className="text-gray-700">Health Visa Application</span>
          </nav>

          <div className="flex gap-8">
            {/* Sidebar */}
            <aside className="hidden lg:block w-56 flex-shrink-0">
              <div className="sticky top-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Steps</p>
                <ol className="space-y-1">
                  {steps.map((label, idx) => {
                    const num = idx + 1;
                    const isActive = num === step;
                    const isDone = num < step;
                    return (
                      <li key={label} className="flex items-start gap-2.5 py-1.5">
                        <div
                          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                          style={{
                            backgroundColor: isDone ? ukGreen : isActive ? ukBlue : "#e5e7eb",
                            color: isDone || isActive ? "white" : "#9ca3af",
                          }}
                        >
                          {isDone ? (
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          ) : num}
                        </div>
                        <span
                          className="text-xs leading-tight"
                          style={{ color: isActive ? ukBlue : isDone ? "#374151" : "#9ca3af", fontWeight: isActive ? 700 : 400 }}
                        >
                          {label}
                        </span>
                      </li>
                    );
                  })}
                </ol>

                {/* Fee summary sidebar */}
                <div className="mt-8 bg-white border border-gray-200 rounded-sm p-4">
                  <p className="text-xs font-bold text-gray-700 mb-3">Estimated fees</p>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>Visa fee</span>
                      <span className="font-semibold">£{stayDuration === "short" ? FEES.visaApplication : FEES.visaApplicationLong}</span>
                    </div>
                    {needsTB && (
                      <div className="flex justify-between">
                        <span>TB test</span>
                        <span className="font-semibold">£{FEES.tuberculosisTest}</span>
                      </div>
                    )}
                    {docCount > 0 && (
                      <div className="flex justify-between">
                        <span>Translations</span>
                        <span className="font-semibold">£{docCount * FEES.documentTranslation}</span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-gray-900">
                      <span>Total</span>
                      <span style={{ color: ukBlue }}>£{totalFee}</span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: ukBlue }}>
                  Apply for a UK Medical Treatment Visitor Visa
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Step {step} of {steps.length}: <strong>{steps[step - 1]}</strong>
                </p>
              </div>

              {/* Error summary */}
              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-sm">
                  <p className="text-sm font-bold text-red-800 mb-2">There is a problem</p>
                  <ul className="space-y-1">
                    {Object.entries(errors).map(([, msg]) => (
                      <li key={msg} className="text-sm text-red-700 flex items-start gap-1.5">
                        <span className="mt-0.5">•</span>
                        <span>{msg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-8 mb-6">
                {step === 1 && <StepPersonal form={form} update={update} errors={errors} />}
                {step === 2 && (
                  <StepPassport
                    form={form}
                    update={update}
                    errors={errors}
                    stayDuration={stayDuration}
                    setStayDuration={setStayDuration}
                  />
                )}
                {step === 3 && <StepMedical form={form} update={update} errors={errors} />}
                {step === 4 && <StepSponsor form={form} update={update} errors={errors} />}
                {step === 5 && (
                  <StepFees
                    stayDuration={stayDuration}
                    setStayDuration={setStayDuration}
                    needsTB={needsTB}
                    setNeedsTB={setNeedsTB}
                    docCount={docCount}
                    setDocCount={setDocCount}
                    totalFee={totalFee}
                  />
                )}
                {step === 6 && (
                  <StepDeclaration form={form} update={update} errors={errors} />
                )}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  {step > 1 ? (
                    <button onClick={back} className="text-sm text-blue-700 hover:underline flex items-center gap-1">
                      ← Back
                    </button>
                  ) : (
                    <div />
                  )}
                  {step < steps.length ? (
                    <button
                      onClick={next}
                      className="px-6 py-2.5 text-sm font-semibold text-white rounded-sm hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: ukGreen }}
                    >
                      Save and continue
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="px-6 py-2.5 text-sm font-semibold text-white rounded-sm hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: ukRed }}
                    >
                      Submit application
                    </button>
                  )}
                </div>
              </div>

              <InfoBox />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

/* ─── Sub-steps ──────────────────────────────────────────────────────────── */

function StepPersonal({ form, update, errors }: any) {
  return (
    <div>
      <SectionTitle
        title="Personal Details"
        description="Enter your details exactly as they appear on your passport or travel document."
      />
      <div className="grid grid-cols-4 gap-4 mb-0">
        <FieldWrap label="Title" required error={errors.title}>
          <SelectEl value={form.title} onChange={(v) => update("title", v)} error={!!errors.title}>
            <option value="">Select</option>
            {["Mr", "Mrs", "Miss", "Ms", "Dr", "Prof", "Rev"].map((t) => <option key={t}>{t}</option>)}
          </SelectEl>
        </FieldWrap>
      </div>
      <div className="grid grid-cols-2 gap-6 mt-4">
        <FieldWrap label="First name(s)" required hint="Include all forenames" error={errors.firstName}>
          <InputEl value={form.firstName} onChange={(v) => update("firstName", v)} placeholder="e.g. Jane" error={!!errors.firstName} />
        </FieldWrap>
        <FieldWrap label="Last name" required error={errors.lastName}>
          <InputEl value={form.lastName} onChange={(v) => update("lastName", v)} placeholder="e.g. Smith" error={!!errors.lastName} />
        </FieldWrap>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <FieldWrap label="Date of birth" required hint="For example, 27 03 1985" error={errors.dob}>
          <InputEl value={form.dob} onChange={(v) => update("dob", v)} type="date" error={!!errors.dob} />
        </FieldWrap>
        <FieldWrap label="Nationality" required error={errors.nationality}>
          <SelectEl value={form.nationality} onChange={(v) => update("nationality", v)} error={!!errors.nationality}>
            <option value="">Select nationality</option>
            {["Afghan","Albanian","Algerian","American","Bangladeshi","Brazilian","British","Canadian","Chinese","Egyptian","French","German","Ghanaian","Indian","Indonesian","Iranian","Iraqi","Italian","Jordanian","Kenyan","Lebanese","Malaysian","Moroccan","Nigerian","Pakistani","Qatari","Russian","Saudi","South African","Spanish","Sri Lankan","Turkish","Ugandan","Ukrainian","Zimbabwean","Other"].map((n) => <option key={n}>{n}</option>)}
          </SelectEl>
        </FieldWrap>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <FieldWrap label="Email address" required hint="We'll send your confirmation here" error={errors.email}>
          <InputEl value={form.email} onChange={(v) => update("email", v)} type="email" placeholder="you@example.com" error={!!errors.email} />
        </FieldWrap>
        <FieldWrap label="Phone number" required hint="Include country code, e.g. +44 7911 123456" error={errors.phone}>
          <InputEl value={form.phone} onChange={(v) => update("phone", v)} placeholder="+44 7911 123456" error={!!errors.phone} />
        </FieldWrap>
      </div>
      <FieldWrap label="Home address" required error={errors.address}>
        <InputEl value={form.address} onChange={(v) => update("address", v)} placeholder="Street address" error={!!errors.address} />
      </FieldWrap>
      <div className="grid grid-cols-3 gap-6">
        <FieldWrap label="City / Town" required error={errors.city}>
          <InputEl value={form.city} onChange={(v) => update("city", v)} placeholder="City" error={!!errors.city} />
        </FieldWrap>
        <FieldWrap label="Country of residence" required error={errors.country}>
          <InputEl value={form.country} onChange={(v) => update("country", v)} placeholder="Country" error={!!errors.country} />
        </FieldWrap>
        <FieldWrap label="Postcode / ZIP">
          <InputEl value={form.postcode} onChange={(v) => update("postcode", v)} placeholder="Postcode" />
        </FieldWrap>
      </div>
    </div>
  );
}

function StepPassport({ form, update, errors, stayDuration, setStayDuration }: any) {
  return (
    <div>
      <SectionTitle
        title="Passport & Travel Information"
        description="Your passport must be valid for at least 6 months beyond your intended date of departure from the UK."
      />
      <div className="grid grid-cols-2 gap-6">
        <FieldWrap label="Passport number" required hint="As shown on the personal data page" error={errors.passportNumber}>
          <InputEl value={form.passportNumber} onChange={(v) => update("passportNumber", v)} placeholder="e.g. 012345678" error={!!errors.passportNumber} />
        </FieldWrap>
        <FieldWrap label="Passport expiry date" required error={errors.passportExpiry}>
          <InputEl value={form.passportExpiry} onChange={(v) => update("passportExpiry", v)} type="date" error={!!errors.passportExpiry} />
        </FieldWrap>
      </div>
      <FieldWrap label="Intended length of stay" required hint="This affects your visa fee">
        <div className="space-y-2">
          {([["short", "Up to 6 months — £115"], ["long", "Over 6 months (exceptional medical need) — £200"]] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer">
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: stayDuration === val ? ukBlue : "#9ca3af" }}
                onClick={() => setStayDuration(val)}
              >
                {stayDuration === val && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ukBlue }} />}
              </div>
              <span className="text-sm text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </FieldWrap>
      <div className="grid grid-cols-2 gap-6 mt-2">
        <FieldWrap label="Intended date of arrival in the UK" required error={errors.arrivalDate}>
          <InputEl value={form.arrivalDate} onChange={(v) => update("arrivalDate", v)} type="date" error={!!errors.arrivalDate} />
        </FieldWrap>
        <FieldWrap label="Intended date of departure from the UK" required error={errors.departureDate}>
          <InputEl value={form.departureDate} onChange={(v) => update("departureDate", v)} type="date" error={!!errors.departureDate} />
        </FieldWrap>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-700 p-4 rounded-sm mt-2">
        <p className="text-xs font-semibold text-blue-900 mb-1">Immigration Health Surcharge</p>
        <p className="text-xs text-blue-800 leading-relaxed">
          The Immigration Health Surcharge (IHS) does <strong>not</strong> apply to Medical Treatment Visitor visas. You are not required to pay IHS as part of this application. However, you remain responsible for the cost of your medical treatment in the UK unless covered by a bilateral healthcare agreement.
        </p>
      </div>
    </div>
  );
}

function StepMedical({ form, update, errors }: any) {
  return (
    <div>
      <SectionTitle
        title="Medical Information"
        description="Provide details of the treatment you are seeking. All information must match your supporting documentation."
      />
      <FieldWrap label="Purpose of visit" required error={errors.purposeOfVisit}>
        <SelectEl value={form.purposeOfVisit} onChange={(v) => update("purposeOfVisit", v)} error={!!errors.purposeOfVisit}>
          <option value="">Select purpose</option>
          {["Cancer treatment","Cardiac surgery","Orthopaedic surgery","Neurology / Neurosurgery","Fertility treatment","Ophthalmology (eye treatment)","Dental treatment","Mental health treatment","Organ transplant assessment","Rehabilitation","Diagnostic assessment","Other specialist treatment"].map((p) => <option key={p}>{p}</option>)}
        </SelectEl>
      </FieldWrap>
      <div className="grid grid-cols-2 gap-6">
        <FieldWrap label="UK hospital or clinic name" required hint="Full registered name" error={errors.hospitalName}>
          <InputEl value={form.hospitalName} onChange={(v) => update("hospitalName", v)} placeholder="e.g. Royal Marsden Hospital" error={!!errors.hospitalName} />
        </FieldWrap>
        <FieldWrap label="Hospital address" hint="City and postcode is sufficient">
          <InputEl value={form.hospitalAddress} onChange={(v) => update("hospitalAddress", v)} placeholder="e.g. London SW3 6JJ" />
        </FieldWrap>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <FieldWrap label="Treating consultant / specialist" required hint="Full name as on referral letter" error={errors.consultant}>
          <InputEl value={form.consultant} onChange={(v) => update("consultant", v)} placeholder="e.g. Dr Sarah Williams" error={!!errors.consultant} />
        </FieldWrap>
        <FieldWrap label="Consultant's GMC number" hint="General Medical Council registration number">
          <InputEl value={form.consultantGMC} onChange={(v) => update("consultantGMC", v)} placeholder="e.g. 7654321" />
        </FieldWrap>
      </div>
      <FieldWrap label="Description of treatment required" required hint="Brief clinical description of your condition and planned treatment" error={errors.treatmentType}>
        <textarea
          value={form.treatmentType}
          onChange={(e) => update("treatmentType", e.target.value)}
          placeholder="Describe your medical condition and the specific treatment or procedures you require in the UK..."
          rows={4}
          className={`w-full border-2 focus:outline-none px-3 py-2 text-sm text-gray-900 rounded-sm resize-none ${errors.treatmentType ? "border-red-600 bg-red-50" : "border-gray-400 focus:border-blue-700"}`}
        />
      </FieldWrap>
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-sm">
        <p className="text-xs font-semibold text-amber-900 mb-1.5">Required supporting documents</p>
        <ul className="text-xs text-amber-800 list-disc ml-4 space-y-1">
          <li>Letter of referral from UK-registered consultant on official letterhead</li>
          <li>Confirmation of appointment date(s) at the treating institution</li>
          <li>Evidence of funds sufficient to cover all treatment costs</li>
          <li>Medical insurance documentation (where applicable)</li>
          <li>Previous medical records relevant to your condition (if requested)</li>
        </ul>
      </div>
    </div>
  );
}

function StepSponsor({ form, update, errors }: any) {
  return (
    <div>
      <SectionTitle
        title="Sponsor & Financial Support"
        description="Provide details of the person or organisation funding your visit. If self-funded, enter your own details."
      />
      <FieldWrap label="Sponsor's full name" required error={errors.sponsorName}>
        <InputEl value={form.sponsorName} onChange={(v) => update("sponsorName", v)} placeholder="Full name of sponsor" error={!!errors.sponsorName} />
      </FieldWrap>
      <div className="grid grid-cols-2 gap-6">
        <FieldWrap label="Relationship to applicant" required error={errors.sponsorRelation}>
          <SelectEl value={form.sponsorRelation} onChange={(v) => update("sponsorRelation", v)} error={!!errors.sponsorRelation}>
            <option value="">Select relationship</option>
            {["Self (self-funded)","Spouse / Partner","Parent","Sibling","Child","Other family member","Employer","Government / official body","Charitable organisation","NHS / UK health authority","Other"].map((r) => <option key={r}>{r}</option>)}
          </SelectEl>
        </FieldWrap>
        <FieldWrap label="Sponsor's contact number" required error={errors.sponsorContact}>
          <InputEl value={form.sponsorContact} onChange={(v) => update("sponsorContact", v)} placeholder="+1 555 000 0000" error={!!errors.sponsorContact} />
        </FieldWrap>
      </div>
      <FieldWrap label="Sponsor's address" hint="Full address including country">
        <InputEl value={form.sponsorAddress} onChange={(v) => update("sponsorAddress", v)} placeholder="Street, City, Country" />
      </FieldWrap>
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
        <p className="text-xs font-semibold text-gray-700 mb-2">Financial evidence requirements</p>
        <p className="text-xs text-gray-600 leading-relaxed">
          You must demonstrate sufficient funds to cover your medical treatment, accommodation, and return travel. Bank statements for the last <strong>3 months</strong> must be included. For private treatment, a formal cost estimate from the treating institution is also required. Minimum recommended funds: <strong>£2,500</strong> per month of stay (excluding treatment costs).
        </p>
      </div>
    </div>
  );
}

function StepFees({ stayDuration, setStayDuration, needsTB, setNeedsTB, docCount, setDocCount, totalFee }: any) {
  const rows = [
    {
      item: "Medical Treatment Visitor Visa application fee",
      detail: stayDuration === "short" ? "Standard — up to 6 months" : "Extended — over 6 months",
      amount: stayDuration === "short" ? FEES.visaApplication : FEES.visaApplicationLong,
      mandatory: true,
      note: "Paid online at the time of application. Non-refundable.",
    },
    {
      item: "Biometric enrolment",
      detail: "Fingerprints and photograph at Visa Application Centre",
      amount: FEES.biometric,
      mandatory: true,
      note: "Included in the visa application fee. No separate charge.",
    },
    {
      item: "Immigration Health Surcharge (IHS)",
      detail: "N/A — not applicable to Medical Treatment Visitor visas",
      amount: null,
      mandatory: false,
      note: "Visitors do not pay the IHS. You are not enrolled in the NHS under this visa.",
    },
    {
      item: "Tuberculosis (TB) test",
      detail: "Required if applying from certain countries (see list at gov.uk)",
      amount: FEES.tuberculosisTest,
      mandatory: false,
      conditional: true,
      note: "Typical cost at an approved UK Visas & Immigration clinic. Exact price varies.",
      active: needsTB,
    },
    {
      item: "Certified document translation",
      detail: `Per page — for documents not in English or Welsh`,
      amount: FEES.documentTranslation,
      mandatory: false,
      perUnit: true,
      note: "Estimate only. Prices vary by translation service. All translations must be certified.",
      count: docCount,
    },
    {
      item: "Priority visa service",
      detail: "Decision within 5 working days (standard: 3 weeks)",
      amount: 250,
      mandatory: false,
      optional: true,
      note: "Optional. Availability not guaranteed for all nationalities. Applied separately after submission.",
    },
    {
      item: "Super Priority service",
      detail: "Decision by end of next working day",
      amount: 800,
      mandatory: false,
      optional: true,
      note: "Available in limited locations. Applied separately after submission.",
    },
  ];

  return (
    <div>
      <SectionTitle
        title="Visa Fees & Costs"
        description="Review all applicable fees before submitting your application. All fees are set by the Home Office and are correct as of April 2025."
      />

      {/* Stay duration selector */}
      <FieldWrap label="Intended length of stay" hint="This determines your application fee">
        <div className="flex gap-4">
          {([["short", "Up to 6 months (£115)"], ["long", "Over 6 months (£200)"]] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 cursor-pointer"
                style={{ borderColor: stayDuration === val ? ukBlue : "#9ca3af" }}
                onClick={() => setStayDuration(val)}
              >
                {stayDuration === val && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ukBlue }} />}
              </div>
              <span className="text-sm text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </FieldWrap>

      {/* TB test */}
      <FieldWrap label="Do you require a Tuberculosis (TB) test?" hint="Required if applying from a country on the TB testing list. Check gov.uk/tb-test-visa">
        <div className="flex gap-4">
          {([["yes", "Yes — add £115"], ["no", "No"]] as [string, string][]).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <div
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{ borderColor: (val === "yes" ? needsTB : !needsTB) ? ukBlue : "#9ca3af" }}
                onClick={() => setNeedsTB(val === "yes")}
              >
                {(val === "yes" ? needsTB : !needsTB) && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ukBlue }} />}
              </div>
              <span className="text-sm text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </FieldWrap>

      {/* Doc translations */}
      <FieldWrap label="Number of documents requiring certified translation" hint="£65 per page — estimate only">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setDocCount(Math.max(0, docCount - 1))}
            className="w-9 h-9 rounded-sm border-2 border-gray-400 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-blue-700"
          >−</button>
          <span className="text-lg font-bold w-8 text-center text-gray-900">{docCount}</span>
          <button
            onClick={() => setDocCount(docCount + 1)}
            className="w-9 h-9 rounded-sm border-2 border-gray-400 flex items-center justify-center text-lg font-bold text-gray-700 hover:border-blue-700"
          >+</button>
          <span className="text-sm text-gray-500 ml-1">pages</span>
        </div>
      </FieldWrap>

      {/* Fee table */}
      <div className="mt-2 border border-gray-200 rounded-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: ukBlue }}>
              <th className="text-left text-white text-xs font-semibold px-4 py-3">Fee item</th>
              <th className="text-left text-white text-xs font-semibold px-4 py-3">Details</th>
              <th className="text-right text-white text-xs font-semibold px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 text-xs text-gray-900 font-medium align-top">
                  <div>{row.item}</div>
                  {row.mandatory && <span className="inline-block mt-1 text-xs text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: ukRed, fontSize: 10 }}>Mandatory</span>}
                  {row.optional && <span className="inline-block mt-1 text-xs text-white px-1.5 py-0.5 rounded bg-gray-500" style={{ fontSize: 10 }}>Optional</span>}
                  {row.perUnit && <span className="inline-block mt-1 text-xs text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: "#1d70b8", fontSize: 10 }}>Per page</span>}
                  {row.conditional && !row.mandatory && <span className="inline-block mt-1 text-xs text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: "#f47738", fontSize: 10 }}>If required</span>}
                  <div className="text-gray-500 text-xs mt-1 font-normal">{row.note}</div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 align-top">{row.detail}</td>
                <td className="px-4 py-3 text-xs text-right align-top font-bold" style={{ color: row.amount === null ? "#9ca3af" : ukBlue }}>
                  {row.amount === null
                    ? "N/A"
                    : row.amount === 0
                    ? "Included"
                    : row.perUnit
                    ? `£${row.amount} × ${docCount} = £${(row.amount * docCount)}`
                    : `£${row.amount}`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ backgroundColor: "#f0f4ff" }}>
              <td colSpan={2} className="px-4 py-3 text-sm font-bold" style={{ color: ukBlue }}>
                Total payable with this application
              </td>
              <td className="px-4 py-3 text-right text-base font-bold" style={{ color: ukBlue }}>
                £{totalFee}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4 bg-blue-50 border-l-4 border-blue-700 p-4 rounded-sm text-xs text-blue-900">
        <p className="font-semibold mb-1">Payment information</p>
        <p className="leading-relaxed">
          The visa application fee of <strong>£{stayDuration === "short" ? FEES.visaApplication : FEES.visaApplicationLong}</strong> is collected online at the time of submission by Worldpay on behalf of the Home Office. Accepted payment methods: Visa, Mastercard, American Express. Fees are <strong>non-refundable</strong> regardless of the visa decision.
        </p>
      </div>
    </div>
  );
}

function StepDeclaration({ form, update, errors }: any) {
  return (
    <div>
      <SectionTitle
        title="Declaration and Consent"
        description="Read the full declaration carefully. You must agree to both statements to submit your application."
      />
      <div className="bg-gray-50 border border-gray-300 rounded-sm p-5 mb-6 text-xs text-gray-700 leading-relaxed space-y-3 max-h-60 overflow-y-auto">
        <p className="font-bold text-sm text-gray-900">UK Medical Treatment Visitor Visa — Applicant Declaration</p>
        <p>I declare that the information I have provided in this application is true, complete, and accurate to the best of my knowledge. I understand that providing false or misleading information is a criminal offence under the Immigration Act 1971 and the Identity Documents Act 2010 and may result in refusal of this application, cancellation of any visa granted, and/or prosecution.</p>
        <p>I confirm that I intend to seek medical treatment from the named institution in the United Kingdom and that I will comply with all visa conditions, including departing the UK no later than the date specified on my visa unless an extension has been applied for and granted.</p>
        <p>I consent to the Home Office sharing information with the Department of Health and Social Care, NHS England, UK Visas and Immigration, and other relevant public authorities for the purpose of processing this application and monitoring compliance with immigration rules.</p>
        <p>I understand that this visa does not entitle me to free NHS treatment. I accept full financial responsibility for all costs associated with my medical treatment and stay in the United Kingdom unless covered by a valid reciprocal healthcare agreement between the UK and my country of nationality.</p>
        <p>I confirm that I have read and understood the UKVI Privacy Notice available at gov.uk/health-visa-privacy and that I consent to my personal data being processed as described therein in accordance with the UK General Data Protection Regulation (UK GDPR).</p>
      </div>

      <div className={`flex items-start gap-3 cursor-pointer group mb-4 p-3 rounded-sm ${errors.declaration ? "bg-red-50 border border-red-300" : ""}`}
        onClick={() => update("declaration", !form.declaration)}>
        <CheckBox checked={form.declaration} />
        <span className="text-sm text-gray-800 leading-snug">
          I confirm that I have read and understood this declaration and that all information provided is correct and complete. <span className="text-red-600">*</span>
        </span>
      </div>

      <div className={`flex items-start gap-3 cursor-pointer group mb-6 p-3 rounded-sm ${errors.dataConsent ? "bg-red-50 border border-red-300" : ""}`}
        onClick={() => update("dataConsent", !form.dataConsent)}>
        <CheckBox checked={form.dataConsent} />
        <span className="text-sm text-gray-800 leading-snug">
          I consent to the Home Office processing my personal data as described in the Privacy Notice for the purpose of this visa application. <span className="text-red-600">*</span>
        </span>
      </div>

      {/* Review summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-sm p-5">
        <p className="text-sm font-bold text-blue-900 mb-3">Application Summary</p>
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs text-blue-800">
          <div><span className="text-blue-500 block">Applicant</span>{form.title} {form.firstName} {form.lastName || "—"}</div>
          <div><span className="text-blue-500 block">Nationality</span>{form.nationality || "—"}</div>
          <div><span className="text-blue-500 block">Passport</span>{form.passportNumber || "—"}</div>
          <div><span className="text-blue-500 block">Arrival date</span>{form.arrivalDate || "—"}</div>
          <div><span className="text-blue-500 block">Hospital / Clinic</span>{form.hospitalName || "—"}</div>
          <div><span className="text-blue-500 block">Treatment type</span>{form.purposeOfVisit || "—"}</div>
          <div><span className="text-blue-500 block">Sponsor</span>{form.sponsorName || "—"}</div>
          <div><span className="text-blue-500 block">Contact</span>{form.email || "—"}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Shared UI components ───────────────────────────────────────────────── */

function CheckBox({ checked }: { checked: boolean }) {
  return (
    <div
      className="w-5 h-5 border-2 rounded-sm flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors"
      style={{ backgroundColor: checked ? ukBlue : "white", borderColor: checked ? ukBlue : "#6b7280" }}
    >
      {checked && (
        <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      )}
    </div>
  );
}

function FieldWrap({ label, hint, required, error, children }: any) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-900 mb-0.5">
        {label}
        {required && <span className="text-red-600 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {error && <p className="text-xs text-red-600 mb-1 font-medium">{error}</p>}
      {children}
    </div>
  );
}

function InputEl({ value, onChange, placeholder, type = "text", error }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full border-2 focus:outline-none px-3 py-2 text-sm text-gray-900 rounded-sm ${error ? "border-red-600 bg-red-50" : "border-gray-400 focus:border-blue-700"}`}
    />
  );
}

function SelectEl({ value, onChange, error, children }: any) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full border-2 focus:outline-none px-3 py-2 text-sm text-gray-900 rounded-sm bg-white ${error ? "border-red-600 bg-red-50" : "border-gray-400 focus:border-blue-700"}`}
      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M3 6l5 5 5-5' stroke='%23374151' fill='none' stroke-width='2'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 10px center", backgroundSize: 16, paddingRight: 36 }}
    >
      {children}
    </select>
  );
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6 pb-4 border-b-2" style={{ borderColor: ukBlue }}>
      <h2 className="text-lg font-bold" style={{ color: ukBlue }}>{title}</h2>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </div>
  );
}

function InfoBox() {
  return (
    <div className="border-l-4 border-blue-700 pl-4 py-2 text-xs text-gray-700 leading-relaxed mb-8">
      <p className="font-semibold mb-1">Need help?</p>
      <p>
        UKVI contact centre: <strong>+44 (0)300 790 6268</strong> (Mon–Fri, 9am–5pm GMT).{" "}
        Overseas: <strong>+44 203 875 4669</strong>. Textphone: <strong>+44 (0)800 389 8289</strong>.
        Visit <a href="#" className="text-blue-700 underline hover:no-underline">gov.uk/health-visa</a> for full guidance.
      </p>
    </div>
  );
}

function Header() {
  return (
    <header>
      <div style={{ backgroundColor: ukBlue }} className="py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CrownSvg color="white" />
            <div>
              <div className="text-white font-bold text-sm tracking-wide">GOV.UK</div>
              <div className="text-blue-200 text-xs">Home Office</div>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-blue-200 text-xs hover:text-white">Cymraeg</a>
            <a href="#" className="text-blue-200 text-xs hover:text-white">Sign in</a>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: ukRed, height: 4 }} />
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-5xl mx-auto text-sm font-semibold" style={{ color: ukBlue }}>
          UK Visa and Immigration Service
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-100 py-6 mt-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <CrownSvg color={ukBlue} size={24} />
          <span className="font-bold text-sm" style={{ color: ukBlue }}>GOV.UK</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600 mb-3">
          {["Help","Cookies","Contact","Terms and conditions","Privacy notice","Accessibility statement","Welsh (Cymraeg)"].map((l) => (
            <a key={l} href="#" className="hover:underline">{l}</a>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          © Crown copyright — All content is available under the{" "}
          <a href="#" className="underline hover:no-underline">Open Government Licence v3.0</a>
          , except where otherwise stated.
        </p>
      </div>
    </footer>
  );
}

function CrownSvg({ color = "white", size = 36 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size * 0.88} viewBox="0 0 36 32" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M5 28h26v3H5v-3zm0-3h26v1H5v-1zM3 18c0 0 1-1 2-1s3 2 3 2 1-2 3-2 2 1 2 1v-3s-1 1-2 1-2-2-2-2-1 2-2 2-2-1-2-1v3zm0 0v7h30v-7H3zm13-8c0 0-1-4 2-6 3 2 2 6 2 6H16zm-5 3l2-6h10l2 6H11z" />
    </svg>
  );
}
