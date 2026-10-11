# Data and file formats

[← README](../../README.md) · [Français](../fr/data-and-formats.md)

On first launch the app creates a `RETRO-DECK` folder in your Documents.

| Folder | Content |
|---|---|
| `notes/` | Notes and journal, Markdown (`.md`) |
| `cards/` | One revision card per `.md` file |
| `data/` | Today's plan, energy readings, statistics (JSON) |

You can open, copy and back up these files with any other tool.

## Card file format

```markdown
---
ease: 2.50
interval: 3
reps: 2
due: 2026-10-15
---
# Why is SameSite=None rejected?
It must also have the Secure attribute (HTTPS).
```

- The first line after the header is the **question** (`# ...`); everything after it is the **answer** (free Markdown).
- The header between `---` is optional. Without it the card is new and due today.
- `ease`: ease factor (minimum 1.3); `interval`: days until the next review; `reps`: consecutive successes; `due`: next review date.

## Importing your own files

A file starting with `# Question` keeps its question. Otherwise the file name becomes the question and the whole text the answer. A card with the same question is skipped.

## Evening review

Saved as `notes/bilan-YYYY-MM-DD.md` with the numbers of the day, one win, one blocker and the plan for tomorrow.
