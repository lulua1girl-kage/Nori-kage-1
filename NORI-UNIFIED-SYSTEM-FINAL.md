# NORI — Unified Student Operating System
## Final system specification / weekend build contract

Status: FINAL SYSTEM DIRECTION
Branch: nori-mentor-engine-v2
Purpose: evolve the existing Handbook + KAGE + Nori system into one personal academic operating system.

---

## 1. The decision

Nori is not a generic chatbot and not a collection of unrelated productivity features.

Nori is the user's **academic operating system**.

It combines:

- the existing Handbook as constitution
- KAGE as academic state and record
- Nori as mentor, investigator, planner, tutor, and accountability layer
- a task/assignment system
- calendar/timetable
- reminders and alarms
- focus sessions and distraction blocking
- study/retrieval workflow
- recovery management
- progress/merit/streak/degree
- voice + text interaction
- a single daily command center

The goal is not to make the user manage another productivity app.

The goal is:

**Nori understands what matters, protects the time required for it, helps the user do it, checks whether it actually happened, and adapts.**

---

## 2. Existing architecture remains the foundation

Do NOT replace the Handbook.

Do NOT replace KAGE.

Do NOT replace the existing Nori shell.

Do NOT turn the system into a giant autonomous agent swarm.

The architecture is:

HUMAN OVERRIDE
    ↓
HANDBOOK / CONSTITUTION
    ↓
KAGE + CURRENT ACADEMIC STATE
    ↓
NORI CONTROL BRAIN
    ↓
DAILY OPERATING LAYER
    ↓
TUTOR / MENTOR / RESEARCH / VOICE
    ↓
TOOLS AND DEVICE ACTIONS
    ↓
EVIDENCE + REVIEW
    ↓
HANDBOOK/KAGE STATE UPDATE

The deterministic layer owns policy and state.
The model reasons, explains, tutors, plans, and communicates.
Device capabilities execute approved actions.
Evaluation checks whether Nori is actually helping.

---

## 3. The missing layer identified by research

Current Nori v2 already handles:

- merit
- streak
- degree
- investigation
- failure classification
- recovery
- study commitments
- study blocks
- learning evidence
- retrieval
- KAGE import
- handbook context
- Human Override

The missing product layer is:

### A. Command center
One screen showing:
- what matters today
- next required action
- current study block
- deadlines
- school timetable
- recovery status
- focus/block status
- important reminders
- Merit/Degree/Streak
- learning evidence

The user should not need to hunt through five screens to know what to do.

### B. Academic task system
Tasks are not generic to-dos.

Every meaningful academic task should be able to contain:
- subject
- topic
- type
- deadline
- estimated effort
- priority
- prerequisites
- status
- evidence required
- linked assessment
- linked study block
- recurrence when appropriate

Examples:
- Chemistry chapter study
- Biology exam preparation
- Math U4 problem set
- English homework
- FutureX lesson
- entrance revision

Nori should distinguish:
**deadline work, learning work, maintenance work, and optional projects.**

### C. Timetable/calendar
Nori needs a model of fixed commitments:
- school
- exams
- classes
- recurring study windows
- recovery/sleep protection
- important events

It should use the timetable to decide whether a proposed plan is realistic.

It must not schedule academic recovery by stealing sleep.

### D. Reminder/alarm layer
Reminders should be meaningful, not notification spam.

Nori should support:
- task due reminders
- study-start reminders
- study-end reminders
- exam reminders
- preparation reminders
- recovery reminders
- recurring reminders
- morning/evening check-ins when useful

Critical distinction:
A reminder says **what needs attention**.
An alarm says **a time-sensitive action is beginning**.

### E. Focus / distraction-control layer
This is the Freedom/Focus-style layer.

A focus session can define:
- start/end
- allowed apps
- blocked apps
- allowed websites
- blocked websites
- emergency/essential exceptions
- whether the session is locked
- the commitment it protects

Instagram/Reels should be treated as an environmental problem when they repeatedly interfere with commitments—not simply as a Merit violation.

Nori should be able to say:
“You committed to 45 minutes of Math. Focus mode is active. Instagram is blocked until the block ends.”

If the user breaks the session, Nori records the event and investigates it.

The system should not turn one failure into an entire-day failure.

### F. Learning operating system
A timer alone is not studying.

Every study block should optionally have:

1. Objective
2. Learn
3. Attempt
4. Retrieve
5. Check
6. Record evidence
7. Schedule next review

