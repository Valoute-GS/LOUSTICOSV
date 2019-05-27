/*eslint-env browser*/

var nbPages = 0;
var pagesState = []; //0: à configurer - 1 : configuré
var myPlayer;

/* =======DEBUT======= AJOUT SUPPRESSION PAGE =========================================*/
function addPage() {
    //structure globale de l'input
    nbPages++;
    var newPage = document.createElement("div");
    newPage.className = "input-group";
    newPage.id = "page" + nbPages;
    newPage.innerHTML = '<div class="input-group-prepend">' +
        '<span class="input-group-text">#' + nbPages + '</span>' +
        '</div>' +
        '<input type="text" class="form-control" style="width: 40%" id="page-' + nbPages + '" placeholder="Nom de la page">' +
        '<select class="custom-select">' +
        '<option selected>Format ...</option>' +
        '<option value="1">Texte</option>' +
        '<option value="2">Video</option>' +
        '<option value="3">Questions</option>' +
        '</select>' +
        '<div class="ml-1">' +
        '<button class="btn btn-warning" type="button" id="button-' + nbPages + '" onclick="configPage(this)">Configurer</button>' +
        '</div>';

    pcontainer.appendChild(newPage); //ajout de la nouvelle div newPages (cf HTML)
    pagesState.push(0);
    console.log(pagesState);



}

function rmPage() {
    if (nbPages > 0) { //si il y a des inputs dans la liste
        nbPages--;
        var select = document.getElementById('pcontainer');
        select.removeChild(select.lastChild);
        pagesState.pop();
    }
}
/* ========FIN======== AJOUT SUPPRESSION PAGE =========================================*/

/* =======DEBUT======= CONFIG PAGE ====================================================*/
var currentPage;
var currentPageName
var currentPageNumber;
var childNodes;
var format;

function configPage(e) {
    currentPage = e.parentElement.parentElement; //du bouton on remonte a la page pour recup ses infos
    currentPageNumber = currentPage.id.substring(4);
    childNodes = currentPage.childNodes;
    format = childNodes[2].options[childNodes[2].selectedIndex].value;
    currentPageName = childNodes[1].value;

    console.log(currentPageName);
    console.log('Page numero ' + currentPageNumber);
    //console.log(childNodes);


    switch (format) {
        case "1": //Texte
            configText();
            break;
        case "2": //Video
            configVideo();
            break;
        case "3": // Question
            configSurvey();
            break;

        default:
            break;
    }
}

function updatePagesState() {
    pagesState[currentPageNumber - 1] = 1;
    var concernedButton = document.getElementById("button-" + currentPageNumber);
    concernedButton.className = "btn btn-success";
    concernedButton.innerHTML = "Configuré"
}

/* ======= TEXT =======*/
function configText() {
    hideByClass("configurator");

    // restauration de la cofiguration si deja faite
    if (pagesState[currentPageNumber - 1] === 1) { //besoin de plus de controle, si changement de format, mais pour l'instant ca fait le taf
        document.getElementById("text-input").value = myConfig.pages[currentPageNumber - 1].text;
    }

    showByClass("configurator-text")
}

function saveText() {
    //sauvergarde des infos dans une donnee type json à inserer dans le tableau "pagesInfos" à l'indice "pageNumber"
    saveTextConfig();
    hideByClass("configurator");
    showByClass("configurator-main")
}

/* ======= VIDEO =======*/
function configVideo() {
    hideByClass("configurator");

    // restauration de la cofiguration si deja faite
    if (pagesState[currentPageNumber - 1] === 1) { //besoin de plus de controle, si changement de format, mais pour l'instant ca fait le taf
        // vide puis rempli les chapitres
        chapcontainer.innerHTML = "";
        nbOfChapters = 0;
        var chaps = myConfig.pages[currentPageNumber-1].chapters;
        for(var i = 0; i < chaps.length; i++){
            createChapterInput();
            document.getElementById("input-title-"+nbOfChapters).value = chaps[nbOfChapters-1].name;
            document.getElementById("input-date-"+nbOfChapters).value = chaps[nbOfChapters-1].date;
        }
        //recharge la source
        document.getElementById("input-file-name").innerHTML = myConfig.pages[currentPageNumber-1].videoName;
        // TODO : ici
    }

    showByClass("configurator-video")
}

function saveVideo() {
    //sauvergarde des infos dans une donnee type json à inserer dans le tableau "pagesInfos" à l'indice "pageNumber"
    saveVideoConfig();
    hideByClass("configurator");
    showByClass("configurator-main")
}

