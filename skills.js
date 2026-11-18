const CONCEPTS = [
  {
    id: "programming",
    label: "Programming",
    aliases: [
      "coding",
      "code",
      "software development",
      "software engineering",
      "computer programming",
      "programming languages",
      "dev",
    ],
  },
  {
    id: "python",
    label: "Python",
    aliases: ["python", "python3", "py", "python programming"],
    broader: ["programming"],
  },
  {
    id: "c",
    label: "C",
    aliases: ["c", "c language"],
    broader: ["programming"],
  },
  {
    id: "cpp",
    label: "C++",
    aliases: ["c++", "cpp", "c plus plus"],
    broader: ["programming"],
  },
  {
    id: "csharp",
    label: "C#",
    aliases: ["c#", "csharp", "c sharp"],
    broader: ["programming"],
  },
  {
    id: "java",
    label: "Java",
    aliases: ["java", "core java"],
    broader: ["programming"],
  },
  {
    id: "javascript",
    label: "JavaScript",
    aliases: ["javascript", "js", "node", "nodejs", "node.js", "ecmascript"],
    broader: ["programming"],
  },
  {
    id: "rust",
    label: "Rust",
    aliases: ["rust", "rustlang"],
    broader: ["programming"],
  },
  {
    id: "sql",
    label: "SQL",
    aliases: [
      "sql",
      "mysql",
      "postgres",
      "postgresql",
      "sqlite",
      "databases",
      "dbms",
    ],
    broader: ["programming"],
  },
  {
    id: "opengl",
    label: "OpenGL",
    aliases: ["opengl", "open gl"],
  },
  {
    id: "ai",
    label: "AI & Machine Learning",
    aliases: [
      "ai",
      "artificial intelligence",
      "machine learning",
      "ml",
      "deep learning",
      "neural networks",
    ],
  },
  {
    id: "cybersecurity",
    label: "Cybersecurity",
    aliases: [
      "cybersecurity",
      "cyber security",
      "information security",
      "infosec",
      "ethical hacking",
      "cyber",
    ],
  },
  {
    id: "network-security",
    label: "Network Security",
    aliases: [
      "network security",
      "network security and management",
      "computer networks",
      "networking",
    ],
    related: ["cybersecurity"],
  },
  {
    id: "excel",
    label: "Excel",
    aliases: [
      "excel",
      "microsoft excel",
      "ms excel",
      "spreadsheets",
      "spreadsheet",
    ],
  },
  {
    id: "design",
    label: "Graphic Design",
    aliases: [
      "graphic design",
      "graphic designing",
      "graphics design",
      "visual design",
      "graphic designer",
    ],
  },
  {
    id: "photoshop",
    label: "Photoshop",
    aliases: ["photoshop", "adobe photoshop"],
    broader: ["design"],
    family: "design-tools",
  },
  {
    id: "illustrator",
    label: "Illustrator",
    aliases: ["illustrator", "adobe illustrator"],
    broader: ["design"],
    family: "design-tools",
  },
  {
    id: "figma",
    label: "Figma",
    aliases: ["figma"],
    broader: ["design"],
    family: "design-tools",
  },
  {
    id: "sketching",
    label: "Sketching",
    aliases: ["sketching", "sketch", "drawing", "doodling"],
  },
  {
    id: "animation",
    label: "Animation",
    aliases: ["animation", "animating", "3d animation", "vfx", "visual effects"],
  },
  {
    id: "blender",
    label: "Blender",
    aliases: ["blender", "blender 3d"],
    broader: ["animation"],
    family: "3d-tools",
  },
  {
    id: "maya",
    label: "Maya",
    aliases: ["maya", "autodesk maya"],
    broader: ["animation"],
    family: "3d-tools",
  },
  {
    id: "level-design",
    label: "Level Design",
    aliases: ["level design", "game level design", "game design"],
    related: ["animation"],
  },
  {
    id: "video-editing",
    label: "Video Editing",
    aliases: [
      "video editing",
      "video editor",
      "video production",
      "premiere pro",
      "davinci resolve",
      "film editing",
    ],
  },
  {
    id: "cad",
    label: "CAD",
    aliases: [
      "cad",
      "computer aided design",
      "computer aided drafting",
      "drafting",
    ],
  },
  {
    id: "autocad",
    label: "AutoCAD",
    aliases: ["autocad", "auto cad"],
    broader: ["cad"],
    family: "cad-tools",
  },
  {
    id: "sketchup",
    label: "SketchUp",
    aliases: ["sketchup", "sketch up"],
    broader: ["cad"],
    family: "cad-tools",
  },
  {
    id: "revit",
    label: "Revit",
    aliases: ["revit", "autodesk revit"],
    broader: ["cad"],
    family: "cad-tools",
  },
  {
    id: "solidworks",
    label: "SolidWorks",
    aliases: ["solidworks", "solid works"],
    broader: ["cad"],
    family: "cad-tools",
  },
  {
    id: "cadcam",
    label: "CAD/CAM",
    aliases: ["cad cam", "cadcam"],
    broader: ["cad"],
    family: "cad-tools",
  },
  {
    id: "music",
    label: "Music",
    aliases: ["music", "music theory", "general music"],
  },
  {
    id: "guitar",
    label: "Guitar",
    aliases: ["guitar", "acoustic guitar", "electric guitar", "guitar playing"],
    broader: ["music"],
    family: "strings",
  },
  {
    id: "ukulele",
    label: "Ukulele",
    aliases: ["ukulele", "uke"],
    broader: ["music"],
    family: "strings",
  },
  {
    id: "singing",
    label: "Singing",
    aliases: ["singing", "vocals", "vocal training", "singing lessons"],
    broader: ["music"],
  },
  {
    id: "communication",
    label: "Communication",
    aliases: [
      "communication",
      "communication skills",
      "interpersonal skills",
      "interpersonal communication",
    ],
  },
  {
    id: "presentation",
    label: "Presentation Skills",
    aliases: [
      "presentation",
      "presentation skills",
      "presentations",
      "public speaking",
      "slide design",
    ],
    broader: ["communication"],
  },
  {
    id: "brainstorming",
    label: "Creative Brainstorming",
    aliases: [
      "creative brainstorming",
      "brainstorming",
      "ideation",
      "creative thinking",
      "creativity",
    ],
  },
  {
    id: "japanese",
    label: "Japanese",
    aliases: ["japanese", "nihongo"],
    family: "language",
  },
  {
    id: "german",
    label: "German",
    aliases: ["german", "deutsch"],
    family: "language",
  },
  {
    id: "french",
    label: "French",
    aliases: ["french", "francais"],
    family: "language",
  },
  {
    id: "italian",
    label: "Italian",
    aliases: ["italian", "italiano"],
    family: "language",
  },
  {
    id: "spanish",
    label: "Spanish",
    aliases: ["spanish", "espanol"],
    family: "language",
  },
  {
    id: "korean",
    label: "Korean",
    aliases: ["korean"],
    family: "language",
  },
  {
    id: "mandarin",
    label: "Mandarin",
    aliases: ["mandarin", "chinese"],
    family: "language",
  },
];

