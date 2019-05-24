/*eslint-env browser*/
// Player
var chosenTest = "";
var myVideoURL;
var myVideoType;
let myPlayer;


/* ===================== Debut Type de test ===================== */
function mediaInput(type) {
    chosenTest = type;
    hideByClass("test");
    showByClass("test-media-input");
}

function callConfigurator() {
    switch (chosenTest) {
        case 1:
            configTestAuto();
            break;
        case 2:
            configTestAuto2();
            break;
        case 3:
            configTestChap();
            break;
        case 4:
            configTestChap();
            break;
        case 5:
            alert("Not implemented yet");
            break;
        default:
            alert("Erreur dans la création");
            break;
    }
}

function initializeMyPlayer() {
    myPlayer.src({
        type: sessionStorage.getItem("videoType"),
        src: sessionStorage.getItem("videoURL")
    });
    myPlayer.pause();
    myPlayer.load();
    myVideoURL = sessionStorage.getItem("videoURL");
    myVideoType = sessionStorage.getItem("videoType");
}

function configTestAuto() {
    myPlayer = videojs('player1', {
        controls: false
    });
    initializeMyPlayer();
    hideByClass("test");
    showByClass("test-preview");
}

function configTestAuto2() {
    myPlayer = videojs('player1', {
        controls: false
    });
    initializeMyPlayer();
    hideByClass("test");
    showByClass("test-preview");
}

function configTestChap() {
    myPlayer = videojs('player3', {});
    initializeMyPlayer();
    hideByClass("test");
    showByClass("test-chapter-selector");
}
/* ===================== Fin Type de test ===================== */

/* ===================== Debut Input file ===================== */

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
/* ===================== Fin Input file ===================== */

/* ===================== Debut Selection Chapitres ===================== */
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
    container.appendChild(div1);
    container.appendChild(document.createElement("br"));
    //mise a jour de l'indice du nouveau chapitre
    nbOfChapters++;
}

function removeChapterInput() {
    if (nbOfChapters > 1) { //si il y a des inputs dans la liste
        nbOfChapters--;
        document.getElementById("container").removeChild(document.getElementById("chapter" + nbOfChapters));
    }
}

function controlChapCreation(){
    console.log("appel de CCC");
    
    var inputText = document.getElementById("config-name").value;
    if(nbOfChapters === 1 ||  inputText == "" || inputText == null){
        alert("Veuillez entrez un nom de configuration et au moins un chapitre");
    }else{
        saveConfig();
    }
}
/* ===================== Fin Selection Chapitres ===================== */

/* ===================== Debut export config ===================== */

class ConfigJson {
    constructor(type, title, videoName, videoType, chapters) {
        this.type = type;
        this.title = title;
        this.videoName = videoName;
        this.videoType = videoType;
        this.chapters = chapters;
    }
    toJson() {
        return {
            type: this.type,
            title: this.title,
            videoName: this.videoName,
            videoType: this.videoType,
            chapters: this.chapters
        };
    }
}
class ChapJson {
    constructor(name, date) {
        this.name = name;
        this.date = date;
    }
    toJson() {
        return {
            name: this.name,
            date: this.date
        };
    }
}

function saveConfig() { //appui du bouton Enregistrer
    var chapterTitleElts = document.getElementsByClassName("form-control chapter-title");
    var chapterDateElts = document.getElementsByClassName("form-control chapter-date");

    var configName = document.getElementById("config-name").value;
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

    //creation du json
    let configTest = new ConfigJson(chosenTest, configName, sessionStorage.getItem("videoName"), sessionStorage.getItem("videoType"), chapters);
    let myJson = JSON.stringify(configTest.toJson());
    localStorage.setItem("test", myJson);
    console.log(localStorage.getItem("test"));

    //lien de telechargement du json
    var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(myJson);
    var dlAnchorElem = document.getElementById('download-config');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "scene.json");
    dlAnchorElem.click();

}
/* ===================== Fin export config ===================== */

/* ===================== Debut Player video fs ===================== */

function play() {
    if (myPlayer.paused()) {
        myPlayer.play();
    }
}

function pause() {
    if (!myPlayer.paused()) {
        myPlayer.pause();
    }
}

function jumpto() {
    myPlayer.currentTime(6);
}
/* ===================== Fin Player video fs ===================== */

/* ===================== Debut fonctions pratiques ===================== */
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
/* ===================== Fin fonctions pratiques ===================== */