/*eslint-env browser*/
var myPlayer = videojs('myvideo');

var nextChapButton = myPlayer.controlBar.addChild("button", {}, 1);
var nextChapButtonDom = nextChapButton.el();
nextChapButtonDom.innerHTML = "<b>>></b>";
nextChapButtonDom.onclick = function () {
    nextChap();
}

var prevChapButton = myPlayer.controlBar.addChild("button", {}, 0);
var prevChapButtonDom = prevChapButton.el();
prevChapButtonDom.innerHTML = "<b><<</b>";
prevChapButtonDom.onclick = function () {
    prevChap();
}


var myConfig = ""; //json de la config chargé
var importedFiles = new Map(); //tab des fichiers (autre que le json) importés
var currentChapters = new Map(); // date -> index in the json

var testID = "";

//var pour observation de l'activité
var myCsvGeneral = "";
var myCsvLogs = "";

var currentPageNumber = 0;
var currentChapterNumber = 0;

var endTime = 0;

var startTimeOnTest = 0;
var startTimeOnPage = 0;
var startTimeOnChapter = 0;

var previousTime = 0;
var myReachedPage = 0;

/* ╔══════DEBUT══════╗ CHARGEMENT CONFIG ==============================================*/
var nbJson = 0; //checker si on a pas importé pls config en mm temps

function loadFiles(files) { //import des fichiers + affichage
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
                //Quand la lecture est terminée on controle l'état de la config chargéeé
                reader.onloadend = function () {
                    controlConfig(false);

                };
            }
        } else { //fichier non-json
            imported.innerHTML += '<li class="list-group-item my-1">' + file.name + '</li>';
            importedFiles.set(file.name, file);

            controlConfig(false);
        }
    }
}

function controlConfig(continueToInfos) { //check si tous les fichiers nécessaires sont disponibles (ceux en trop seront ignorés pour l'instant)
    var isCorrect = true;
    var errorMessages = new Set([]);
    mainerror.innerHTML = "";

    if (myConfig !== "") { //Si un config a été chargée

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
        if (continueToInfos) {
            personnalInfos()
        };
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

    //RESET des champs et de la config 
    //(un peu bourrin certaines auraient été redef sans soucis)
    for (const input of document.getElementsByClassName("infos-perso")) {
        input.className = "form-control infos-perso";
        input.value = "";
    }
    pagesNameIndex.innerHTML = "";
    myCsvGeneral = "";
    myCsvLogs = "";
    currentPageNumber = 0;
    currentChapterNumber = 0;
    endTime = 0;
    startTimeOnTest = 0;
    startTimeOnPage = 0;
    startTimeOnChapter = 0;
    previousTime = 0;
    myReachedPage = 0;

    testID = generateUniqueID();
    ident.value = testID;
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
        //init player -> event quand click sur la bar de navigation

        //indexPage
        if (myConfig.options[0] === true) { //on affiche la liste des pages si l'option dans la config est cochée
            for (const page of myConfig.pages) {
                pagesNameIndex.innerHTML += '<a class="dropdown-item" onclick="jumpToPage(' + (page.pageNumber - 1) + ')">· ' + page.pageName + '</a>';
            }
            showByClass("pages-index");
        }

        //init csv
        myCsvLogs = new CsvLogs();
        startTimeOnTest = Date.now();
        loadPage();
    }
}

