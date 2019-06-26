/*eslint-env browser*/

var nbPages = 0; //nb de page pour l'affichage au "compteur"
var pagesState = []; //0: à configurer - 1 : configuré
var myURLs = []; //liste des URL utilisés pendant les configs
var myPlayer = videojs('player', {});

/* ╔══════DEBUT══════╗ AJOUT SUPPRESSION PAGE =========================================*/
function addPage() {
    //structure globale de l'input
    nbPages++;
    var newPage = document.createElement("div");
    newPage.className = "input-group my-1";
    newPage.id = "page" + nbPages;
    newPage.innerHTML = '<div class="input-group-prepend">' +
        '<span class="input-group-text">#' + nbPages + '</span>' +
        '</div>' +
        '<input type="text" class="form-control" style="width: 40%" id="page-' + nbPages + '" placeholder="Nom de la page" onchange="namePageUpdate(this)">' +
        '<select class="custom-select">' +
        '<option selected>Format ...</option>' +
        '<option value="1">Texte</option>' +
        '<option value="2">Video</option>' +
       // '<option value="3">Questions</option>' +
        '</select>' +
        '<div class="ml-1">' +
        '<button class="btn btn-warning" type="button" id="button-' + nbPages + '" onclick="configPage(this)">Configurer</button>' +
        '</div>';

    pcontainer.appendChild(newPage); //ajout de la nouvelle div newPages (cf HTML)
    pagesState.push(0);

}

function rmPage() {
    if (nbPages > 0) { //si il y a des inputs dans la liste
        nbPages--;
        var select = document.getElementById('pcontainer');
        select.removeChild(select.lastChild);
        pagesState.pop();
    }
}
/* ╚═══════FIN═══════╝ AJOUT SUPPRESSION PAGE =========================================*/

/* ╔══════DEBUT══════╗ CONFIG PAGE ====================================================*/
var currentPage, currentPageName, currentPageNumber;
var childNodes;
var format;

function configPage(e) {
    currentPage = e.parentElement.parentElement; //du bouton on remonte a la page pour recup ses infos    
    currentPageNumber = currentPage.id.substring(4);
    childNodes = currentPage.childNodes;
    format = childNodes[2].options[childNodes[2].selectedIndex].value;
    currentPageName = childNodes[1].value;

    currentPage.getElementsByClassName("custom-select")[0].className = "custom-select border-success";

    switch (format) {
        case "1": //Texte
            configText();
            maintitle.innerHTML = "TEXTE - Page " + currentPageNumber;
            break;
        case "2": //Video
            maintitle.innerHTML = "VIDEO - Page " + currentPageNumber;
            configVideo();
            break;
        case "3": // Question
            configSurvey();
            break;

        default:
            currentPage.getElementsByClassName("custom-select")[0].className = "custom-select border-warning";
            break;
    }
}

function updatePagesState(newState) {
    pagesState[currentPageNumber - 1] = newState;
    var concernedButton = document.getElementById("button-" + currentPageNumber);
    concernedButton.className = "btn btn-success";
    concernedButton.innerHTML = "Configuré"
}

function namePageUpdate(inputElt) { //petit patch un peu sale pour changer dynamiquement le nom de la page (si deja configurée)
    var nthPage = inputElt.id.substring(5);
    if (document.getElementById("button-" + nthPage).innerHTML === "Configuré") {
        myConfig.pages[nthPage - 1].pageName = inputElt.value;
    }
}

/* ======= TEXT =======*/
function configText() {
    hideByClass("configurator");

    // restauration de la cofiguration si deja faite
    let state = pagesState[currentPageNumber - 1];
    if (state === 0) { // vierge

    } else if (state === 1) { // si c'est un text qui a deja ete config
        document.getElementById("text-input").value = myConfig.pages[currentPageNumber - 1].text;
    } else { //deja config dans un autre format
        document.getElementById("text-input").value = "";
    }

    showByClass("configurator-text")
}

function saveText() {
    if (saveTextConfig() == true) {
        hideByClass("configurator");
        maintitle.innerHTML = "LOUSTIC OS - Créer";
        showByClass("configurator-main");
    }
}

