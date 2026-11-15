# CFDT : la séparation
**Les Cahiers de Thierry Gibert — édition historique de travail**

Ce dossier est conçu comme un cahier à feuilleter indépendant des travaux sur NAZA. Ses fichiers sont isolés dans `cfdt-la-separation/`. Il n'altère ni `index.html` ni `feuilleter.html` à la racine du dépôt.

## Expérience de lecture

- Couverture typographique bleu nuit et bronze, esprit revue historique.
- Pages intérieures sur papier ivoire, texte en caractères de lecture, folios et références.
- Ruptures de rythme : chronologie, grands millésimes, portrait, débat comparatif, vote de 1964 et conclusion.
- Sommaire cliquable, marqueur de progression, navigation au clavier et au doigt.
- Mode « lecture continue » pour les petits écrans.
- Export PDF A5 par la commande d'impression du navigateur.
- Fallback de lecture en une page lorsque StPageFlip ne peut pas être chargé.

## Sources et crédits iconographiques

La photographie de Paul Vignaux (1975) est de **François Vignaux**, publiée sur [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Paul_Vignaux.jpg) sous licence **CC BY-SA 4.0**. Le crédit, le lien de licence et la provenance apparaissent sous le portrait. Les reproductions d'archives dont les droits de publication ne sont pas déterminés ne sont pas intégrées : leurs références figurent sous forme de liens.

[StPageFlip](https://github.com/Nodlik/StPageFlip) est publié sous licence MIT et chargé via jsDelivr ; le cahier prévoit une lecture de repli en cas d'indisponibilité.

## Structure

`index.html` — enveloppe de publication et commandes de navigation.

`style.css` — base de mise en page.

`editorial.css` — direction artistique et styles responsive / impression.

`pages-1.js` et `pages-2.js` — contenu de l'édition.

`reader.js` — recomposition éditoriale des 31 sections en 18 pages, sommaire, feuilletage, mode continu, progression et PDF imprimable.

`interco.js` — complément sur la Fédération Interco : 1974, 1977, FPT et communiqué du 8 décembre 2025.

`composition.css` — pagination densifiée et mise en forme des doubles sections sans espaces perdus.

## Publication

**Ne pas fusionner sur `main` avant validation éditoriale et contrôle visuel sur navigateur.**

À contrôler avant publication : transcriptions exactes des textes de 1919, 1947, 1957 et 1964 ; réaction des autorités ecclésiastiques ; vérification de tous les liens ; droits sur toute image supplémentaire ; contrôle des débordements sur petit écran ; test du feuilletage et de l'impression ; relecture de la ponctuation (pas de virgule devant « mais »).

Version actuelle : 18 pages, construite pour la relecture et la vérification.

## Recherche historique complémentaire (14 novembre 2026)

Le chapitre Interco est enrichi avec le vote des communaux des **30 et 31 janvier 1965** (125 voix pour la résolution Estavil, 66 pour la résolution Glotin, 2 votes nuls), la date vérifiée du congrès de Saint-Malo (**22–24 mai 1974**) et l'intégration de la Fédération Justice en **novembre 2000**. Les archives et les questions en suspens sont consignées dans [sources-interco.md](sources-interco.md).

La mise en ligne de l'aperçu distinct dans `apercu-cfdt/` ne constitue pas une validation scientifique du dossier ni une autorisation de publier le cahier définitif.