Nori should distinguish:
- watched a lesson
- read notes
- attempted problems
- solved independently
- explained concept
- retrieved from memory
- corrected an error
- passed an assessment

AI assistance is not automatically learning evidence.

### G. Tutor mode
Nori should have a formal tutoring behavior:

**Tutor**
- explain at the user's level
- teach step by step
- ask for attempts
- give hints before answers when appropriate
- detect misconceptions
- require independent checks
- adapt difficulty
- connect to the student's current course state

**Mentor**
- decide what deserves attention
- challenge weak reasoning
- investigate avoidance/distraction
- protect capacity
- adapt plans

These are different jobs, but they share the same state.

### H. Daily adaptive planning
Nori should generate a plan from:

- fixed timetable
- deadlines
- exam proximity
- task priority
- backlog
- current capacity
- previous execution
- recovery
- learning needs

The plan is a hypothesis.

At execution time:
- if capacity changes → adapt
- if knowledge is missing → tutor
- if plan is unrealistic → replan
- if distraction occurs → control environment
- if avoidance occurs → investigate
- if the system caused the failure → Nori owns the planning error

### I. Review / weekly intelligence
Nori should periodically answer:

- What actually happened?
- What was planned?
- Which subjects are falling behind?
- Which failure causes are recurring?
- Is the user learning independently?
- Are plans consistently too large?
- Is distraction improving?
- Is recovery being respected?
- Which intervention actually worked?

This is not a motivational report.

It is a control-system review.

---

## 4. The Handbook remains the authority

The existing vocabulary stays:

- Merit
- Streak
- Degree
- Consequence
- Recovery
- Integrity
- Investigation
- Human Override

But Nori now applies them through evidence.

### Investigation protocol

EVENT → EVIDENCE → CAUSE → PATTERN → RESPONSE → REVIEW

Possible causes:

- capacity
- knowledge
- planning
- distraction
- avoidance
- system failure
- unknown

Examples:

Capacity:
- reduce load
- protect recovery
- no punishment

Knowledge:
- tutor
- practice
- independent check

Planning:
- shrink/rebuild plan

Distraction:
- remove pathway
- restart
- strengthen focus environment

Avoidance:
- direct challenge
- bounded intervention
- investigate repeated pattern

System failure:
- Nori changes the system
- do not blame the student for a bad system

Unknown:
- collect evidence first

### Degree rule

No automatic degree escalation from a single event.

A pattern can produce a recommendation.

The human remains the final authority.

---

## 5. Merit and streak philosophy

Merit should reward meaningful reliability:

- completing important commitments
- independent learning
- honest reporting
- successful recovery
- adapting intelligently
- following through after correction

Merit should NOT reward:
- suffering unnecessarily
- sacrificing sleep
- blind obedience
- pretending a task was completed
- excessive app usage just to collect points

Streaks are continuity signals, not chains.

Breaking a streak does not erase progress.

---

## 6. The daily Nori loop

Every day:

### 1. ORIENT
Nori knows:
- timetable
- deadlines
- priorities
- capacity
- current state

### 2. CHOOSE
Nori identifies the smallest set of actions that actually matter.

### 3. PROTECT
Nori schedules reminders and focus protection.

### 4. START
User starts a block.

### 5. GUIDE
Nori tutors/mentors as needed.

### 6. VERIFY
Nori checks execution and learning evidence.

### 7. RECOVER
If capacity is poor, the system protects recovery.

### 8. ADAPT
The remaining day is replanned from reality.

### 9. REVIEW
Nori records what worked and what did not.

This is the central operating loop.

---

## 7. Nori's modes

### READY
“What matters now?”

### PLANNER
Build/rebuild today's plan.

### FOCUS
Protect a commitment from distractions.

### TUTOR
Teach the current academic task.

### MENTOR
Reason about decisions, avoidance, priorities, and discipline.

### RECOVERY
Reduce load and protect health/sleep/readiness.

### REVIEW
Analyze execution and patterns.

### COMMAND
Execute safe device/app actions requested by the user.

The user should be able to move between these naturally by voice or text.

---

## 8. Nori should feel like one system

The user should NOT have to say:

“Open my task app.”
“Open my blocker.”
“Open my calendar.”
“Open KAGE.”
“Ask ChatGPT.”
“Start my timer.”

Instead:

> “Nori, what should I do now?”

Nori should answer from the unified state.

Or:

> “Start my Chemistry block.”

Nori should:
- identify the correct task
- start the study block
- activate the appropriate focus protection
- show the objective
- become Tutor/Mentor when needed
- record completion/evidence afterward

