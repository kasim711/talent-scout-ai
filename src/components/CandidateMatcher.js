import React, { useEffect, useState } from "react";
import { CANDIDATES_DB } from "../lib/candidates";

export default function CandidateMatcher({ agentResult, onCandidatesScored }) {
  const [scored, setScored] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    if (!agentResult?.candidates) return;

    // Merge AI scores with candidate DB info
    const results = agentResult.candidates.map((aiC) => {
      const dbC = CANDIDATES_DB.find((c) => c.id === aiC.id) || {};
      return { ...dbC, ...aiC };
    }).sort((a, b) => b.matchScore - a.matchScore);

    setScored(results);
    const top = results.slice(0, 4).map((c) => c.id);
    setSelected(top);
    onCandidatesScored(results, top);
  }, [agentResult]); // eslint-disable-line

  function toggle(id) {
    const next = selected.includes(id)
      ? selected.filter((x) => x !== id)
      : [...selected, id];
    setSelected(next);
    onCandidatesScored(scored, next);
  }

  if (!agentResult) return <p className="step-desc muted">Run the agent in step 1 first.</p>;

  return (
    <div className="step-content">
      <p className="step-desc">
        {scored.length} candidates scored by AI. Select who to engage.
      </p>
      <div className="cand-list">
        {scored.map((c) => (
          <div
            key={c.id}
            className={`cand-card ${selected.includes(c.id) ? "selected" : ""}`}
            onClick={() => toggle(c.id)}
          >
            <div className="cand-check">{selected.includes(c.id) ? "✓" : ""}</div>
            <div className="avatar" style={{ background: c.bg, color: c.color }}>{c.avatar}</div>
            <div className="cand-info">
              <div className="cand-name">{c.name}</div>
              <div className="cand-meta">{c.role} · {c.exp}y · {c.location} · ₹{c.salary}L · {c.notice}</div>
              <div className="cand-skills">
                {(c.matchedSkills || []).map((s) => <span key={s} className="skill-match">{s}</span>)}
                {(c.missingSkills || []).slice(0, 2).map((s) => <span key={s} className="skill-miss">{s}</span>)}
              </div>
              <div className="explain-text">{c.explanation}</div>
            </div>
            <div className="match-score-box">
              <div className="big-score" style={{ color: c.matchScore >= 70 ? "#2563EB" : c.matchScore >= 50 ? "#7C3AED" : "#888" }}>
                {c.matchScore}
              </div>
              <div className="score-label">match</div>
              <div className="score-bar-wrap">
                <div className="score-bar" style={{ width: `${c.matchScore}%`, background: c.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="selection-note">{selected.length} selected for outreach</div>
      )}
    </div>
  );
}
