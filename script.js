// Fonction principale appelée au chargement de la page
document.addEventListener("DOMContentLoaded", initialiserPage);

function initialiserPage() {
    const elementTitre = document.querySelector('h2.h2');
    const boutonAjouter = creerBoutonAjouter();
    elementTitre.insertAdjacentElement('afterend', boutonAjouter);

    // Afficher les livres stockés dans sessionStorage au chargement de la page
    afficherLivresStockes();
}

// Crée le bouton "Ajouter un livre"
function creerBoutonAjouter() {
    const bouton = document.createElement('button');
    bouton.textContent = "Ajouter un livre";
    bouton.id = "btn-ajouter-un-livre";
    bouton.addEventListener('click', function() {
        bouton.remove(); // Supprimer le bouton "Ajouter un livre"
        afficherFormulaireRecherche(); // Afficher le formulaire de recherche
    });
    return bouton;
}

// Affiche le formulaire de recherche de livre
function afficherFormulaireRecherche() {
    const formulaire = creerFormulaireRecherche();
    const elementTitre = document.querySelector('h2.h2');
    elementTitre.insertAdjacentElement('afterend', formulaire);
}

// Crée les champs du formulaire de recherche
function creerFormulaireRecherche() {
    const formulaire = document.createElement('form');
    formulaire.id = "form-rechercher-des-livres";

    const champTitre = creerChampTexte('Titre du livre', 'titre');
    const champAuteur = creerChampTexte('Auteur', 'auteur');

    const labelTitre = document.createElement('label');
    labelTitre.textContent = 'Titre du livre:';
    labelTitre.htmlFor = 'titre';

    const labelAuteur = document.createElement('label');
    labelAuteur.textContent = 'Auteur:';
    labelAuteur.htmlFor = 'auteur';

    const boutonRechercher = creerBouton('Rechercher', gererRecherche, 'btn-rechercher-des-livres');
    const boutonAnnuler = creerBouton('Annuler', annulerRecherche, 'btn-annuler-les-recherches-des-livres');

    formulaire.appendChild(labelTitre);
    formulaire.appendChild(champTitre.input);
    formulaire.appendChild(labelAuteur);
    formulaire.appendChild(champAuteur.input);
    formulaire.appendChild(boutonRechercher);
    formulaire.appendChild(boutonAnnuler);

    return formulaire;
}

// Crée un champ de formulaire (input) et son label
function creerChampTexte(texteLabel, nom) {
    const input = document.createElement('input');
    input.type = 'text';
    input.name = nom;
    input.id = nom;
    return { input };
}

// Crée un bouton avec un gestionnaire d'événements
function creerBouton(texte, gestionnaireClic, id) {
    const bouton = document.createElement('button');
    bouton.textContent = texte;
    bouton.type = 'button';
    bouton.id = id;
    bouton.addEventListener('click', gestionnaireClic);
    return bouton;
}

// Gestionnaire pour la recherche de livres via l'API Google Books
function gererRecherche() {
    const titre = document.querySelector('input[name="titre"]').value;
    const auteur = document.querySelector('input[name="auteur"]').value;
    if (titre === "" || auteur === ""){
        // Si l'un des deux champs est vide un message d'erreur s'affiche 
        alert("Le champs Titre du livre et Auteur sont obligatoire");
    }else{
        // Si les champs sont bien remplis
        rechercherLivresGoogle(titre, auteur);
    }
}

// Requête API Google Books
function rechercherLivresGoogle(titre, auteur) {
    const requete = `intitle:${titre}+inauthor:${auteur}`;
    const urlApi = `https://www.googleapis.com/books/v1/volumes?q=${requete}`;

    fetch(urlApi)
        .then(reponse => reponse.json())
        .then(donnees => {
            const livres = donnees.items || [];
            afficherResultatsRecherche(livres); // Afficher les résultats de recherche sans affecter les livres de la sessionStorage
        })
        .catch(erreur => console.error("Erreur lors de la recherche des livres :", erreur));
}

// Affiche les résultats de recherche
function afficherResultatsRecherche(livres) {
    // Sélectionner l'élément <hr> existant dans le document
    const hrElement = document.querySelector('hr');

    // Crée ou obtient le conteneur des résultats de recherche
    const conteneurLivres = obtenirOuCreerConteneurLivres('resultats-recherche');
    conteneurLivres.innerHTML = '';

    // Crée un élément H2 avec la valeur "Résultats de recherche"
    const titreResultats = document.createElement('h2');
    titreResultats.id = 'titre-resultats-de-recherche';
    titreResultats.textContent = 'Résultats de recherche';

    // Insérer titreResultats après l'élément <hr>
    if (hrElement) {
        hrElement.insertAdjacentElement('afterend', titreResultats);
    } else {
        document.body.appendChild(titreResultats); // Ajouter au body si <hr> n'existe pas
    }

    // Ajouter le conteneur après titreResultats
    titreResultats.insertAdjacentElement('afterend', conteneurLivres);

    // Insérer titreResultats après l'élément <hr>
    if (hrElement) {
        hrElement.insertAdjacentElement('afterend', titreResultats);
    } else {
        document.body.appendChild(titreResultats); // Ajouter au body si <hr> n'existe pas
    }

    // Ajouter le conteneur après l'élément <hr> si nécessaire
    if (hrElement && !document.getElementById('resultats-recherche')) {
        hrElement.insertAdjacentElement('afterend', conteneurLivres);
    }

    if (livres.length === 0) {
        const messageAucunResultat = document.createElement('p');
        messageAucunResultat.textContent = "Aucun livre n’a été trouvé";
        conteneurLivres.appendChild(messageAucunResultat);
    } else {
        livres.forEach(livre => {
            const carteLivre = creerCarteLivre(livre, false); // 'false' pour indiquer que ce n'est pas un livre en sessionStorage
            conteneurLivres.appendChild(carteLivre);
        });
    }
}


