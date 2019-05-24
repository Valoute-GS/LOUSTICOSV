/*eslint-env browser*/

var nbPages = 0;

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

    pcontainer.appendChild(newPage);

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
var page;
var pageNumber;
var childNodes;
var format;

function configPage(e) {

    page = e.parentElement.parentElement;
    pageNumber = page.id.substring(4);
    childNodes = page.childNodes;
    format = childNodes[2].options[childNodes[2].selectedIndex].value;

    console.log(page);
    console.log(childNodes);


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
    hideByClass("configurator");
    showByClass("configurator-main")

}

/* ======= VIDEO =======*/
function configVideo() {
    hideByClass("configurator");
    showByClass("configurator-video")

}

/* ======= SURVEY =======*/
function configSurvey() {
    hideByClass("configurator");
    showByClass("configurator-survey")

}



/* ========FIN======== CONFIG PAGE ====================================================*/


function handleFiles(file) {
    document.getElementById("input-file-name").innerHTML = file[0].name;

    var fileUrl = URL.createObjectURL(file[0]);
    var fileType = file[0].type;
    var fileName = file[0].name;
    
    console.log(fileName);
    document.getElementById("btn-file-selected").disabled = false;

    sessionStorage.setItem("videoURL", fileUrl);
    sessionStorage.setItem("videoType", fileType);
    sessionStorage.setItem("videoName", fileName);
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