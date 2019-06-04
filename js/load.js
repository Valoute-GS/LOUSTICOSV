/*eslint-env browser*/
var myPlayer;


/* ╔══════DEBUT══════╗ CHARGEMENT CONFIG ==============================================*/
var myConfig = "";
var importedFiles = [];
var nbJson = 0;

function loadFiles(files) {
    nbJson = 0; //checker si on a pas importé pls config en mm temps
    //on vide l'affichage et la memoire
    imported.innerHTML = "";
    myConfig = "";
    importedFiles = [];
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
            importedFiles.push(file);
        }
    }
}
function controlConfig() { //check si tous les fichiers nécessaires sont disponibles (ceux en trop seront ignorés pour l'instant)
    var isCorrect = true;
    if (myConfig !== "") { //Si un config a été chargé
        console.log(myConfig);
        console.log(importedFiles);

        //check les fichiers importés/necessaires
        var imp = [];
        for (const impFile of importedFiles) {
            imp.push(impFile.name)
        }
        for (const page of myConfig.pages) {
            if (page.type === "video") {
                if(!imp.includes(page.videoName)){
                    alert("Le fichier : " + page.videoName + " est maquant");
                    isCorrect = false;
                }
            }
        }
              
    } else {
        alert("Veuillez sélectionner un fichier de configuration .json");
        isCorrect = false;
    }

    if(isCorrect){
        startConfig();
    }
}

/* ╚═══════FIN═══════╝ CHARGEMENT CONFIG ==============================================*/


/* ╔══════DEBUT══════╗  PREVIEW =======================================================*/
function preview() {
    hideByClass("load");
    showByClass("load-preview");
    console.log(myConfig.pages);

    for (const page of myConfig.pages) {
        previewcol.innerHTML +=
            '<div class="card">' +
            '<div class="card-body">' +
            '<h5 class="card-title">' + page.pageName + '</h5>' +
            '<p class="card-text">' + page.type + '</p>' +
            '</div></div>';
    }

    /*myPlayer = videojs("player1")
    myPlayer.src({
        type: "video/mp4",
        src: URL.createObjectURL(myConfigFiles[0])
    });
    document.getElementById("text-input").innerHTML += myConfig.pages[0].text; */
}

/* ╚═══════FIN═══════╝ PREVIEW  =======================================================*/

/* ╔══════DEBUT══════╗ DEROULEMENT DU TEST ============================================*/
function startConfig() {
    hideByClass("load");
    hideByClass("navbar")
    showByClass("load-form-infos")

    ident.value = generateUniqueID();
    
}

/* ╚═══════FIN═══════╝ DEROULEMENT DU TEST ============================================*/



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

/* ╚═══════FIN═══════╝ TOOLS ==========================================================*/