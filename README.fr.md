# RETRO-DECK MD-1

**Le carnet de travail calme qui planifie ta journée selon ton énergie et transforme tes erreurs en révisions.**
Local. Hors ligne. Sans compte. Sans abonnement.

[English](README.md) · [Français](README.fr.md) · [Site](https://retrodeck.lastparadox.dev) · [Essayer dans le navigateur](https://retrodeck.lastparadox.dev/essayer/) · [Page de campagne](https://retrodeck.lastparadox.dev/campagne) · [Documentation](https://retrodeck.lastparadox.dev/docs)

> **Statut (octobre 2026) : accès anticipé, version 0.2 pour Windows.** L'application est en vente en achat unique, sans abonnement ; elle va évoluer avec les retours des premiers utilisateurs.
> Ce dépôt est la vitrine publique : documentation, charte graphique et source du site web. **L'application elle-même est propriétaire et n'est pas incluse ici.**

---

## De quoi s'agit-il

RETRO-DECK MD-1 est un carnet de travail local pour Windows, construit autour de trois gestes :

1. **Planifier** : trois tâches par jour et un ordre conseillé selon ton énergie du moment.
2. **Se concentrer** : une seule tâche à l'écran, un minuteur, tout le reste disparaît.
3. **Retenir** : une solution trouvée devient une fiche de révision qui revient au bon moment.

Tes notes sont de simples fichiers `.md` dans un dossier de ton ordinateur. Si l'application disparaît, tes fichiers restent lisibles.

## Nouveau en version 0.2 : un projet à la fois

- **Projets** : chaque projet est un simple dossier de `.md` ; un seul est ouvert à la fois et l'appli n'affiche que lui. Fermer un projet demande un geste volontaire (`Échap` maintenu 2 secondes).
- **Parking** (`Ctrl+Espace`) : gare une pensée parasite dans `parking.md` sans quitter ton texte, trie-la après (demain / fiche / poubelle).
- **Concentration** (`Ctrl+Maj+T`) : plein écran, seul le paragraphe en cours reste net.
- **Session** (`Ctrl+Maj+S`) : 10, 25 ou 45 minutes ; en brouillon, effacer, flèches et souris sont bloqués. Un court écran d'**atterrissage** suit.

## Fonctions du prototype

| Domaine | Ce que ça fait |
|---|---|
| **Aujourd'hui** | Trois tâches maximum, une prochaine action proposée, un assistant guidé « Planifier ma journée » (énergie, tâches dures/légères, ordre conseillé) |
| **Énergie** | Un tap de 1 à 5 ; l'application apprend ta meilleure période, uniquement sur ton ordinateur. Aucun capteur, aucune donnée de santé |
| **Focus** | Une tâche, un minuteur (15 / 25 / 50 / 90 min), un compteur toujours visible pendant que tu travailles ailleurs |
| **Écrire** | Éditeur plein écran avec sauvegarde auto, raccourcis façon nano (`Ctrl+O`, `K`, `U`, `W`, `L`, `R`, `G`), mode lecture, gabarits (journal, bloqué/débloqué, revue de semaine, Cornell, lecture, réunion) |
| **Fichiers** | Ouvrir n'importe quel `.md` / `.txt`, parcourir un dossier, glisser un fichier dans la fenêtre, fichiers récents |
| **Fiches de révision** | Une fiche = un fichier `.md` ; en créer une depuis une sélection (`Ctrl+J`) ; révision espacée (revoir / bien / facile) ; importer tes propres `.md` en fiches ; bibliothèque avec filtre |
| **Fermer la journée** | Vidage de tête à trier plus tard (tâche / note / idée / poubelle), puis bilan du soir de 60 secondes, enregistré comme une note et rappelé le lendemain matin |
| **Confort** | Accueil à huit icônes, croix directionnelle et flèches du clavier, menu repliable, tiroir des notes, réglages (thème papier / encre, taille du texte, largeur de page) |

Détails : [documentation](docs/fr/features.md) · [raccourcis](docs/fr/shortcuts.md) · [données et formats](docs/fr/data-and-formats.md) · [FAQ](docs/fr/faq.md).

## Principes

- **Local d'abord, hors ligne d'abord.** Le cœur fonctionne sans connexion.
- **Formats ouverts.** Markdown et JSON. Tu peux partir à tout moment avec toutes tes données.
- **Volontairement petit.** Mieux vaut peu de fonctions solides que beaucoup de fragiles.
- **Aucune manipulation.** Pas de séries, pas de notifications, pas de récompenses artificielles.
- **Honnêteté.** On sépare ce qui existe de ce qui est prévu.
- **Discrétion.** Aucun accès à tes mails ou calendriers. Cette version n'a pas de fonction d'IA et n'envoie aucune donnée à un service d'IA.

## Feuille de route

La feuille de route détaillée est sur le [site](https://retrodeck.lastparadox.dev/#roadmap). Un appareil dédié est une idée à l'étude, sans date, sans prix et sans précommande.

Prévu, sans date : polices embarquées et finitions, installeur Windows et licence perpétuelle vérifiable hors ligne, retrait d'une fiche avec confirmation, import d'un calendrier en lecture seule (lien `.ics`), validation de l'intérêt via une liste d'attente.
Idées, sans engagement : versions macOS et Linux.

## Contenu de ce dépôt

| Chemin | Contenu |
|---|---|
| `docs/en`, `docs/fr` | Documentation utilisateur en anglais et en français |
| `design/` | La charte e-paper (indépendante des autres projets LastParadox) |
| `site/` | Source du site web (https://retrodeck.lastparadox.dev) : pages statiques (FR/EN) et un petit Worker Cloudflare pour la liste d'attente |

## Retours

Ouvre une [issue](../../issues) avec tes impressions : trop de fonctions ? une qui manque ? un détail qui te gênerait ? Ou rejoins la liste d'attente sur le [site](https://retrodeck.lastparadox.dev/#liste) pour être prévenu au lancement de la bêta.

## Licence et contact

© 2026 LastParadox. Tous droits réservés. Voir [NOTICE.md](NOTICE.md).
Contact : support@lastparadox.xyz