/* ======= SURVEY =======*/
function configSurvey() {
    hideByClass("configurator");
    showByClass("configurator-survey")
}

function saveSurvey() {
    //sauvergarde des infos dans une donnee type json à inserer dans le tableau "pagesInfos" à l'indice "pageNumber"

    hideByClass("configurator");
    showByClass("configurator-main")
}

/* ========FIN======== CONFIG PAGE ====================================================*/

/* =======DEBUT======= VIDEO CREATOR ==================================================*/
var nbOfChapters = 0;
var fileUrl;
var fileType;
var fileName;

function handleFiles(file) {
    document.getElementById("input-file-name").innerHTML = file[0].name;
    //infos sur la video courante
    fileUrl = URL.createObjectURL(file[0]);
    fileType = file[0].type;
    fileName = file[0].name;

    console.log(fileName + ' loaded');

    myPlayer = videojs('player', {});
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
    div1.className = "input-group";
    div1.id = "chapter" + nbOfChapters;
    div1.innerHTML =
        '<div class="input-group-prepend">' +
        '<span class="input-group-text">Chapitre ' + nbOfChapters + '</span>' +
        '</div>' +
        '<input type="text" class="form-control chapter-title" id="input-title-' + nbOfChapters + '" placeholder="Titre">' +
        '<input type="text" class="form-control chapter-date" id="input-date-' + nbOfChapters + '" placeholder="m:s">';
    chapcontainer.appendChild(div1);
    //mise a jour de l'indice du nouveau chapitre

}

function removeChapterInput() {
    if (nbOfChapters > 0) { //si il y a des inputs dans la liste
        document.getElementById("chapcontainer").removeChild(document.getElementById("chapter" + nbOfChapters));
        nbOfChapters--;
    }
}

/* ========FIN======== VIDEO CREATOR ==================================================*/

/* =======DEBUT======= EXPORTS ========================================================*/
class maConfig {
    constructor(name, pages) {
        this.name = name;
        this.pages = pages; //tableau contenant les pages et leurs infos
    }
}
class ConfigVideoJson {
    constructor(videoName, videoType, chapters) {
        this.pageName = currentPageName;
        this.pageNumber = currentPageNumber;
        this.type = "video";
        this.videoName = videoName;
        this.videoType = videoType;
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

var myConfig = new maConfig("", []);

/* ======= VIDEO =======*/
function saveVideoConfig() { //appui du bouton Terminer
    var chapterTitleElts = document.getElementsByClassName("form-control chapter-title");
    var chapterDateElts = document.getElementsByClassName("form-control chapter-date");

    var chapters = [];
    var index = 0;

    for (var eltTitle of chapterTitleElts) { //on recupere les titres dans les inputs pour les chapitres
        var newChap = new ChapJson(eltTitle.value, "-1");
        chapters.push(newChap);
    }
    for (var eltDate of chapterDateElts) { //on recupere les dates dans les inputs pour les chapitres
        chapters[index].date = eltDate.value;
        index++;
    }

    let newVideoConfig = new ConfigVideoJson(fileName, fileType, chapters);

    myConfig.pages[currentPageNumber - 1] = newVideoConfig; //On sauvergarde les infosde la page (type video) pour le futur export
    updatePagesState();

}

/* ======= TEXT ========*/
function saveTextConfig() { //appui du bouton Terminer

    let newTextConfig = new ConfigTextJson(document.getElementById("text-input").value);

    myConfig.pages[currentPageNumber - 1] = newTextConfig; //On sauvergarde les infosde la page (type video) pour le futur export
    updatePagesState();
}

/* ======= CONFIG ======*/
function finishConfig() {
    if (configChecker()) {
        var configName = document.getElementById("config-name").value;
        myConfig.name = configName;
        console.log(JSON.stringify(myConfig));
    } else {
        alert("Configuration incomplete ou erronée")
    }

    function configChecker() {
        return pagesState.every(setTo1) &&
            pagesState.length > 0 &&
            configName !== null &&
            configName !== "";
    }

    /*
    //lien de telechargement du json
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(myJson);
    var dlAnchorElem = document.getElementById('download-config');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "scene.json");
    dlAnchorElem.click();
    */
}
/* ========FIN======== EXPORTS ========================================================*/

/* =======DEBUT======= TOOLS ==========================================================*/
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

function setTo1(pageState) {
    return pageState === 1;
}

/* ========FIN======== TOOLS ==========================================================*/



/* ╔══════════════════════════════════════════════════════════════════════════════════╗
   ╠════════════════════════════ ↓↓↓ ZONE DE CHANTIER ↓↓↓ ════════════════════════════╣*/