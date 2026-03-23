import { useState, useEffect, useRef } from "react";

const ukBlue = "#003078";
const ukRed = "#d4351c";
const ukGreen = "#00703c";

const FEES = {
  skilledWorkerShort: 719,
  skilledWorkerLong: 1420,
  healthCareShort: 284,
  healthCareLong: 551,
  ihsPerYear: 1035,
  priority: 500,
  superPriority: 800,
};

const VISA_TYPES = [
  { id: "health-care", label: "Health and Care Worker Visa", description: "For nurses, care workers, doctors, and allied health professionals working for the NHS, social care sector or with a CQC-registered employer.", discount: true },
  { id: "skilled-worker", label: "Skilled Worker Visa", description: "For teachers, engineers, IT professionals, accountants, and other workers in eligible skilled occupations with a licensed UK sponsor.", discount: false },
];

const OCCUPATION_GROUPS = [
  "Care workers and home carers","Senior care workers","Nursing assistants and auxiliary nurses",
  "Registered nurses","Midwives","Community nurses","Operating theatre nurses","Dental nurses",
  "Doctors (general practice)","Hospital doctors and consultants",
  "Allied health professionals (physiotherapy, occupational therapy)","Social workers",
  "Primary school teachers","Secondary school teachers","Special educational needs (SEN) teachers",
  "Further education teachers","Teaching assistants","Engineers (civil, mechanical, electrical)",
  "Software developers and IT professionals","Architects","Accountants and auditors",
  "Construction project managers","Chefs and cooks","Other eligible skilled occupation",
];

