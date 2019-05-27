/*eslint-env browser*/

var nbPages = 0;
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
        '<input type="text" class="form-control" style="width: 40%" placeholder="Nom de la page">' +
        '<select class="custom-select">' +
        '<option selected>Format ...</option>' +
        '<option value="1">Texte</option>' +
        '<option value="2">Video</option>' +
        '<option value="3">Questions</option>' +
        '</select>' +
        '<div class="ml-1">' +
        '<button class="btn btn-outline-dark" type="button" onclick="configPage(this)">Configurer</button>' +
        '</div>';

    pcontainer.appendChild(newPage); //ajout de la nouvelle div newPages (cf HTML)
    
    
}
function rmPage() {
    if (nbPages > 0) { //si il y a des inputs dans la liste
        nbPages--;
        var select = document.getElementById('pcontainer');
        select.removeChild(select.lastChild);
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


/* ======= TEXT =======*/
function configText() {
    hideByClass("configurator");
    showByClass("configurator-text")
}
function saveText() {
    //sauvergarde des infos dans une donnee type json à inserer dans le tableau "pagesInfos" à l'indice "pageNumber"

    hideByClass("configurator");
    showByClass("configurator-main")
}

/* ======= VIDEO =======*/
function configVideo() {
    hideByClass("configurator");
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


function handleFiles(file) {
    document.getElementById("input-file-name").innerHTML = file[0].name;
    //infos sur la video courante
    var fileUrl = URL.createObjectURL(file[0]);
    var fileType = file[0].type;
    var fileName = file[0].name;
    
    console.log(fileName);
    //save dans le sessionStorage pour les recuper au besoin
    sessionStorage.setItem("videoURL", fileUrl);
    sessionStorage.setItem("videoType", fileType);
    sessionStorage.setItem("videoName", fileName);
    
    myPlayer = videojs('player3', {});
    myPlayer.src({
        type: sessionStorage.getItem("videoType"),
        src: sessionStorage.getItem("videoURL")
    });
    myPlayer.pause();
    myPlayer.load();
}

let nbOfChapters = 1;

function createChapterInput() {
    //structure globale de l'input
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
    nbOfChapters++;
}

function removeChapterInput() {
    if (nbOfChapters > 1) { //si il y a des inputs dans la liste
        nbOfChapters--;
        document.getElementById("chapcontainer").removeChild(document.getElementById("chapter" + nbOfChapters));
    }
}



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
/* ========FIN======== TOOLS ==========================================================*/




/* ╠═══ ↓↓↓ ZONE DE CHANTIER ↓↓↓ ═════════════════════════════════════════════════════╣*/


function finishConfig(){
    var configName = document.getElementById("config-name").value;
    myConfig.name = configName;
    console.log(JSON.stringify(myConfig));
    
}


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

var myConfig = new maConfig("",[]);

function saveVideoConfig() { //appui du bouton Terminer
    var chapterTitleElts = document.getElementsByClassName("form-control chapter-title");
    var chapterDateElts = document.getElementsByClassName("form-control chapter-date");

    var chapters = [];
    var index = 0;

    for (var elt of chapterTitleElts) { //on recupere les titres dans les inputs pour les chapitres
        var newChap = new ChapJson(elt.value, "-1");
        chapters.push(newChap);
    }
    for (var elt of chapterDateElts) { //on recupere les dates dans les inputs pour les chapitres
        chapters[index].date = elt.value;
        index++;
    }
    
    let newVideoConfig = new ConfigVideoJson(sessionStorage.getItem("videoName"), sessionStorage.getItem("videoType"), chapters);
    
    myConfig.pages[currentPageNumber -1] = newVideoConfig;
    

    /*
    //lien de telechargement du json
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(myJson);
    var dlAnchorElem = document.getElementById('download-config');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "scene.json");
    dlAnchorElem.click();
    */

}