Or:

> “I can't finish this.”

Nori should investigate instead of immediately labeling it failure.

---

## 9. Device-control principles

Device controls exist to protect the academic mission.

They are not the mission.

Actions should be explicit, understandable, and reversible where reasonable.

Focus blocking may be strict during a committed session.

Outside a session, Nori should not unnecessarily control the phone.

The system must preserve emergency/essential access.

No consequence should create a situation where the user is trapped in an unsafe or unreasonable state.

---

## 10. Android implementation direction

For actual Android enforcement:

- exact alarms are appropriate for genuinely user-facing precise alarms, subject to Android's alarm permissions
- persistent scheduled background work should use Android's persistent scheduling mechanisms rather than relying on a web page remaining open
- notifications require the appropriate Android notification permission on modern Android
- app blocking can use Android's accessibility capabilities where appropriate and permitted

The app should detect and clearly explain required permissions instead of silently depending on them.

The web/Jarvis shell remains the interface; native Android capabilities provide the device-level enforcement layer.

---

## 11. What Nori should NOT become

Do not add complexity merely because it sounds advanced.

No:
- giant multi-agent swarm
- endless dashboards
- fake psychological diagnosis
- manipulative punishment
- notification flooding
- meaningless gamification
- AI-generated homework presented as learning
- giant memory of irrelevant personal history
- automatic escalation without investigation
- productivity rituals that consume study time
- feature-building that becomes the user's new distraction

Complexity must be earned by a demonstrated failure of the simpler system.

---

## 12. Privacy and memory boundary

Nori should remember what is operationally necessary:

- goals
- timetable
- subjects
- assignments
- deadlines
- study preferences
- current progress
- learning evidence
- system state
- relevant recent decisions

Nori should NOT require a permanent archive of sensitive personal history to mentor effectively.

The mentor should reason primarily from:
**current reality + academic state + handbook + recent evidence.**

---

## 13. Research-derived design principles

Current productivity tools demonstrate that reminders, recurring schedules, calendars, tasks, focus sessions, blocklists, and cross-device scheduling are useful building blocks. Notion, for example, supports reminders, recurring database templates, automations, and calendar/task integration. citeturn0search0turn0search4turn0search15

Focus tools demonstrate that scheduled blocking, recurring focus sessions, locked sessions, blocklists, and multi-device protection can turn intention into environmental support. citeturn0search8turn0search7

Android itself supports precise user-facing alarms, persistent background scheduling, and notification permissions, meaning Nori's alarm/reminder/focus system should be designed as a real device feature rather than as a browser timer pretending to be one. citeturn1search0turn1search1turn1search5

The important product insight is not “copy every feature.”
It is:

**Nori should unify the useful functions behind one academic decision system.**

---

## 14. Final priority order

### P0 — Core academic control
1. Handbook integrity
2. KAGE state
3. Daily command center
4. Task/deadline model
5. Timetable/calendar model
6. Study-block lifecycle
7. Investigation/recovery
8. Learning evidence

### P1 — Environmental control
9. Reminders
10. Alarms
11. Focus sessions
12. App/site blocking
13. Focus-session violation logging

### P2 — Intelligence
14. Adaptive planning
15. Tutor mode
16. Mentor mode
17. Retrieval/review scheduling
18. Weekly system review
19. Pattern detection

### P3 — Quality
20. Evaluation/traces
21. Privacy controls
22. Reliable state synchronization
23. Permission health checks
24. Regression tests

---

## 15. The final product definition

Nori is:

**KAGE's intelligence and control layer + a student planner + reminder/alarm system + focus/blocking system + AI tutor + mentor + accountability system.**

But all of those functions answer to one mission:

**Academic performance → discipline → long-term improvement.**

The user should experience this as one assistant, not six apps.

The Handbook is the constitution.
KAGE is the academic memory/state.
Nori is the mentor/control brain.
The device layer protects execution.
The tutor protects learning.
The review layer improves the system.

Human Override remains supreme.

---

## 16. Weekend rule

Do not start another feature because it looks impressive.

The next engineering phase should implement the P0/P1 gaps in small verified slices, beginning with the unified task/deadline/timetable model and the daily command center, then reminders/focus enforcement.

Before adding another subsystem, ask:

**What observed failure does this solve?**
**Can the existing system solve it reliably?**
**What evidence will prove the new component works?**

If there is no strong answer, do not build it.

This keeps Nori from becoming the distraction it was designed to prevent.
