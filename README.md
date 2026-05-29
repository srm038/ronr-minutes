# ronr-minutes

Meeting minutes conforming to Robert's Rules of Order (RONR). Write minutes in YAML, validate against schema, render to Markdown, convert to PDF.

## Pipeline

```
.minutes.yml  ──→  .minutes.md  ──→  .minutes.pdf
   (editor)       (yml2md.ts)       (md2pdf.sh)
```

## Schema

`minutes.schema.yml` — JSON Schema (draft-07) in YAML format. Covers all RONR §41-48 requirements:

- Calls to order, opening/closing ceremonies, roll call, quorum
- Minutes approval (Approved / Approved as Corrected with rules)
- Reports with motions
- Unfinished business and new business with motions
- Votes: Voice, Show of Hands, Rising, Counted Division, Roll Call, Ballot, Unanimous Consent
- Each vote method enforces required/forbidden fields (e.g., Roll Call requires `members`; Unanimous Consent forbids `yes`/`no`)
- Adjournment with Adjourn-only motion type constraint
- Dispositions with conditional `referred_to` / `postponed_to`

## Usage

### Validate

Via editor (Helix, VS Code) — yaml-language-server validates against `minutes.schema.yml` on save.

### Convert YAML to Markdown

```bash
bun yml2md.ts sample.minutes.yml > sample.minutes.md
```

### Convert Markdown to PDF

```bash
./md2pdf.sh sample.minutes.md
```

### Full pipeline

```bash
bun yml2md.ts sample.minutes.yml > sample.minutes.md && ./md2pdf.sh sample.minutes.md
```

## Requirements

- [Bun](https://bun.sh) — runtime for yml2md.ts
- [Pandoc](https://pandoc.org) + [XeLaTeX](https://tug.org/texlive/) — PDF conversion
- Times New Roman font (or substitute via `md2pdf.sh`)
- yaml-language-server (optional, for editor validation)

```bash
brew bundle
```

## Format Reference

### Minimal minutes

```yaml
title: Committee Name
date: 2025-01-15
status: Draft
meeting_type: Regular
calling_to_order:
  time: 7:00 PM
  by: Chair
adjournment:
  motion:
    type: Adjourn
    text: That the meeting adjourn.
    by: Member
```

### Motion with vote

```yaml
motions:
  - type: Main Motion
    text: That the budget be approved.
    by: Member
    seconded: true
    vote:
      method: Voice
      result: Carried
```

### Roll call vote

```yaml
vote:
  method: Roll Call
  result: Carried
  members:
    - name: Alice
      vote: yes
    - name: Bob
      vote: yes
    - name: Charlie
      vote: abstain
```
