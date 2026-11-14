/* Complément Interco : dossier historique et sources, novembre 2026 */
(function(){
"use strict";
const p=window.CAHIER_PAGES;
if(!Array.isArray(p)||p.length!==28)return;
p[3][1]="De 1919 à nos jours : neuf repères";
p[3][2]=p[3][2].replace(
'<div><strong>2014</strong>Suppression',
'<div><strong>1974</strong>Création de la Fédération Interco CFDT à Saint-Malo</div><div><strong>1977–1984</strong>Structuration d’Interco, décentralisation et statut de la FPT</div><div><strong>2014</strong>Suppression'
);
p[22][2]=p[22][2].replace(
'<div class="note">',
'<p>En décembre 2025, la Fédération Interco a, de son côté, publié un <a href="https://interco.cfdt.fr/la-federation-cfdt-interco-rappelle-le-principe-de-laicite-qui-permet-de-faire-societe/" target="_blank" rel="noopener">communiqué sur la laïcité</a> qu’elle rattache à l’émancipation, à l’universalisme et à la défense des services publics.</p><div class="note">'
);
p[26][2]=p[26][2].replace('</ul>','<li><a href="https://interco.cfdt.fr/la-federation-cfdt-interco-rappelle-le-principe-de-laicite-qui-permet-de-faire-societe/" target="_blank" rel="noopener">Interco CFDT, communiqué sur la laïcité (8 décembre 2025)</a>.</li></ul>');
p[27][2]=p[27][2].replace('</ul>','<li><a href="https://arbre-bleu-editions.com/histoire-de-la-federation-interco-cfdt.html" target="_blank" rel="noopener">Romain Vila, Histoire de la Fédération Interco CFDT (2014)</a>.</li></ul>');
p.push([
"XI · Les fédérations",
"1974 : Interco, sept cultures syndicales réunies",
"<p>La déconfessionnalisation n'achève pas la transformation de la CFDT. Dix ans après le congrès de 1964, une fédération nouvelle voit le jour en mai 1974 à Saint-Malo. Elle rassemble des organisations d'origines professionnelles différentes : communaux, personnels des préfectures et départements, services techniques du ministère de l'Intérieur, police, offices publics d'HLM et distribution des eaux.</p>"+
"<p>Le nom <strong>Interco</strong> rapproche les termes Intérieur et collectivités locales. La fédération entend construire une représentation commune sans effacer les spécificités professionnelles. Son premier secrétariat général est assuré par Tonia Scavennec en 1974-1975. René Bellanger lui succède de 1975 à 1977.</p>"+
"<p>Selon l'historien Romain Vila, cette fédération procède d'un regroupement de sept entités ayant chacune son histoire. Elle constitue un exemple de la façon dont la CFDT élabore une identité collective dans la diversité. Cette observation relève de l'analyse historique et ne prouve pas à elle seule que la laïcité ait été l'objectif fondateur du congrès de Saint-Malo.</p>",
"https://arbre-bleu-editions.com/histoire-de-la-federation-interco-cfdt.html"
]);
p.push([
"1977–1984 · Services publics",
"De la fédéralisation au statut territorial",
"<p>Le congrès d'Autrans des 19 au 23 avril 1977 donne à Interco un nouvel élan organisationnel. Jacques Nodin devient secrétaire général. La fédération renforce ses syndicats départementaux et construit des orientations communes à des agents de métiers différents.</p>"+
"<p>Au cours des années 1980, elle intervient dans les débats sur la décentralisation, la défense des personnels des collectivités et le statut de la fonction publique territoriale, notamment dans la période qui conduit à la loi du 26 janvier 1984.</p>"+
"<p>Cette spécificité nous intéresse directement : aujourd'hui Interco représente à la fois des agents des collectivités territoriales et de plusieurs ministères ainsi que des salariés de droit privé, dans l'habitat, l'eau ou les services funéraires. La liberté de conscience concerne tous les militants. L'obligation de neutralité religieuse s'impose aux agents publics dans l'exercice de leurs fonctions selon l'article L.121-2 du Code général de la fonction publique.</p>"+
"<div class=\"note\">La place précise de la laïcité dans les statuts fédéraux de 1974 et les résolutions de 1977 reste à établir à partir des archives originales.</div>",
"https://interco.cfdt.fr/federation-interco-cfdt-qui-sommes-nous-qui-aidons-nous/"
]);
})();