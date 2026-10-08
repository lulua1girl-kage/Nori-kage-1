# Nori Mentor System v2

## Design decision

Nori is a handbook-first mentor, not a generic productivity chatbot.

The deterministic handbook/state layer owns:
- mission priorities
- merit
- streaks
- degrees
- investigation
- recovery
- learning evidence
- commitments and study blocks
- Human Override
- consequence recommendations

The language model owns:
- conversation
- explanation
- hypothesis generation
- tutoring
- planning assistance
- interpretation of handbook state
- natural-language coaching

The model does not silently mutate handbook state or escalate consequences.

## Why this architecture

Recent education research consistently points toward planning, monitoring, evaluation, feedback, and adaptation as core mechanisms of self-regulated learning. AI can support these processes, but unrestricted AI assistance can improve assisted performance while reducing independent performance. Therefore Nori separates deterministic policy/state from model reasoning.

## Handbook evolution

Existing concepts are preserved rather than replaced:
- Degree system
- Merit
- Streak
- Consequence
- Recovery
- Integrity
- Human Override

The key correction is investigation before escalation.

Failure causes are classified as:
- capacity
- knowledge
- planning
- distraction
- avoidance
- unknown

Responses are cause-specific.

Capacity failures trigger recovery, not punishment.
Knowledge failures trigger tutoring.
Planning failures trigger replanning.
Distraction failures trigger environmental control and rapid reset.
Avoidance can trigger structured intervention when repeated.
Unknown failures require more evidence.

## Learning integrity

Nori must distinguish assisted performance from independent competence.

Learning evidence can include:
- retrieval
- independent problem solving
- explanation
- correction
- application

A successful AI conversation is not automatically a successful learning session.

## Current student context

The current school constraint is morning school Monday-Friday. Nori should therefore protect evening recovery and should not compensate for missed work by automatically extending study deep into the night.

## Future architecture

1. Nori shell
2. Deterministic handbook engine
3. KAGE bridge/state adapter
4. Model router
5. Retrieval/knowledge layer
6. Tool/action layer
7. Evaluation and audit layer
8. Privacy/safety layer

The model should receive a compact, relevant state projection rather than the entire historical memory.

## Evaluation

Nori should eventually evaluate itself on:
- plan quality
- failure diagnosis
- tutoring quality
- independent learning evidence
- unnecessary direct answers
- appropriate escalation
- recovery decisions
- hallucination/unsupported claims
- user agency
- long-dialogue consistency

Model intelligence alone is not a sufficient tutor metric.

## Product principle

Complexity is earned.

Do not add another subsystem merely because it sounds advanced. Add it when observed behavior shows that the existing architecture cannot solve the problem reliably.

## Human Override

The handbook serves the mission.

The mission does not serve the handbook.

No automated consequence may override health, safety, sleep, school readiness, or reasonable human judgment.
