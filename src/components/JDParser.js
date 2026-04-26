import React, { useState, useEffect } from "react";
import { runFullAgent } from "../lib/sir";
import { CANDIDATES_DB } from "../lib/candidates";

const DEFAULT_JD = `We are looking for a Senior Frontend Engineer with 4+ years of experience in React.js and TypeScript. The ideal candidate should have strong experience with state management (Redux or Zustand), performance optimization, and REST/GraphQL APIs. Experience with React Native is a plus. Must be able to collaborate with cross-functional teams and have good communication skills. Remote-friendly, India-based preferred. Salary range: ₹25-45 LPA.`;

export default function JDParser({ jd, setJd, onParsed }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [parsed, setParsed] = useState(null);

  // ✅ set default JD only first time (not on every mount)
  useEffect(() => {
    if (!jd) {
      setJd(DEFAULT_JD);
    }
  }, []); // run once

  async function handleParse() {
    if (!jd.trim() || loading) return; // guard

    setLoading(true);
    setError(null);

    try {
      const result = await runFullAgent(jd, CANDIDATES_DB);
      setParsed(result.parsedJD);
      onParsed(result, jd);
    } catch (e) {
      setError("API call failed: " + e.message);
    }

    setLoading(false);
  }

  return (
    <div className="step-content">
      <p className="step-desc">
        Paste a job description. One AI call will parse it <strong>and</strong> score all candidates instantly.
      </p>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={7}
        placeholder="Paste job description here..."
        disabled={loading}
      />

      <div className="row-gap">
        <button
          className="btn primary"
          onClick={handleParse}
          disabled={loading || !jd.trim()}
        >
          {loading
            ? <><span className="spinner" /> analysing JD + scoring candidates...</>
            : "run agent →"}
        </button>

        {error && <span className="error-text">{error}</span>}
      </div>

      {parsed && (
        <div className="parsed-result">
          <div className="parsed-title">{parsed.title}</div>

          <div className="tags-row" style={{ marginTop: 8 }}>
            {parsed.skills?.map((s) => (
              <span key={s} className="tag skill">{s}</span>
            ))}

            {parsed.nice_to_have?.map((s) => (
              <span key={s} className="tag nice">{s} ★</span>
            ))}

            <span className="tag exp">{parsed.experience_years}+ years</span>
            <span className="tag loc">{parsed.location}</span>
            <span className="tag sal">up to ₹{parsed.salary_lpa_max}L</span>
          </div>

          {parsed.key_responsibilities?.length > 0 && (
            <ul className="resp-list" style={{ marginTop: 8 }}>
              {parsed.key_responsibilities.slice(0, 3).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}