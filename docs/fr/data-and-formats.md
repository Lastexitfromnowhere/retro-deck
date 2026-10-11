# Données et formats de fichiers

[← README](../../README.fr.md) · [English](../en/data-and-formats.md)

Au premier lancement, l'application crée un dossier `RETRO-DECK` dans tes Documents.

| Dossier | Contenu |
|---|---|
| `notes/` | Notes et journal, Markdown (`.md`) |
| `cards/` | Une fiche de révision par fichier `.md` |
| `data/` | Plan du jour, relevés d'énergie, statistiques (JSON) |

Tu peux ouvrir, copier et sauvegarder ces fichiers avec n'importe quel autre outil.

## Format d'un fichier de fiche

```markdown
---
ease: 2.50
interval: 3
reps: 2
due: 2026-10-15
---
# Pourquoi SameSite=None est-il rejeté ?
Il doit aussi avoir l'attribut Secure (HTTPS).
```

- La première ligne après l'en-tête est la **question** (`# ...`) ; tout ce qui suit est la **réponse** (Markdown libre).
- L'en-tête entre `---` est facultatif. Sans lui, la fiche est nouvelle et à voir aujourd'hui.
- `ease` : facteur de facilité (minimum 1,3) ; `interval` : jours avant la prochaine révision ; `reps` : succès consécutifs ; `due` : date de la prochaine révision.

## Importer tes propres fichiers

Un fichier qui commence par `# Question` garde sa question. Sinon le nom du fichier devient la question et tout le texte la réponse. Une fiche de même question est ignorée.

## Bilan du soir

Enregistré dans `notes/bilan-AAAA-MM-JJ.md` avec les chiffres du jour, une victoire, un blocage et le plan de demain.
