# RETRO-DECK MD-1

**The calm work notebook that plans your day around your energy and turns your mistakes into revision.**
Local. Offline. No account. No subscription. No AI.

[English](README.md) · [Français](README.fr.md) · [Website](https://retrodeck.lastparadox.dev) · [Campaign page](https://retrodeck.lastparadox.dev/campagne) · [Documentation](https://retrodeck.lastparadox.dev/docs)

> **Status (October 2026): prototype in development.** A working Windows prototype exists. It is not distributed yet and nothing can be bought. Prices and dates mentioned anywhere are indicative.
> This repository is the public showcase: documentation, design charter and the source of the website. **The application itself is proprietary and is not included here.**

---

## What it is

RETRO-DECK MD-1 is a local work notebook for Windows built around three moves:

1. **Plan**: three tasks a day, and a suggested order based on your energy right now.
2. **Focus**: one task on screen, one timer, everything else fades away.
3. **Remember**: a solution you found becomes a revision card that comes back at the right time.

Your notes are plain `.md` files in a folder on your computer. If the app disappears, your files stay readable.

## Features of the prototype

| Area | What it does |
|---|---|
| **Today** | Three tasks maximum, one suggested next action, a guided "Plan my day" assistant (energy, hard/light tasks, suggested order) |
| **Energy** | One tap from 1 to 5; the app learns your best time of day, only on your computer. No sensor, no health data |
| **Focus** | One task, one timer (15 / 25 / 50 / 90 min), a counter that stays visible while you work elsewhere |
| **Writing** | Full-screen editor with autosave, nano-style shortcuts (`Ctrl+O`, `K`, `U`, `W`, `L`, `R`, `G`), reading mode, templates (journal, stuck/solved, weekly review, Cornell, reading, meeting) |
| **Files** | Open any `.md` / `.txt` file, browse a folder, drag a file into the window, recent files |
| **Revision cards** | One card = one `.md` file; create one from a selection (`Ctrl+J`); spaced repetition (again / good / easy); import your own `.md` files as cards; card library with filter |
| **Close the day** | Brain dump you sort later (task / note / idea / bin), then a 60-second evening review that is saved as a note and reminds you the next morning |
| **Comfort** | Home screen with eight icons, directional pad and arrow keys, foldable menu, note drawer, settings (paper / ink theme, text size, page width) |

Full details: [documentation](docs/en/features.md) · [shortcuts](docs/en/shortcuts.md) · [data and file formats](docs/en/data-and-formats.md) · [FAQ](docs/en/faq.md).

## Principles

- **Local first, offline first.** The core works without a connection.
- **Open formats.** Markdown and JSON. You can leave at any time with all your data.
- **Deliberately small.** Better a few solid features than many fragile ones.
- **No manipulation.** No streaks, no notifications, no artificial rewards.
- **Honesty.** What exists is separated from what is planned.
- **No AI.** No AI feature, and no access to your email or calendars.

## Roadmap

Planned, with no date: bundled fonts and polish, a Windows installer and an offline-verifiable perpetual license, removing a card with confirmation, read-only calendar import (`.ics` link), validation of interest through a waitlist.
Ideas, not commitments: macOS and Linux versions.

## What is in this repository

| Path | Content |
|---|---|
| `docs/en`, `docs/fr` | User documentation in English and French |
| `design/` | The e-paper design charter (independent from other LastParadox projects) |
| `site/` | Source of the website (https://retrodeck.lastparadox.dev): static pages (FR/EN) plus a small Cloudflare Worker for the waitlist |

## Feedback

Open an [issue](../../issues) with your impressions: too many features? a missing one? a detail that would bother you? Or join the waitlist on the [website](https://retrodeck.lastparadox.dev/#liste) to be notified when the beta launches.

## License and contact

© 2026 LastParadox. All rights reserved. See [NOTICE.md](NOTICE.md).
Contact: support@lastparadox.xyz