const EXCLUSIVE_FAMILIES = new Set(["language"]);
const MODIFIERS = new Set([
  "advanced",
  "basic",
  "basics",
  "beginner",
  "intermediate",
  "intro",
  "introduction",
  "fundamentals",
  "essentials",
  "pro",
  "expert",
  "learning",
  "learn",
]);

const CONCEPT_BY_ID = new Map(CONCEPTS.map((concept) => [concept.id, concept]));
const CACHE = new Map();

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9+#. ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripModifiers(value) {
  return value
    .split(" ")
    .filter((token) => token && !MODIFIERS.has(token))
    .join(" ")
    .trim();
}

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function containsPhrase(text, phrase) {
  if (phrase.length < 3) return false;
  return new RegExp(`(^| )${escapePattern(phrase)}( |$)`).test(text);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    for (let j = 1; j <= b.length; j += 1) {
      current[j] = Math.min(
        previous[j] + 1,
        current[j - 1] + 1,
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    previous = current;
  }
  return previous[b.length];
}

function stem(token) {
  if (token.length > 5 && token.endsWith("ing")) return token.slice(0, -3);
  if (token.length > 4 && token.endsWith("ed")) return token.slice(0, -2);
  if (token.length > 3 && token.endsWith("s") && !token.endsWith("ss"))
    return token.slice(0, -1);
  return token;
}

function tokens(value) {
  return new Set(
    value
      .split(" ")
      .filter((token) => token.length > 1)
      .map(stem),
  );
}

function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const distance = 1 - levenshtein(a, b) / Math.max(a.length, b.length);
  const aTokens = tokens(a);
  const bTokens = tokens(b);
  let shared = 0;
  for (const token of aTokens) if (bTokens.has(token)) shared += 1;
  const union = aTokens.size + bTokens.size - shared;
  const overlap = union ? shared / union : 0;
  return Math.max(distance, overlap);
}

