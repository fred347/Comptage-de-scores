let partie = null;

// =========================
// INITIALISATION
// =========================

document.addEventListener("DOMContentLoaded", () => {

    const sauvegarde =
        localStorage.getItem("compteurScores");

    if (sauvegarde) {

        partie = JSON.parse(sauvegarde);

        document.getElementById("setup").style.display = "none";
        document.getElementById("game").style.display = "block";

        afficherPartie();

    } else {

        ajouterJoueur();
        ajouterJoueur();

    }

});

// =========================
// TEST VOIX
// =========================

function testVoix() {

    const voix = new SpeechSynthesisUtterance(
        "Test de la synthèse vocale"
    );

    voix.lang = "fr-FR";

const liste = speechSynthesis.getVoices();

const voixFr =
    liste.find(v => v.lang.startsWith("fr"));

if (voixFr) {
    voix.voice = voixFr;
}

    
// =========================
// JOUEURS
// =========================

function ajouterJoueur() {

    const liste =
        document.getElementById("listeJoueurs");

    const div =
        document.createElement("div");

    div.className = "player-input";

    div.innerHTML = `
        <input type="text" placeholder="Nom du joueur">
    `;

    liste.appendChild(div);

    mettreAJourDistributeurs();
}

function mettreAJourDistributeurs() {

    const select =
        document.getElementById(
            "premierDistributeur"
        );

    if (!select) return;

    select.innerHTML = "";

    const joueurs =
        document.querySelectorAll(
            "#listeJoueurs input"
        );

    joueurs.forEach((joueur, index) => {

        const option =
            document.createElement("option");

        option.value = index;

        option.textContent =
            joueur.value ||
            `Joueur ${index + 1}`;

        select.appendChild(option);

    });

}

document.addEventListener(
    "input",
    mettreAJourDistributeurs
);

// =========================
// DEMARRER UNE PARTIE
// =========================

function demarrerPartie() {

    const joueurs = [];

    document
        .querySelectorAll(
            "#listeJoueurs input"
        )
        .forEach(input => {

            if (
                input.value.trim()
            ) {

                joueurs.push({
                    nom: input.value.trim(),
                    score: 0
                });

            }

        });

    if (joueurs.length < 2) {

        alert(
            "Il faut au moins 2 joueurs."
        );

        return;
    }

    partie = {

        nomPartie:
            document.getElementById(
                "nomPartie"
            ).value,

        jeu:
            document.getElementById(
                "nomJeu"
            ).value,

        limite:
            Number(
                document.getElementById(
                    "limite"
                ).value
            ),

        condition:
            document.getElementById(
                "condition"
            ).value,

        premier:
            Number(
                document.getElementById(
                    "premierDistributeur"
                ).value
            ),

        manche: 1,

        joueurs: joueurs,

        historique: []

    };

    sauvegarder();

    document.getElementById(
        "setup"
    ).style.display = "none";

    document.getElementById(
        "game"
    ).style.display = "block";

    afficherPartie();
}

// =========================
// AFFICHAGE
// =========================

function afficherPartie() {

    if (!partie) return;

    document.getElementById(
        "titrePartie"
    ).innerText =
        `${partie.nomPartie} - ${partie.jeu}`;

    document.getElementById(
    "titreManche"
).innerText =
    `🎯 Manche ${partie.manche}`;

    const donneurIndex =
        (
            partie.premier +
            partie.manche -
            1
        ) %
        partie.joueurs.length;

    const donneur =
        document.getElementById(
            "distributeur"
        );

    if (donneur) {

        donneur.innerText =
            partie.joueurs[
                donneurIndex
            ].nom;

    }

    const zone =
        document.getElementById(
            "zoneScores"
        );

    zone.innerHTML = "";

    partie.joueurs.forEach(joueur => {

        zone.innerHTML += `

        <div class="score-row">

            <label>${joueur.nom}</label>

            <input
                type="number"
                value="0"
                min="0"
                id="score_${joueur.nom}">

        </div>

        `;

    });

    mettreAJourClassement();
    mettreAJourHistorique();
}

// =========================
// VALIDER MANCHE
// =========================

function validerManche() {

    const manche = [];

    partie.joueurs.forEach(joueur => {

        const points =
            Number(
                document.getElementById(
                    `score_${joueur.nom}`
                ).value
            );

        joueur.score += points;

        manche.push({

            joueur:
                joueur.nom,

            points:
                points

        });

    });

    partie.historique.push(
        manche
    );

    partie.manche++;

    sauvegarder();

    if (
        verifierFinPartie()
    ) {

        afficherFinPartie();
        annoncerClassement();
        return;
    }

    afficherPartie();
    annoncerClassement();

}
// =========================
// annonce score + donneur
// =========================

function annoncerClassement() {

    let classement = [...partie.joueurs];

    classement.sort((a, b) => {

        if (partie.condition === "petit") {
            return a.score - b.score;
        }

        return b.score - a.score;

    });

    const donneurIndex =
        (
            partie.premier +
            partie.manche - 1
        ) %
        partie.joueurs.length;

    const prochainDonneur =
        partie.joueurs[donneurIndex].nom;

    const texte =
        classement
            .map(j =>
                `${j.nom} avec ${j.score} points`
            )
            .join(". ")
        +
        `. Le donneur est ${prochainDonneur}`;

    const voix =
        new SpeechSynthesisUtterance(texte);

    voix.lang = "fr-FR";
    voix.rate = 1;
    voix.pitch = 1;

    speechSynthesis.cancel();
    speechSynthesis.speak(voix);
}

// =========================
// FIN DE PARTIE
// =========================

function verifierFinPartie() {

    return partie.joueurs.some(
        joueur =>
            joueur.score >= partie.limite
    );

}

function afficherFinPartie() {

    document.getElementById(
        "finPartie"
    ).style.display = "block";

    let classement =
        [...partie.joueurs];

    classement.sort((a, b) => {

        if (
            partie.condition ===
            "petit"
        ) {

            return a.score - b.score;

        }

        return b.score - a.score;

    });

    const top3 =
        classement.slice(0, 3);

    document.getElementById(
        "podium"
    ).innerHTML = `

    <div class="podium">

        <div class="place2">
    🥈<br>
    ${top3[1]?.nom || ""}<br>
    <strong>${top3[1]?.score || 0}</strong>
</div>

<div class="place1">
    🥇<br>
    ${top3[0]?.nom || ""}<br>
    <strong>${top3[0]?.score || 0}</strong>
</div>

<div class="place3">
    🥉<br>
    ${top3[2]?.nom || ""}<br>
    <strong>${top3[2]?.score || 0}</strong>
</div>

    </div>

    `;

    document.getElementById(
        "autres"
    ).innerHTML =

        classement
            .slice(3)
            .map(
                (j, i) =>
                    `${i + 4}. ${j.nom} (${j.score})`
            )
            .join("<br>");

    document.getElementById(
    "historiqueFin"
).innerHTML =

    partie.historique
        .map((manche, index) => {

            let html =
                `<strong>Manche ${index + 1}</strong><br>`;

            manche.forEach(ligne => {

                html +=
                    `${ligne.joueur} : ${ligne.points}<br>`;

            });

            html += "<hr>";

            return html;

        })

        .join("");

    lancerConfettis();
}

function lancerConfettis() {

    for (let i = 0; i < 40; i++) {

        const c =
            document.createElement(
                "div"
            );

        c.className =
            "confetti";

        c.innerHTML =
            ["🎊", "🎉", "✨", "🎈"][
                Math.floor(
                    Math.random() * 4
                )
            ];

        c.style.left =
            Math.random() *
                window.innerWidth +
            "px";

        document.body.appendChild(
            c
        );

        setTimeout(() => {

            c.remove();

        }, 4000);

    }

}

// =========================
// CLASSEMENT
// =========================

function mettreAJourClassement() {

    let classement =
        [...partie.joueurs];

    classement.sort((a, b) => {

        if (
            partie.condition ===
            "petit"
        ) {

            return a.score - b.score;

        }

        return b.score - a.score;

    });

    document.getElementById(
        "classement"
    ).innerHTML =

        classement
            .map(
                (j, i) =>
                    `${i + 1}. ${j.nom} : ${j.score}`
            )
            .join("<br>");
}

// =========================
// HISTORIQUE
// =========================

function mettreAJourHistorique() {

    document.getElementById(
        "historique"
    ).innerHTML =

        partie.historique
            .map((m, i) => {

                let html =
                    `<h4>Manche ${i + 1}</h4>`;

                m.forEach(l => {

                    html +=
                        `${l.joueur} : ${l.points}<br>`;

                });

                html += "<hr>";

                return html;

            })

            .join("");

}

// =========================
// CORRIGER MANCHE
// =========================

function corrigerDerniereManche() {

    if (
        partie.historique.length === 0
    ) {
        return;
    }

    const derniere =
        partie.historique.pop();

    derniere.forEach(l => {

        const joueur =
            partie.joueurs.find(
                j =>
                    j.nom ===
                    l.joueur
            );

        joueur.score -=
            l.points;

    });

    partie.manche--;

    sauvegarder();

    afficherPartie();
}

// =========================
// ANNULER PARTIE
// =========================

function annulerPartie() {

    if (
        !confirm(
            "Voulez-vous vraiment annuler cette partie ?"
        )
    ) {
        return;
    }

    localStorage.removeItem(
        "compteurScores"
    );

    location.reload();
}

// =========================
// SAUVEGARDE
// =========================

function sauvegarder() {

    localStorage.setItem(
        "compteurScores",
        JSON.stringify(partie)
    );

}

// =========================
// CHARGEMENT
// =========================

window.addEventListener("load", () => {

    const sauvegarde =
        localStorage.getItem(
            "compteurScores"
        );

    if (!sauvegarde) {
        return;
    }

    try {

        partie =
            JSON.parse(sauvegarde);

        document.getElementById(
            "setup"
        ).style.display = "none";

        document.getElementById(
            "game"
        ).style.display = "block";

        afficherPartie();

    } catch (e) {

        console.error(e);

        localStorage.removeItem(
            "compteurScores"
        );

    }

});

// =========================
// REFAIRE MEME PARTIE
// =========================

window.refaireMemePartie = function () {

    partie = {

        nomPartie: partie.nomPartie,

        jeu: partie.jeu,

        limite: partie.limite,

        condition: partie.condition,

        premier:
        (
            partie.premier +
            partie.manche -1
        ) %
        partie.joueurs.length,

        manche: 1,

        joueurs: partie.joueurs.map(j => ({
            nom: j.nom,
            score: 0
        })),

        historique: []

    };

    sauvegarder();

    document.getElementById(
        "finPartie"
    ).style.display = "none";

    afficherPartie();

};

// =========================
// NOUVELLE PARTIE
// =========================

window.nouvellePartie = function () {

    localStorage.removeItem(
        "compteurScores"
    );

    location.reload();

};

// =========================
// CORRIGER DERNIERE MANCHE
// =========================

window.corrigerDerniereMancheFin = function () {

    if (partie.historique.length === 0) {
        return;
    }

    const derniere =
        partie.historique.pop();

    derniere.forEach(ligne => {

        const joueur =
            partie.joueurs.find(
                j => j.nom === ligne.joueur
            );

        if (joueur) {
            joueur.score -= ligne.points;
        }

    });

    partie.manche--;

    sauvegarder();

    document.getElementById(
        "finPartie"
    ).style.display = "none";

    document.getElementById(
        "game"
    ).style.display = "block";

    afficherPartie();
};
// fin du fichier