function loadPage() { //charge la page suivante en fonction de son type et inc de l'indice de la page actuelle
    if (currentPageNumber < 1) {
        btnPrevPage.style.display = "none";
    } else {
        btnPrevPage.style.display = "block";
    }

    if (myConfig.pages.length === currentPageNumber) { //si fini
        btnNextPage.style.display = "none";
        btnPrevPage.style.display = "none";
        finishConfig();
    } else {
        btnNextPage.style.display = "block";
        pauseVideo(false); //pour pas que la video précédement chargée continue en fond si on est sur autre chose qu'une video

        var currentPage = myConfig.pages[currentPageNumber];

        startTimeOnPage = Date.now();
        myCsvLogs.addLine("START_PAGE");
        switch (currentPage.type) {
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

}

function nextPage() {
    myCsvLogs.addLine("NEXT_PAGE");
    console.log("NEXT PAGE");
    currentPageNumber++;
    loadPage();
}

function prevPage() {
    myCsvLogs.addLine("PREV_PAGE");
    console.log("PREV PAGE");
    currentPageNumber--;
    loadPage();
}

function jumpToPage(pageNumber) {
    myReachedPage = pageNumber;
    myCsvLogs.addLine("SOMMAIRE");
    console.log("SOMMAIRE : " + currentPageNumber + "-->" + pageNumber);
    currentPageNumber = pageNumber;
    loadPage();
}

function finishConfig() { //récup des infos et résulatats
    hideByClass("load");
    hideByClass("pages-index")
    showByClass("load-finish");
    endTime = Date.now();
    console.log(myCsvLogs.toString());
    //dlcsv();
}

function dlcsv() {
    var dlAnchorElem = document.getElementById('download-link');
    dlAnchorElem.setAttribute("href", myCsvLogs);
    dlAnchorElem.setAttribute("download", "test" + ".csv");
    dlAnchorElem.click();
}

/* ╚═══════FIN═══════╝ DEROULEMENT DU TEST ============================================*/

/* ╔══════DEBUT══════╗ PLAYER VIDEO  ==================================================*/
function loadVideo() { //page de type video, change l'interface et rempli les champs en fonction de la configuration
    var currentPage = myConfig.pages[currentPageNumber];
    var currentFile = importedFiles.get(currentPage.videoName);

    myPlayer.one('playing', function () { // La lecture de la video à commencé (premièere seulement)
        startTimeOnChapter = Date.now();
        myCsvLogs.addLine("VIDEO_START");
        console.log("VIDEO_START");
    });

    console.log(myPlayer.controlBar);


    //Pour plus de lisibilité du code on stock es options
    const PAUSECHAP = currentPage.options[0]; //TODO:
    const PPLLOWED = currentPage.options[1];
    const FREENAV = currentPage.options[2];
    const VISIBLECHAP = currentPage.options[3];
    const CLICKABLECHAP = currentPage.options[4];
    const NAVIGABLECHAP = currentPage.options[5];

    //on met a jour la liste des chapitres courants
    currentChapters = new Map();
    var index = 0;
    for (const chapter of myConfig.pages[currentPageNumber].chapters) {
        currentChapters.set(toSeconds(chapter.date), index);
        index++;
    }
    currentChapters = new Map([...currentChapters.entries()].sort((a, b) => a[0] - b[0])); //tri par date

    hideByClass("load");
    showByClass("load-video");

    //init player
    myPlayer.src({
        type: currentFile.type,
        src: URL.createObjectURL(currentFile)
    })
    //supprimer les fonctionnalités non désirer (fullscreen et controle du son)
    myPlayer.tech_.off('dblclick');
    myPlayer.controlBar.removeChild('FullscreenToggle');
    myPlayer.controlBar.removeChild('VolumePanel');

    //changements en fonction de la config
    //PLAY PAUSE AUTORISES
    if (PPLLOWED) {
        document.querySelector(".vjs-tech").style.pointerEvents = "auto";
        document.querySelector(".vjs-play-control.vjs-control.vjs-button").style.display = "block";
        autoPlay = false;
        pauseVideo(false);
    } else {
        document.querySelector(".vjs-tech").style.pointerEvents = "none";
        document.querySelector(".vjs-play-control.vjs-control.vjs-button").style.display = "none";
        autoPlay = true;
        playVideo(false);
    }

    //detection clic sur la barre de navigation (obligé de doubler l'event listener car si on clique sur la seekbar cela n'est pas détecté. Bug de VideoJS ? )
    myPlayer.controlBar.progressControl.on('mousedown', function (event) {
        myCsvLogs.addLine("NAVBAR_USED");
        console.log("NAVBAR_USED : progressControl -> previous: " + previousTime + " current:" + myPlayer.currentTime());
    });
    myPlayer.controlBar.progressControl.seekBar.on('mousedown', function (event) {
        myCsvLogs.addLine("NAVBAR_USED");
        console.log("NAVBAR_USED : seekbar -> previous: " + previousTime + " current:" + myPlayer.currentTime());
    });
    //BARRE DE NAVIGATION VISIBLE
    if (FREENAV) {
        document.querySelector(".vjs-progress-control").style.pointerEvents = "auto";
    } else {
        document.querySelector(".vjs-progress-control").style.pointerEvents = "none";
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
        //nothing to do
    } else {
        for (const btn of document.getElementsByClassName("btn-chapter")) {
            btn.disabled = "true";
        }
    }
    //CHAPITRES CLIQUABLE
    if (NAVIGABLECHAP) {
        nextChapButtonDom.style.display = "block";
        prevChapButtonDom.style.display = "block";
    } else {
        nextChapButtonDom.style.display = "none";
        prevChapButtonDom.style.display = "none";        
    }
    //maj du player
    myPlayer.load();
}

function playVideo(withLog) {
    if (withLog) {
        myCsvLogs.addLine("PLAY");
        //console.log("PLAY");
    }
    myPlayer.play();
}

function pauseVideo(withLog) {
    if (withLog) {
        myCsvLogs.addLine("PAUSE");
        console.log("PAUSE");
        myPlayer.one('playing', function () { // à  la prochaine lecture            
            myCsvLogs.addLine("PLAY");
            console.log("PLAY");
        });
    }
    myPlayer.pause();
}

function gotoTime(time) {
    myPlayer.currentTime(toSeconds(time));
    myCsvLogs.addLine("CHAP_USED");
    console.log("CHAPTER USED");
}

function videoEnded() {
    myCsvLogs.addLine("VIDEO_END");
    console.log("VIDEO_END");
}

var chapFrom = 0;
var chapTo = 0;

function checkChap() { //check quel est le chapitre courant durant la lecture d'une video
    previousTime = myPlayer.currentTime();
    var tmp = 0;
    for (const chapterDate of currentChapters.keys()) { //on parcourt la liste des chaps
        if (myPlayer.currentTime() >= chapterDate) {
            tmp = currentChapters.get(chapterDate) + 1; //on prend le numéro du chapitre courant
        }
    }
    if (tmp != currentChapterNumber) { //si on arrive a un nouveau chap
        chapFrom = currentChapterNumber;
        chapTo = tmp;
        //manip un peu moche engendré par les problème de sychro dus au seektime
        if (myPlayer.seeking()) { //Si déplacement via chapitre ou timeline il y aura un seektime, donc on le préviens et on ne génère les CSV qu une fois ce temps de chargement terminé
            myPlayer.one('seeked', function () {
                myCsvLogs.addLine("CHAP_ATT");
                console.log("CHAP_ATT : " + chapFrom + "-->" + chapTo);
            });
        } else { //lecture naturelle de la video (sans seeking donc)
            myCsvLogs.addLine("CHAP_ATT");
            console.log("CHAP_ATT : " + chapFrom + "-->" + chapTo);
        }
    }

    currentChapterNumber = tmp; //mise jour de la var chapitre courrant
}

function nextChap() {
    if(currentChapterNumber === myConfig.pages[currentPageNumber].chapters.length){

    }else{
        myPlayer.currentTime(toSeconds(myConfig.pages[currentPageNumber].chapters[currentChapterNumber].date));
    }
}

function prevChap() {
    if(currentChapterNumber === 0){
        myPlayer.currentTime(0);
    }else if(currentChapterNumber === 1){
        myPlayer.currentTime(0);
    }else{
        myPlayer.currentTime(toSeconds(myConfig.pages[currentPageNumber].chapters[currentChapterNumber - 2].date));
    }
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


/* ╔══════DEBUT══════╗ CSV ============================================================*/
class Csv {
    constructor() {
        this.lines = [];
        this.lines.push("data:text/csv;charset=utf-8,");
    }

    toString() {
        var res = "";
        for (const line of this.lines) {
            res += line + "\n";
        }
        return res;
    }
}

class CsvLogs extends Csv {
    /*  En-tetes colonnes CSV de log
    Timer;  
    Current page;
    Current chap;
    Reached page;
    Reached chap;
    Action;
    Time from test begining;
    Time from page begining;
    Video Timer
    Time from chap begining;
    Time from PLAY
*/
    constructor() {
        super();
        this.lines.push("Timer;Current page;Current chap;Reached page;Reched chap;Action;Time from test begining;Time from page begining;Video timer;Time from chap begining;Time from PLAY");
    }

    addLine(action) { // START_PAGE | NEXT_PAGE | PREV_PAGE | CHAP_ATT | CHAP_USED | VIDEO_START | VIDEO_END | PLAY | PAUSE | NAVBAR_USED  
        var d = new Date();
        var timer = d.toLocaleDateString() + "(" + d.toLocaleDateString("fr-FR", {
            weekday: "short"
        }) + ")-" + d.toLocaleTimeString();

        var tfTest = duration(startTimeOnTest, Date.now()).toFixed(1);
        var tfPage = duration(startTimeOnPage, Date.now()).toFixed(1);
        var tfChap = "";
        var tfPlay = "";
        var videoTimer = "";
        var reachedChap = "";
        var reachedPage = "";

        if (myConfig.pages[currentPageNumber].type === "video") {
            tfChap = duration(startTimeOnChapter, Date.now()).toFixed(1);
            if (tfChap > 1500000000) {
                tfChap = "";
            }
            tfPlay = 0;
            videoTimer = myPlayer.currentTime().toFixed(1);
        }

        switch (action) {
            case "START_PAGE":

                break;
            case "NEXT_PAGE":
                reachedPage = currentPageNumber + 1;
                break;
            case "PREV_PAGE":
                reachedPage = currentPageNumber - 1;
                break;
            case "CHAP_ATT":
                reachedChap = chapTo;
                break;
            case "CHAP_USED":

                break;
            case "VIDEO_START":

                break;
            case "VIDEO_END":

                break;
            case "PLAY":

                break;
            case "PAUSE":

                break;
            case "NAVBAR_USED":

                break;
            case "SOMMAIRE":
                reachedPage = myReachedPage;
                break;

            default:
                console.error("Unknown Action");
                break;
        }
        this.lines.push(timer + ";" + currentPageNumber + ";" + currentChapterNumber + ";" + reachedPage + ";" + reachedChap + ";" + action + ";" + tfTest + ";" + tfPage + ";" + videoTimer + ";" + tfChap + ";" + tfPlay);
    }
}
/* ╚═══════FIN═══════╝ CSV ============================================================*/

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

function duration(from, to) { //return en sec le temps écoulé entre deux dates
    return (to - from) / 1000;
}

function sortNumber(a, b) {
    return a - b;
}
/* ╚═══════FIN═══════╝ TOOLS ==========================================================*/