/**
 * Recruiter FAQ.
 *
 * These are the objections a hiring manager forms silently when they see a
 * career-changer with a short commercial track record. Leaving them unanswered
 * does not make them go away — it just moves the decision somewhere you cannot
 * influence it. Answering them plainly, in your own words, before they are
 * asked, is the most confident thing on the site.
 *
 * Rules for editing: answer the real question, do not get defensive, and never
 * claim something a first technical screen would contradict.
 */

export interface Faq {
  question: string;
  answer: string;
}

export const faqs: Faq[] = [
  {
    question: "Why move from running a business into engineering?",
    answer:
      "In operations, output scales with headcount — you want more, you hire more. " +
      "Software does not work that way, and AI widens the gap further. I want to " +
      "work where a good decision compounds instead of being consumed. That is the " +
      "whole reason for the move, and it is why the direction is systems and " +
      "infrastructure rather than anything faster to enter.",
  },
  {
    question: "You have no commercial software experience. Why hire you?",
    answer:
      "Correct, and I would not argue the point. What I would offer instead is " +
      "three pull requests merged into Litestar and Strawberry GraphQL — libraries " +
      "other people ship on — each reviewed by a maintainer who had no reason to be " +
      "generous. That is the closest public evidence there is of working inside a " +
      "codebase I did not write, to someone else's standard. Underneath it sits " +
      "four years of owning outcomes in a system where mistakes cost money the same " +
      "week they happen, which is where the instinct to design for failure first " +
      "comes from.",
  },
  {
    question: "How much of your GitHub is real work versus coursework?",
    answer:
      "Three systems and four study repositories, and the site labels which is " +
      "which. The systems have trade-offs I can walk through end to end: OrderFlow, " +
      "Postmark and site-auditor. The rest is deliberate practice in Python " +
      "internals, C and algorithms — real code, categorised for what it is rather " +
      "than dressed up as product work. The upstream contributions are the part I " +
      "would look at first, and they are not on my GitHub at all: they are in other " +
      "people's repositories.",
  },
  {
    question: "Are you available while studying and running the business?",
    answer:
      "Yes, for full-time work. The degree is structured to run alongside " +
      "employment, and the business is operationally stable with the day-to-day " +
      "handled. I would rather you ask this directly in a first call than infer it.",
  },
  {
    question: "Remote, hybrid or relocation?",
    answer:
      "All three. I am near Kolkata, UTC+05:30, which overlaps a full working day " +
      "with EMEA and most of the morning with US Eastern. I am open to relocation " +
      "for the right team.",
  },
  {
    question: "What do you want to be doing in three years?",
    answer:
      "Backend and platform work on systems where correctness matters, moving " +
      "toward the infrastructure ML runs on — serving, data pipelines, evaluation. " +
      "Not a research role. The engineering underneath one.",
  },
  {
    question: "What are you weakest at right now?",
    answer:
      "Production operations. I can build the system and I have started writing the " +
      "tests that hold it — the upstream work shipped with regression coverage " +
      "because a maintainer would not have taken it otherwise. What I have not done " +
      "is keep something alive under real traffic with someone paging me at 3am. " +
      "That is the experience I am looking for a team to give me, and it is the " +
      "first thing I would want to be held to a standard on.",
  },
];
