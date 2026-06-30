# Module Quality Report

Generated: 2026-06-30T10:55:40.223Z
Module path: /mnt/d/Wonderful/openskill-galaxy/03-modules/module-python-basic

## 1. Data Scale

| Data Type | Count |
|-----------|------|
| courses | 12 |
| lessons | 171 |
| knowledge-points | 706 |
| questions | 2500 |
| exams | 85 |
| cases | 185 |
| routes | 25 |
| glossary | 320 |
| faqs | 220 |
| tags | 331 |

## 2. Question Type Distribution

| Type | Count |
|------|------|
| single | 1482 |
| judge | 455 |
| short | 392 |
| multiple | 171 |

## 3. Difficulty Distribution

| Difficulty | Count | Percentage |
|------------|------|------------|
| medium | 1083 | 43.3% |
| easy | 1046 | 41.8% |
| hard | 371 | 14.8% |

## 4. Duplicate IDs

✅ No duplicate IDs found.

## 5. Reference Integrity

✅ All key references are valid.

## 6. File Sizes

| File | Size (KB) |
|------|-----------|
| questions.json | 1876.3 |
| knowledge-points.json | 668.9 |
| faqs.json | 111.4 |
| lessons.json | 111.3 |
| cases.json | 109.3 |
| glossary.json | 95.9 |
| exams.json | 62.7 |
| tags.json | 41.3 |
| routes.json | 22.0 |
| courses.json | 8.0 |
| search-index.json | 1037.3 |

## 7. Search Index

✅ search-index.json exists (1037.3 KB)

## 8. Optimization Suggestions

- **questions.json** is large (1876 KB). Consider splitting or lazy-loading.
- Hard questions are below 15%. Consider adding more challenging questions.

## 9. Next Steps

- Replace generated questions with real textbook/exam questions (source_type: "official")
- Enrich knowledge-point contentMarkdown with detailed derivations and diagrams
- Add more case_analysis questions for practical scenarios
- Run validate-module.mjs after any data changes