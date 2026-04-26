import React, { useState } from "react";
import JDParser from "./components/JDParser";
import CandidateMatcher from "./components/CandidateMatcher";
import EngagementChat from "./components/EngagementChat";
import Shortlist from "./components/Shortlist";
import "./App.css";

const STEPS = [
  { id: 1, label: "Parse JD", desc: "Input & run agent", icon: "📋" },
  { id: 2, label: "Match", desc: "Discover & score candidates", icon: "🎯" },
  { id: 3, label: "Engage", desc: "Conversational outreach", icon: "💬" },
  { id: 4, label: "Shortlist", desc: "Ranked output", icon: "🏆" },
];

const STEP_HEADERS = [
  { icon: "📋", bg: "#EFF6FF", title: "Job Description — Run Agent", desc: "One AI call: parses JD + scores all candidates + generates outreach messages + recruiter notes." },
  { icon: "🎯", bg: "#ECFDF5", title: "Candidate Matching", desc: "AI-scored candidates ranked by match. Select who to engage." },
  { icon: "💬", bg: "#F5F3FF", title: "Conversational Outreach", desc: "You play the candidate. AI agent replies. Interest score updates in real time." },
  { icon: "🏆", bg: "#FFFBEB", title: "Ranked Shortlist", desc: "Final output: Match + Interest scores, recruiter notes, recommended actions." },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const [agentResult, setAgentResult] = useState(null); // single source of truth
  const [rawJD, setRawJD] = useState("");
  const [scoredCandidates, setScoredCandidates] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [conversations, setConversations] = useState({});

  function completeStep(n) {
    setCompletedSteps((prev) => new Set([...prev, n]));
    setCurrentStep(n + 1);
  }

  function handleJDParsed(result, jd) {
    setAgentResult(result);
    setRawJD(jd);
    completeStep(1);
  }

  function handleCandidatesScored(all, selected) {
    setScoredCandidates(all);
    setSelectedIds(selected);
  }

  function resetPipeline() {
    setAgentResult(null);   // 🔥 main fix
    setRawJD("");
    setScoredCandidates([]);
    setSelectedIds([]);
    setConversations({});
    setCompletedSteps(new Set()); 
    setCurrentStep(1);
  }

  function goPrev() {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }

  const selectedCandidates = scoredCandidates.filter((c) => selectedIds.includes(c.id));
  const avgMatch = scoredCandidates.length
    ? Math.round(scoredCandidates.reduce((a, c) => a + c.matchScore, 0) / scoredCandidates.length) : 0;
  const totalMsgs = Object.values(conversations).reduce((a, msgs) => a + msgs.filter(m => m.role === "candidate").length, 0);

  const h = STEP_HEADERS[currentStep - 1];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo">
            <div className="logo-icon">⚡</div>
            <span className="logo-text">TalentScout</span>
            <span className="logo-sub">AI Recruiting Agent</span>
          </div>
          <div className="header-meta">Catalyst · Deccan AI Hackathon</div>
        </div>
      </header>

      <div className="stats-bar">
        {[
          { icon: "📋", bg: "#EFF6FF", value: agentResult ? "✓" : "—", label: "JD Parsed" },
          { icon: "👥", bg: "#ECFDF5", value: scoredCandidates.length || "—", label: "Candidates Found" },
          { icon: "💬", bg: "#F5F3FF", value: totalMsgs || "—", label: "Messages Sent" },
          { icon: "📊", bg: "#FFFBEB", value: avgMatch || "—", label: "Avg Match Score" },
        ].map((s, i) => (
          <div className="stat-card" key={i}>
            <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="pipeline-bar">
        <div className="pipeline-bar-inner">
          {STEPS.map((s) => (
            <div key={s.id}
              className={`pipeline-step ${currentStep === s.id ? "active" : ""} ${completedSteps.has(s.id) ? "done" : ""}`}
              onClick={() => { if (completedSteps.has(s.id) || currentStep >= s.id) setCurrentStep(s.id); }}
            >
              <div className="step-circle">{completedSteps.has(s.id) ? "✓" : s.id}</div>
              <div className="step-meta">
                <div className="step-name">{s.label}</div>
                <div className="step-desc-sm">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <main className="main">
        <div className="step-wrapper">
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px"
            }}>
            {/* LEFT - Previous */}
            <button
              className="btn secondary"
              onClick={goPrev}
              disabled={currentStep === 1}>
              ← Previous
            </button>
            {/* RIGHT - Reset */}
            <button
              className="btn secondary"
              onClick={resetPipeline}>
              🔄 Start New Search
            </button>
          </div>
          <div className="step-header">
            <div className="step-header-icon" style={{ background: h.bg }}>{h.icon}</div>
            <div><h2>{h.title}</h2><p>{h.desc}</p></div>
          </div>

          <div className="step-content">
            {currentStep === 1 && <JDParser
              jd={rawJD}
              setJd={setRawJD}
              onParsed={handleJDParsed}
            />}

            {currentStep === 2 && (
              <>
                <CandidateMatcher agentResult={agentResult} onCandidatesScored={handleCandidatesScored} />
                {selectedIds.length > 0 && (
                  <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                    <button className="btn primary large" onClick={() => completeStep(2)}>
                      Engage {selectedIds.length} candidates →
                    </button>
                  </div>
                )}
              </>
            )}

            {currentStep === 3 && (
              <>
                <EngagementChat
                  candidates={selectedCandidates}
                  agentResult={agentResult}
                  parsedJD={agentResult?.parsedJD}
                  onConversationsUpdate={setConversations}
                />
                <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                  <button className="btn primary large" onClick={() => completeStep(3)}>
                    Finalize &amp; build shortlist →
                  </button>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <Shortlist
                candidates={selectedCandidates}
                conversations={conversations}
                parsedJD={agentResult?.parsedJD}
                onReset={resetPipeline}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