/* ─── Main component ──────────────────────────────────────────────────────── */
export default function VisaApplication() {
  // phase: "form" | "payment" | "processing" | "confirmed"
  const [phase, setPhase] = useState<"form" | "payment" | "processing" | "confirmed">("form");
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [visaType, setVisaType] = useState("health-care");
  const [duration, setDuration] = useState<"short" | "long">("short");
  const [wantsPriority, setWantsPriority] = useState<"none" | "priority" | "super">("none");
  const [ihsYears, setIhsYears] = useState(1);

  const isHealthCare = visaType === "health-care";
  const visaFee = isHealthCare
    ? (duration === "short" ? FEES.healthCareShort : FEES.healthCareLong)
    : (duration === "short" ? FEES.skilledWorkerShort : FEES.skilledWorkerLong);
  const priorityFee = wantsPriority === "priority" ? FEES.priority : wantsPriority === "super" ? FEES.superPriority : 0;
  const ihsFee = isHealthCare ? 0 : FEES.ihsPerYear * ihsYears;
  const totalFee = visaFee + priorityFee + ihsFee;

  const [refNumber] = useState("SW-" + Date.now().toString(36).toUpperCase().slice(-8));

  const [form, setForm] = useState({
    title: "", firstName: "", lastName: "", dob: "", nationality: "",
    passportNumber: "", passportExpiry: "", email: "", phone: "",
    address: "", city: "", country: "", postcode: "",
    cosReference: "", sponsorName: "", sponsorLicenceNumber: "",
    jobTitle: "", occupationGroup: "", annualSalary: "", employmentStartDate: "",
    workLocation: "", contractType: "", englishLevel: "", englishEvidence: "",
    qualificationLevel: "", qualificationSubject: "",
    declaration: false, dataConsent: false,
  });

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

  const steps = ["Visa Type","Personal Details","Job & Sponsorship","Passport & Travel","English & Qualifications","Fees & Costs","Declaration"];

  const validateStep = (s: number): boolean => {
    const e: Record<string, string> = {};
    if (s === 2) {
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
    if (s === 3) {
      if (!form.cosReference.trim()) e.cosReference = "Enter your Certificate of Sponsorship reference number";
      if (!form.sponsorName.trim()) e.sponsorName = "Enter your sponsor's name";
      if (!form.jobTitle.trim()) e.jobTitle = "Enter your job title";
      if (!form.occupationGroup) e.occupationGroup = "Select your occupation";
      if (!form.annualSalary.trim()) e.annualSalary = "Enter your annual salary";
      if (!form.employmentStartDate) e.employmentStartDate = "Enter your employment start date";
      if (!form.contractType) e.contractType = "Select your contract type";
    }
    if (s === 4) {
      if (!form.passportNumber.trim()) e.passportNumber = "Enter your passport number";
      if (!form.passportExpiry) e.passportExpiry = "Enter your passport expiry date";
    }
    if (s === 5) {
      if (!form.englishLevel) e.englishLevel = "Select your English language level";
      if (!form.englishEvidence) e.englishEvidence = "Select how you will demonstrate English";
    }
    if (s === 7) {
      if (!form.declaration) e.declaration = "You must confirm the declaration to submit";
      if (!form.dataConsent) e.dataConsent = "You must consent to data processing";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setStep((s) => s + 1);
    }
  };

  const back = () => {
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((s) => s - 1);
  };

  const proceedToPayment = () => {
    if (validateStep(7)) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setPhase("payment");
    }
  };

  const saveApplicationToDatabase = async (paystackRef: string) => {
    try {
      await fetch("/api/visa-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber: refNumber,
          paymentReference: paystackRef,
          visaType,
          title: form.title,
          firstName: form.firstName,
          lastName: form.lastName,
          dateOfBirth: form.dob,
          nationality: form.nationality,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          country: form.country,
          postcode: form.postcode || null,
          passportNumber: form.passportNumber,
          passportExpiry: form.passportExpiry,
          cosReference: form.cosReference,
          sponsorName: form.sponsorName,
          sponsorLicenceNumber: form.sponsorLicenceNumber || null,
          jobTitle: form.jobTitle,
          occupationGroup: form.occupationGroup,
          annualSalary: form.annualSalary,
          employmentStartDate: form.employmentStartDate,
          workLocation: form.workLocation || null,
          contractType: form.contractType,
          englishLevel: form.englishLevel,
          englishEvidence: form.englishEvidence,
          qualificationLevel: form.qualificationLevel || null,
          qualificationSubject: form.qualificationSubject || null,
          visaDuration: duration,
          processingSpeed: wantsPriority,
          ihsYears: isHealthCare ? null : ihsYears,
          totalFeePaid: totalFee,
        }),
      });
    } catch (err) {
      console.error("[visa-app] Failed to save application to database:", err);
    }
  };

  const handlePaymentReceived = (paystackRef: string) => {
    setPhase("processing");
    saveApplicationToDatabase(paystackRef);
  };

  if (phase === "payment") {
    return <PaymentPage
      form={form}
      totalFee={totalFee}
      visaFee={visaFee}
      ihsFee={ihsFee}
      priorityFee={priorityFee}
      isHealthCare={isHealthCare}
      duration={duration}
      wantsPriority={wantsPriority}
      refNumber={refNumber}
      onBack={() => setPhase("form")}
      onPaid={handlePaymentReceived}
    />;
  }

  if (phase === "processing") {
    return <ProcessingPage onDone={() => setPhase("confirmed")} />;
  }

  if (phase === "confirmed") {
    return <ConfirmationPage form={form} refNumber={refNumber} totalFee={totalFee} isHealthCare={isHealthCare} wantsPriority={wantsPriority} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div style={{ backgroundColor: "#1d70b8" }} className="py-2 px-4">
        <div className="max-w-5xl mx-auto">
          <span className="text-white text-xs font-semibold bg-white/20 px-2 py-0.5 rounded mr-2">BETA</span>
          <span className="text-white text-xs">This is a new service — <a href="#" className="underline text-white">your feedback</a> will help us improve it.</span>
        </div>
      </div>
      <main className="flex-1 py-8 md:py-10">
        <div className="max-w-5xl mx-auto px-4">
          <nav className="text-xs text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
            <a href="#" className="text-blue-700 hover:underline">Home</a>
            <span>›</span>
            <a href="#" className="text-blue-700 hover:underline">Visas and immigration</a>
            <span>›</span>
            <a href="#" className="text-blue-700 hover:underline">Work in the UK</a>
            <span>›</span>
            <span className="text-gray-700">Skilled Worker Visa Application</span>
          </nav>

          <div className="flex gap-8">
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
                        <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
                          style={{ backgroundColor: isDone ? ukGreen : isActive ? ukBlue : "#e5e7eb", color: isDone || isActive ? "white" : "#9ca3af" }}>
                          {isDone ? <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg> : num}
                        </div>
                        <span className="text-xs leading-tight" style={{ color: isActive ? ukBlue : isDone ? "#374151" : "#9ca3af", fontWeight: isActive ? 700 : 400 }}>{label}</span>
                      </li>
                    );
                  })}
                  <li className="flex items-start gap-2.5 py-1.5 opacity-60">
                    <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold mt-0.5" style={{ backgroundColor: "#e5e7eb", color: "#9ca3af" }}>8</div>
                    <span className="text-xs leading-tight text-gray-400">Payment</span>
                  </li>
                </ol>

                <div className="mt-8 bg-white border border-gray-200 rounded-sm p-4">
                  <p className="text-xs font-bold text-gray-700 mb-3">Estimated fees</p>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between"><span>Visa fee</span><span className="font-semibold">£{visaFee.toLocaleString()}</span></div>
                    {!isHealthCare && <div className="flex justify-between"><span>IHS ({ihsYears}yr)</span><span className="font-semibold">£{ihsFee.toLocaleString()}</span></div>}
                    {isHealthCare && <div className="flex justify-between text-green-700"><span>IHS</span><span className="font-semibold">Exempt</span></div>}
                    {wantsPriority !== "none" && <div className="flex justify-between"><span>Priority</span><span className="font-semibold">£{priorityFee.toLocaleString()}</span></div>}
                    <div className="border-t border-gray-200 pt-1.5 flex justify-between font-bold text-gray-900">
                      <span>Total</span><span style={{ color: ukBlue }}>£{totalFee.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                {isHealthCare && (
                  <div className="mt-4 bg-green-50 border border-green-200 rounded-sm p-3">
                    <p className="text-xs text-green-800 leading-relaxed"><strong>IHS Exempt</strong> — Health and Care Worker visa holders do not pay the Immigration Health Surcharge.</p>
                  </div>
                )}
              </div>
            </aside>

            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <h1 className="text-2xl font-bold" style={{ color: ukBlue }}>Apply for a UK Work Visa (Sponsorship)</h1>
                <p className="text-sm text-gray-600 mt-1">Step {step} of {steps.length}: <strong>{steps[step - 1]}</strong></p>
              </div>

              {Object.keys(errors).length > 0 && (
                <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6 rounded-sm">
                  <p className="text-sm font-bold text-red-800 mb-2">There is a problem</p>
                  <ul className="space-y-1">
                    {Object.values(errors).map((msg) => (
                      <li key={msg} className="text-sm text-red-700 flex items-start gap-1.5"><span className="mt-0.5 flex-shrink-0">•</span><span>{msg}</span></li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-white border border-gray-200 rounded-sm shadow-sm p-6 md:p-8 mb-6">
                {step === 1 && <StepVisaType visaType={visaType} setVisaType={setVisaType} errors={errors} />}
                {step === 2 && <StepPersonal form={form} update={update} errors={errors} />}
                {step === 3 && <StepSponsorship form={form} update={update} errors={errors} />}
                {step === 4 && <StepPassport form={form} update={update} errors={errors} duration={duration} setDuration={setDuration} />}
                {step === 5 && <StepEnglish form={form} update={update} errors={errors} />}
                {step === 6 && <StepFees isHealthCare={isHealthCare} duration={duration} setDuration={setDuration} visaFee={visaFee} ihsYears={ihsYears} setIhsYears={setIhsYears} ihsFee={ihsFee} wantsPriority={wantsPriority} setWantsPriority={setWantsPriority} priorityFee={priorityFee} totalFee={totalFee} />}
                {step === 7 && <StepDeclaration form={form} update={update} errors={errors} isHealthCare={isHealthCare} />}

                <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                  {step > 1 ? (
                    <button onClick={back} className="text-sm text-blue-700 hover:underline flex items-center gap-1">← Back</button>
                  ) : <div />}
                  {step < steps.length ? (
                    <button onClick={next} className="px-6 py-2.5 text-sm font-semibold text-white rounded-sm hover:opacity-90 transition-opacity" style={{ backgroundColor: ukGreen }}>Save and continue</button>
                  ) : (
                    <button onClick={proceedToPayment} className="px-6 py-2.5 text-sm font-semibold text-white rounded-sm hover:opacity-90 transition-opacity flex items-center gap-2" style={{ backgroundColor: ukGreen }}>
                      Continue to payment
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  )}
                </div>
              </div>

              <div className="border-l-4 border-blue-700 pl-4 py-2 text-xs text-gray-700 leading-relaxed mb-8">
                <p className="font-semibold mb-1">Need help?</p>
                <p>UKVI contact centre: <strong>+44 (0)300 790 6268</strong> (Mon–Fri, 9am–5pm GMT). Overseas: <strong>+44 203 875 4669</strong>. <a href="#" className="text-blue-700 underline hover:no-underline">gov.uk/skilled-worker-visa</a></p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ─── Payment Page ────────────────────────────────────────────────────────── */
function PaymentPage({ form, totalFee, visaFee, ihsFee, priorityFee, isHealthCare, duration, wantsPriority, onBack, onPaid, refNumber }: any) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paypalReady, setPaypalReady] = useState(false);
  const paypalContainerRef = useRef<HTMLDivElement>(null);
  const paypalRendered = useRef(false);

  const publicKey = (import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string) || '';
  const paypalClientId = (import.meta.env.VITE_PAYPAL_CLIENT_ID as string) || '';

  useEffect(() => {
    if (!paypalClientId || paypalRendered.current) return;

    const loadAndRender = () => {
      const paypal = (window as any).paypal;
      if (!paypal || !paypalContainerRef.current) return;
      if (paypalRendered.current) return;
      paypalRendered.current = true;

      paypal.Buttons({
        style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
        createOrder: (_data: unknown, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: totalFee.toFixed(2), currency_code: 'USD' },
              description: 'UK Visa Application Fee',
            }],
          });
        },
        onApprove: (_data: unknown, actions: any) => {
          setLoading(true);
          return actions.order.capture().then((details: any) => {
            const orderID = details.id;
            fetch('/api/paypal/capture-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ orderID }),
            })
              .then((r) => r.json())
              .then((result: any) => {
                if (result.verified) {
                  onPaid('PAYPAL-' + orderID);
                } else {
                  setError('PayPal payment could not be verified. Please contact support.');
                  setLoading(false);
                }
              })
              .catch(() => {
                setError('Network error during PayPal verification. Please contact support.');
                setLoading(false);
              });
          });
        },
        onError: (err: any) => {
          console.error('[paypal] Button error:', err);
          setError('PayPal encountered an error. Please try again or use card payment.');
        },
      }).render(paypalContainerRef.current);

      setPaypalReady(true);
    };

    if ((window as any).paypal) {
      loadAndRender();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD`;
    script.async = true;
    script.onload = loadAndRender;
    script.onerror = () => console.warn('[paypal] Failed to load PayPal SDK');
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [paypalClientId, totalFee, onPaid]);

  const openPaystack = () => {
    if (!publicKey) {
      setError('Payment configuration error: Paystack public key is missing. Please contact support.');
      return;
    }
    const PaystackPop = (window as any).PaystackPop;
    if (!PaystackPop) {
      setError('Payment system unavailable. Please refresh the page and try again.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const paystackConfig: Record<string, unknown> = {
        key: publicKey,
        email: form.email,
        amount: totalFee * 100,
        currency: 'USD',
        ref: refNumber,
        firstname: form.firstName,
        lastname: form.lastName,
        metadata: {
          custom_fields: [
            { display_name: 'Visa Type', variable_name: 'visa_type', value: isHealthCare ? 'Health & Care Worker' : 'Skilled Worker' },
            { display_name: 'Duration', variable_name: 'duration', value: duration === 'short' ? 'Up to 3 years' : 'Over 3 years' },
            { display_name: 'Processing', variable_name: 'processing', value: wantsPriority === 'none' ? 'Standard' : wantsPriority === 'priority' ? 'Priority' : 'Super Priority' },
          ],
        },
        callback: (response: { reference: string }) => {
          void (async () => {
            try {
              const res = await fetch('/api/paystack/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: response.reference }),
              });
              const data = await res.json();
              if (data.verified) {
                onPaid(response.reference);
              } else {
                setError('Payment could not be verified. Please contact support if your card was charged.');
                setLoading(false);
              }
            } catch {
              setError('Network error during payment verification. Please contact support.');
              setLoading(false);
            }
          })();
        },
        onClose: () => {
          setLoading(false);
        },
      };
      const handler = PaystackPop.setup(paystackConfig);
      handler.openIframe();
    } catch (err: any) {
      console.error('[paystack] Failed to open payment popup:', err);
      setError('Could not open payment window: ' + (err?.message || 'Unknown error. Please refresh and try again.'));
      setLoading(false);
    }
  };

  const lineItems = [
    { label: isHealthCare ? 'Health and Care Worker Visa fee' : 'Skilled Worker Visa fee', detail: duration === 'short' ? 'Up to 3 years' : 'Over 3 years', amount: visaFee },
    ...(!isHealthCare ? [{ label: 'Immigration Health Surcharge (IHS)', detail: '£1,035/yr — paid in advance', amount: ihsFee }] : []),
    ...(wantsPriority !== 'none' ? [{ label: wantsPriority === 'priority' ? 'Priority service' : 'Super Priority service', detail: wantsPriority === 'priority' ? 'Decision within 5 working days' : 'Decision by end of next working day', amount: priorityFee }] : []),
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div style={{ backgroundColor: '#1d70b8' }} className="py-2 px-4">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
          <span className="text-white text-xs font-semibold">Secure payment — encrypted connection (TLS 1.3)</span>
        </div>
      </div>
      <main className="flex-1 py-8 md:py-10">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="text-xs text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
            <a href="#" className="text-blue-700 hover:underline">Home</a><span>›</span>
            <a href="#" className="text-blue-700 hover:underline">Work in the UK</a><span>›</span>
            <span className="text-gray-700">Payment</span>
          </nav>

          <h1 className="text-2xl font-bold mb-1" style={{ color: ukBlue }}>Pay your visa application fee</h1>
          <p className="text-sm text-gray-600 mb-8">Payment is processed securely via PayPal. You can pay with your PayPal account or any debit/credit card.</p>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="md:col-span-3">
              <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: ukBlue }}>
                  <p className="text-sm font-bold text-white">Secure payment</p>
                  <p className="text-xs text-blue-200 mt-0.5">Powered by PayPal · 256-bit SSL encrypted</p>
                </div>
                <div className="p-5">
                  <div className="mb-5">
                    <p className="text-sm text-gray-700 mb-1"><span className="font-semibold">Applicant:</span> {form.title} {form.firstName} {form.lastName}</p>
                    <p className="text-sm text-gray-700"><span className="font-semibold">Email:</span> {form.email}</p>
                  </div>

                  <div className="border border-gray-100 rounded-sm p-4 mb-5 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2 font-semibold uppercase tracking-wide">Total amount due</p>
                    <p className="text-3xl font-bold" style={{ color: ukBlue }}>£{totalFee.toLocaleString()}</p>
                    <p className="text-xs text-gray-500 mt-1">UK visa application fee (non-refundable)</p>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-sm text-xs text-red-700 flex items-start gap-2">
                      <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                      {error}
                    </div>
                  )}

                  {/* ── Pay with PayPal ── */}
                  <div className="border border-[#0070ba] rounded-sm p-4">
                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-3 flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-[#0070ba]" viewBox="0 0 24 24" fill="currentColor"><path d="M20.067 8.478c.492.88.556 2.014.3 3.327-.74 3.806-3.276 5.12-6.514 5.12h-.5a.805.805 0 0 0-.794.68l-.04.22-.63 3.993-.032.17a.804.804 0 0 1-.794.679H8.93a.483.483 0 0 1-.477-.558L9.053 19h1.48l.394-2.656.025-.137a.804.804 0 0 1 .793-.679h.5c3.236 0 5.772-1.314 6.512-5.12.31-1.583.15-2.907-.69-3.93z"/><path d="M18.124 7.527c-.24-.698-.637-1.29-1.169-1.756-.858-.742-2.114-1.102-3.701-1.102h-4.85a.808.808 0 0 0-.797.68L5.836 16.54a.484.484 0 0 0 .478.559h3.139l.788-5.002-.025.155a.808.808 0 0 1 .797-.68h1.66c3.257 0 5.807-1.324 6.553-5.152.022-.114.041-.226.057-.336-.209-.113-.43-.215-.659-.557z"/></svg>
                      Pay with PayPal
                    </p>
                    {paypalClientId ? (
                      <div
                        ref={paypalContainerRef}
                        className={!paypalReady ? 'min-h-[50px] bg-[#ffc439] rounded flex items-center justify-center' : ''}
                      >
                        {!paypalReady && (
                          <div className="flex items-center gap-2 py-2">
                            <svg className="w-4 h-4 animate-spin text-[#003087]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity={0.3} strokeWidth={3} /><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth={3} strokeLinecap="round" /></svg>
                            <span className="text-xs font-bold text-[#003087]">Loading PayPal...</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="min-h-[50px] bg-[#ffc439] rounded flex items-center justify-center">
                        <span className="text-xs font-bold text-[#003087]">PayPal — pay with your account or card</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-2 text-center">Pay securely with your PayPal account or card</p>
                  </div>

                  <p className="mt-4 text-center text-xs text-gray-400">
                    By paying you confirm your application is complete and correct. Fees are non-refundable.
                  </p>
                </div>
              </div>

              <button
                onClick={onBack}
                disabled={loading}
                className="mt-4 text-xs text-blue-700 hover:underline flex items-center gap-1 disabled:opacity-50"
              >
                ← Back to declaration
              </button>
            </div>

            <div className="md:col-span-2">
              <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100" style={{ backgroundColor: ukBlue }}>
                  <p className="text-sm font-bold text-white">Payment summary</p>
                  <p className="text-xs text-blue-200 mt-0.5">Application: {form.firstName} {form.lastName}</p>
                </div>
                <div className="p-5">
                  <div className="space-y-3 mb-4">
                    {lineItems.map((item, i) => (
                      <div key={i} className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.detail}</p>
                        </div>
                        <span className="text-sm font-bold flex-shrink-0" style={{ color: ukBlue }}>£{item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    {isHealthCare && (
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <p className="text-xs font-semibold text-green-700">IHS — Exempt</p>
                          <p className="text-xs text-gray-500">Health & Care Worker exemption</p>
                        </div>
                        <span className="text-sm font-bold text-green-700">£0</span>
                      </div>
                    )}
                  </div>
                  <div className="border-t-2 border-gray-200 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-900">Total</span>
                      <span className="text-xl font-bold" style={{ color: ukBlue }}>£{totalFee.toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Including VAT where applicable</p>
                  </div>

                  <div className="mt-5 space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
                    <p><span className="font-semibold text-gray-800">Applicant:</span> {form.title} {form.firstName} {form.lastName}</p>
                    <p><span className="font-semibold text-gray-800">Sponsor:</span> {form.sponsorName || '—'}</p>
                    <p><span className="font-semibold text-gray-800">CoS reference:</span> {form.cosReference || '—'}</p>
                    <p><span className="font-semibold text-gray-800">Visa type:</span> {isHealthCare ? 'Health & Care Worker' : 'Skilled Worker'}</p>
                    <p><span className="font-semibold text-gray-800">Ref:</span> {refNumber}</p>
                  </div>

                  <div className="mt-4 bg-amber-50 border border-amber-200 rounded-sm p-3 text-xs text-amber-900">
                    <strong>Non-refundable:</strong> The visa application fee cannot be refunded if your application is refused or withdrawn.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ─── Processing Page ─────────────────────────────────────────────────────── */
function ProcessingPage({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("Verifying payment...");
  const doneRef = useRef(false);

  useEffect(() => {
    const stages = [
      { at: 300, text: "Confirming payment with PayPal..." },
      { at: 1200, text: "Recording payment with Home Office..." },
      { at: 2200, text: "Generating your reference number..." },
      { at: 3000, text: "Sending confirmation email..." },
      { at: 3600, text: "Almost done..." },
    ];
    stages.forEach(({ at, text }) => setTimeout(() => setStatusText(text), at));

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 70);

    const timer = setTimeout(() => {
      if (!doneRef.current) { doneRef.current = true; onDone(); }
    }, 3800);

    return () => { clearInterval(interval); clearTimeout(timer); };
  }, [onDone]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-20 px-4">
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm max-w-md w-full p-10 text-center">
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <svg className="w-16 h-16 animate-spin" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="6" />
              <path d="M32 4a28 28 0 0 1 28 28" stroke={ukBlue} strokeWidth="6" strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke={ukBlue} strokeWidth={2.5}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-bold mb-2" style={{ color: ukBlue }}>Processing your payment</h2>
          <p className="text-sm text-gray-500 mb-6 h-5 transition-all">{statusText}</p>
          <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
            <div
              className="h-2 rounded-full transition-all duration-75"
              style={{ width: `${progress}%`, backgroundColor: ukGreen }}
            />
          </div>
          <p className="text-xs text-gray-400">Please do not close this page or press Back.</p>
          <p className="text-xs text-gray-400 mt-1">Secured by <strong>PayPal</strong> · TLS 1.3 encrypted</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ─── Confirmation Page ───────────────────────────────────────────────────── */
function ConfirmationPage({ form, refNumber, totalFee, isHealthCare, wantsPriority }: any) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">

          <div className="bg-white border border-gray-200 shadow-sm rounded-sm overflow-hidden mb-6">
            {/* Green success banner */}
            <div style={{ backgroundColor: ukGreen }} className="px-8 md:px-10 py-7">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white bg-opacity-20 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">Application received — payment confirmed</h2>
                  <p className="text-green-100 text-sm mt-0.5">Your {isHealthCare ? "Health and Care Worker" : "Skilled Worker"} Visa application has been successfully submitted and your payment processed.</p>
                </div>
              </div>
            </div>

            <div className="p-8 md:p-10">
              {/* What to expect next — prominent notice */}
              {(() => {
                const now = new Date();
                const in3 = new Date(now); in3.setDate(now.getDate() + 21);
                const in4 = new Date(now); in4.setDate(now.getDate() + 28);
                const fmt = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
                return (
                  <div className="bg-blue-50 border-l-4 border-blue-700 rounded-sm p-5 mb-7">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: ukBlue }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.38 2 2 0 0 1 3.58 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.54A16 16 0 0 0 12 12.63a16 16 0 0 0 4.09.38l-.38-.38" /></svg>
                      <div>
                        <p className="font-bold text-sm mb-1" style={{ color: ukBlue }}>You will be contacted by email within 3 to 4 weeks</p>
                        <p className="text-sm text-blue-900 leading-relaxed">
                          Our processing team will send full instructions on your next steps to <strong>{form.email}</strong> between <strong>{fmt(in3)}</strong> and <strong>{fmt(in4)}</strong>. Please ensure you check your inbox, including your spam or junk folder.
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Payment receipt */}
              <div className="bg-gray-50 border border-gray-200 rounded-sm p-5 mb-7">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Payment receipt</p>
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-gray-500 mb-0.5">Application reference</p><p className="font-mono font-bold text-xl" style={{ color: ukBlue }}>{refNumber}</p></div>
                  <div><p className="text-xs text-gray-500 mb-0.5">Payment reference</p><p className="font-mono font-semibold text-gray-800">PP-{refNumber.replace("SW-","").replace("HC-","")}</p></div>
                  <div><p className="text-xs text-gray-500 mb-0.5">Date & time</p><p className="font-semibold text-gray-800 text-sm">{new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })} at {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} GMT</p></div>
                  <div><p className="text-xs text-gray-500 mb-0.5">Amount charged</p><p className="font-bold text-lg" style={{ color: ukGreen }}>£{totalFee.toLocaleString()}</p></div>
                  <div><p className="text-xs text-gray-500 mb-0.5">Applicant</p><p className="font-semibold text-gray-800 text-sm">{form.title} {form.firstName} {form.lastName}</p></div>
                  <div><p className="text-xs text-gray-500 mb-0.5">Sponsor / employer</p><p className="font-semibold text-gray-800 text-sm">{form.sponsorName || "—"}</p></div>
                  <div><p className="text-xs text-gray-500 mb-0.5">Job title</p><p className="font-semibold text-gray-800 text-sm">{form.jobTitle || "—"}</p></div>
                  <div><p className="text-xs text-gray-500 mb-0.5">CoS reference</p><p className="font-mono font-semibold text-gray-800 text-sm">{form.cosReference || "—"}</p></div>
                </div>
              </div>

              {/* What happens next — timeline */}
              <p className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">What happens next</p>
              <div className="relative mb-7">
                <div className="absolute left-3.5 top-7 bottom-7 w-px bg-gray-200" />
                <div className="space-y-5">
                  {[
                    {
                      icon: <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                      title: "Confirmation email sent",
                      timing: "Within 2 working hours",
                      desc: `A full payment receipt and application confirmation has been sent to ${form.email}. Please quote reference ${refNumber} in all future correspondence with us.`,
                    },
                    {
                      icon: <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
                      title: "Next steps guidance by email",
                      timing: "Within 3 to 4 weeks",
                      desc: "Our team will email you with detailed instructions covering your biometric appointment booking, required documents, and everything you need to proceed with your visa.",
                    },
                    {
                      icon: <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
                      title: "Biometric appointment",
                      timing: "Arranged after guidance email",
                      desc: "You will attend your nearest UK Visa Application Centre (VAC) to have your fingerprints and photograph taken. Full details will be provided in your guidance email.",
                    },
                    {
                      icon: <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
                      title: "Visa decision",
                      timing: wantsPriority === "super" ? "By end of next working day after biometrics" : wantsPriority === "priority" ? "Within 5 working days of biometrics" : "Within 3 weeks of biometrics",
                      desc: "Once a decision has been made, you will be notified by email. If granted, your Biometric Residence Permit (BRP) will be dispatched to your nominated address.",
                    },
                  ].map(({ icon, title, timing, desc }, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center z-10" style={{ backgroundColor: ukBlue }}>{icon}</div>
                      <div className="flex-1 pb-1">
                        <div className="flex flex-wrap items-baseline gap-2 mb-1">
                          <p className="font-semibold text-gray-900 text-sm">{title}</p>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">{timing}</span>
                        </div>
                        <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Important notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-sm p-4 text-xs text-amber-900 mb-6 leading-relaxed">
                <p className="font-bold mb-1">Important — please read carefully</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>Your CoS reference <strong>{form.cosReference || "—"}</strong> must match your visa application exactly. Discrepancies may delay or invalidate your application.</li>
                  <li>Do <strong>not</strong> travel to the UK or begin employment before your visa has been formally granted.</li>
                  <li>Keep your application reference <strong>{refNumber}</strong> safe — you will need it for all future correspondence.</li>
                  <li>If you do not hear from us within 4 weeks, please check your spam folder before contacting support.</li>
                </ul>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => window.print()} className="px-5 py-2.5 text-sm font-semibold border-2 rounded-sm hover:bg-gray-50 transition-colors flex items-center gap-2" style={{ borderColor: ukBlue, color: ukBlue }}>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  Print this confirmation
                </button>
              </div>

              <p className="mt-6 text-xs text-gray-400 text-center leading-relaxed">
                This is an automated confirmation. For assistance, please email <strong>support@ukvisaapplication.com</strong> quoting your reference <strong>{refNumber}</strong>.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ─── Card badge ──────────────────────────────────────────────────────────── */
function CardBadge({ type, active, small }: { type: string; active: boolean; small?: boolean }) {
  const size = small ? "h-5 px-1.5" : "h-6 px-2";
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    visa:       { bg: "#1a1f71", text: "white",   label: "VISA" },
    mastercard: { bg: "#eb001b", text: "white",   label: "MC" },
    amex:       { bg: "#007bc1", text: "white",   label: "AMEX" },
  };
  const c = configs[type];
  return (
    <div className={`${size} rounded flex items-center justify-center font-bold text-xs transition-opacity ${active ? "opacity-100" : "opacity-25"}`} style={{ backgroundColor: c.bg, color: c.text }}>
      {c.label}
    </div>
  );
}

function PayField({ label, hint, error, children }: any) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-900 mb-0.5">{label}</label>
      {hint && <p className="text-xs text-gray-500 mb-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mb-1 font-medium">{error}</p>}
      {children}
    </div>
  );
}

/* ─── Steps ───────────────────────────────────────────────────────────────── */

function StepVisaType({ visaType, setVisaType, errors }: any) {
  return (
    <div>
      <SectionTitle title="Select Your Visa Type" description="You must have a job offer from a UK employer who holds a valid Home Office Sponsor Licence before applying." />
      <div className="bg-blue-50 border-l-4 border-blue-700 p-4 rounded-sm mb-6">
        <p className="text-xs font-semibold text-blue-900 mb-1">Points-based system</p>
        <p className="text-xs text-blue-800 leading-relaxed">To qualify you must score at least <strong>70 points</strong>. You automatically get 50 points for having a job offer from a licensed sponsor at the required skill level and salary threshold. The remaining 20 points come from salary, English language, and shortage occupation.</p>
      </div>
      <FieldWrap label="Which visa are you applying for?" required error={errors.visaType}>
        <div className="space-y-4 mt-1">
          {VISA_TYPES.map((vt) => (
            <label key={vt.id} className={`block border-2 rounded-sm p-4 cursor-pointer transition-colors ${visaType === vt.id ? "border-blue-700 bg-blue-50" : "border-gray-300 hover:border-gray-400"}`} onClick={() => setVisaType(vt.id)}>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5" style={{ borderColor: visaType === vt.id ? "#003078" : "#9ca3af" }}>
                  {visaType === vt.id && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#003078" }} />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-gray-900">{vt.label}</span>
                    {vt.discount && <span className="text-xs text-white px-2 py-0.5 rounded" style={{ backgroundColor: ukGreen }}>IHS Exempt · Reduced fee</span>}
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{vt.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </FieldWrap>
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-sm p-5">
        <p className="text-xs font-semibold text-gray-800 mb-3">Who is eligible to apply?</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
          <div>
            <p className="font-semibold text-gray-800 mb-1.5">Health and Care Worker Visa</p>
            <ul className="space-y-1 list-disc ml-4">
              <li>Registered nurses and midwives</li><li>Care workers and senior care workers</li>
              <li>Doctors and dentists</li><li>Allied health professionals</li><li>Social workers</li>
              <li>Must work for NHS, social care, or CQC-regulated employer</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold text-gray-800 mb-1.5">Skilled Worker Visa</p>
            <ul className="space-y-1 list-disc ml-4">
              <li>Teachers (primary, secondary, SEN, FE)</li><li>Engineers and architects</li>
              <li>IT and software professionals</li><li>Accountants and finance professionals</li>
              <li>Chefs (skilled level)</li><li>Many other RQF Level 3+ occupations</li>
            </ul>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-3">Minimum salary: <strong>£26,200/yr</strong> (or the going rate for your occupation, whichever is higher). New entrant rate: <strong>£20,960</strong>.</p>
      </div>
    </div>
  );
}

function StepPersonal({ form, update, errors }: any) {
  return (
    <div>
      <SectionTitle title="Personal Details" description="Enter your details exactly as they appear on your passport or travel document." />
      <div className="grid grid-cols-4 gap-4">
        <FieldWrap label="Title" required error={errors.title}>
          <SelectEl value={form.title} onChange={(v: string) => update("title", v)} error={!!errors.title}>
            <option value="">Select</option>
            {["Mr","Mrs","Miss","Ms","Dr","Prof","Rev"].map((t) => <option key={t}>{t}</option>)}
          </SelectEl>
        </FieldWrap>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
        <FieldWrap label="First name(s)" required hint="Include all forenames as shown on passport" error={errors.firstName}>
          <InputEl value={form.firstName} onChange={(v: string) => update("firstName", v)} placeholder="e.g. Amara" error={!!errors.firstName} />
        </FieldWrap>
        <FieldWrap label="Last name" required error={errors.lastName}>
          <InputEl value={form.lastName} onChange={(v: string) => update("lastName", v)} placeholder="e.g. Okafor" error={!!errors.lastName} />
        </FieldWrap>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrap label="Date of birth" required hint="For example, 27 03 1990" error={errors.dob}>
          <InputEl value={form.dob} onChange={(v: string) => update("dob", v)} type="date" error={!!errors.dob} />
        </FieldWrap>
        <FieldWrap label="Nationality" required error={errors.nationality}>
          <SelectEl value={form.nationality} onChange={(v: string) => update("nationality", v)} error={!!errors.nationality}>
            <option value="">Select nationality</option>
            {["Afghan","Albanian","Algerian","American","Bangladeshi","Brazilian","British","Canadian","Chinese","Egyptian","French","German","Ghanaian","Indian","Indonesian","Iranian","Iraqi","Italian","Jamaican","Jordanian","Kenyan","Lebanese","Malaysian","Moroccan","Nigerian","Pakistani","Philippine","Qatari","Russian","Saudi","Sierra Leonean","South African","Spanish","Sri Lankan","Sudanese","Turkish","Ugandan","Ukrainian","Zimbabwean","Other"].map((n) => <option key={n}>{n}</option>)}
          </SelectEl>
        </FieldWrap>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrap label="Email address" required hint="We'll send your confirmation here" error={errors.email}>
          <InputEl value={form.email} onChange={(v: string) => update("email", v)} type="email" placeholder="you@example.com" error={!!errors.email} />
        </FieldWrap>
        <FieldWrap label="Phone number" required hint="Include country code, e.g. +234 80 1234 5678" error={errors.phone}>
          <InputEl value={form.phone} onChange={(v: string) => update("phone", v)} placeholder="+234 80 1234 5678" error={!!errors.phone} />
        </FieldWrap>
      </div>
      <FieldWrap label="Home address" required hint="Your current address outside the UK" error={errors.address}>
        <InputEl value={form.address} onChange={(v: string) => update("address", v)} placeholder="Street address" error={!!errors.address} />
      </FieldWrap>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FieldWrap label="City / Town" required error={errors.city}>
          <InputEl value={form.city} onChange={(v: string) => update("city", v)} placeholder="City" error={!!errors.city} />
        </FieldWrap>
        <FieldWrap label="Country of residence" required error={errors.country}>
          <InputEl value={form.country} onChange={(v: string) => update("country", v)} placeholder="Country" error={!!errors.country} />
        </FieldWrap>
        <FieldWrap label="Postcode / ZIP">
          <InputEl value={form.postcode} onChange={(v: string) => update("postcode", v)} placeholder="Postcode" />
        </FieldWrap>
      </div>
    </div>
  );
}

function StepSponsorship({ form, update, errors }: any) {
  return (
    <div>
      <SectionTitle title="Job Offer & Sponsorship Details" description="Your employer must be a UK Visas and Immigration licensed sponsor. You must have received a Certificate of Sponsorship (CoS) before applying." />
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-sm mb-6">
        <p className="text-xs font-semibold text-amber-900 mb-1">Certificate of Sponsorship (CoS) required</p>
        <p className="text-xs text-amber-800 leading-relaxed">Your employer must issue you a CoS reference number before you apply. The CoS confirms your job offer, salary, start date, and occupation code.</p>
      </div>
      <FieldWrap label="Certificate of Sponsorship (CoS) reference number" required hint="Your employer provides this — format: W1234567X" error={errors.cosReference}>
        <InputEl value={form.cosReference} onChange={(v: string) => update("cosReference", v)} placeholder="e.g. W1234567X" error={!!errors.cosReference} />
      </FieldWrap>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrap label="Sponsor (employer) name" required hint="Full registered name of your UK employer" error={errors.sponsorName}>
          <InputEl value={form.sponsorName} onChange={(v: string) => update("sponsorName", v)} placeholder="e.g. Sunrise Care Homes Ltd" error={!!errors.sponsorName} />
        </FieldWrap>
        <FieldWrap label="Sponsor licence number" hint="Found on your CoS document">
          <InputEl value={form.sponsorLicenceNumber} onChange={(v: string) => update("sponsorLicenceNumber", v)} placeholder="e.g. 1234567/A/001/A1234" />
        </FieldWrap>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrap label="Job title" required hint="Exactly as stated on your CoS" error={errors.jobTitle}>
          <InputEl value={form.jobTitle} onChange={(v: string) => update("jobTitle", v)} placeholder="e.g. Care Worker" error={!!errors.jobTitle} />
        </FieldWrap>
        <FieldWrap label="Occupation / role" required error={errors.occupationGroup}>
          <SelectEl value={form.occupationGroup} onChange={(v: string) => update("occupationGroup", v)} error={!!errors.occupationGroup}>
            <option value="">Select your occupation</option>
            {OCCUPATION_GROUPS.map((o) => <option key={o}>{o}</option>)}
          </SelectEl>
        </FieldWrap>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrap label="Annual salary (before tax)" required hint="Must meet the minimum threshold for your role" error={errors.annualSalary}>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">£</span>
            <input value={form.annualSalary} onChange={(e) => update("annualSalary", e.target.value)} placeholder="e.g. 28000" type="number"
              className={`w-full border-2 focus:outline-none pl-7 pr-3 py-2 text-sm text-gray-900 rounded-sm ${errors.annualSalary ? "border-red-600 bg-red-50" : "border-gray-400 focus:border-blue-700"}`} />
          </div>
        </FieldWrap>
        <FieldWrap label="Employment start date" required hint="As stated on your CoS" error={errors.employmentStartDate}>
          <InputEl value={form.employmentStartDate} onChange={(v: string) => update("employmentStartDate", v)} type="date" error={!!errors.employmentStartDate} />
        </FieldWrap>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrap label="Contract type" required error={errors.contractType}>
          <SelectEl value={form.contractType} onChange={(v: string) => update("contractType", v)} error={!!errors.contractType}>
            <option value="">Select contract type</option>
            <option>Permanent (full-time)</option><option>Permanent (part-time)</option>
            <option>Fixed-term contract</option><option>Bank / agency staff</option>
          </SelectEl>
        </FieldWrap>
        <FieldWrap label="Work location" hint="City or region in the UK">
          <InputEl value={form.workLocation} onChange={(v: string) => update("workLocation", v)} placeholder="e.g. Birmingham, West Midlands" />
        </FieldWrap>
      </div>
      <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm text-xs text-gray-700">
        <p className="font-semibold mb-2">Minimum salary thresholds (2024/2025)</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
          {[["Care workers","£23,200/yr"],["Nurses (Registered)","£29,970/yr"],["Teachers","£31,350/yr"],["Engineers","£26,200/yr"],["IT professionals","£26,200/yr"],["General threshold","£26,200/yr"]].map(([r, s]) => (
            <div key={r} className="flex justify-between py-1 border-b border-gray-200 last:border-0">
              <span className="text-gray-600">{r}</span><span className="font-semibold text-gray-900">{s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepPassport({ form, update, errors, duration, setDuration }: any) {
  return (
    <div>
      <SectionTitle title="Passport & Travel" description="Your passport must be valid for the full duration of your visa." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrap label="Passport number" required hint="As shown on the personal data page" error={errors.passportNumber}>
          <InputEl value={form.passportNumber} onChange={(v: string) => update("passportNumber", v)} placeholder="e.g. A01234567" error={!!errors.passportNumber} />
        </FieldWrap>
        <FieldWrap label="Passport expiry date" required error={errors.passportExpiry}>
          <InputEl value={form.passportExpiry} onChange={(v: string) => update("passportExpiry", v)} type="date" error={!!errors.passportExpiry} />
        </FieldWrap>
      </div>
      <FieldWrap label="Length of visa required" required hint="This determines your application fee and IHS amount">
        <div className="space-y-2 mt-1">
          {([["short","Up to 3 years"],["long","More than 3 years (up to 5 years)"]] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: duration === val ? "#003078" : "#9ca3af" }} onClick={() => setDuration(val)}>
                {duration === val && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#003078" }} />}
              </div>
              <span className="text-sm text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </FieldWrap>
      <div className="bg-blue-50 border-l-4 border-blue-700 p-4 rounded-sm mt-2">
        <p className="text-xs font-semibold text-blue-900 mb-1">TB test requirement</p>
        <p className="text-xs text-blue-800 leading-relaxed">If applying from Nigeria, Ghana, India, Pakistan, Philippines, or other listed countries, you must provide a TB certificate from an approved clinic. Visit <strong>gov.uk/tb-test-visa</strong>.</p>
      </div>
    </div>
  );
}

function StepEnglish({ form, update, errors }: any) {
  return (
    <div>
      <SectionTitle title="English Language & Qualifications" description="You must demonstrate English at CEFR level B1 or above." />
      <FieldWrap label="English language level" required error={errors.englishLevel}>
        <SelectEl value={form.englishLevel} onChange={(v: string) => update("englishLevel", v)} error={!!errors.englishLevel}>
          <option value="">Select level</option>
          <option>B1 — Intermediate (meets minimum requirement)</option>
          <option>B2 — Upper Intermediate</option><option>C1 — Advanced</option><option>C2 — Proficiency</option>
        </SelectEl>
      </FieldWrap>
      <FieldWrap label="How will you demonstrate English language ability?" required error={errors.englishEvidence}>
        <SelectEl value={form.englishEvidence} onChange={(v: string) => update("englishEvidence", v)} error={!!errors.englishEvidence}>
          <option value="">Select evidence type</option>
          <option>IELTS (Academic or UKVI) — score of 5.5+ overall</option>
          <option>TOEFL iBT — score of 59+</option>
          <option>Pearson Test of English (PTE) Academic</option>
          <option>Cambridge English Qualifications (B2 First or above)</option>
          <option>Degree taught in English (UK or majority English-speaking country)</option>
          <option>Nationality exemption (e.g. Australian, Canadian, American, Irish)</option>
          <option>GCSE / A-Level English from UK school</option>
        </SelectEl>
      </FieldWrap>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldWrap label="Highest qualification level" hint="Relevant to your sponsorship role">
          <SelectEl value={form.qualificationLevel} onChange={(v: string) => update("qualificationLevel", v)}>
            <option value="">Select level</option>
            <option>Secondary school / O-Level / WAEC</option><option>A-Level / HNC</option>
            <option>Higher National Diploma (HND)</option><option>Bachelor's degree (BSc / BA / BNSc)</option>
            <option>Postgraduate Certificate / Diploma</option><option>Master's degree (MSc / MA / MEd)</option>
            <option>Doctorate (PhD / MD)</option><option>Professional qualification (NMC / GTC / GMC registered)</option>
          </SelectEl>
        </FieldWrap>
        <FieldWrap label="Subject / field of study" hint="e.g. Nursing, Education, Civil Engineering">
          <InputEl value={form.qualificationSubject} onChange={(v: string) => update("qualificationSubject", v)} placeholder="e.g. Adult Nursing" />
        </FieldWrap>
      </div>
      <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-sm">
        <p className="text-xs font-semibold text-amber-900 mb-1.5">Professional registration requirements</p>
        <ul className="text-xs text-amber-800 list-disc ml-4 space-y-1">
          <li><strong>Nurses & Midwives:</strong> NMC registration required before entering the UK</li>
          <li><strong>Doctors:</strong> GMC registration required</li>
          <li><strong>Teachers:</strong> Qualified Teacher Status (QTS) for most roles in England</li>
          <li><strong>Social Workers:</strong> Social Work England registration required</li>
          <li><strong>Care Workers:</strong> No mandatory registration but must meet CQC standards</li>
        </ul>
      </div>
    </div>
  );
}

function StepFees({ isHealthCare, duration, setDuration, visaFee, ihsYears, setIhsYears, ihsFee, wantsPriority, setWantsPriority, priorityFee, totalFee }: any) {
  const rows = [
    { item: isHealthCare ? "Health and Care Worker Visa fee" : "Skilled Worker Visa fee", detail: duration === "short" ? "Up to 3 years" : "More than 3 years", amount: visaFee, badge: "Mandatory", badgeColor: "#d4351c", note: "Non-refundable. Paid online via PayPal at submission." },
    { item: "Biometric enrolment", detail: "Fingerprints and photo at Visa Application Centre", amount: 0, display: "Included", badge: "Mandatory", badgeColor: "#d4351c", note: "Included in visa fee." },
    { item: "Immigration Health Surcharge (IHS)", detail: isHealthCare ? "Exempt — H&C Worker visa holders do not pay IHS" : `£1,035/yr × ${ihsYears} yr`, amount: isHealthCare ? null : ihsFee, display: isHealthCare ? "EXEMPT" : undefined, badge: isHealthCare ? "Exempt" : "Mandatory", badgeColor: isHealthCare ? "#00703c" : "#d4351c", note: isHealthCare ? "H&C Worker visa holders and dependants are fully exempt." : "Gives access to the NHS. Paid upfront for the visa duration." },
    { item: "Priority service", detail: "Decision within 5 working days", amount: 500, display: wantsPriority === "priority" ? "£500" : "Not selected", badge: "Optional", badgeColor: "#6b7280", note: "Add below." },
    { item: "Super Priority service", detail: "Decision by end of next working day", amount: 800, display: wantsPriority === "super" ? "£800" : "Not selected", badge: "Optional", badgeColor: "#6b7280", note: "Limited locations. Add below." },
  ];

  return (
    <div>
      <SectionTitle title="Fees & Costs" description="All fees are set by the Home Office and are correct as of April 2025. Fees are non-refundable." />
      <FieldWrap label="Length of visa" required hint="Determines your application fee and IHS">
        <div className="flex flex-wrap gap-4 mt-1">
          {([["short","Up to 3 years"],["long","Over 3 years"]] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-2 cursor-pointer">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: duration === val ? "#003078" : "#9ca3af" }} onClick={() => setDuration(val)}>
                {duration === val && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#003078" }} />}
              </div>
              <span className="text-sm text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </FieldWrap>
      {!isHealthCare && (
        <FieldWrap label="IHS years" hint={`£1,035 × ${ihsYears} = £${(1035 * ihsYears).toLocaleString()}`}>
          <div className="flex items-center gap-3 mt-1">
            <button onClick={() => setIhsYears(Math.max(1, ihsYears - 1))} className="w-9 h-9 rounded-sm border-2 border-gray-400 flex items-center justify-center text-lg font-bold hover:border-blue-700 transition-colors">−</button>
            <span className="text-lg font-bold w-8 text-center text-gray-900">{ihsYears}</span>
            <button onClick={() => setIhsYears(Math.min(5, ihsYears + 1))} className="w-9 h-9 rounded-sm border-2 border-gray-400 flex items-center justify-center text-lg font-bold hover:border-blue-700 transition-colors">+</button>
            <span className="text-sm text-gray-500 ml-1">year{ihsYears !== 1 ? "s" : ""} = £{(1035 * ihsYears).toLocaleString()}</span>
          </div>
        </FieldWrap>
      )}
      {isHealthCare && (
        <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded-sm mb-5">
          <p className="text-xs font-semibold text-green-900 mb-1">IHS exemption applies</p>
          <p className="text-xs text-green-800 leading-relaxed">Health and Care Worker visa applicants and dependants are <strong>fully exempt</strong> from the Immigration Health Surcharge — saving £1,035 per year per person.</p>
        </div>
      )}
      <FieldWrap label="Processing speed" hint="Standard processing included at no extra cost">
        <div className="space-y-2 mt-1">
          {([["none","Standard — 3 weeks (included)"],["priority","Priority — within 5 working days (+£500)"],["super","Super Priority — next working day (+£800)"]] as const).map(([val, label]) => (
            <label key={val} className="flex items-center gap-3 cursor-pointer">
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{ borderColor: wantsPriority === val ? "#003078" : "#9ca3af" }} onClick={() => setWantsPriority(val)}>
                {wantsPriority === val && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#003078" }} />}
              </div>
              <span className="text-sm text-gray-800">{label}</span>
            </label>
          ))}
        </div>
      </FieldWrap>
      <div className="mt-4 border border-gray-200 rounded-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[480px]">
          <thead><tr style={{ backgroundColor: "#003078" }}>
            <th className="text-left text-white text-xs font-semibold px-4 py-3">Fee item</th>
            <th className="text-left text-white text-xs font-semibold px-4 py-3 hidden md:table-cell">Details</th>
            <th className="text-right text-white text-xs font-semibold px-4 py-3">Amount</th>
          </tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                <td className="px-4 py-3 text-xs text-gray-900 font-medium align-top">
                  <div className="mb-1">{row.item}</div>
                  <span className="inline-block text-white px-1.5 py-0.5 rounded" style={{ backgroundColor: row.badgeColor, fontSize: 10 }}>{row.badge}</span>
                  <div className="text-gray-500 text-xs mt-1 font-normal leading-relaxed">{row.note}</div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-600 align-top hidden md:table-cell">{row.detail}</td>
                <td className="px-4 py-3 text-xs text-right align-top font-bold" style={{ color: row.amount === null || row.amount === 0 ? "#00703c" : "#003078" }}>
                  {row.display ? row.display : row.amount === 0 ? "Included" : `£${(row.amount as number).toLocaleString()}`}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot><tr style={{ backgroundColor: "#f0f4ff" }}>
            <td colSpan={3} className="px-4 py-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold" style={{ color: "#003078" }}>Total payable</span>
                <span className="text-lg font-bold" style={{ color: "#003078" }}>£{totalFee.toLocaleString()}</span>
              </div>
            </td>
          </tr></tfoot>
        </table>
      </div>
      <div className="mt-4 bg-blue-50 border-l-4 border-blue-700 p-4 rounded-sm text-xs text-blue-900">
        <p className="font-semibold mb-1">How payment works</p>
        <p className="leading-relaxed">After you submit your declaration on the next step, you will be taken to a <strong>secure payment page</strong> powered by PayPal. You can pay with your PayPal account or any debit/credit card. All fees are <strong>non-refundable</strong>.</p>
      </div>
    </div>
  );
}

function StepDeclaration({ form, update, errors, isHealthCare }: any) {
  return (
    <div>
      <SectionTitle title="Declaration and Consent" description="Read this carefully. You must agree to both statements before proceeding to payment." />
      <div className="bg-gray-50 border border-gray-300 rounded-sm p-5 mb-6 text-xs text-gray-700 leading-relaxed space-y-3 max-h-60 overflow-y-auto">
        <p className="font-bold text-sm text-gray-900">UK {isHealthCare ? "Health and Care Worker" : "Skilled Worker"} Visa — Applicant Declaration</p>
        <p>I declare that the information I have provided in this application is true, complete, and accurate to the best of my knowledge. I understand that providing false or misleading information is a criminal offence under the Immigration Act 1971 and the Identity Documents Act 2010 and may result in refusal of this application, cancellation of any visa granted, a ban from future applications and/or prosecution.</p>
        <p>I confirm that I have a genuine job offer from a UK Visas and Immigration licensed sponsor, that the Certificate of Sponsorship details I have provided are correct, and that I intend to take up the employment described in my CoS upon entering the United Kingdom.</p>
        <p>I understand that this visa ties me to the occupation and sponsor listed in my CoS. If I wish to change employer or occupation, I must apply for a new visa or notify the Home Office. I may not work for any employer not listed on my visa without permission.</p>
        <p>I consent to the Home Office sharing relevant information with UKVI, HM Revenue and Customs, my sponsoring employer, and other government departments for the purposes of processing this application, monitoring sponsor compliance, and enforcing immigration rules.</p>
        <p>I confirm that I have read and understood the UKVI Privacy Notice and consent to my personal data being processed in accordance with the UK General Data Protection Regulation (UK GDPR).</p>
      </div>
      <div className={`flex items-start gap-3 cursor-pointer mb-4 p-3 rounded-sm border ${errors.declaration ? "bg-red-50 border-red-300" : "border-transparent"}`} onClick={() => update("declaration", !form.declaration)}>
        <CheckBox checked={form.declaration} />
        <span className="text-sm text-gray-800 leading-snug select-none">I confirm that I have read and understood this declaration and that all information provided is correct and complete. <span className="text-red-600">*</span></span>
      </div>
      <div className={`flex items-start gap-3 cursor-pointer mb-6 p-3 rounded-sm border ${errors.dataConsent ? "bg-red-50 border-red-300" : "border-transparent"}`} onClick={() => update("dataConsent", !form.dataConsent)}>
        <CheckBox checked={form.dataConsent} />
        <span className="text-sm text-gray-800 leading-snug select-none">I consent to the Home Office processing my personal data as described in the Privacy Notice for the purpose of this visa application. <span className="text-red-600">*</span></span>
      </div>
      <div className="bg-blue-50 border border-blue-200 rounded-sm p-5 mb-4">
        <p className="text-sm font-bold text-blue-900 mb-3">Application Summary</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-xs text-blue-800">
          <div><span className="text-blue-500 block">Applicant</span>{form.title} {form.firstName} {form.lastName || "—"}</div>
          <div><span className="text-blue-500 block">Nationality</span>{form.nationality || "—"}</div>
          <div><span className="text-blue-500 block">CoS reference</span>{form.cosReference || "—"}</div>
          <div><span className="text-blue-500 block">Employer / Sponsor</span>{form.sponsorName || "—"}</div>
          <div><span className="text-blue-500 block">Job title</span>{form.jobTitle || "—"}</div>
          <div><span className="text-blue-500 block">Start date</span>{form.employmentStartDate || "—"}</div>
          <div><span className="text-blue-500 block">Passport</span>{form.passportNumber || "—"}</div>
          <div><span className="text-blue-500 block">Contact email</span>{form.email || "—"}</div>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-sm p-4 text-xs text-green-900 flex items-start gap-2">
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
        <span>After agreeing to the declaration, you will be taken to the <strong>secure payment page</strong> to pay your visa fee. Payment is processed securely by PayPal.</span>
      </div>
    </div>
  );
}

/* ─── Shared UI ───────────────────────────────────────────────────────────── */
function CheckBox({ checked }: { checked: boolean }) {
  return (
    <div className="w-5 h-5 border-2 rounded-sm flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors"
      style={{ backgroundColor: checked ? "#003078" : "white", borderColor: checked ? "#003078" : "#6b7280" }}>
      {checked && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}><polyline points="20 6 9 17 4 12" /></svg>}
    </div>
  );
}

function FieldWrap({ label, hint, required, error, children }: any) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-gray-900 mb-0.5">{label}{required && <span className="text-red-600 ml-0.5">*</span>}</label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {error && <p className="text-xs text-red-600 mb-1 font-medium">{error}</p>}
      {children}
    </div>
  );
}

function InputEl({ value, onChange, placeholder, type = "text", error }: any) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full border-2 focus:outline-none px-3 py-2 text-sm text-gray-900 rounded-sm transition-colors ${error ? "border-red-600 bg-red-50" : "border-gray-400 focus:border-blue-700"}`} />
  );
}

