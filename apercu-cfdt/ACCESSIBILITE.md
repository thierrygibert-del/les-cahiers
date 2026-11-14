# CFDT : la séparation — refonte éditoriale et accessibilité

État : **branche de recette**, non déployée. L'URL publique GitHub Pages reste inchangée tant que la branche n'est pas fusionnée dans `main`.

## Fichiers de publication

- `apercu-cfdt/index.html` : structure sémantique, données historiques existantes et chargement des deux ressources externes.
- `apercu-cfdt/editorial.css` : **nouvelle** couche d'habillage et d'accessibilité, volontairement chargée après la feuille CSS interne historique.
- `apercu-cfdt/reader.js` : moteur de feuilletage StPageFlip, pagination conservée, lecture linéaire distincte, gestion du mode, des tailles de texte et du focus.

Les **32 sections historiques** sont conservées dans leurs données d'origine. Seuls le moteur de présentation, les contrôles et les styles changent.

## Modifications apportées

1. **Palette papier** : crème `#F9F6F0`, encre foncée `#26343A`, sépia `#705334` et tranches très légèrement ombrées. Plus de blanc pur en fond de feuillet.
2. **Typographies** : Lora pour les titres et citations, Inter pour le corps ; polices système de secours si Google Fonts est bloqué. Le feuilletage garde des tailles compactes ; la lecture linéaire est plus aérée.
3. **Feuilletage** : nuance d'ombre StPageFlip réduite, filet de pliure en dégradé sans interception des clics, gestion du mouvement réduit.
4. **Documents historiques** : encadrés et citations à fond sépia avec filet vertical. Les URL sont identifiables et accessibles au clavier.
5. **Lecture continue** : `renderLinear()` génère 32 articles HTML à partir des sections **non recomposées**. Chaque article possède un `h3` sous le `h2` du mode lecture. Les deux copies visuelles du contenu ne figurent jamais simultanément dans l'arbre d'accessibilité (`hidden` et `inert`).
6. **Taille du texte** : boutons A−/A+ ; paliers 100, 125, 150, 175, 200 %, appliqués à la lecture continue, sauvegardés localement. Aucun feuillet fixe n'est utilisé pour le texte agrandi.
7. **Navigation** : boutons de mode et de page explicites, états `aria-pressed`, focus visible, sommaire adapté au mode choisi, messages d'état discrets, échappement du sommaire, touches fléchées uniquement lorsque le livre est sélectionné.
8. **Mobile** : lecture continue initialement proposée sur petit écran ou en cas de préférence de mouvement réduit, sauf si une préférence de mode a déjà été enregistrée.
9. **Impression** : A4 à partir des articles continus, sans pages A5 fixes ni risques de rognage.

## Intégration dans le dépôt

**Chemin conseillé :** laisser la PR en brouillon jusqu'à validation visuelle et fonctionnelle.

1. Ouvrir la PR de la branche `design/cfdt-editorial-accessibilite` vers `main`.
2. Examiner les trois fichiers cités ci-dessus ; aucune modification de `cfdt-la-separation/pages-1.js`, `pages-2.js` ou `interco.js` n'est nécessaire.
3. Vérifier que le fichier `index.html` se termine par `<script src="./reader.js" defer></script>` après les scripts de données, et que `<link rel="stylesheet" href="./editorial.css">` se trouve après les anciens styles internes.
4. Après validation, fusionner la PR dans `main`. GitHub Pages publiera les trois fichiers au chemin `/les-cahiers/apercu-cfdt/`. Conserver un numéro de version de cache (par exemple `?v=12`) lors du premier contrôle.

## Recette RGAA et appareils — à effectuer avant fusion

- **Contrastes** : texte principal 11,91:1 ; sépia 6,54:1 ; liens 8,08:1 ; libellés de navigation sombre 9,28:1 (calculs sur les paires de couleur définies). Vérifier les états sur dégradés et images.
- **Clavier** : Tab et Maj+Tab atteignent tous les boutons ; focus visible ; aucune tabulation dans les contenus `hidden/inert` ; Échap referme le sommaire ; retour au bon point de lecture après bascule.
- **Lecteur d'écran** : effectuer une lecture complète dans VoiceOver + Safari (macOS et iOS) ; contrôler la liste des 32 titres et le sens des liens de source. Contrôler aussi NVDA + Firefox si possible.
- **Zoom** : vérifier le texte jusqu'à 200 %, puis les zooms navigateur 200 % et 400 % ; aucune perte d'information ni défilement horizontal imposé au corps de texte.
- **Mobile** : tailles 320, 375 et 430 px ; lecture continue par défaut, commandes accessibles, alternance des modes.
- **Feuilletage** : pages longues, sources, citations, portrait, couverture et numérotation ; absence de chevauchement et de paragraphes masqués, y compris après chargement des polices.
- **Impression** : PDF A4 complet, 32 sections présentes, titres non orphelins, pas de pages blanches inopinées.
- **Aide au mouvement** : `prefers-reduced-motion: reduce` supprime les animations accessoires et réduit le temps de feuilletage.

**Attention :** il s'agit de travaux d'amélioration en référence au RGAA 4.1.2, **pas d'une certification de conformité**. La vérification finale impose une revue manuelle des critères applicables avec de véritables technologies d'assistance, conformément à la méthode officielle : https://accessibilite.numerique.gouv.fr/methode/criteres-et-tests/

## Retour arrière

Si les tests après fusion échouent, rétablir les versions antérieures de `apercu-cfdt/index.html` à partir de l'historique de GitHub. Les deux nouveaux fichiers externes deviennent alors inactifs, car l'ancien HTML ne les charge pas.

## Équilibrage des feuillets : correction de novembre 2026

La version publique antérieure mesurait systématiquement la quantité de texte avec une surface de **430 × 608 px**. StPageFlip affiche pourtant un feuillet plus grand sur de nombreux écrans de bureau. Cette divergence entraîne une pagination trop anticipée et des espaces blancs disproportionnés.

La branche de refonte corrige cette divergence à deux niveaux :
- `measureSize()` estime désormais la surface à partir des dimensions effectives de `#shell`, du format des pages et du nombre de feuillets visibles ;
- `reconcileFlipDimensions()` relit `StPageFlip.getBoundsRect()` et relance le découpage avec la hauteur et la largeur réelles grâce à `updateFromHtml()`. Le recalcul est également déclenché au changement de mode et lors d'un redimensionnement.

Le système continue à répartir les paragraphes entre pages et à conserver un filet de sécurité contre les coupes en bas de page. Les pages volontairement graphiques (couverture ou vote) peuvent rester aérées.

**Essai comparatif de mise en page dans Chromium** sur deux sections initiales et leurs encadrés : à 430 × 608, leur contenu ne tient pas ensemble ; à 530 × 750, elles entrent ensemble avec environ 32 px de marge restante avant le folio. Il s'agit d'un essai représentatif, pas encore d'une recette complète des 32 sections dans Safari.

### Aperçu non définitif

Pour ne pas modifier la version partagée avec les lecteurs, la refonte est également copiée dans un répertoire de prévisualisation indépendant sur `main` :

https://thierrygibert-del.github.io/les-cahiers/apercu-cfdt-refonte/?v=12

Ce dossier reprend `index.html`, `editorial.css` et `reader.js`. Les modifications de la branche de travail doivent être répercutées dans cette copie tant que la PR n'est pas fusionnée. **Le chemin public habituel `/apercu-cfdt/` demeure inchangé.**