/* ======= VIDEO =======*/
function configVideo() {
    hideByClass("configurator");
    //reset
    chapcontainer.innerHTML = "";
    document.getElementById("input-file-name").innerHTML = "";
    nbOfChapters = 0;

    // restauration de la cofiguration si deja faite
    if (pagesState[currentPageNumber - 1] === 2) { //Si un format config a deja ete fait on le charge
        //on remplit les chapitres
        var chaps = myConfig.pages[currentPageNumber - 1].chapters;
        for (var i = 0; i < chaps.length; i++) {
            createChapterInput();
            document.getElementById("input-title-" + nbOfChapters).value = chaps[nbOfChapters - 1].name;
            document.getElementById("input-date-" + nbOfChapters).value = chaps[nbOfChapters - 1].date;
        }
        //recharge la source et variables fileType/Name
        fileType = myConfig.pages[currentPageNumber - 1].videoType;
        fileName = myConfig.pages[currentPageNumber - 1].videoName;
        document.getElementById("input-file-name").innerHTML = fileName;
        myPlayer.src({
            type: fileType,
            src: myURLs[currentPageNumber]
        });
        myPlayer.pause();
    }

    showByClass("configurator-video")
}

function saveVideo() {
    if (saveVideoConfig() == true) { //bug sans == true ???
        hideByClass("configurator");
        maintitle.innerHTML = "LOUSTIC OS - Créer";
        showByClass("configurator-main");
    }
}

/* ======= SURVEY =======*/
function configSurvey() {
    hideByClass("configurator");
    showByClass("configurator-survey")
}

function saveSurvey() {
    hideByClass("configurator");
    maintitle.innerHTML = "LOUSTIC OS - Créer"
    showByClass("configurator-main")
}

/* ╚═══════FIN═══════╝ CONFIG PAGE ====================================================*/

/* ╔══════DEBUT══════╗ VIDEO CREATOR ==================================================*/
var nbOfChapters = 0;
var fileUrl;
var fileType;
var fileName;

function handleFiles(file) {
    document.getElementById("input-file-name").innerHTML = file[0].name;
    //infos sur la video courante
    fileUrl = URL.createObjectURL(file[0]);
    myURLs[currentPageNumber] = fileUrl;
    fileType = file[0].type;
    fileName = file[0].name;

    myPlayer.src({
        type: fileType,
        src: fileUrl
    });
    myPlayer.pause();
    myPlayer.load();
}

function createChapterInput() {
    //structure globale de l'input
    nbOfChapters++;
    var div1 = document.createElement("div");
    div1.className = "input-group my-1";
    div1.id = "chapter" + nbOfChapters;
    div1.innerHTML =
        '<div class="input-group-prepend">' +
        '<span class="input-group-text">Chapitre ' + nbOfChapters + '</span>' +
        '</div>' +
        '<input type="text" class="form-control chapter-title" id="input-title-' + nbOfChapters + '" placeholder="Titre" required pattern="^[a-zA-Z0-9_.,!:]*$">' +
        '<input type="text" class="form-control chapter-date" id="input-date-' + nbOfChapters + '" placeholder="HH:MM:SS" required pattern="((0?[0-9]|1[0-9]):)?([0-5]?[0-9]:)?([0-5]?[0-9])">';
    chapcontainer.appendChild(div1);
    //mise a jour de l'indice du nouveau chapitre

}

function removeChapterInput() {
    if (nbOfChapters > 0) { //si il y a des inputs dans la liste
        document.getElementById("chapcontainer").removeChild(document.getElementById("chapter" + nbOfChapters));
        nbOfChapters--;
    }
}

/* ╚═══════FIN═══════╝ VIDEO CREATOR ==================================================*/


