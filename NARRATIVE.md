# Context Hub: Always-current docs for AI agents

Your AI coding agent was trained months ago. The API you're using shipped a breaking change last week. The agent doesn't know. It writes code against the old API, you debug for 20 minutes, then paste the docs into chat yourself.

Context Hub fixes this. One command gives your agent up-to-date, LLM-optimized documentation and skills — maintained by the community, versioned, and searchable.

## How an agent uses it

```bash
# Agent doesn't know the Stripe API changed. It searches:
chub search "stripe payments" --json | jq -r '.results[0].id'
# → stripe-payments

# Agent fetches the current docs:
chub get docs stripe-payments --lang python -o .context/stripe.md

# Now it reads .context/stripe.md and writes correct code.
```

That's it. Search, fetch, use. No hallucinated parameters, no outdated patterns.

For reusable patterns — login flows, deployment scripts, auth integrations — agents fetch skills:

```bash
chub get skills playwright-login -o .claude/skills/playwright-login/SKILL.md
```

The skill is now installed. The agent discovers it automatically in every future session.

## Why this matters

LLMs have a knowledge cutoff. APIs don't stop changing. Today, humans bridge this gap by pasting docs into chat. Context Hub lets the agent bridge it autonomously — search a registry, fetch what it needs, and get back to writing code.

Docs tell the agent *what to know*. Skills tell it *how to do things*. Both are versioned, searchable across multiple sources (public CDN + your team's private docs), and formatted for the [Agent Skills](https://agentskills.io) open standard — compatible with Claude Code, Cursor, Codex, and 30+ other tools.
