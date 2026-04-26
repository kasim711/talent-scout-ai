const BACKEND =
  process.env.REACT_APP_BACKEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://talent-scout-ai-ok8y.onrender.com/api/gemini"
    : "http://localhost:8000/api/gemini");

// ✅ yaha global guard variable
let isCalling = false;

async function callGemini(prompt, max_tokens = 1000) {
  // 🔥 GUARD
  if (isCalling) {
    console.log("Blocked duplicate call");
    return "";
  }

  isCalling = true;

  try {
    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: max_tokens,
        temperature: 0.7,
      },
    };

    const res = await fetch(BACKEND, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let data;

    try {
      data = await res.json();
    } catch (e) {
      throw new Error("Invalid response from server");
    }

    if (!res.ok) {
      console.error("API error:", data);
      throw new Error(data?.error?.message || "API failed");
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Empty AI response");
    }

    return text.trim();

  } catch (err) {
    console.error(err);
    return "";
  } finally {
    isCalling = false;
  }
}

// ✅ ONE SINGLE API CALL — does everything at once
export async function runFullAgent(jdText, candidates) {
  const candList = candidates.map((c, i) =>
    `${i + 1}. ${c.name} | ${c.role} | ${c.exp}y exp | Skills: ${c.skills.join(", ")} | ₹${c.salary}L | ${c.location} | Notice: ${c.notice}`
  ).join("\n");

  const prompt = `
You are an AI talent scout agent. Do ALL of the following in ONE response.

JOB DESCRIPTION:
${jdText}

CANDIDATES:
${candList}

Return ONLY this exact JSON (no markdown, no backticks, no explanation):
{
  "parsedJD": {
    "title": "job title",
    "skills": ["skill1", "skill2"],
    "experience_years": 4,
    "location": "location",
    "salary_lpa_max": 45,
    "nice_to_have": ["skill"],
    "key_responsibilities": ["resp1", "resp2"]
  },
  "candidates": [
    {
      "id": 1,
      "matchScore": 85,
      "explanation": "4/5 skills matched · exp ok · salary fit",
      "outreachMessage": "Hi [name]! Your React and TypeScript background caught my eye...",
      "interestScore": 70,
      "recruiterNote": "Strong match, schedule immediately.",
      "action": "Schedule Interview"
    }
  ]
}

Rules:
- matchScore: 0-100 based on skill overlap, experience, salary fit
- interestScore: 50 by default (will update after conversation)
- action: "Schedule Interview" | "Follow Up" | "Hold" | "Pass"
- outreachMessage: personalized 2-3 sentence message for each candidate
- Return ALL ${candidates.length} candidates in same order
`;

  const text = await callGemini(prompt, 2000);
  return JSON.parse(text.replace(/```json|```/g, "").trim());
}

// ✅ ONE API CALL for agent reply during chat
export async function generateAgentReply(jobTitle, conversationHistory) {
  const history = conversationHistory.map(m =>
    `${m.role === "agent" ? "Scout Agent" : "Candidate"}: ${m.text}`
  ).join("\n");

  const prompt = `
You are a professional talent scout agent recruiting for a ${jobTitle} role.
Continue this conversation naturally. Be helpful, warm, 2-3 sentences only.
Never be pushy. Answer questions honestly.

Conversation so far:
${history}

Scout Agent:`;

  return callGemini(prompt, 200);
}

// ✅ Interest score computed locally — NO API CALL
export function computeInterestScore(messages) {
  const candText = messages
    .filter((m) => m.role === "candidate")
    .map((m) => m.text.toLowerCase())
    .join(" ");

  if (!candText) return 50;

  const positive = ["interested", "open to", "sounds good", "excited", "love to", "definitely", "yes", "happy to", "keen", "tell me more", "would love", "exploring", "sure", "great"];
  const negative = ["not looking", "not interested", "no thanks", "not right now", "pass", "not a fit", "happy where", "busy"];

  let score = 50;
  positive.forEach((w) => { if (candText.includes(w)) score += 7; });
  negative.forEach((w) => { if (candText.includes(w)) score -= 12; });
  score += messages.filter((m) => m.role === "candidate").length * 5;

  return Math.min(98, Math.max(8, score));
}
