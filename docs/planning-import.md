# PlanningImport — Logic Documentation

`app/Imports/PlanningImport.php`

Imports a structured Excel/ODS file into the planning hierarchy for a given `PlanningVersion`.
Uses [Maatwebsite Excel](https://docs.laravel-excel.com/) (`ToCollection`, `WithStartRow`, `WithLimit`).

---

## Column Layout (0-indexed)

| Index | Content                          |
|-------|----------------------------------|
| 0     | Code + Name (e.g. `1.02 - Xxx`) or Name-only (no code) |
| 1     | Indicator name                   |
| 2     | Baseline value                   |
| 3     | Year 1 — Target                  |
| 4     | Year 1 — Budget                  |
| 5     | Year 2 — Target                  |
| 6     | Year 2 — Budget                  |
| 7     | Year 3 — Target                  |
| 8     | Year 3 — Budget                  |
| 9     | Year 4 — Target                  |
| 10    | Year 4 — Budget                  |
| 11    | Year 5 — Target                  |
| 12    | Year 5 — Budget                  |
| 13    | Perangkat Daerah                 |
| 14    | Keterangan                       |

Years are dynamic: `startYear` through `startYear + 4`, read from `PlanningVersion.year_start`.

---

## Constructor

```
FUNCTION __construct(versionId, startCell, endCell):
    version = PlanningVersion.findOrFail(versionId)
    startYear = version.year_start

    extract numeric part from startCell → startRow
    extract numeric part from endCell   → endRow
```

- `startCell` / `endCell` are Excel cell references like `"A5"`, `"A120"`.
- The numeric part is extracted via regex and used to slice the sheet.

---

## startRow / limit

```
FUNCTION startRow():
    RETURN startRow   -- tells Excel where to begin reading

FUNCTION limit():
    RETURN endRow - startRow + 1   -- number of rows to read
```

---

## collection() — Main Import Logic

Runs inside a **single DB transaction** (all-or-nothing).

### State Variables

```
lastActivity       = null    -- the most recently persisted activity node
lastCodedActivity  = null    -- the most recently persisted CODED activity node
currentLevel       = 0       -- the depth level of lastActivity
stack              = {}      -- map of level → activity node (for parent lookup)
counters           = {}      -- map of parentCode → auto-increment counter
```

---

### Per-Row Processing

```
FOR EACH row IN rows:

    excelRow = rowIndex + startRow
    row      = row.toArray()

    IF count(row) < 15:
        THROW ValidationException("Invalid column count at row {excelRow}")

    label         = trim(row[0])   -- col A: code+name or name-only
    indicatorName = trim(row[1])   -- col B: indicator name
```

---

### Step 1 — Determine Row Type

```
IF label == "":
    -- Empty col A

    IF indicatorName != "" AND lastActivity != null:
        -- CONTINUATION ROW: extra indicator for the same activity
        activity = lastActivity
        level    = currentLevel
    ELSE:
        -- CONTINUE (skip row entirely)
        CONTINUE

ELSE:
    -- ACTIVITY ROW (col A has content)
    → go to Step 2
```

**Row types:**

| col A | col B | Meaning |
|-------|-------|---------|
| empty | has value | Continuation — extra indicator for `lastActivity` |
| empty | empty | Blank row — skipped safely |
| has value (with ` - `) | any | Coded activity row |
| has value (no ` - `) | any | Name-only row — auto-assigned code |

---

### Step 2 — Parse Label & Resolve Code

```
parts   = split(label, " - ", limit=2)
hasCode = (count(parts) == 2)
code    = hasCode ? trim(parts[0]) : null
name    = hasCode ? trim(parts[1]) : trim(parts[0])
```

**Example splits:**

| label | hasCode | code | name |
|-------|---------|------|------|
| `"1.02.01 - PROGRAM PENUNJANG..."` | true | `1.02.01` | `PROGRAM PENUNJANG...` |
| `"Meningkatnya Akuntabilitas..."` | false | null | `Meningkatnya Akuntabilitas...` |

---

### Step 3 — Resolve Level & Parent

**Case A: Coded row (hasCode = true)**

```
level  = count_dots_in(code)
           -- "1"        → 0 dots → level 0  (program)
           -- "1.02"     → 1 dot  → level 1  (activity)
           -- "1.02.01"  → 2 dots → level 2  (sub_activity)
           -- "1.02.01.001" → 3 dots → level 3 (output)

parent = nearest parent found in stack looking backwards from level - 1
           -- If levels jump (e.g. from 2 straight to 4), we search down 3, 2, 1 until found.
```

**Case B: No-code row (hasCode = false)**

```
parent     = lastCodedActivity          -- nest under the most recent coded node
level      = parent ? dot_count(parentCode) + 1 : 0  -- one level deeper than parent

parentCode = parent.code ?? ""
counters[parentCode] += 1
padded     = leftPad(counters[parentCode], 4, "0")

code       = parentCode != ""
             ? "{parentCode}.{padded}"  -- e.g. "1.02.01.0001"
             : padded                   -- e.g. "0001" (edge case: no parent)
```

**Counter example:**

```
Parent: "1.02.01"
  → first no-code child  → code = "1.02.01.0001"
  → second no-code child → code = "1.02.01.0002"
  → third                → code = "1.02.01.0003"

Parent: "1.02.02"  (new coded row later)
  → first no-code child  → code = "1.02.02.0001"  (counter resets per parentCode)
```

```
currentLevel = level
```

---

### Step 4 — Map Level to Type

```
typeMap = {
    0 → "program",
    1 → "activity",
    2 → "sub_activity",
    3 → "output"
}

type = typeMap[level] ?? "output"
```

---

### Step 5 — Persist Activity

```
activity = PlanningActivityVersion.updateOrCreate(
    WHERE: { planning_version_id, code },
    SET:   {
        parent_id:       parent.id ?? null,
        name:            name,
        type:            type,
        full_code:       code,
        perangkat_daerah: row[13],
        keterangan:      row[14],
        sort_order:      counters[parent.code ?? ""] ?? 0,
    }
)

lastActivity = activity
IF hasCode == true:
    lastCodedActivity = activity
    stack[level]      = activity    -- register at this depth for future parent lookups
    -- clear stack entries deeper than `level` to prevent hierarchy bugs
```

> `updateOrCreate` is **idempotent**: re-importing the same file updates existing records rather than duplicating them.

---

### Step 6 — Persist Indicator

```
IF indicatorName != "":
    indicator = PlanningActivityIndicator.updateOrCreate(
        WHERE: { planning_activity_version_id: activity.id, name: indicatorName },
        SET:   { baseline: row[2] }
    )
ELSE:
    indicator = null
```

---

### Step 7 — Persist Yearly Data (5 years)

```
FOR i IN 0..4:
    year          = startYear + i
    targetColIdx  = 3 + (i * 2)    -- cols 3,5,7,9,11
    budgetColIdx  = 4 + (i * 2)    -- cols 4,6,8,10,12

    target = row[targetColIdx] (trimmed, comma→dot, or null if empty)
    budget = row[budgetColIdx] (strip thousand-separators, parse float, or null)

    IF indicator != null AND target != null:
        PlanningActivityYear.updateOrCreate(
            WHERE: { yearable_id: indicator.id, yearable_type: "PlanningActivityIndicator", year },
            SET:   { target }
        )

    IF label != "" AND budget != null:
        -- Budget only written on primary activity rows (not continuation rows)
        PlanningActivityYear.updateOrCreate(
            WHERE: { yearable_id: activity.id, yearable_type: "PlanningActivityVersion", year },
            SET:   { budget }
        )
```

**Budget parsing (Indonesian locale):**
- Input: `"27.323.594.154,00"` (dots = thousand sep, comma = decimal)
- Strip dots → `"27323594154,00"` → replace comma with dot → `27323594154.00`

---

## Full Flow Diagram

```
START
  │
  ▼
Load PlanningVersion → get startYear
  │
  ▼
FOR EACH Excel row:
  │
  ├─ col A empty?
  │     ├─ col B has value + lastActivity exists → CONTINUATION (reuse lastActivity)
  │     └─ otherwise → CONTINUE (skip empty row)
  │
  └─ col A has content?
        │
        ├─ contains " - "?
        │     ├─ YES → CODED ROW
        │     │         level  = dot_count(code)
        │     │         parent = nearest_in_stack(level)
        │     │
        │     └─ NO  → NO-CODE ROW
        │               parent = lastCodedActivity
        │               level  = dot_count(parent.code) + 1
        │               code   = "{parent.code}.{XXXX}"  (auto-incremented per parent)
        │
        ├─ Resolve type by level (program / activity / sub_activity / output)
        ├─ upsert PlanningActivityVersion
        ├─ if CODED → stack[level] = activity & lastCodedActivity = activity & trim stack
        ├─ lastActivity = activity
        │
        ├─ upsert PlanningActivityIndicator  (if col B non-empty)
        │
        └─ FOR each of 5 years:
              ├─ upsert indicator target  (if indicator && target present)
              └─ upsert activity budget   (if primary row && budget present)

END (all inside one DB transaction)
```

---

## Error Handling

| Condition | Behavior |
|-----------|----------|
| Row has fewer than 15 columns | Throws `ValidationException` with row number |
| col A empty, col B empty | `continue` — cleanly skips blank rows |
| Unknown level (> 3) | Type defaults to `"output"` |
| Missing target/budget cells | Silently skipped (null) |
