/*eslint-env browser*/
var nbPages = 0; //nb de page pour l'affichage au "compteur"
var pagesState = []; //0: à configurer | 1 : configuré
var myURLs = new Map(); //liste des URL utilisés pendant les configs
var myPlayer = videojs('player', {});
window.onbeforeunload = function () {
	return "";
};
/*const editor = new EditorJS({
		autofocus: true
});*/
/*
$(function () {
		$('[data-toggle="popover"]').popover()
})

$(document).on('DOMSubtreeModified', function() {
		$(function(){
				$('.fadein').removeClass('fadein');
		})
});*/

/* ╔══════DEBUT══════╗ AJOUT SUPPRESSION PAGE =========================================*/
function addPage() {
	//structure globale de l'input
	nbPages++;
	var newPage = document.createElement("li");
	newPage.className = "input-group my-1 fadein";
	newPage.style += "position: relative; z-index: 10"
	newPage.id = "page" + nbPages;
	newPage.innerHTML = '<div class="input-group-prepend">' +
		'<span class="input-group-text">#' + nbPages + '</span>' +
		'</div>' +
		'<input type="text" class="form-control" style="width: 40%" placeholder="Nom de la page" onchange="namePageUpdate(this)">' +
		'<select class="custom-select">' +
		'<option selected>Format ...</option>' +
		'<option value="1">Texte</option>' +
		'<option value="2">Video</option>' +
		// '<option value="3">Questions</option>' +
		'</select>' +
		'<div class="ml-1">' +
		'<button class="btn btn-warning btn-configure" type="button" onclick="configPage(this)" >Configurer</button>' +
		'</div>' +
		'<div class="ml-1">' +
		'<button class="btn btn-outline-success disabled handle">↕</button>' +
		'</div>' +/*
		'<div class="ml-1">' +
		'<button class="btn btn-outline-danger btn-delete">X</button>' +
		'</div>' +*/
		'</li>';

	pcontainer.appendChild(newPage); //ajout de la nouvelle div newPages (cf HTML)
	pagesState.push(0);
	sortablePageUpdate();
}

function rmPage() {
	if (nbPages > 0) { //si il y a des inputs dans la liste
		nbPages--;
		var select = document.getElementById('pcontainer');
		select.removeChild(select.lastChild);
		pagesState.pop();
		myConfig.pages.pop();
	}
}
/* ╚═══════FIN═══════╝ AJOUT SUPPRESSION PAGE =========================================*/

var itemsBeforeUpdate = "";
var items = "";
/* ╔══════DEBUT══════╗ SORTABLE PAGE ==================================================*/
function sortablePageUpdate() {
	//gestion de la fonctionnalité sortable (reorganisation)

	sortable('.js-sortable', {
		forcePlaceholderSize: true,
		placeholderClass: 'mb1 bg-navy border border-yellow',
		hoverClass: 'bg-maroon yellow',
		handle: '.handle',
	})
	sortable('.sortable')[0].addEventListener('sortupdate', function (e) {

		if (!(itemsBeforeUpdate === e.detail.origin.itemsBeforeUpdate && items === e.detail.origin.items)) {
			itemsBeforeUpdate = e.detail.origin.itemsBeforeUpdate;
			items = e.detail.origin.items
			var i = 0;

			var mem_myConfig = JSON.parse(JSON.stringify(myConfig));
			var mem_pagesState = pagesState.slice(0)
			
			for (const pageElt of pcontainer.children) {
				var newPageNum = (i);
				var oldPageNum = (pageElt.id.substring(4) -1);
				console.log(pageElt.id.substring(4) -1);
				
				if (pageElt.id.substring(4) == (i + 1)) { //pas de modif car la page n'a pas changé d'index
				} else { //modification nécessaire
					
					//maj de l'HTML
					pageElt.id = "page" + (i+1);
					pageElt.getElementsByClassName("input-group-text")[0].innerHTML = "#" + (i+1);
					//maj de myConfig
					myConfig.pages[newPageNum] = mem_myConfig.pages[oldPageNum];
					pagesState[newPageNum] = mem_pagesState[oldPageNum];

				}

				i++;
			}
			console.log(myConfig)
			console.log(pagesState)

		}

		/*
		This event is triggered when the user stopped sorting and the DOM position has changed.

		e.detail.item - {HTMLElement} dragged element

		Origin Container Data
		e.detail.origin.index - {Integer} Index of the element within Sortable Items Only
		e.detail.origin.elementIndex - {Integer} Index of the element in all elements in the Sortable Container
		e.detail.origin.container - {HTMLElement} Sortable Container that element was moved out of (or copied from)
		e.detail.origin.itemsBeforeUpdate - {Array} Sortable Items before the move
		e.detail.origin.items - {Array} Sortable Items after the move

		Destination Container Data
		e.detail.destination.index - {Integer} Index of the element within Sortable Items Only
		e.detail.destination.elementIndex - {Integer} Index of the element in all elements in the Sortable Container
		e.detail.destination.container - {HTMLElement} Sortable Container that element was moved out of (or copied from)
		e.detail.destination.itemsBeforeUpdate - {Array} Sortable Items before the move
		e.detail.destination.items - {Array} Sortable Items after the move
		*/
	});
}
/* ╚═══════FIN═══════╝ SORTABLE PAGE ==================================================*/

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

	switch (format) {
		case "1": //Texte
			configText();
			maintitle.innerHTML = "TEXTE - Page " + currentPageNumber;
			break;
		case "2": //Video
			maintitle.innerHTML = "VIDEO - Page " + currentPageNumber;
			configVideo();
			checkVideoOption();
			break;
		case "3": // 
			//configTextEditor();
			break;

		default:
			currentPage.getElementsByClassName("custom-select")[0].className = "custom-select border-warning";
			break;
	}
}