// Crée une carte contenant les informations d'un livre
function creerCarteLivre(livre, estStocke) {
    const divLivre = document.createElement('div');
    divLivre.classList.add('livre');

    const titreLivre = document.createElement('h3');
    titreLivre.textContent = `Titre : ${livre.volumeInfo.title}`;
    divLivre.appendChild(titreLivre);

    const identifiantLivre = document.createElement('p');
    identifiantLivre.textContent = `Id : ${livre.id}`;
    identifiantLivre.style.fontStyle = 'italic';
    identifiantLivre.style.fontWeight = 'bold';
    divLivre.appendChild(identifiantLivre);

    const auteurLivre = document.createElement('p');
    auteurLivre.textContent = livre.volumeInfo.authors ? `Auteur : ${livre.volumeInfo.authors[0]}` : 'Auteur inconnu';
    divLivre.appendChild(auteurLivre);

    const iconeAction = document.createElement('span');
    iconeAction.id = 'bookmark-ou-corbeille';
    iconeAction.style.cursor = 'pointer';

    if (estStocke) {
        iconeAction.textContent = '🗑️';
        iconeAction.addEventListener('click', function() {
            retirerLivreDePochListe(livre.id);
            divLivre.remove(); // Supprimer la carte du livre de l'affichage
        });
    } else {
        iconeAction.textContent = '🔖';
        iconeAction.addEventListener('click', function() {
            ajouterLivrePochListe(livre);
        });
    }

    divLivre.appendChild(iconeAction);

    const descriptionLivre = document.createElement('p');
    descriptionLivre.textContent = `Description : ${livre.volumeInfo.description 
        ? livre.volumeInfo.description.substring(0, 200) + '...' 
        : 'Information manquante'}`;    
    divLivre.appendChild(descriptionLivre);

    const imageLivre = document.createElement('img');
    imageLivre.id = 'img-livre';
    imageLivre.src = livre.volumeInfo.imageLinks ? livre.volumeInfo.imageLinks.thumbnail : 'logo/unavailable.png';
    divLivre.appendChild(imageLivre);

    return divLivre;
}

// Ajoute un livre à la sessionStorage sans vider les résultats de recherche
function ajouterLivrePochListe(livre) {
    let livresEnregistres = JSON.parse(sessionStorage.getItem('livresEnregistres')) || [];

    if (livresEnregistres.some(l => l.id === livre.id)) {
        alert("Vous ne pouvez ajouter deux fois le même livre");
    } else {
        livresEnregistres.push(livre);
        sessionStorage.setItem('livresEnregistres', JSON.stringify(livresEnregistres));
        afficherLivresStockes(); // Mettre à jour l'affichage des livres stockés
    }
}

// Affiche les livres stockés dans sessionStorage
function afficherLivresStockes() {
    const livresEnregistres = JSON.parse(sessionStorage.getItem('livresEnregistres')) || [];
    const conteneurLivresStockes = obtenirOuCreerConteneurLivres('livres-stockes');
    document.body.appendChild(conteneurLivresStockes);
    conteneurLivresStockes.innerHTML = '';

    livresEnregistres.forEach(livre => {
        const carteLivre = creerCarteLivre(livre, true);
        conteneurLivresStockes.appendChild(carteLivre);
    });
}

// Retire un livre de sessionStorage et met à jour l'affichage
function retirerLivreDePochListe(idLivre) {
    let livresEnregistres = JSON.parse(sessionStorage.getItem('livresEnregistres')) || [];
    livresEnregistres = livresEnregistres.filter(livre => livre.id !== idLivre);
    sessionStorage.setItem('livresEnregistres', JSON.stringify(livresEnregistres));
    afficherLivresStockes(); // Mettre à jour l'affichage des livres stockés
}

// Obtenir ou créer un conteneur pour afficher les livres
function obtenirOuCreerConteneurLivres(id) {
    let conteneur = document.getElementById(id);
    if (!conteneur) {
        conteneur = document.createElement('div');
        conteneur.id = id;
    }
    return conteneur;
}

// Annule la recherche et restaure le bouton "Ajouter un livre"
function annulerRecherche() {
    const formulaire = document.querySelector('form');
    const resultatsRecherche = document.getElementById('resultats-recherche');
    const titreResultatsRecherche = document.getElementById('titre-resultats-de-recherche');
    formulaire.remove();
    resultatsRecherche.remove();
    titreResultatsRecherche.remove();
    const boutonAjouter = creerBoutonAjouter();
    const elementTitre = document.querySelector('h2.h2');
    elementTitre.insertAdjacentElement('afterend', boutonAjouter);
}
