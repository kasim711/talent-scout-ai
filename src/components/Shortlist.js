import React from "react";
import { computeInterestScore } from "../lib/sir";

export default function Shortlist({ candidates, conversations, parsedJD, onReset }) {
  
  const enriched = candidates
    .map((c) => {
      const msgs = conversations[c.id] || [];
      const interest = computeInterestScore(msgs);

      const combined = Math.round(c.matchScore * 0.6 + interest * 0.4);

      return {
        ...c,
        interestScore: interest,
        combinedScore: combined,
      };
    })
    .sort((a, b) => b.combinedScore - a.combinedScore);

  const actionColors = {
    "Schedule Interview": { bg: "#ECFDF5", color: "#059669" },
    "Follow Up": { bg: "#FFFBEB", color: "#D97706" },
    "Hold": { bg: "#F5F3FF", color: "#7C3AED" },
    "Pass": { bg: "#FEF2F2", color: "#DC2626" },
  };

  return (
    <div className="step-content">
      
      {/* 🔥 RESET BUTTON */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "10px" }}>
        <button className="btn secondary" onClick={onReset}>
          🔄 Start New Search
        </button>
      </div>

      <p className="step-desc">
        Final ranked shortlist. Combined = Match (60%) + Interest (40%).
      </p>

      <div className="shortlist-grid">
        {enriched.map((c, i) => {
          const action = c.combinedScore >= 75
            ? "Schedule Interview"
            : c.combinedScore >= 60
            ? "Follow Up"
            : c.combinedScore >= 45
            ? "Hold"
            : "Pass";

          const ac = actionColors[action];

          return (
            <div
              key={c.id}
              className="sl-card"
              style={{ borderLeft: `3px solid ${c.color}` }}
            >
              <div className="sl-top">
                <div
                  className="avatar"
                  style={{ background: c.bg, color: c.color }}
                >
                  {c.avatar}
                </div>

                <div className="sl-info">
                  <div className="sl-name">{c.name}</div>
                  <div className="sl-role">
                    {c.role} · {c.exp}y · ₹{c.salary}L
                  </div>
                  <div className="sl-loc">
                    {c.location} · Notice: {c.notice}
                  </div>
                </div>

                <div className="sl-combined">
                  <div className="combined-num">{c.combinedScore}</div>
                  <div className="combined-lbl">combined</div>
                </div>
              </div>

              <div className="sl-scores">
                <div className="score-item">
                  <span className="score-label-sm">match</span>
                  <div className="mini-bar-wrap">
                    <div
                      className="mini-bar"
                      style={{
                        width: `${c.matchScore}%`,
                        background: c.color,
                      }}
                    />
                  </div>
                  <span className="score-val">{c.matchScore}</span>
                </div>

                <div className="score-item">
                  <span className="score-label-sm">interest</span>
                  <div className="mini-bar-wrap">
                    <div
                      className="mini-bar"
                      style={{
                        width: `${c.interestScore}%`,
                        background: "#059669",
                      }}
                    />
                  </div>
                  <span className="score-val">{c.interestScore}</span>
                </div>
              </div>

              <div className="explain-row">{c.explanation}</div>

              {/* 🔥 AUTO GENERATED NOTE (no AI dependency) */}
              <div className="recruiter-note">
                <div className="note-text">
                  💬 {c.combinedScore >= 75
                    ? "Strong match with good engagement. Recommend immediate interview."
                    : c.combinedScore >= 60
                    ? "Good candidate, worth a follow-up discussion."
                    : c.combinedScore >= 45
                    ? "Moderate fit, keep on hold."
                    : "Low fit for current role."}
                </div>

                <span
                  className="action-badge"
                  style={{ background: ac.bg, color: ac.color }}
                >
                  {action}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="scoring-legend">
        <strong>Scoring:</strong> Combined = Match × 0.6 + Interest × 0.4 &nbsp;·&nbsp;
        <strong>Match:</strong> skill + experience + salary fit &nbsp;·&nbsp;
        <strong>Interest:</strong> conversation sentiment (local)
      </div>
    </div>
  );
}