/* ╔══════DEBUT══════╗ EXPORTS ========================================================*/
class maConfig {
    constructor(name, options, pages) {
        this.name = name;
        this.options = options;
        this.pages = pages; //tableau contenant les pages et leurs infos
    }
}
class ConfigVideoJson {
    constructor(videoName, videoType, options, chapters) {
        this.pageName = currentPageName;
        this.pageNumber = currentPageNumber;
        this.type = "video";
        this.videoName = videoName;
        this.videoType = videoType;
        this.options = options;
        this.chapters = chapters;
    }
}
class ChapJson {
    constructor(name, date) {
        this.name = name;
        this.date = date;
    }
}
class ConfigTextJson {
    constructor(text) {
        this.pageName = currentPageName;
        this.pageNumber = currentPageNumber;
        this.type = "text";
        this.text = text;
    }
}

var myConfig = new maConfig("", [], []);

/* ======= VIDEO =======*/
function saveVideoConfig() { //appui du bouton Terminer
    var chapterTitleElts = document.getElementsByClassName("chapter-title");
    var chapterDateElts = document.getElementsByClassName("chapter-date");
    var videoOptionsElts = document.getElementsByClassName("video-option");

    var complete = true;

    var chapters = [];
    var options = [];
    var index = 0;

    for (var eltTitle of chapterTitleElts) { //on recupere les titres dans les inputs pour les chapitres
        var newChap = new ChapJson(eltTitle.value, "-1");
        if (!eltTitle.checkValidity()) {
            complete = false;
            eltTitle.className = "form-control chapter-title border-danger";
        }else{
            eltTitle.className = "form-control chapter-title border-success";
        }
        chapters.push(newChap);
    }
    for (var eltDate of chapterDateElts) { //on recupere les dates dans les inputs pour les chapitres
        chapters[index].date = eltDate.value;
        if (!eltDate.checkValidity()) {
            complete = false;
            eltDate.className = "form-control chapter-date border-danger";
        }else{
            eltDate.className = "form-control chapter-date border-success";
        }
        index++;
    }
    for (const videoOptionElt of videoOptionsElts) { //on recupere les options selectionnees ou non dans les checkboxes
        options.push(videoOptionElt.checked);
    }
    
    if (!isSomething(fileName) || !isSomething(myPlayer.src())) {
        complete = false;
    }

    if (complete) {
        let newVideoConfig = new ConfigVideoJson(fileName, fileType, options, chapters);
        myConfig.pages[currentPageNumber - 1] = newVideoConfig; //On sauvergarde les infos de la page (type video) pour le futur export
        updatePagesState(2);
        myPlayer.reset();
        return true;
    } else {
        videoerror.innerHTML = bAlert("Configuration video incomplete ou invalide");
        return false;
    }
}

/* ======= TEXT ========*/
function saveTextConfig() { //appui du bouton Terminer
    let newText = document.getElementById("text-input").value;

    let newTextConfig = new ConfigTextJson(newText);
    myConfig.pages[currentPageNumber - 1] = newTextConfig; //On sauvergarde les infosde la page (type video) pour le futur export
    updatePagesState(1);
    return true;
}

/* ======= CONFIG ======*/
function finishConfig() {
    var options = [];
    for (const optionElt of document.getElementsByClassName("config-option")) {
        options.push(optionElt.checked);
    }
    //ajout des infos a la config
    myConfig.name = document.getElementById("config-name").value;
    myConfig.options = options;

    if (configChecker() == true) {
        console.log(JSON.stringify(myConfig));

        //lien de telechargement du json
        var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(myConfig));
        var dlAnchorElem = document.getElementById('download-config');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", myConfig.name + ".json");
        dlAnchorElem.click();


    } else {
        alertmain.innerHTML = bAlert("Configuration incomplete ou erronée");
    }

    function configChecker() {
        return pagesState.every(isSet) &&
            pagesState.length > 0 &&
            isSomething(myConfig.name);
    }

}
/* ╚═══════FIN═══════╝ EXPORTS ========================================================*/

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

function isSet(pageState) {
    return pageState > 0;
}

function isSomething(params) {
    if (params === "" || params === null || params === undefined) {
        return false;
    }
    return true;
}

function bAlert(message) {
    return '<div class="alert alert-warning alert-dismissible" role="alert">' +
    '<strong>Erreur</strong> '+ message +
    '<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
    '<span aria-hidden="true">&times;' +
    '</span></button></div>';
    
}
/* ╚═══════FIN═══════╝ TOOLS ==========================================================*/
