let partie = null;

ajouterJoueur();
ajouterJoueur();

function ajouterJoueur() {

const div = document.createElement("div");

div.className = "player-input";

div.innerHTML = `
<input type="text" placeholder="Nom du joueur">
`;

document
.getElementById("listeJoueurs")
.appendChild(div);

mettreAJourDistributeurs();
}

function mettreAJourDistributeurs(){

const select =
document.getElementById("premierDistributeur");

select.innerHTML="";

const joueurs =
document.querySelectorAll(
"#listeJoueurs input"
);

joueurs.forEach((j,index)=>{

const opt =
document.createElement("option");

opt.value=index;
opt.textContent=j.value || `Joueur ${index+1}`;

select.appendChild(opt);

});
}

document.addEventListener(
"input",
mettreAJourDistributeurs
);

function demarrerPartie(){

const joueurs = [];

document
.querySelectorAll("#listeJoueurs input")
.forEach(j=>{

if(j.value.trim()){

joueurs.push({
nom:j.value.trim(),
score:0
});

}

});

if(joueurs.length < 2){

alert("Minimum 2 joueurs");

return;
}

partie = {

nomPartie:
document.getElementById("nomPartie").value,

jeu:
document.getElementById("nomJeu").value,

limite:
Number(document.getElementById("limite").value),

condition:
document.getElementById("condition").value,

premier:
Number(
document.getElementById(
"premierDistributeur"
).value
),

manche:1,

joueurs,

historique:[]
};

sauvegarder();

document.getElementById(
"setup"
).style.display="none";

document.getElementById(
"game"
).style.display="block";

afficherPartie();
}

function afficherPartie(){

document.getElementById(
"titrePartie"
).innerText =
`${partie.nomPartie} - ${partie.jeu}`;

const d =
(partie.premier +
partie.manche -1)
%
partie.joueurs.length;

const p =
(d+1)
%
partie.joueurs.length;

document.getElementById(
"distributeur"
).innerText =
partie.joueurs[d].nom;

document.getElementById(
"prochain"
).innerText =
partie.joueurs[p].nom;

const zone =
document.getElementById(
"zoneScores"
);

zone.innerHTML="";

partie.joueurs.forEach(j=>{

zone.innerHTML += `
<div class="score-row">
<label>${j.nom}</label>
<input type="number"
id="score_${j.nom}"
value="0">
</div>
`;

});

majClassement();
majHistorique();
}

function validerManche(){

const manche = [];

partie.joueurs.forEach(j=>{

const points =
Number(
document.getElementById(
`score_${j.nom}`
).value
);

j.score += points;

manche.push({
joueur:j.nom,
points
});

});

partie.historique.push(manche);

partie.manche++;

sauvegarder();

if(finPartie()){

afficherFin();

return;
}

afficherPartie();
}

function finPartie(){

return partie.joueurs.some(
j=>j.score >= partie.limite
);
}

function majClassement(){

let joueurs =
[...partie.joueurs];

joueurs.sort((a,b)=>{

if(partie.condition==="petit")
return a.score-b.score;

return b.score-a.score;

});

document.getElementById(
"classement"
).innerHTML = joueurs
.map((j,i)=>
`${i+1}. ${j.nom} : ${j.score}`
)
.join("<br>");
}

function majHistorique(){

document.getElementById(
"historique"
).innerHTML =
partie.historique
.map((m,i)=>{

let txt =
`<strong>Manche ${i+1}</strong><br>`;

m.forEach(l=>{

txt +=
`${l.joueur} : ${l.points}<br>`;

});

return txt+"<hr>";

})
.join("");
}

function corrigerDerniereManche(){

if(
partie.historique.length===0
) return;

const derniere =
partie.historique.pop();

derniere.forEach(l=>{

const joueur =
partie.joueurs.find(
j=>j.nom===l.joueur
);

joueur.score -= l.points;

});

partie.manche--;

sauvegarder();

afficherPartie();
}

function afficherFin(){

let classement =
[...partie.joueurs];

classement.sort((a,b)=>{

if(partie.condition==="petit")
return a.score-b.score;

return b.score-a.score;

});

const top3 =
classement.slice(0,3);

document.getElementById(
"podium"
).innerHTML =

`<div class="podium">

<div class="place2">
🥈<br>
${top3[1]?.nom || ""}
</div>

<div class="place1">
🥇<br>
${top3[0]?.nom || ""}
</div>

<div class="place3">
🥉<br>
${top3[2]?.nom || ""}
</div>

</div>`;

document.getElementById(
"autres"
).innerHTML =
classement
.slice(3)
.map((j,i)=>
`${i+4}. ${j.nom}
(${j.score})`
)
.join("<br>");

document.getElementById(
"finPartie"
).style.display="block";
}

function sauvegarder(){

localStorage.setItem(
"compteurScores",
JSON.stringify(partie)
);
}

function nouvellePartie(){

localStorage.removeItem(
"compteurScores"
);

location.reload();
}

window.onload = ()=>{

const save =
localStorage.getItem(
"compteurScores"
);

if(save){

partie = JSON.parse(save);

document.getElementById(
"setup"
).style.display="none";

document.getElementById(
"game"
).style.display="block";

afficherPartie();
}
};