const ENTRIES = [];
for (const concept of CONCEPTS) {
  for (const alias of new Set([concept.label, ...(concept.aliases || [])])) {
    const key = normalize(alias);
    if (key) ENTRIES.push({ key, id: concept.id });
  }
}
ENTRIES.sort((a, b) => b.key.length - a.key.length);

const EXACT = new Map();
for (const entry of ENTRIES) {
  if (!EXACT.has(entry.key)) EXACT.set(entry.key, entry.id);
}

function matchSegment(segment) {
  const clean = stripModifiers(segment);
  if (!clean) return null;
  if (EXACT.has(clean)) {
    return { id: EXACT.get(clean), score: 1, type: "same" };
  }
  const phrase = ENTRIES.find((entry) => containsPhrase(clean, entry.key));
  if (phrase) {
    return { id: phrase.id, score: 0.97, type: "phrase" };
  }
  let best = null;
  for (const entry of ENTRIES) {
    if (entry.key.length < 4) continue;
    const score = similarity(clean, entry.key);
    if (score >= 0.86 && (!best || score > best.score)) {
      best = { id: entry.id, score };
    }
  }
  if (best) {
    return { id: best.id, score: 0.8 + best.score * 0.1, type: "fuzzy" };
  }
  return null;
}

function labelFor(id, fallback) {
  return CONCEPT_BY_ID.get(id)?.label || fallback;
}

export function analyzeSkill(value) {
  const source = String(value ?? "").trim();
  if (!source) return [];
  if (CACHE.has(source)) return CACHE.get(source);

  const normalized = normalize(source);
  const hits = new Map();
  const add = (hit) => {
    if (!hit) return;
    const current = hits.get(hit.id);
    if (!current || hit.score > current.score) hits.set(hit.id, hit);
  };

  if (normalized && EXACT.has(normalized)) {
    add({ id: EXACT.get(normalized), score: 1, type: "same" });
  } else {
    const segments = normalized
      .split(/\s*(?:,|;|\/|\band\b)\s*/)
      .map((segment) => segment.trim())
      .filter(Boolean);
    if (segments.length > 1) {
      for (const segment of segments) add(matchSegment(segment));
    } else {
      add(matchSegment(normalized));
    }
    if (!hits.size) add(matchSegment(normalized));
  }

  if (!hits.size) {
    const key = stripModifiers(normalized) || normalized;
    hits.set(`raw:${key}`, {
      id: `raw:${key}`,
      score: 1,
      type: "same",
      label: source,
    });
  }

  const list = [...hits.values()].map((hit) => ({
    ...hit,
    label: hit.label || labelFor(hit.id, source),
  }));

  CACHE.set(source, list);
  return list;
}

function conceptRelation(left, right) {
  if (!left || !right) return { score: 0, type: "none" };
  if (left.id === right.id) return { score: 1, type: "same" };
  if (left.broader?.includes(right.id) || right.broader?.includes(left.id)) {
    return { score: 0.7, type: "broader" };
  }
  if (left.related?.includes(right.id) || right.related?.includes(left.id)) {
    return { score: 0.6, type: "related" };
  }
  if (
    left.family &&
    left.family === right.family &&
    !EXCLUSIVE_FAMILIES.has(left.family)
  ) {
    return { score: 0.5, type: "family" };
  }
  return { score: 0, type: "none" };
}

