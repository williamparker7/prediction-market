# Project Guidance

## Purpose

This repository is a Prediction Market Edge / Intelligence Platform. The immediate goal is a credible, resume-worthy V0, followed by iterative improvement.

## Working rules

- Before making a meaningful change, inspect the relevant existing code and explain the current behavior.
- Make one meaningful milestone at a time.
- Prefer simple, conventional implementations over premature abstractions.
- Do not introduce new dependencies, infrastructure, frameworks, or services unless there is a concrete need.
- Do not introduce React, GraphQL, Redis, Kafka, Kubernetes, cloud deployment, ML, or AI features unless the current milestone requires them.
- TypeScript/Node.js/MySQL are the current core stack.
- MySQL runs locally in Docker.
- Never expose or commit `.env` secrets.
- Do not run destructive Docker/database commands such as `docker compose down -v` unless explicitly requested and the consequences are understood.
- Do not run ingestion or other database-writing commands when the task is inspection/design only.
- Use current official Polymarket documentation when API behavior matters.
- Explain important data-flow, schema, API, and architecture decisions so the developer can defend them in an interview.
- Run `npm run typecheck` after TypeScript changes unless there is a concrete reason not to.
- Show meaningful diffs and summarize what changed after implementation.
- Do not invent scale, users, performance numbers, statistical results, or trading edge.

## Current near-term milestone

reproducible ingestion
→ trustworthy stored data
→ run provenance/idempotency
→ historical/resolution data
→ first calibration analysis

## Research principles

- Treat market price as the baseline probability model.
- Distinguish interesting backtests from evidence of real tradable edge.
- Avoid look-ahead leakage.
- Prefer simple statistical baselines before ML.
