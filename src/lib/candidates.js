export const CANDIDATES_DB = [
  {
    id: 1,
    name: "Priya Sharma",
    role: "Senior Frontend Engineer",
    exp: 5,
    skills: ["React.js", "TypeScript", "Redux", "REST APIs", "GraphQL", "Jest"],
    location: "Bangalore",
    salary: 38,
    notice: "30 days",
    linkedin: "linkedin.com/in/priya-sharma-fe",
    avatar: "PS",
    color: "#185FA5",
    bg: "#E6F1FB",
    bio: "5 years building scalable React apps at funded startups. Loves clean architecture and mentoring junior devs.",
  },
  {
    id: 2,
    name: "Arjun Mehta",
    role: "Frontend Engineer",
    exp: 4,
    skills: ["React.js", "TypeScript", "Zustand", "REST APIs", "Node.js", "Tailwind"],
    location: "Mumbai",
    salary: 28,
    notice: "60 days",
    linkedin: "linkedin.com/in/arjun-mehta-dev",
    avatar: "AM",
    color: "#534AB7",
    bg: "#EEEDFE",
    bio: "Full-stack leaning frontend dev. Built 3 production apps from scratch. Passionate about DX and design systems.",
  },
  {
    id: 3,
    name: "Sneha Patel",
    role: "React Developer",
    exp: 6,
    skills: ["React.js", "JavaScript", "Redux", "React Native", "GraphQL", "Webpack"],
    location: "Pune",
    salary: 42,
    notice: "Immediate",
    linkedin: "linkedin.com/in/sneha-patel-react",
    avatar: "SP",
    color: "#0F6E56",
    bg: "#E1F5EE",
    bio: "6 years React + React Native. Built apps used by 1M+ users. Open to new challenges after recent acquisition.",
  },
  {
    id: 4,
    name: "Rahul Gupta",
    role: "Full Stack Engineer",
    exp: 3,
    skills: ["React.js", "TypeScript", "REST APIs", "Python", "PostgreSQL"],
    location: "Delhi",
    salary: 22,
    notice: "30 days",
    linkedin: "linkedin.com/in/rahul-gupta-dev",
    avatar: "RG",
    color: "#854F0B",
    bg: "#FAEEDA",
    bio: "Full stack with strong React fundamentals. Looking for a frontend-focused role to deepen specialization.",
  },
  {
    id: 5,
    name: "Divya Nair",
    role: "UI Engineer",
    exp: 5,
    skills: ["React.js", "TypeScript", "Zustand", "GraphQL", "React Native", "Storybook"],
    location: "Chennai",
    salary: 35,
    notice: "45 days",
    linkedin: "linkedin.com/in/divya-nair-ui",
    avatar: "DN",
    color: "#993556",
    bg: "#FBEAF0",
    bio: "UI-focused engineer obsessed with performance and accessibility. Maintains a popular open source component library.",
  },
  {
    id: 6,
    name: "Karan Singh",
    role: "Frontend Lead",
    exp: 7,
    skills: ["React.js", "TypeScript", "Redux", "REST APIs", "System Design", "Mentoring"],
    location: "Hyderabad",
    salary: 50,
    notice: "90 days",
    linkedin: "linkedin.com/in/karan-singh-lead",
    avatar: "KS",
    color: "#3B6D11",
    bg: "#EAF3DE",
    bio: "Led frontend teams of 8+ at Series B startups. Architect of 3 large-scale React migrations. Exploring selective opportunities.",
  },
];

export function scoreCandidate(candidate, parsedJD) {
  const cSkills = candidate.skills.map((s) => s.toLowerCase());
  const jdSkills = (parsedJD.skills || []).map((s) => s.toLowerCase());
  const niceToHave = (parsedJD.nice_to_have || []).map((s) => s.toLowerCase());

  const mustMatch = jdSkills.filter((s) => cSkills.includes(s));
  const niceMatch = niceToHave.filter((s) => cSkills.includes(s));
  const expOk = candidate.exp >= (parsedJD.experience_years || 0);
  const salaryOk = candidate.salary <= (parsedJD.salary_lpa_max || 999);

  const skillScore = (mustMatch.length / Math.max(jdSkills.length, 1)) * 70;
  const niceScore = (niceMatch.length / Math.max(niceToHave.length, 1)) * 15;
  const expScore = expOk ? 10 : Math.max(0, 10 - (parsedJD.experience_years - candidate.exp) * 3);
  const salaryScore = salaryOk ? 5 : 0;

  const matchScore = Math.round(Math.min(100, skillScore + niceScore + expScore + salaryScore));

  const explanation = [
    `${mustMatch.length}/${jdSkills.length} required skills`,
    niceMatch.length > 0 ? `${niceMatch.length} bonus skills` : null,
    expOk ? `${candidate.exp}y exp ✓` : `${candidate.exp}y exp (needs ${parsedJD.experience_years}y)`,
    salaryOk ? `₹${candidate.salary}L in range` : `₹${candidate.salary}L over budget`,
  ]
    .filter(Boolean)
    .join(" · ");

  const matchedSkills = mustMatch.map((s) => candidate.skills.find((cs) => cs.toLowerCase() === s));
  const missingSkills = jdSkills
    .filter((s) => !cSkills.includes(s))
    .map((s) => parsedJD.skills.find((ps) => ps.toLowerCase() === s));

  return { matchScore, explanation, matchedSkills, missingSkills, expOk, salaryOk };
}