export function compareSkills(leftLabel, rightLabel) {
  let best = {
    score: 0,
    type: "none",
    a: leftLabel,
    b: rightLabel,
    aSkill: String(leftLabel ?? ""),
    bSkill: String(rightLabel ?? ""),
  };

  for (const left of analyzeSkill(leftLabel)) {
    for (const right of analyzeSkill(rightLabel)) {
      let proven = 0;
      let type = "none";
      if (left.id === right.id) {
        proven = Math.min(left.score, right.score);
        type = "same";
      } else {
        const relation = conceptRelation(
          CONCEPT_BY_ID.get(left.id),
          CONCEPT_BY_ID.get(right.id),
        );
        proven = relation.score * Math.min(left.score, right.score);
        type = relation.type;
      }
      if (proven > best.score) {
        best = {
          score: proven,
          type,
          a: leftLabel,
          b: rightLabel,
          aSkill: left.label,
          bSkill: right.label,
        };
      }
    }
  }

  if (best.score === 0) {
    const leftRaw = analyzeSkill(leftLabel)[0];
    const rightRaw = analyzeSkill(rightLabel)[0];
    if (
      leftRaw?.id.startsWith("raw:") &&
      rightRaw?.id.startsWith("raw:") &&
      leftRaw.id !== rightRaw.id
    ) {
      const score = similarity(
        leftRaw.id.slice(4),
        rightRaw.id.slice(4),
      );
      if (score >= 0.88) {
        best = {
          score: 0.8 + score * 0.1,
          type: "fuzzy",
          a: leftLabel,
          b: rightLabel,
          aSkill: leftRaw.label,
          bSkill: rightRaw.label,
        };
      }
    }
  }

  return best;
}

function bestPair(left = [], right = []) {
  let best = {
    score: 0,
    type: "none",
    a: "",
    b: "",
    aSkill: "",
    bSkill: "",
  };
  for (const leftSkill of left) {
    for (const rightSkill of right) {
      const relation = compareSkills(leftSkill, rightSkill);
      if (relation.score > best.score) best = relation;
    }
  }
  return best;
}

export function sharedSkills(left = [], right = [], minimum = 0.6) {
  const found = new Map();
  for (const leftSkill of left) {
    for (const rightSkill of right) {
      const relation = compareSkills(leftSkill, rightSkill);
      if (relation.score < minimum) continue;
      const current = found.get(relation.aSkill);
      if (!current || current.score < relation.score) {
        found.set(relation.aSkill, {
          score: relation.score,
          label: relation.aSkill,
        });
      }
    }
  }
  return [...found.values()]
    .sort((leftSkill, rightSkill) => rightSkill.score - leftSkill.score)
    .slice(0, 3);
}

export function matchProfiles(me = {}, other = {}) {  const theyTeach = bestPair(me.wants, other.offers);
  const youTeach = bestPair(me.offers, other.wants);
  const sharedWant = bestPair(me.wants, other.wants);
  const sharedOffer = bestPair(me.offers, other.offers);

  const mutual = theyTeach.score >= 0.6 && youTeach.score >= 0.6;
  const oneWay = theyTeach.score >= 0.6 || youTeach.score >= 0.6;
  const related = Math.max(
    theyTeach.score,
    youTeach.score,
    sharedWant.score,
    sharedOffer.score,
  );

  let score = 0;
  if (mutual) {
    score = 70 + 20 * theyTeach.score + 10 * youTeach.score;
  } else if (oneWay) {
    score = 40 + 30 * Math.max(theyTeach.score, youTeach.score);
  } else if (sharedWant.score >= 0.7) {
    score = 25 + 15 * sharedWant.score;
  } else if (sharedOffer.score >= 0.7) {
    score = 15 + 15 * sharedOffer.score;
  } else if (related >= 0.5) {
    score = 10 + 10 * related;
  }

  return {
    score: Math.round(Math.min(score, 100)),
    mutual,
    oneWay,
    theyTeach: { ...theyTeach, skill: theyTeach.bSkill },
    youTeach: { ...youTeach, skill: youTeach.aSkill },
    sharedWant,
    sharedOffer,
  };
}
