/*eslint-env browser*/
var myPlayer = videojs('myvideo');
var myConfig = ""; //json de la config chargé
var importedFiles; //tab des fichiers (autre que le json) importés

var currentPageNumber = 0;
var currentFileName = ""; //key of the map

var startTime = 0;
var endTime = 0;
var startTimeOnPage = 0;
var endTimeOnPage = 0;
var timeOnPage = [];

/* ╔══════DEBUT══════╗ CHARGEMENT CONFIG ==============================================*/
var nbJson = 0;

function loadFiles(files) { //import des fichiers + affichage
    nbJson = 0; //checker si on a pas importé pls config en mm temps
    //on vide l'affichage et la memoire
    imported.innerHTML = "";
    myConfig = "";
    importedFiles = new Map();
    //iteration sur les fichiers selectionnés
    for (const file of files) {
        if (file.type === "application/json") {
            nbJson++;
            if (nbJson > 1) { //On ne garde que le premier fichier json et on avertis si pls ont été choisis
                alert("Le fichier : " + file.name + " n'a pas été importé, veuillez ne sélectionner qu'un fichier de configuration (.json)")
            } else {
                imported.innerHTML += '<li class="list-group-item list-group-item-primary my-1">' + file.name + '</li>';
                var selectedFile = file;
                var reader = new FileReader();
                reader.onload = function () {
                    myConfig = JSON.parse(reader.result);
                };
                reader.readAsText(selectedFile);
            }
        } else {
            imported.innerHTML += '<li class="list-group-item my-1">' + file.name + '</li>';
            importedFiles.set(file.name, file);
        }
    }
}

function controlConfig() { //check si tous les fichiers nécessaires sont disponibles (ceux en trop seront ignorés pour l'instant)
    var isCorrect = true;
    var errorMessages = new Set([]);
    mainerror.innerHTML = "";

    if (myConfig !== "") { //Si un config a été chargée
        console.log(myConfig);

        //check les fichiers importés/necessaires
        var imp = [];
        for (const impFile of importedFiles.values()) {
            imp.push(impFile.name)
        }
        for (const page of myConfig.pages) { //check si les fichiers nécessaires ont bien été importés
            if (page.type === "video") {
                if (!imp.includes(page.videoName)) {
                    errorMessages.add("Le fichier " + page.videoName + " est manquant");
                    isCorrect = false;
                }
            }
        }

    } else { //si aucun titre saisi
        errorMessages.add("Veuillez sélectionner un fichier de configuration .json");
        isCorrect = false;
    }

    if (isCorrect) { //si tout est okay on passe a la suite
        personnalInfos();
    } else { //sinon on affiches les erreurs
        for (const message of errorMessages) {
            mainerror.innerHTML += bAlert(message);
        }
    }
}

/* ╚═══════FIN═══════╝ CHARGEMENT CONFIG ==============================================*/


/* ╔══════DEBUT══════╗  PREVIEW =======================================================*/
function preview() { //Need work, affiches les infos de la config chargée
    hideByClass("load");
    showByClass("load-preview");

    for (const page of myConfig.pages) {
        previewcol.innerHTML +=
            '<div class="card">' +
            '<div class="card-body">' +
            '<h5 class="card-title">' + page.pageName + '</h5>' +
            '<p class="card-text">' + page.type + '</p>' +
            '</div></div>';
    }

}

/* ╚═══════FIN═══════╝ PREVIEW  =======================================================*/

/* ╔══════DEBUT══════╗ DEROULEMENT DU TEST ============================================*/
function personnalInfos() { //phase d'initialisation
    hideByClass("load");
    hideByClass("navbar");
    showByClass("load-form-infos");

    ident.value = generateUniqueID();

}

function startConfig() {
    var correct = true;
    for (const input of document.getElementsByClassName("infos-perso")) { //on check les infos saisies et on met en valeurs les champs en fonction de leur validité
        if (!input.checkValidity()) {
            input.className = "form-control infos-perso border-danger";
            correct = false;
        } else {
            input.className = "form-control infos-perso border-success";
        }
    }
    if (correct) { //Si tout est OK
        hideByClass("load");
        //initialisation des infos et de la lecture de la config

        //indexPage
        if (myConfig.options[0] === true) { //on affiche la liste des pages si l'option dans la config est cochée
            for (const page of myConfig.pages) {
                pagesNameIndex.innerHTML += '<a class="dropdown-item" onclick="jumpToPage(' + (page.pageNumber - 1) + ')">· ' + page.pageName + '</a>';
            }
            showByClass("pages-index");
        }

        startTime = Date.now();
        nextPage();
    }
}

function nextPage() { //charge la page suivante en fonction de son type et inc de l'indice de la page actuelle
    if (myConfig.pages.length === currentPageNumber) {
        finishConfig();
    } else {
        switch (myConfig.pages[currentPageNumber].type) {
            case "video":
                loadVideo();
                break;
            case "text":
                loadText();
                break;

            default:
                break;
        }
    }
    currentPageNumber++;

}

