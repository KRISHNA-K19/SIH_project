"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useVeritas } from "@/context/VeritasContext";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Buttons";
import { FormInput, FormSelect } from "@/components/ui/Inputs";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CaseRecord } from "@/types/veritas";

export default function NewScreeningPage() {
  const router = useRouter();
  const { createCase } = useVeritas();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Subject & Flight Data
  const [passengerName, setPassengerName] = useState("VANDERBILT, ARTHUR");
  const [dob, setDob] = useState("1989-11-04");
  const [nationality, setNationality] = useState("CAN (Canada)");
  const [docNumber, setDocNumber] = useState("CA992384");
  const [gender, setGender] = useState("M");
  const [flightNumber, setFlightNumber] = useState("AC-862");
  const [flightRoute, setFlightRoute] = useState("YYZ → JFK");
  const [seat, setSeat] = useState("12B");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Step 2: Document Data
  const [docType, setDocType] = useState("Canadian Passport");
  const [expiryDate, setExpiryDate] = useState("2033-05-18");
  const [chipProtocol, setChipProtocol] = useState("BAC/EAC (ICAO 9303 PKI)");
  const [simulationScenario, setSimulationScenario] = useState<"flagged_cut" | "clean_pass" | "visa_mismatch">("flagged_cut");

  // Step 3: Analysis Simulation
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load Presets
  const handleLoadPreset = (scenario: "flagged_cut" | "clean_pass" | "visa_mismatch") => {
    setSimulationScenario(scenario);
    if (scenario === "flagged_cut") {
      setPassengerName("VANDERBILT, ARTHUR");
      setDob("1989-11-04");
      setNationality("CAN (Canada)");
      setDocNumber("CA992384");
      setDocType("Canadian e-Passport");
      setFlightNumber("AC-862");
      setFlightRoute("YYZ → JFK");
      setSeat("12B");
    } else if (scenario === "clean_pass") {
      setPassengerName("SANTOS, MARIA");
      setDob("1995-03-21");
      setNationality("PRT (Portugal)");
      setDocNumber("P482910");
      setDocType("Portuguese e-Passport");
      setFlightNumber("TP-209");
      setFlightRoute("LIS → JFK");
      setSeat("08A");
    } else {
      setPassengerName("KOWALSKI, JAN");
      setDob("1991-08-15");
      setNationality("POL (Poland)");
      setDocNumber("PL773910");
      setDocType("Polish e-Passport");
      setFlightNumber("LO-026");
      setFlightRoute("WAW → JFK");
      setSeat("24F");
    }
    setErrors({});
  };

  // Step 1 Validation
  const handleStep1Next = () => {
    const errs: { [key: string]: string } = {};
    if (!passengerName.trim()) errs.passengerName = "Passenger name is mandatory.";
    if (!dob) errs.dob = "Date of birth is required.";
    if (!docNumber.trim()) errs.docNumber = "Document number is mandatory.";
    if (!flightNumber.trim()) errs.flightNumber = "Flight number is mandatory.";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setCurrentStep(2);
  };

  // Step 2 Next: Start Analysis Simulation
  const handleStartAnalysis = () => {
    setCurrentStep(3);
    setIsAnalyzing(true);
    setAnalysisProgress(10);

    const interval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          setTimeout(() => setCurrentStep(4), 400);
          return 100;
        }
        return prev + 25;
      });
    }, 350);
  };

  // Step 4: Final Case Creation
  const handleCreateCase = async () => {
    const isClean = simulationScenario === "clean_pass";
    const isVisaMismatch = simulationScenario === "visa_mismatch";

    const riskScore = isClean ? 14 : isVisaMismatch ? 62 : 79;
    const riskLevel = isClean ? "LOW" : isVisaMismatch ? "MEDIUM" : "HIGH";
    const decisionRecommendation = isClean
      ? "AUTOMATED CLEARANCE RECOMMENDED"
      : isVisaMismatch
      ? "SECONDARY REVIEW - DOB MISMATCH"
      : "SECONDARY REVIEW REQUIRED - FORENSIC CUT DETECTED";

    const newCasePayload: Omit<CaseRecord, "id" | "createdAt" | "isDevFixture"> = {
      checkpoint: "DELTA CHECKPOINT",
      lane: "DELTA-01 AIRSIDE",
      riskScore,
      riskLevel,
      decisionRecommendation,
      subject: {
        name: passengerName.toUpperCase(),
        dob,
        nationality,
        documentNumber: docNumber,
        gender,
        photoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmASGEWbmJ08QcKtaayP0qmieKnnwvvTTKkOIdemdhjfVV5x9_qy5EbThxs0xGV4jhkzXzD0DXR6zmeQHfAzGXISS2YcFFzjvNS1RpTa3X4OW7K--ybEc0A905UQ2IfbQdW7nkRdc7gU6a_L7l-dtE4SBEvQQynIHPfEGhCoTwMcKCCaxlzC1SdoHoZHoRhOEZuqDiVDD0z96dv8ixCbuvpfK1qJDMvnvYAio70H19NyH634jtpKB8",
        livePhotoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYuNxEDHFWRvznvfPNj7y-9O_rkn6sT53-tNBKJB0k15A5wyzLZvFzF_ftQP-oFb-o7Nde-xc3ObEKyJ9E7nswkUaBfpzyGMRIK5CymfzgQsV0WVaPenRATXYi4j6Rcn5BVkXOP7pMVhj4vioJITpPyGGoOKVtJ2IryERUeQQ3SJl6SYi1Owwn63lj9JDep79M6z0m4vEAJQ6zdd2G_q84PSFme6SKil7KdQ1TLs9L7QxZtpMCr9R6",
      },
      flight: {
        number: flightNumber,
        airline: "International Carrier",
        route: flightRoute,
        seat,
        cabinClass: "Standard",
        scheduledArrival: "08:45 UTC",
        lane: "Lane 4",
        checkpoint: "Delta-01",
      },
      documents: [
        {
          id: docNumber,
          type: docType,
          documentNumber: docNumber,
          issuingCountry: nationality.substring(0, 3),
          issueDate: "2023-01-15",
          expiryDate,
          status: isClean ? "Valid ICAO-9303" : "Flagged Anomaly",
          issuePost: "Consulate",
          mrzRaw: [
            `P<${nationality.substring(0, 3)}${passengerName.replace(/,\s*/, "<<")}<<<<<<<<<<<<<<<<<<`,
            `${docNumber}<4${nationality.substring(0, 3)}8911048M3305185<<<<<<<<<<<<<<<04`,
          ],
          mrzValid: true,
          mrzFields: [
            { label: "Document Type", raw: "P<", parsed: "Standard Passport", valid: true },
            { label: "Document Number", raw: docNumber, parsed: docNumber, valid: true },
          ],
          chipVerified: true,
          chipProtocol,
          docImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuCt5B8NqUydPjWJxu2BEWTvEpofK_SGm3-o3IW7oN3Gz6eOaL6KZ3vaDfUja1xqTCzlBERYB9_20oOgX1QOEycqm5xESEgEn76d7aElzU5ogtpmW_r78t-9oaa7lthdXXpdS36qgege-RikSZ6Ki8WfHMe40PE3S3bVDF5iXv5YLTj3F5OcH2BnUSVgLH8dP-BpQIaFuJ79TB7_pqGCo5BK70DlOdqd2LO0v-j9jj3aqQSGcbNwpwfr",
          uvImage: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFWyWO33rJRt9T0QJN2-VY0ZZePd-ck2MeZR5Pu4f9zEdTxPawOHmm7KjBePqnIoJJbLr9j07QUsZlo0xbTI2LM7OOKj0lCcG4nOE-XWytl4JE0L4zEUe6DjzjsjHV11_R5tPFeuydAXJwp80JQfSMJjcYr4jIguPt_hybWjiTba-OUnO1hoF9VH7EKf95zhBb2Zks61BWlXhSSliFYvAiWytD3PGaX_84Jlpq9t0lakSP_YwVYvo8",
        },
      ],
      evidence: isClean
        ? [
            {
              id: "ev-gen-1",
              category: "FACE VERIFICATION",
              finding: "HIGH BIOMETRIC CONVERGENCE",
              severity: "success",
              source: "Biometric Comparator Engine",
              description: "Live camera sensor matches digital e-chip baseline with 96.4% confidence.",
              metrics: [{ label: "Similarity", value: "96.4%", pass: true }],
            },
          ]
        : [
            {
              id: "ev-gen-1",
              category: "DOCUMENT FORENSICS",
              finding: "SUBSTRATE RAZOR INCISION DETECTED",
              severity: "critical",
              source: "Optical Scanner 380nm UV",
              description: "Automated analysis flagged boundary anomaly around portrait frame.",
              metrics: [{ label: "Cut Depth", value: "0.14mm", pass: false }],
            },
            {
              id: "ev-gen-2",
              category: "FACE VERIFICATION",
              finding: "DIVERGENT FACIAL EMBEDDING",
              severity: "warning",
              source: "Biometric Engine",
              description: "51.2% match against chip portrait. Variance exceeds automatic clearance threshold.",
              metrics: [{ label: "Match Score", value: "51.2%", pass: false }],
            },
          ],
      biometrics: {
        passportPhotoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmASGEWbmJ08QcKtaayP0qmieKnnwvvTTKkOIdemdhjfVV5x9_qy5EbThxs0xGV4jhkzXzD0DXR6zmeQHfAzGXISS2YcFFzjvNS1RpTa3X4OW7K--ybEc0A905UQ2IfbQdW7nkRdc7gU6a_L7l-dtE4SBEvQQynIHPfEGhCoTwMcKCCaxlzC1SdoHoZHoRhOEZuqDiVDD0z96dv8ixCbuvpfK1qJDMvnvYAio70H19NyH634jtpKB8",
        livePhotoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDYuNxEDHFWRvznvfPNj7y-9O_rkn6sT53-tNBKJB0k15A5wyzLZvFzF_ftQP-oFb-o7Nde-xc3ObEKyJ9E7nswkUaBfpzyGMRIK5CymfzgQsV0WVaPenRATXYi4j6Rcn5BVkXOP7pMVhj4vioJITpPyGGoOKVtJ2IryERUeQQ3SJl6SYi1Owwn63lj9JDep79M6z0m4vEAJQ6zdd2G_q84PSFme6SKil7KdQ1TLs9L7QxZtpMCr9R6",
        similarityScore: isClean ? 96.4 : 51.2,
        thresholdRequired: 75.0,
        deltaDistance: isClean ? 0.08 : 0.488,
        antiSpoofConfidence: 99.2,
        livenessVerified: true,
        facialMeshPoints: 468,
        comparisonStatus: isClean ? "VERIFIED" : "NON_CONVERGENCE",
        advisoryNote: isClean ? "All facial metrics verified." : "Facial divergence flagged for physical officer review.",
      },
      forensics: isClean
        ? []
        : [
            {
              id: "FOR-GEN-01",
              title: "Physical Boundary Score",
              type: "Substrate Anomaly",
              severity: "critical",
              band: "UV_380NM",
              description: "Razor cut detected along right photo edge.",
              coordinates: { x: 44, y: 88, label: "0.14mm INCISION" },
              imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBFWyWO33rJRt9T0QJN2-VY0ZZePd-ck2MeZR5Pu4f9zEdTxPawOHmm7KjBePqnIoJJbLr9j07QUsZlo0xbTI2LM7OOKj0lCcG4nOE-XWytl4JE0L4zEUe6DjzjsjHV11_R5tPFeuydAXJwp80JQfSMJjcYr4jIguPt_hybWjiTba-OUnO1hoF9VH7EKf95zhBb2Zks61BWlXhSSliFYvAiWytD3PGaX_84Jlpq9t0lakSP_YwVYvo8",
            },
          ],
      crossChecks: [
        {
          field: "Date of Birth",
          primaryValue: dob,
          primarySource: "Passport",
          secondaryValue: isVisaMismatch ? "1988-11-04" : dob,
          secondarySource: "Manifest",
          status: isVisaMismatch ? "DISCREPANCY" : "MATCH",
          severity: isVisaMismatch ? "critical" : "success",
          delta: isVisaMismatch ? "+1 Year" : undefined,
        },
      ],
      timeline: [
        {
          id: `t-step-${Date.now()}`,
          timestamp: new Date().toISOString().substring(11, 19),
          title: "Intake Pipeline Completed",
          description: "All automated intake checks evaluated.",
          type: isClean ? "success" : "critical",
        },
      ],
    };

    const created = await createCase(newCasePayload);
    router.push(`/cases/${created.id}/overview`);
  };

  return (
    <div className="flex flex-col gap-space-xl max-w-5xl mx-auto pb-space-2xl">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md border-b border-border-subtle pb-space-md">
        <div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold uppercase tracking-wide">
            Initiate Security Screening
          </h1>
          <p className="font-body-md text-outline">
            Interactive passenger intake, document scanning, and automated threat arbitration
          </p>
        </div>

        {/* Quick Scenario Preset Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-outline text-label-xs uppercase font-bold">Preset:</span>
          <button
            onClick={() => handleLoadPreset("flagged_cut")}
            className={`px-2 py-1 rounded text-xs font-mono uppercase border ${simulationScenario === "flagged_cut" ? "bg-status-critical-bg text-status-critical border-status-critical" : "bg-surface-panel text-outline border-border-subtle"}`}
            type="button"
          >
            Tampered Passport
          </button>
          <button
            onClick={() => handleLoadPreset("clean_pass")}
            className={`px-2 py-1 rounded text-xs font-mono uppercase border ${simulationScenario === "clean_pass" ? "bg-status-success-bg text-status-success border-status-success" : "bg-surface-panel text-outline border-border-subtle"}`}
            type="button"
          >
            Clean Pass
          </button>
        </div>
      </div>

      {/* Main Wizard Container */}
      <div className="bg-surface-workstation rounded-lg border border-border-subtle shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[480px]">
        {/* Left Step Rail */}
        <div className="w-full md:w-64 bg-surface-panel p-space-lg border-b md:border-b-0 md:border-r border-border-subtle flex flex-row md:flex-col gap-space-md shrink-0">
          <StepItem
            number="01"
            label="Subject & Flight"
            active={currentStep === 1}
            completed={currentStep > 1}
            onClick={() => currentStep > 1 && setCurrentStep(1)}
          />
          <StepItem
            number="02"
            label="Document Platen"
            active={currentStep === 2}
            completed={currentStep > 2}
            onClick={() => currentStep > 2 && setCurrentStep(2)}
          />
          <StepItem
            number="03"
            label="Automated Analysis"
            active={currentStep === 3}
            completed={currentStep > 3}
          />
          <StepItem
            number="04"
            label="Summary & Docket"
            active={currentStep === 4}
            completed={false}
          />
        </div>

        {/* Right Active Step Form Viewport */}
        <div className="flex-1 p-space-xl flex flex-col justify-between">
          {/* STEP 1: SUBJECT & TRANSIT DETAILS */}
          {currentStep === 1 && (
            <div className="flex flex-col gap-space-lg">
              <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
                <span className="font-headline-md text-on-surface font-bold uppercase">
                  Step 01: Subject Identification & Inbound Flight
                </span>
                <span className="text-outline text-label-xs font-mono">LANE DELTA-01</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <FormInput
                  label="Subject Full Legal Name (Surname, Given)"
                  placeholder="e.g. VANDERBILT, ARTHUR"
                  value={passengerName}
                  onChange={(e) => setPassengerName(e.target.value)}
                  error={errors.passengerName}
                  required
                />

                <FormInput
                  label="Date of Birth (YYYY-MM-DD)"
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  error={errors.dob}
                  required
                />

                <FormSelect
                  label="Citizenship / Nationality"
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  options={[
                    { label: "CAN (Canada)", value: "CAN (Canada)" },
                    { label: "GBR (United Kingdom)", value: "GBR (United Kingdom)" },
                    { label: "USA (United States)", value: "USA (United States)" },
                    { label: "PRT (Portugal)", value: "PRT (Portugal)" },
                    { label: "ARE (United Arab Emirates)", value: "ARE (United Arab Emirates)" },
                    { label: "NGA (Nigeria)", value: "NGA (Nigeria)" },
                  ]}
                />

                <FormSelect
                  label="Gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  options={[
                    { label: "Male (M)", value: "M" },
                    { label: "Female (F)", value: "F" },
                    { label: "Unspecified (X)", value: "X" },
                  ]}
                />

                <FormInput
                  label="Primary Travel Document Number"
                  placeholder="e.g. CA992384"
                  value={docNumber}
                  onChange={(e) => setDocNumber(e.target.value)}
                  error={errors.docNumber}
                  required
                />

                <FormInput
                  label="Flight Number & Code"
                  placeholder="e.g. AC-862"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  error={errors.flightNumber}
                  required
                />

                <FormInput
                  label="Transit Route"
                  placeholder="e.g. YYZ → JFK"
                  value={flightRoute}
                  onChange={(e) => setFlightRoute(e.target.value)}
                />

                <FormInput
                  label="Assigned Seat"
                  placeholder="e.g. 12B"
                  value={seat}
                  onChange={(e) => setSeat(e.target.value)}
                />
              </div>

              <div className="flex justify-end pt-space-md border-t border-border-subtle">
                <PrimaryButton onClick={handleStep1Next} icon="arrow_forward">
                  PROCEED TO DOCUMENT SCAN
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* STEP 2: DOCUMENT PLATEN CAPTURE */}
          {currentStep === 2 && (
            <div className="flex flex-col gap-space-lg">
              <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
                <span className="font-headline-md text-on-surface font-bold uppercase">
                  Step 02: Platen Scanner & Optical Acquisition
                </span>
                <span className="text-outline text-label-xs font-mono">4K COAXIAL SENSOR READY</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
                <div className="flex flex-col gap-space-md">
                  <FormSelect
                    label="Detected Document Specimen Type"
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    options={[
                      { label: "National e-Passport (Standard)", value: "National e-Passport" },
                      { label: "Diplomatic Passport", value: "Diplomatic Passport" },
                      { label: "Consular Visa Foil", value: "Consular Visa Foil" },
                      { label: "Permanent Resident Card (PRC)", value: "Permanent Resident Card" },
                    ]}
                  />

                  <FormInput
                    label="Passport Expiration Date"
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />

                  <FormSelect
                    label="Chip Cryptographic Interface"
                    value={chipProtocol}
                    onChange={(e) => setChipProtocol(e.target.value)}
                    options={[
                      { label: "BAC/EAC (ICAO 9303 PKI)", value: "BAC/EAC (ICAO 9303 PKI)" },
                      { label: "PACE (Password Authenticated Connection)", value: "PACE (Password Authenticated Connection)" },
                      { label: "Optical Only (No Contactless Chip)", value: "Optical Only" },
                    ]}
                  />

                  <div className="p-space-md bg-surface-panel rounded border border-border-subtle text-body-sm text-outline flex items-center gap-2">
                    <span className="material-symbols-outlined text-status-success text-[18px]">check_circle</span>
                    <span>Document platen feed locked. Alignment verified.</span>
                  </div>
                </div>

                {/* Platen Visual Preview */}
                <div className="relative aspect-video rounded bg-[#07090E] border border-border-strong overflow-hidden flex items-center justify-center">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCt5B8NqUydPjWJxu2BEWTvEpofK_SGm3-o3IW7oN3Gz6eOaL6KZ3vaDfUja1xqTCzlBERYB9_20oOgX1QOEycqm5xESEgEn76d7aElzU5ogtpmW_r78t-9oaa7lthdXXpdS36qgege-RikSZ6Ki8WfHMe40PE3S3bVDF5iXv5YLTj3F5OcH2BnUSVgLH8dP-BpQIaFuJ79TB7_pqGCo5BK70DlOdqd2LO0v-j9jj3aqQSGcbNwpwfr"
                    alt="Platen Scan"
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-forensic-cyan font-mono text-[11px]">
                    PLATEN SENSOR 4K LIVE
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-space-md border-t border-border-subtle">
                <SecondaryButton onClick={() => setCurrentStep(1)}>
                  BACK
                </SecondaryButton>
                <PrimaryButton onClick={handleStartAnalysis} icon="radar">
                  INITIATE SYSTEM ANALYSIS
                </PrimaryButton>
              </div>
            </div>
          )}

          {/* STEP 3: PIPELINE SIMULATION */}
          {currentStep === 3 && (
            <div className="flex flex-col items-center justify-center p-space-2xl gap-space-lg text-center min-h-[360px]">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-border-subtle border-t-status-info animate-spin"></div>
                <span className="material-symbols-outlined text-forensic-cyan text-[32px]">biotech</span>
              </div>

              <div className="flex flex-col gap-1 max-w-md">
                <h3 className="font-headline-lg text-on-surface font-bold uppercase">
                  Executing VERITAS AI & Forensic Pipeline
                </h3>
                <p className="font-body-sm text-outline">
                  Running MRZ Doc 9303 checksums, facial landmark cosine vector extraction, and coaxial 380nm UV anomaly detection...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md flex flex-col gap-1">
                <div className="w-full h-2 rounded bg-surface-panel overflow-hidden border border-border-subtle">
                  <div
                    className="h-full bg-status-info transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-outline text-[11px] font-mono">
                  <span>ANALYSIS PIPELINE</span>
                  <span>{analysisProgress}%</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: VERIFICATION & FINAL CASE REGISTRATION */}
          {currentStep === 4 && (
            <div className="flex flex-col gap-space-lg">
              <div className="flex items-center justify-between border-b border-border-subtle pb-space-sm">
                <span className="font-headline-md text-on-surface font-bold uppercase">
                  Step 04: Intake Arbitration Summary
                </span>
                <StatusBadge
                  status={simulationScenario === "clean_pass" ? "success" : "critical"}
                  text={simulationScenario === "clean_pass" ? "CLEARED" : "ANOMALIES FLAGGED"}
                />
              </div>

              <div className="p-space-lg rounded bg-surface-panel border border-border-subtle flex flex-col gap-space-sm">
                <div className="flex items-center justify-between">
                  <span className="font-headline-md font-bold text-on-surface">
                    {passengerName}
                  </span>
                  <span className="font-code-md text-forensic-cyan font-bold">
                    DOC #{docNumber}
                  </span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-body-sm text-outline pt-2 border-t border-border-subtle">
                  <div>Nationality: <span className="text-on-surface">{nationality}</span></div>
                  <div>Flight: <span className="text-on-surface">{flightNumber}</span></div>
                  <div>Route: <span className="text-on-surface">{flightRoute}</span></div>
                  <div>Seat: <span className="text-on-surface">{seat}</span></div>
                </div>
              </div>

              {/* Finding Snapshot */}
              <div className="p-space-md rounded bg-surface-elevated border border-border-subtle flex items-start gap-space-sm font-body-sm">
                <span className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${simulationScenario === "clean_pass" ? "text-status-success" : "text-status-critical"}`}>
                  {simulationScenario === "clean_pass" ? "verified" : "warning"}
                </span>
                <div className="flex flex-col">
                  <span className="font-bold text-on-surface">
                    {simulationScenario === "clean_pass"
                      ? "Zero Anomalies Detected · Automated Clearance Candidate"
                      : "Forensic & Biometric Anomalies Intercepted"}
                  </span>
                  <p className="text-outline mt-0.5">
                    {simulationScenario === "clean_pass"
                      ? "Passport chip passes cryptographic signature checks. Facial similarity exceeds statutory thresholds."
                      : "Document platen scan or biometric comparison exceeded acceptable risk bounds. Mandatory referral required."}
                  </p>
                </div>
              </div>

              <div className="flex justify-between pt-space-md border-t border-border-subtle">
                <SecondaryButton onClick={() => setCurrentStep(2)}>
                  BACK TO SCAN
                </SecondaryButton>
                <PrimaryButton onClick={handleCreateCase} icon="check">
                  GENERATE SCREENING CASE & OPEN WORKSPACE
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepItem({
  number,
  label,
  active,
  completed,
  onClick,
}: {
  number: string;
  label: string;
  active?: boolean;
  completed?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-space-md ${
        onClick ? "cursor-pointer" : ""
      } ${active ? "text-primary font-bold" : completed ? "text-status-success" : "text-outline"}`}
    >
      <span
        className={`w-8 h-8 rounded flex items-center justify-center font-code-md text-xs font-bold shrink-0 transition-colors ${
          active
            ? "bg-primary/20 text-primary border border-primary/50"
            : completed
            ? "bg-status-success-bg text-status-success border border-status-success/40"
            : "bg-surface-elevated text-outline border border-border-subtle"
        }`}
      >
        {completed ? "✓" : number}
      </span>
      <span className="font-label-md uppercase tracking-wider text-[12px]">{label}</span>
    </div>
  );
}
