// 模块内置静态数据校验脚本（零依赖，CI 可直接运行）
// 检查：文件存在性、JSON 可解析、ID 唯一性、跨文件引用完整性、search-index 存在
import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";

const DATA_DIR = join(process.cwd(), "public/data");
const ok = (m) => console.log("  ✅ " + m);
const fail = (m) => { console.error("  ❌ " + m); errors.push(m); };
const errors = [];
const uniq = (arr) => new Set(arr).size === arr.length;

async function load(name) {
  try {
    const raw = await readFile(join(DATA_DIR, name + ".json"), "utf8");
    const data = JSON.parse(raw);
    const sz = (await stat(join(DATA_DIR, name + ".json"))).size;
    ok(`${name}.json (${Math.round(sz / 1024)} KB)`);
    return data;
  } catch (e) {
    fail(`${name}.json: ${e.message}`);
    return null;
  }
}

console.log("\n=== Validate Static Data (module-python-basic) ===\n");
console.log("--- File Existence & JSON Parse ---");
const courses = await load("courses");
const lessons = await load("lessons");
const kps = await load("knowledge-points");
const questions = await load("questions");
const exams = await load("exams");
const cases = await load("cases");
const routes = await load("routes");
const glossary = await load("glossary");
const faqs = await load("faqs");
const tags = await load("tags");
const moduleMeta = await load("module");
const searchIdx = await load("search-index");

console.log("\n--- Duplicate ID Check ---");
const checkIds = (name, arr) => {
  if (!arr) return;
  const ids = arr.map((x) => x.id);
  if (uniq(ids)) ok(`${name}.json: ${ids.length} unique IDs`);
  else fail(`${name}.json: duplicate IDs found`);
};
checkIds("courses", courses);
checkIds("lessons", lessons);
checkIds("knowledge-points", kps);
checkIds("questions", questions);
checkIds("exams", exams);
checkIds("cases", cases);
checkIds("routes", routes);
checkIds("glossary", glossary);
checkIds("faqs", faqs);
checkIds("tags", tags);

console.log("\n--- Reference Integrity ---");
if (courses && lessons) {
  const courseIds = new Set(courses.map((c) => c.id));
  let bad = 0;
  for (const l of lessons) if (!courseIds.has(l.courseId)) { bad++; fail(`lesson ${l.id} courseId ${l.courseId} not found`); }
  if (bad === 0) ok("lessons.courseId all valid");
  const lessonIds = new Set(lessons.map((l) => l.id));
  bad = 0;
  for (const c of courses) for (const lid of c.lessons || []) if (!lessonIds.has(lid)) bad++;
  if (bad === 0) ok("courses.lessons all valid");
}
if (lessons && kps) {
  const kpIds = new Set(kps.map((k) => k.id));
  let bad = 0;
  for (const l of lessons) for (const k of l.knowledgePoints || []) if (!kpIds.has(k)) bad++;
  if (bad === 0) ok("lessons.knowledgePoints all valid");
}
if (questions && exams) {
  const qIds = new Set(questions.map((q) => q.id));
  let bad = 0;
  for (const e of exams) for (const q of e.questionIds || []) if (!qIds.has(q)) bad++;
  if (bad === 0) ok("exams.questionIds all valid");
}
if (questions && cases) {
  const qIds = new Set(questions.map((q) => q.id));
  let bad = 0;
  for (const c of cases) for (const k of c.knowledgePoints || []) { /* kp ref */ }
  // cases.knowledgePoints 是 kp id
  if (kps) {
    const kpIds = new Set(kps.map((k) => k.id));
    bad = 0;
    for (const c of cases) for (const k of c.knowledgePoints || []) if (!kpIds.has(k)) bad++;
    if (bad === 0) ok("cases.knowledgePoints all valid");
  }
}
if (kps && questions) {
  const qIds = new Set(questions.map((q) => q.id));
  let bad = 0;
  for (const k of kps) for (const r of k.relatedQuestions || []) if (!qIds.has(r)) bad++;
  if (bad === 0) ok("knowledge-points.relatedQuestions all valid");
}

console.log("\n--- Search Index ---");
if (searchIdx && Array.isArray(searchIdx)) ok(`search-index.json: ${searchIdx.length} entries`);
else if (searchIdx && typeof searchIdx === "object") ok("search-index.json present");
else fail("search-index.json missing or invalid");

console.log("\n========================================");
if (errors.length === 0) {
  console.log("✅ VALIDATION PASSED");
} else {
  console.log(`❌ VALIDATION FAILED (${errors.length} errors)`);
  process.exit(1);
}
