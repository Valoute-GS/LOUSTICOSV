/*eslint-env browser*/

/* ╔══════DEBUT══════╗ AJOUT SUPPRESSION PAGE =========================================*/


/* ╚═══════FIN═══════╝ AJOUT SUPPRESSION PAGE =========================================*/

var myConfig;
var myConfigFiles = [];
var myPlayer;

function loadFiles(files) {
    var nbJson = 0; //checker si on a pas importé pls config en mm temps
    //on vide l'afficheur et la memoire
    imported.innerHTML = "";
    myConfig = "";
    myConfigFiles = [];
    //iteration sur les fichiers selectionnés
    for (const file of files) {
        if (file.type === "application/json") {
            nbJson++;
            if (nbJson > 1) {
                imported.innerHTML += '<li class="list-group-item list-group-item-danger my-1">' + file.name + '</li>';
                alert("Erreur : plusieurs configuration.json ont été selectionnés")
            } else {
                imported.innerHTML += '<li class="list-group-item list-group-item-primary my-1">' + file.name + '</li>';
                var selectedFile = file;
                var reader = new FileReader();
                reader.onload = function (event) {
                    myConfig = JSON.parse(reader.result)
                    
                };
                reader.readAsText(selectedFile);
            }
        } else {
            imported.innerHTML += '<li class="list-group-item my-1">' + file.name + '</li>';

            myConfigFiles.push(URL.createObjectURL(file));
        }
    }
}

//TODO bug videojs non reconnu ! --'

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

/* ╚═══════FIN═══════╝ TOOLS ==========================================================*/

