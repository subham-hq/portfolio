# Editing the content

No copy lives in a component. Everything a reader sees is in `src/content/`.

| File | Holds |
| --- | --- |
| `site.ts` | Name, links, nav, and every version of the bio |
| `projects.ts` | Projects, case-study sections, spec facts |
| `records.ts` | Timeline, roadmap, credentials, skills, languages |

Add a project to `projects.ts` and it appears on the index, the work page, its
own detail route and `sitemap.xml`. Nothing else needs touching.

---

## Rewrite the bio. Seriously.

Every string under `bio` in `site.ts` is a draft. It was written from your
LinkedIn and GitHub bios and it deliberately keeps your sentence rhythm — short
declaratives, a concrete claim before an abstract one, no adjective you can't
defend. But it is not your voice.

This matters more than it sounds. The people you want to reach read a lot of
generated text, and the tell is not vocabulary — it is that generated copy is
*evenly* good. Real writing has a sentence that is slightly too long because the
thought needed the room, and a detail nobody would invent. Your own bios have
both. "It taught me systems before I could write one, and the difference between
capability you buy and capability you have" is a line I could not have written
for you, and it is the best sentence in either bio.

### Method

1. Read the draft.
2. Close it.
3. Say the same thing out loud, as if to an engineer you respect.
4. Write what you said.
5. Cut the first sentence — it is almost always throat-clearing.

### Constraints per slot

| Slot | Length | Test |
| --- | --- | --- |
| `headline` | ≤ 12 words | Read aloud. If it sounds like a slogan, cut it. |
| `lede` | 3 sentences | Every claim checkable. |
| `oneLiner` | 1 sentence | Must survive being quoted with no context. |
| `short` | ~40 words | Third person. For directories and README headers. |
| `elevator` | ~30 seconds spoken | Time it. |
| `long` | 5 paragraphs | The About page. Re-orderable — each paragraph stands alone. |
| `metaDescription` | ≤ 155 characters | Count it. Google truncates. |
| `ogDescription` | ≤ 200 characters | More room in an unfurl than in a SERP. |

### Rules that apply to all of them

- No adjective you would not defend in an interview. "Passionate", "cutting-edge",
  "robust" and "scalable" are all claims until proven, and none of them are proven.
- Prefer a number to an intensifier. "Four years running production" beats
  "extensive operations experience".
- Never write that you are "passionate about" anything. Show the thing instead.
- Do not use an em dash where a full stop works. You will notice, after a while,
  that generated prose leans on them.

---

## Keeping `currentFocus` honest

`currentFocus` in `site.ts` drives the status block on the index, including an
"Updated" date. A stale "currently building" is worse than no status at all — it
tells a reader that the last time you touched this was months ago.

Set a monthly reminder. If it is not true this month, change it or delete the row.

---

## Promoting a study repo to a system

`kind: "study"` renders an honest empty state. Change it to `"system"` only when
you can fill in all four case-study sections without hand-waving:

- **Problem** — what breaks if this doesn't exist, stated concretely.
- **Approach** — the design, and where the constraint was enforced.
- **Trade-offs** — what you chose *against*, and the condition under which you
  would change your mind. This is the section senior reviewers read first.
- **What I'd change** — proof you kept thinking after it shipped.

If any section would be padding, the repo is still a study. That is fine.
