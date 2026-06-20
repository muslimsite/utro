# Утро — Claude Code notes

## Design skills

Two design skills are installed under `.claude/skills/`. Use them for every interface/UI task in this repo (Mini App screens in `apps/web`, bot-facing UI copy/menus, etc.) — don't write or change frontend markup/styles without going through them first.

- **impeccable** (`.claude/skills/impeccable/`) — primary workflow. Commands: `craft`, `shape`, `critique`, `audit`, `polish`, `bolder`/`quieter`, `animate`/`colorize`/`typeset`/`layout`, `clarify`/`distill`/`harden`, `init`/`document`/`live`. Run its setup steps before any interface change. It also runs automatically via the `PostToolUse` hook in `.claude/settings.json`, which flags banned anti-patterns after Edit/Write/MultiEdit on UI files.
- **taste-skill** (`.claude/skills/taste-skill/`, install name `design-taste-frontend`) — anti-slop pass: read the brief, infer the design direction (vibe, audience, references), then tune variance/motion/density before generating markup. Use it alongside impeccable, not instead of it.

On the first real interface task, impeccable's setup will report `NO_PRODUCT_MD` and run a short interview (register, audience, brand personality, anti-references) before writing `PRODUCT.md`/`DESIGN.md`. That's expected — answer it rather than skipping init.
