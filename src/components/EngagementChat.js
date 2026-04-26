import React, { useState, useRef, useEffect } from "react";
import { generateAgentReply, computeInterestScore } from "../lib/sir";

export default function EngagementChat({
  candidates,
  agentResult,
  parsedJD,
  onConversationsUpdate,
}) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [conversations, setConversations] = useState({});
  const [input, setInput] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);
  const bottomRef = useRef(null);

  // ✅ SAFE active candidate
  const activeCand = candidates[activeIdx] || candidates[0];

  // ✅ INIT conversations ONLY ONCE (IMPORTANT FIX)
  useEffect(() => {
    if (!candidates.length || !agentResult?.candidates) return;

    // 🛑 prevent infinite loop
    if (Object.keys(conversations).length > 0) return;

    const initial = {};

    candidates.forEach((c) => {
      const aiData = agentResult.candidates.find((x) => x.id === c.id);

      const opener =
        aiData?.outreachMessage ||
        `Hi ${c.name}! We have a ${
          parsedJD?.title || "great role"
        } that matches your background. Would you be open to a quick chat?`;

      initial[c.id] = [{ role: "agent", text: opener }];
    });

    setConversations(initial);
    onConversationsUpdate(initial);

    // eslint-disable-next-line
  }, [candidates, agentResult]);

  // ✅ auto scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeIdx]);

  // ✅ SEND MESSAGE
  async function handleSend() {
    if (!input.trim() || agentTyping || !activeCand) return;

    const userMsg = {
      role: "candidate",
      text: input.trim(),
    };

    const history = [...(conversations[activeCand.id] || []), userMsg];

    // ✅ SAFE state update
    setConversations((prev) => {
      const updated = { ...prev, [activeCand.id]: history };
      onConversationsUpdate(updated);
      return updated;
    });

    setInput("");
    setAgentTyping(true);

    try {
      const reply = await generateAgentReply(
        parsedJD?.title || "Senior Engineer",
        history
      );

      const agentMsg = { role: "agent", text: reply };

      setConversations((prev) => {
        const updated = {
          ...prev,
          [activeCand.id]: [...history, agentMsg],
        };
        onConversationsUpdate(updated);
        return updated;
      });
    } catch {
      const fallback = {
        role: "agent",
        text: "Thanks for sharing! I'll connect you with the hiring team. Does a call this week work?",
      };

      setConversations((prev) => {
        const updated = {
          ...prev,
          [activeCand.id]: [...history, fallback],
        };
        onConversationsUpdate(updated);
        return updated;
      });
    }

    setAgentTyping(false);
  }

  function handleKey(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!activeCand) {
    return <p className="step-desc muted">No candidates selected.</p>;
  }

  const msgs = conversations[activeCand.id] || [];
  const interestScore = computeInterestScore(msgs);

  return (
    <div className="step-content">
      <p className="step-desc">
        <strong>You play the candidate.</strong> The AI agent has started the
        conversation. Reply naturally to influence interest score.
      </p>

      {/* TABS */}
      <div className="chat-tabs">
        {candidates.map((c, i) => {
          const cMsgs = conversations[c.id] || [];
          const cs = computeInterestScore(cMsgs);

          return (
            <button
              key={c.id}
              className={`chat-tab ${i === activeIdx ? "active" : ""}`}
              onClick={() => setActiveIdx(i)}
            >
              <span
                className="tab-avatar"
                style={{ background: c.bg, color: c.color }}
              >
                {c.avatar}
              </span>

              <span>{c.name.split(" ")[0]}</span>

              {cMsgs.length > 1 && (
                <span
                  className="tab-score"
                  style={{
                    color:
                      cs >= 70
                        ? "#059669"
                        : cs >= 40
                        ? "#D97706"
                        : "#DC2626",
                  }}
                >
                  {cs}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* CHAT WINDOW */}
      <div className="chat-window">
        <div className="chat-header">
          <div
            className="avatar sm"
            style={{
              background: activeCand.bg,
              color: activeCand.color,
            }}
          >
            {activeCand.avatar}
          </div>

          <div>
            <div className="chat-cand-name">{activeCand.name}</div>
            <div className="chat-cand-role">
              {activeCand.role} · {activeCand.location}
            </div>
          </div>

          <div
            className="interest-pill"
            style={{
              background:
                interestScore >= 70
                  ? "#ECFDF5"
                  : interestScore >= 40
                  ? "#FFFBEB"
                  : "#FEF2F2",
              color:
                interestScore >= 70
                  ? "#059669"
                  : interestScore >= 40
                  ? "#D97706"
                  : "#DC2626",
            }}
          >
            interest: {interestScore}
          </div>
        </div>

        {/* MESSAGES */}
        <div className="chat-messages">
          {msgs.length === 0 && (
            <div className="chat-loading">Loading conversation...</div>
          )}

          {msgs.map((m, i) => (
            <div key={i} className={`msg-wrap ${m.role}`}>
              {m.role === "agent" && (
                <div className="msg-avatar">🤖</div>
              )}

              <div className="msg-bubble">
                <div className="msg-sender">
                  {m.role === "agent" ? "Scout Agent" : activeCand.name}
                </div>
                <div className="msg-text">{m.text}</div>
              </div>

              {m.role === "candidate" && (
                <div
                  className="msg-avatar cand-avatar"
                  style={{
                    background: activeCand.bg,
                    color: activeCand.color,
                  }}
                >
                  {activeCand.avatar}
                </div>
              )}
            </div>
          ))}

          {agentTyping && (
            <div className="msg-wrap agent">
              <div className="msg-avatar">🤖</div>
              <div className="msg-bubble typing">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        <div className="chat-input-row">
          <div className="you-label">
            you (as {activeCand.name.split(" ")[0]})
          </div>

          <div className="input-wrap">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Reply as ${activeCand.name}... (Enter to send)`}
              rows={2}
              disabled={agentTyping || msgs.length === 0}
            />

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={
                agentTyping || !input.trim() || msgs.length === 0
              }
            >
              send →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}