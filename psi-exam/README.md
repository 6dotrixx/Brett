# AZ Property & Casualty — PSI-Style Practice Exam

A self-contained, zero-dependency practice exam for the **Arizona Property & Casualty
insurance producer license** (PSI exam format). Open `index.html` in any browser — no
build step or server required.

## Modes

- **Full Exam Simulation** — 150 questions, 165-minute countdown timer, no feedback
  until submission, auto-submits at time expiry. Pass mark 70%.
- **Quick Quiz** — 25 random questions with instant feedback and explanations.
- **Practice by Section** — drill any combination of outline sections with instant feedback.

Every attempt ends with a per-section score breakdown and a full answer review with
explanations (filterable to missed questions only).

## Question bank & rotation

300 original practice questions in `data/bank-{a..f}.js`, organized by the PSI
Arizona P&C content outline. Like the real PSI exam, each simulation draws 150
questions from the pool while preserving the outline's section proportions, and
questions the browser has seen the fewest times rotate in first (tracked in
localStorage) — so consecutive attempts are different tests.

| Section | Pool | Per 150-question exam |
| --- | --- | --- |
| Insurance Regulation | 30 | 15 |
| General Insurance Concepts | 24 | 12 |
| P&C Basics | 40 | 20 |
| Dwelling Policy | 16 | 8 |
| Homeowners Policy | 30 | 15 |
| Auto Insurance | 40 | 20 |
| Commercial Property & CPP | 24 | 12 |
| Commercial General Liability | 20 | 10 |
| Businessowners Policy | 16 | 8 |
| Workers Compensation | 24 | 12 |
| Other Lines (Marine, Crime, Bonds, Umbrella, Flood) | 24 | 12 |
| Arizona Laws & Rules | 12 | 6 |

Question format (`data/bank-*.js`):

```js
{
  s: "Section name",
  q: "Question text",
  c: ["choice", "choice", "choice", "choice"],
  a: 0,            // index of the correct choice (choices are shuffled at runtime)
  e: "Explanation shown in feedback and review"
}
```

Add or edit questions by appending objects to any bank file — the app picks up
counts and sections automatically.

## Disclaimer

This is an original study aid written to the public PSI content outline. It is **not**
actual PSI exam content. State-specific figures (limits, notice periods, CE hours) change —
verify current requirements with the Arizona Department of Insurance and Financial
Institutions (DIFI) and the PSI candidate handbook before your exam.
