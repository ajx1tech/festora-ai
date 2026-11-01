# Festora AI Product Brief

Festora AI is a GenAI-powered planning assistant for weddings, birthdays and community events. Users complete a wizard, instantly receive a deterministic plan (budget allocation, backwards-scheduled timeline, vendor checklist, readiness score) and optionally enrich it with Gemini (concept, personalised ideas, vendor outreach drafts, multilingual invitations, run-of-show, plan-aware chat).

## Core Principles

- **Separation of Concerns**: Deterministic engines own every number and date; Gemini owns language and creativity and must never invent figures.
- **Graceful Fallback**: If AI fails, the app falls back to deterministic content and says so honestly.
- **Client-Side Privacy**: Data is stored locally in the browser (`localStorage`, versioned, Zod-validated).
- **Target Audience**: Families in India and global users.
- **Currencies Supported**: Default currency INR, with USD, EUR, GBP supported.
- **Multilingual Support**: Languages for invitations include English, Hindi, Marathi, Spanish, French.