function updatePagesState(newState) {
	var page = document.getElementById("page" + currentPageNumber);
	pagesState[currentPageNumber - 1] = newState;
	var concernedButton = page.getElementsByClassName("btn-configure")[0];
	document.getElementById("page" + currentPageNumber).getElementsByClassName("custom-select")[0].className = "custom-select border-success";
	concernedButton.className = "btn btn-success btn-configure";
	concernedButton.innerHTML = "Configuré"
}

function namePageUpdate(inputElt) { //petit patch un peu sale pour changer dynamiquement le nom de la page (si deja configurée)
	var pageNumber = inputElt.parentElement.id.substring(4);
	if (document.getElementById("page" + pageNumber).getElementsByClassName("btn btn-success")[0]) {
		myConfig.pages[pageNumber - 1].pageName = inputElt.value;
		
	}
}

/* ======= TEXT =======*/
function configText() {
	hideByClass("configurator");

	// restauration de la cofiguration si deja faite
	let state = pagesState[currentPageNumber - 1];
	if (state === 0) { // vierge
		document.getElementById("text-input").value = "";
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
	document.getElementById("input-file-name").innerHTML = "Choisir un fichier video";
	document.getElementById("input-file-name").className = "custom-file-label border-warning";
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
		var index = 1;
		for (const option of myConfig.pages[currentPageNumber - 1].options) {
			document.getElementById("customCheck" + index).checked = option;
			index++;
		}
		//recharge la source et variables fileType/Name
		fileType = myConfig.pages[currentPageNumber - 1].videoType;
		fileName = myConfig.pages[currentPageNumber - 1].videoName;
		document.getElementById("input-file-name").innerHTML = fileName;
		document.getElementById("input-file-name").className = "custom-file-label border-success";

		myPlayer.src({
			type: fileType,
			src: myURLs.get(fileName)
		});
		myPlayer.pause();
	} else {
		var index = 0;
		for (const option of document.getElementsByClassName("custom-control-input video-option")) {
			option.checked = false;
			index++;
		}
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

/* ==== TEXT EDITOR ====*/
function configTextEditor() {
	hideByClass("configurator");
	showByClass("configurator-text-editor")
}
/* ╚═══════FIN═══════╝ CONFIG PAGE ====================================================*/

/* ╔══════DEBUT══════╗ CHARGEMENT CONFIG ==============================================*/
var nbJson = 0; //checker si on a pas importé pls config en mm temps
var importedFiles = new Map(); //tab des fichiers (autre que le json) importés
var loadedConfig = "";

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
					loadedConfig = JSON.parse(reader.result);
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

function controlConfig(canBeLoaded) { //check si tous les fichiers nécessaires sont disponibles (ceux en trop seront ignorés pour l'instant)
	var isCorrect = true;
	var errorMessages = new Set([]);
	mainerror.innerHTML = "";

	if (loadedConfig !== "") { //Si un config a été chargée
		//check les fichiers importés/necessaires
		var imp = [];
		for (const impFile of importedFiles.values()) {
			imp.push(impFile.name)
		}
		for (const page of loadedConfig.pages) { //check si les fichiers nécessaires ont bien été importés
			if (page.type === "video") {
				if (!imp.includes(page.videoName)) {
					errorMessages.add("Le fichier " + page.videoName + " est manquant");
					isCorrect = false;
				}
			}
		}
	} else { //si aucun fichier json selectionné
		errorMessages.add("Veuillez sélectionner un fichier de configuration .json");
		isCorrect = false;
	}
	if (isCorrect) { //si tout est okay on passe a la suite
		document.getElementById("input-loadfile-name").className = "custom-file-label border-success";
		btnSelectConfig.style.display = "inline";
		if (canBeLoaded) {
			loadConfig()
		};
	} else { //sinon on affiches les erreurs
		document.getElementById("input-loadfile-name").className = "custom-file-label border-warning";
		for (const message of errorMessages) {
			mainerror.innerHTML += bAlert(message);
		}
	}
}

function loadConfig() {
	//reset des champs et infos
	pcontainer.innerHTML = "";
	myURLs = new Map();
	pagesState = [];
	myConfig = loadedConfig;
	nbPages = 0;
	//maj avec les infos de la config chargee
	for (let i = 1; i <= myConfig.options.length; i++) {
		document.getElementById("switch" + i).checked = myConfig.options[i - 1]
	}
	let index = 0;
	for (const page of myConfig.pages) {
		currentPageNumber = index + 1;
		addPage();
		document.getElementById("page" + currentPageNumber).getElementsByClassName("form-control")[0].value = page.pageName;
		document.getElementById("config-name").value = myConfig.name;
		if (page.type === "video") {
			updatePagesState(2);
			document.getElementById("page" + currentPageNumber).getElementsByClassName("custom-select")[0].selectedIndex = 2;
			fileUrl = URL.createObjectURL(importedFiles.get(page.videoName));
			myURLs.set(page.videoName, fileUrl);
		} else if (page.type === "text") {
			updatePagesState(1);
			document.getElementById("page" + currentPageNumber).getElementsByClassName("custom-select")[0].selectedIndex = 1;
		}
		index++;
	}
	//reset des infos apres import
	mainerror.innerHTML = "";
	imported.innerHTML = "";
	nbJson = 0; //checker si on a pas importé pls config en mm temps
	importedFiles = new Map(); //tab des fichiers (autre que le json) importés
	loadedConfig = "";
	document.getElementById("input-loadfile-name").className = "custom-file-label border-dark";
	btnSelectConfig.style.display = "none";
	loadConfigInput.style.display = "block";
	input.value = "";
}
/* ╚═══════FIN═══════╝ CHARGEMENT CONFIG ==============================================*/

/* ╔══════DEBUT══════╗ VIDEO CREATOR ==================================================*/
var nbOfChapters = 0;
var fileUrl;
var fileType;
var fileName;

function handleFiles(file) {

	document.getElementById("input-file-name").innerHTML = file[0].name;
	document.getElementById("input-file-name").className = "custom-file-label border-success";

	//infos sur la video courante
	fileUrl = URL.createObjectURL(file[0]);
	myURLs.set(file[0].name, fileUrl);
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
		'<input type="text" class="form-control chapter-title" id="input-title-' + nbOfChapters + '" placeholder="Titre" required pattern="^[a-zA-Z0-9_.,!: ]*$">' +
		'<input type="text" class="form-control chapter-date" id="input-date-' + nbOfChapters + '" placeholder="(HH:)MM:SS" required pattern="((0?[0-9]|1[0-9]):)?([0-5]?[0-9]:)([0-5][0-9])">';
	chapcontainer.appendChild(div1);
	//mise a jour de l'indice du nouveau chapitre

}

function removeChapterInput() {
	if (nbOfChapters > 0) { //si il y a des inputs dans la liste
		document.getElementById("chapcontainer").removeChild(document.getElementById("chapter" + nbOfChapters));
		nbOfChapters--;
	}
}

function checkVideoOption() {
	if (customCheck3.checked) {
		customCheck4.disabled = false;
	} else {
		customCheck4.checked = false;
		customCheck4.disabled = true;
	}
	if (customCheck4.checked) {
		customCheck5.disabled = false;
	} else {
		customCheck5.checked = false;
		customCheck5.disabled = true;
	}
	if (customCheck4.checked) {
		customCheck6.disabled = false;
	} else {
		customCheck6.checked = false;
		customCheck6.disabled = true;
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
		} else {
			eltTitle.className = "form-control chapter-title border-success";
		}
		chapters.push(newChap);
	}
	var prevDate = -1;
	for (var eltDate of chapterDateElts) { //on recupere les dates dans les inputs pour les chapitres
		chapters[index].date = eltDate.value;
		if (!eltDate.checkValidity()) { //format valide selon la regex
			complete = false;
			eltDate.className = "form-control chapter-date border-danger";
		} else {
			if (prevDate < toSeconds(eltDate.value)) {
				eltDate.className = "form-control chapter-date border-success";
			} else {
				complete = false;
				eltDate.className = "form-control chapter-date border-danger";
			}
			prevDate = toSeconds(eltDate.value);
		}
		index++;
	}
	for (const videoOptionElt of videoOptionsElts) { //on recupere les options selectionnees ou non dans les checkboxes
		options.push(videoOptionElt.checked);
	}

	if (!isSomething(fileName) || !isSomething(myPlayer.src())) {
		complete = false;
	} else {
		if (myPlayer.duration() < prevDate) { //si la video est plus longue que la date du dernier chap
			complete = false;
		}
	}

	if (complete) {
		let newVideoConfig = new ConfigVideoJson(fileName, fileType, options, chapters);
		myConfig.pages[currentPageNumber - 1] = newVideoConfig; //On sauvergarde les infos de la page (type video) pour le futur export
		updatePagesState(2);
		myPlayer.reset();
		videoerror.innerHTML = "";
		inputGroupVideo.value = "";
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
		console.log(pagesState.every(isSet));

		return pagesState.every(isSet) && pagesState.length > 0 && isSomething(document.getElementById("config-name").value)
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
/* ╚═══════FIN═══════╝ TOOLS ==========================================================*/