function SelectEl({ value, onChange, error, children }: any) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`w-full border-2 focus:outline-none px-3 py-2 text-sm text-gray-900 rounded-sm bg-white transition-colors ${error ? "border-red-600 bg-red-50" : "border-gray-400 focus:border-blue-700"}`}>
      {children}
    </select>
  );
}

function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-6 pb-4 border-b-2" style={{ borderColor: "#003078" }}>
      <h2 className="text-lg font-bold" style={{ color: "#003078" }}>{title}</h2>
      {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
    </div>
  );
}

function Header() {
  return (
    <header>
      <div style={{ backgroundColor: "#003078" }} className="py-3 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CrownSvg color="white" />
            <div>
              <div className="text-white font-bold text-sm tracking-wide leading-none">GOV.UK</div>
              <div className="text-blue-200 text-xs mt-0.5">Home Office</div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:gap-6">
            <a href="#" className="text-blue-200 text-xs hover:text-white hidden sm:block">Cymraeg</a>
            <a href="#" className="text-blue-200 text-xs hover:text-white">Sign in</a>
          </div>
        </div>
      </div>
      <div style={{ backgroundColor: "#d4351c", height: 4 }} />
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-5xl mx-auto text-sm font-semibold" style={{ color: "#003078" }}>UK Visa and Immigration Service — Work Visa (Sponsorship)</div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-gray-100 py-6 mt-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-4"><CrownSvg color="#003078" size={24} /><span className="font-bold text-sm" style={{ color: "#003078" }}>GOV.UK</span></div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-600 mb-3">
          {["Help","Cookies","Contact","Terms and conditions","Privacy notice","Accessibility statement"].map((l) => <a key={l} href="#" className="hover:underline">{l}</a>)}
        </div>
        <p className="text-xs text-gray-500">© Crown copyright — All content is available under the <a href="#" className="underline hover:no-underline">Open Government Licence v3.0</a>, except where otherwise stated.</p>
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
