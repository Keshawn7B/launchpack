# LaunchPack — AI Promoter Prompt Builder

LaunchPack is a static, client-side tool that turns a rough project, product, game, app, song, service, or community idea into a model-ready AI promotion prompt kit.

It does **not** call an AI API directly. Instead, it helps users efficiently prompt any model:

- ChatGPT
- Gemini
- Claude
- Grok
- Copilot
- local/small models
- any other text model

## What it generates

- Universal master prompt
- Model-specific prompting guidance
- Platform-native promotion rules
- Campaign, hook, critique, or repurpose prompt stacks
- Fast follow-up prompts
- Promotion angles
- Downloadable Markdown kit

## Why it is useful

Most weak AI marketing output comes from weak prompts. LaunchPack packages the missing context:

- role
- audience
- offer
- platform
- goal
- proof/constraints
- avoid-list
- deliverables
- quality bar
- output format
- self-critique instruction

That makes the next AI model significantly more useful without requiring API keys or burning credits.

## Local development

```bash
python3 -m http.server 8788
```

Open http://127.0.0.1:8788/.

## Privacy

LaunchPack is static and client-side. It uses `localStorage` for draft recovery and `Blob` downloads for exporting Markdown. There is no backend, no tracking, and no API key exposure.