function jumpToPage(pageNumber) {
    currentPageNumber = pageNumber;
    nextPage();
}

function finishConfig() { //récup des infos et résulatats
    hideByClass("load");
    hideByClass("pages-index")
    showByClass("load-finish");
    endTime = Date.now();
    console.log("Temps écoulé : " + (endTime - startTime) / 1000);

}

/* ╚═══════FIN═══════╝ DEROULEMENT DU TEST ============================================*/

/* ╔══════DEBUT══════╗ PLAYER VIDEO  ==================================================*/
function loadVideo() { //page de type video, change l'interface et rempli les champs en fonction de la configuration
    var currentPage = myConfig.pages[currentPageNumber];
    var currentFile = importedFiles.get(currentPage.videoName);
    //Pour plus de lisibilité du code on stock es options
    const PAUSECHAP = currentPage.options[0]; //TODO:
    const PPLLOWED = currentPage.options[1];
    const FREENAV = currentPage.options[2];
    const VISIBLECHAP = currentPage.options[3];
    const CLICKABLECHAP = currentPage.options[4];

    hideByClass("load");
    showByClass("load-video");

    //init player
    myPlayer.src({
        type: currentFile.type,
        src: URL.createObjectURL(currentFile)
    })
    myPlayer.removeChild('BigPlayButton')

    //changements en fonction de la config
    //PLAY PAUSE AUTORISES
    if (PPLLOWED) {
        controls.style.display = "inline";
    } else {
        controls.style.display = "none";
        playVideo();
    }
    //BARRE DE NAVIGATION VISIBLE
    if (FREENAV) {
        myPlayer.controls(true);
        myPlayer.tech_.off('dblclick');
        myPlayer.tech_.off('pointer-events');
        myPlayer.controlBar.removeChild('FullscreenToggle')
        myPlayer.controlBar.removeChild('VolumePanel')

    } else {
        myPlayer.controls(false);
    }
    //CHAPITRES VISIBLES
    chapcontainer.innerHTML = "";
    if (VISIBLECHAP) {
        chapcontainer.style.display = "block";
        for (const chapter of myConfig.pages[currentPageNumber].chapters) {
            chapcontainer.innerHTML += '<li class="list-group-item bg-transparent my-1 p-1">' + chapter.name + ' : ' +
                '<button class="btn btn-sm btn-outline-primary btn-chapter" type="button" onclick="gotoTime(this.innerHTML)">' + chapter.date +
                '</button>' +
                '</li>';
        }
    } else {
        chapcontainer.style.display = "none";
    }
    //CHAPITRES CLIQUABLE
    if (CLICKABLECHAP) {

    } else {
        for (const btn of document.getElementsByClassName("btn-chapter")) {
            btn.disabled = "true";
        }
    }

    myPlayer.load();
}

function playVideo() {
    btnPlay.style.display = "none";
    btnPause.style.display = "inline";
    myPlayer.play();
}

function pauseVideo() {
    btnPlay.style.display = "inline";
    btnPause.style.display = "none";
    myPlayer.pause();
}

function gotoTime(time) {
    myPlayer.currentTime(toSeconds(time));
}

/* ╚═══════FIN═══════╝ PLAYER VIDEO  ==================================================*/

/* ╔══════DEBUT══════╗ TEXT  ==========================================================*/
function loadText() { //page de type texte
    hideByClass("load");
    showByClass("load-text");

    document.getElementById("text-display").innerHTML = "";
    document.getElementById("text-display").innerHTML += myConfig.pages[currentPageNumber].text;
}

/* ╚═══════FIN═══════╝ TEXT  ==========================================================*/


/* ╔══════DEBUT══════╗ TOOLS ==========================================================*/
function hideByClass(className) {
    var eltsToHide = document.getElementsByClassName(className);
    for (var i = 0; i < eltsToHide.length; i++) {
        eltsToHide[i].style.display = 'none';
    }
}

function showByClass(className) {
    var eltsToHide = document.getElementsByClassName(className);
    for (var i = 0; i < eltsToHide.length; i++) {
        eltsToHide[i].style.display = 'block';
    }
}

function generateUniqueID() {
    id = myConfig.name.replace(/[^A-Z0-9]+/ig, "_") + Date.now();
    return id;
}

function bAlert(message) {
    return '<div class="alert alert-warning alert-dismissible" role="alert">' +
        '<strong>Erreur</strong> ' + message +
        '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
        '<span aria-hidden="true">&times;' +
        '</span></button></div>';

}

function toSeconds(time) {
    var a = time.split(':'); // split au séparateur ":"
    var seconds = 0;
    switch (a.length) {
        case 1:
            seconds = time
            break;
        case 2:
            seconds = (+a[0]) * 60 + (+a[1]);
            break;
        case 3:
            seconds = (+a[0]) * 3600 + (+a[1]) * 60 + (+a[2]);
            break;
        default:
            alert("Heure du chapitre dans un format incorrect")
            break;
    }
    return seconds;
}

//ident.value = generateUniqueID();

/* ╚═══════FIN═══════╝ TOOLS ==========================================================*/