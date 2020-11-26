/*eslint-env browser*/

const DBX_TOKEN = '1zR2wsLvoWYAAAAAAAAAAU4A4cnN-u5xGrQrXagFL9iUWQa42RNViPnO_g65BzKg'

var nbPages = 0; //nb de page pour l'affichage au "compteur"
var pagesState = []; //0: à configurer | 1 : configuré
var myURLs = new Map(); //liste des URL utilisés pendant les configs
var myFiles = new Map();

var myPlayer = videojs('player', {});
checkOptions();
//empeche de quitter la page
window.onbeforeunload = function () {
	return "";
};

//toolbar Quill
var toolbarOptions = [
	['bold', 'italic', 'underline', 'strike'], // toggled buttons
	['blockquote', 'code-block'],

	[{
		'header': 1
	}, {
		'header': 2
	}], // custom button values
	[{
		'list': 'ordered'
	}, {
		'list': 'bullet'
	}],
	[{
		'script': 'sub'
	}, {
		'script': 'super'
	}], // superscript/subscript
	[{
		'indent': '-1'
	}, {
		'indent': '+1'
	}], // outdent/indent
	[{
		'direction': 'rtl'
	}], // text direction

	[{
		'size': ['small', false, 'large', 'huge']
	}], // custom dropdown
	[{
		'header': [1, 2, 3, 4, 5, 6, false]
	}],
	['link', 'image', 'video', 'formula'], // add's image support
	[{
		'color': []
	}, {
		'background': []
	}], // dropdown with defaults from theme
	[{
		'font': []
	}],
	[{
		'align': []
	}],

	['clean'] // remove formatting button
];
//editeur Quill
var quill = new Quill('#editor', {
	modules: {
		imageResize: {
			displaySize: true
		},
		toolbar: toolbarOptions
	},

	theme: 'snow'
});

//gestion popover
$(function () {
	$('[data-toggle="popover"]').popover()
})
//detection pour generer l'effet de fondu
$(document).on('DOMSubtreeModified', function () {
	$(function () {
		$('.fadein').removeClass('fadein');
	})
});
/* ╔══════DEBUT══════╗ AJOUT SUPPRESSION PAGE =========================================*/
function addPage() {
	//structure globale de l'input
	nbPages++;
	var newPage = document.createElement("li");
	newPage.className = "input-group my-1";
	newPage.style += "position: relative; z-index: 10"
	newPage.id = "page" + nbPages;
	newPage.innerHTML = '<div class="input-group-prepend">' +
		'<span class="input-group-text">#' + nbPages + '</span>' +
		'</div>' +
		'<input type="text" class="form-control" style="width: 40%" placeholder="Nom de la page" onchange="namePageUpdate(this)">' +
		'<select class="custom-select">' +
		'<option selected>Format ...</option>' +
		'<option value="1">Editeur de texte/médias</option>' +
		'<option value="2">Video</option>' +
		'<option value="3">PDF</option>' +
		'</select>' +
		'<div class="ml-1">' +
		'<button class="btn btn-warning btn-configure" data-hover="Modifier" type="button" onclick="configPage(this)" >Configurer</button>' +
		'</div>' +
		'<div class="ml-1">' +
		'<button class="btn btn-outline-success disabled handle">↕</button>' +
		'</div>' +
		'<div class="ml-1">' +
		'<button class="btn btn-outline-danger btn-delete" onclick="rmThisPage(this)">X</button>' +
		'</div>' +
		'</li>';

	pcontainer.appendChild(newPage); //ajout de la nouvelle div newPages (cf HTML)
	pagesState.push(0);
	sortablePageUpdate();
	console.log(myURLs);
}

function rmPage() {
	if (nbPages > 0) { //si il y a des inputs dans la liste
		nbPages--;
		pcontainer.removeChild(pcontainer.lastChild);
		pagesState.pop();
		myConfig.pages.pop();
	}
}

function rmThisPage(e) {
	var elt = e.parentElement.parentElement;
	var pageNum = e.parentElement.parentElement.id.substring(4);
	console.log(myConfig);
	elt.parentNode.removeChild(elt);
	pagesState.splice(pageNum - 1, 1);
	myConfig.pages.splice(pageNum - 1, 1);
	nbPages--;
	console.log(myConfig);

	for (var i = pageNum; i <= pcontainer.children.length; i++) {
		console.log(pcontainer.children[i - 1].id + " -> " + i);
		pcontainer.children[i - 1].id = "page" + i;
		pcontainer.children[i - 1].getElementsByClassName("input-group-text")[0].innerHTML = "#" + (i);

	}
}
/* ╚═══════FIN═══════╝ AJOUT SUPPRESSION PAGE =========================================*/

var itemsBeforeUpdate = "";
var items = "";
/* ╔══════DEBUT══════╗ SORTABLE PAGE ==================================================*/
function sortablePageUpdate() { //gestion de la fonctionnalité sortable (reorganisation)
	//def des elements sortable
	sortable('.js-sortable', {
		forcePlaceholderSize: true,
		handle: '.handle',
	});
	sortable('.sortable')[0].addEventListener('sortupdate', function (e) { //TODO: elagage
		if (!(itemsBeforeUpdate === e.detail.origin.itemsBeforeUpdate && items === e.detail.origin.items)) { //si il y a eu un changmt dans la liste, evite les doublons sur l'event
			itemsBeforeUpdate = e.detail.origin.itemsBeforeUpdate;
			items = e.detail.origin.items

			var i = 0; //index de la forof
			var mem_myConfig = JSON.parse(JSON.stringify(myConfig)); //copie de la config
			var mem_pagesState = pagesState.slice(0) //copie de l'etat (trick : slice(0) permet une copie en profondeur)
			//on parcourt toutes les "pages"
			for (const pageElt of pcontainer.children) {
				var newPageNum = i;
				var oldPageNum = (pageElt.id.substring(4) - 1);
				if (!(pageElt.id.substring(4) == (i + 1))) { //modif car la page a changé d'index
					//maj de l'HTML
					pageElt.id = "page" + (i + 1);
					pageElt.getElementsByClassName("input-group-text")[0].innerHTML = "#" + (i + 1);
					//maj de myConfig
					myConfig.pages[newPageNum] = mem_myConfig.pages[oldPageNum];
					//maj de l'etat des pages
					pagesState[newPageNum] = mem_pagesState[oldPageNum];
				}

				i++;
			}
		}
		/* MEMO pour Sortable : sortupdate event
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

function configPage(e) { //lance le bon configurateur de page en foncion du type
	currentPage = e.parentElement.parentElement; //du bouton on remonte a la page pour recup ses infos    
	currentPageNumber = currentPage.id.substring(4);
	childNodes = currentPage.childNodes;
	format = childNodes[2].options[childNodes[2].selectedIndex].value;
	currentPageName = childNodes[1].value;

	switch (format) {
		case "1": //Texte
			configTextEditor();
			maintitle.innerHTML = "TEXTE - Page " + currentPageNumber;
			break;
		case "2": //Video
			maintitle.innerHTML = "VIDEO - Page " + currentPageNumber;
			configVideo();
			checkVideoOptions();
			break;
		case "3": //PDF
			configPdf();
			checkPdfOptions()
			maintitle.innerHTML = "PDF - Page " + currentPageNumber;
			break;

		default:
			currentPage.getElementsByClassName("custom-select")[0].className = "custom-select border-warning";
			break;
	}
}

function updatePagesState(newState) { //mets a jour l'état de la page (configuré ou non et son type) 
	/*	0 : pas configuré
		1 : editeur de texte
		2 : video
		3 : pdf
	*/
	var pageInput = document.getElementById("page" + currentPageNumber);
	pagesState[currentPageNumber - 1] = newState;
	var concernedButton = pageInput.getElementsByClassName("btn-configure")[0];
	document.getElementById("page" + currentPageNumber).getElementsByClassName("custom-select")[0].className = "custom-select border-success"; //feedbck sur le format configure
	concernedButton.className = "btn btn-success btn-configure hover-btn";
	concernedButton.innerHTML = "<span>Configuré</span>";
}

function namePageUpdate(inputElt) { //petit patch un peu sale pour changer dynamiquement le nom de la page dans myConfig (si deja configurée)
	var pageNumber = inputElt.parentElement.id.substring(4);
	if (document.getElementById("page" + pageNumber).getElementsByClassName("btn btn-success")[0]) {
		myConfig.pages[pageNumber - 1].pageName = inputElt.value;
	}
}

function checkOptions() { //checkboxes conditionnelles
	if (switch1.checked) {
		switch3.disabled = false;
	} else {
		switch3.checked = false;
		switch3.disabled = true;
	}
}
/* ======= VIDEO =======*/
function configVideo() {
	hideByClass("configurator");
	//reset
	chapcontainer.innerHTML = "";
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

		myPlayer.src({
			type: fileType,
			src: myURLs.get(fileName)
		});
		myPlayer.pause();
	} else {
		var index = 0;
		document.getElementById("input-file-name").innerHTML = "Choisir un fichier video";
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

function exitVideo() { //retour a la main page du configurateur 
	hideByClass("configurator");
	maintitle.innerHTML = "LOUSTIC OS - Créer";
	showByClass("configurator-main");
	myPlayer.reset();
	videoerror.innerHTML = "";
	inputGroupVideo.value = "";
	document.getElementById("input-file-name").innerHTML = "Choisir un fichier video";
}

/* ======= TEXT EDITOR =======*/
quill.setHTML = (html) => {
	editor.innerHTML = html;
};

// get html content
quill.getHTML = () => {
	return editor.innerHTML;
};

function configTextEditor() {
	hideByClass("configurator");

	// restauration de la cofiguration si deja faite
	let state = pagesState[currentPageNumber - 1];
	if (state === 1) { // si c'est un text qui a deja ete config
		quill.setContents(myConfig.pages[currentPageNumber - 1].text)
	} else { //deja config dans un autre format
		quill.setText('')
	}

	showByClass("configurator-text-editor")
}

function saveText() {
	if (saveTextConfig() == true) {
		hideByClass("configurator");
		maintitle.innerHTML = "LOUSTIC OS - Créer";
		showByClass("configurator-main");
	}
}

function exitText() {
	hideByClass("configurator");
	maintitle.innerHTML = "LOUSTIC OS - Créer";
	showByClass("configurator-main");
}

/* ======= PDF =======*/
function configPdf() {
	hideByClass("configurator");
	//reset des champs
	resetPdf();
	inputGroupPdf.value = "";
	chappdfcontainer.innerHTML = ""
	pdferror.innerHTML = "";
	pager.style.display = "none";
	nbPdfChapters = 0;
	for (const option of document.getElementsByClassName("pdf-option")) {
		option.checked = false;
	}

	// restauration de la cofiguration si deja faite
	let state = pagesState[currentPageNumber - 1];
	if (state === 3) { // si c'est un pdf qui a deja ete config
		pager.style.display = "block";
		pdfName = myConfig.pages[currentPageNumber - 1].pdf;
		initPDFViewer(myURLs.get(pdfName));
		document.getElementById("input-pdf-name").innerHTML = pdfName;

		for (const chap of myConfig.pages[currentPageNumber - 1].chapters) {
			createPdfChapter()
			chappdfcontainer.lastChild.getElementsByClassName("pdfchapter-title")[0].value = chap.name;
			chappdfcontainer.lastChild.getElementsByClassName("pdfchapter-slide")[0].value = chap.date;
		}
		var i = 0;
		for (const option of myConfig.pages[currentPageNumber - 1].options) {
			document.getElementsByClassName("pdf-option")[i].checked = option;
			i++;
		}
	}

	showByClass("configurator-pdf")
}

function savePdf() {
	if (savePdfConfig() == true) {
		hideByClass("configurator");
		maintitle.innerHTML = "LOUSTIC OS - Créer";
		showByClass("configurator-main");
	}
}

function exitPdf() {
	hideByClass("configurator");
	maintitle.innerHTML = "LOUSTIC OS - Créer";
	showByClass("configurator-main");
}

/* ╚═══════FIN═══════╝ CONFIG PAGE ====================================================*/

/* ╔══════DEBUT══════╗ CHARGEMENT CONFIG ==============================================*/
var importedFiles = new Map(); //tab des fichiers (autre que le json) importés
var loadedConfig = "";
$(document).on('click', '.load', function () { //gestion du faux input file
	var file = $(this).parent().parent().parent().find('.loadfile');
	file.trigger('click');
});

function loadFiles(files) { //import des fichiers + affichage
	//iteration sur les fichiers selectionnés
	for (const file of files) {
		if (file.type === "application/json") {
			if (loadedConfig != "") { //On ne garde que le premier fichier json et on avertis si pls ont été choisis
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
				//on demande ensuite a charger les fichiers annexe et on change les contraintes de l'input
				document.getElementById("load-file-name").innerHTML = "Importer les fichiers annexes requis";
				input.accept = "video/*, application/pdf";
				input.multiple = true;
			}
		} else { //fichier non-json, video/mp4, video/webm, video/quicktime --> restriction sur le format ?
			imported.innerHTML += '<li class="list-group-item my-1">' + file.name + '</li>';
			importedFiles.set(file.name, file);
			myFiles.set(file.name, file);
			controlConfig(false);
		}
	}
}

function controlConfig(canBeLoaded) { //check si tous les fichiers nécessaires sont disponibles (ceux en trop seront ignorés pour l'instant)
	var isCorrect = true;
	var missingFiles = new Set([]);
	var errorMessages = "";
	mainerror.innerHTML = "";
	$('[data-toggle="popover"]').popover("hide"); //on force le popover à se fermer car il se bloque parfois

	if (loadedConfig !== "") { //Si un config a été chargée
		//check les fichiers importés/necessaires
		var imp = new Set([]);
		for (const impFile of importedFiles.values()) {
			imp.add(impFile.name);
		}
		for (const page of loadedConfig.pages) { //check si les fichiers nécessaires ont bien été importés
			if (page.type === "video") {
				if (!imp.has(page.videoName)) {
					missingFiles.add("Veuillez ajouter le fichier manquant : " + page.videoName);
					isCorrect = false;
				}
			}
			if (page.type === "pdf") {
				if (!imp.has(page.pdf)) {
					missingFiles.add("Veuillez ajouter le fichier manquant : " + page.pdf);
					isCorrect = false;
				}
			}
		}
	} else { //si aucun fichier json selectionné
		errorMessages = "Veuillez sélectionner un fichier de configuration .json";
		isCorrect = false;
	}
	if (isCorrect) { //si tout est okay on passe a la suite
		btnSelectConfig.style.display = "inline";
		document.getElementById("load-file-name").className = "load btn btn-outline-success";
		document.getElementById("load-file-name").disabled = true;
		document.getElementById("importload-btn").className = "load btn btn-outline-success";
		document.getElementById("importload-btn").disabled = true;
		if (canBeLoaded) {
			loadConfig()
		};
	} else { //sinon on affiches les erreurs
		for (const message of missingFiles) {
			mainerror.innerHTML += missingAlert(message);
		}
		if (errorMessages != "") {
			mainerror.innerHTML += bAlert(errorMessages);
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
	checkOptions();
	let index = 0;
	document.getElementById("config-name").value = myConfig.name;
	for (const page of myConfig.pages) {
		currentPageNumber = index + 1;
		addPage();
		document.getElementById("page" + currentPageNumber).getElementsByClassName("form-control")[0].value = page.pageName;
		if (page.type === "video") {
			updatePagesState(2);
			document.getElementById("page" + currentPageNumber).getElementsByClassName("custom-select")[0].selectedIndex = 2;
			fileUrl = URL.createObjectURL(importedFiles.get(page.videoName));
			myURLs.set(page.videoName, fileUrl);
		} else if (page.type === "text") {
			updatePagesState(1);
			document.getElementById("page" + currentPageNumber).getElementsByClassName("custom-select")[0].selectedIndex = 1;
		} else if (page.type === "pdf") {
			updatePagesState(3);
			document.getElementById("page" + currentPageNumber).getElementsByClassName("custom-select")[0].selectedIndex = 3;
			fileUrl = URL.createObjectURL(importedFiles.get(page.pdf));
			myURLs.set(page.pdf, fileUrl);
		}
		index++;
	}
	emptyLoad();
}

function emptyLoad() {
	//reset des infos apres import
	mainerror.innerHTML = "";
	imported.innerHTML = "";
	importedFiles = new Map(); //tab des fichiers (autre que le json) importés
	loadedConfig = "";
	document.getElementById("load-file-name").className = "load btn btn-outline-primary";
	document.getElementById("load-file-name").disabled = false;
	document.getElementById("importload-btn").className = "load btn btn-primary";
	document.getElementById("importload-btn").disabled = false;
	btnSelectConfig.style.display = "none";
	document.getElementById("load-file-name").innerHTML = "Charger un fichier de configuration (.json)";
	input.accept = "application/json";
	input.multiple = false;
	input.value = "";
}
/* ╚═══════FIN═══════╝ CHARGEMENT CONFIG ==============================================*/

/* ╔══════DEBUT══════╗ VIDEO CREATOR ==================================================*/
var nbOfChapters = 0;
var fileUrl;
var fileType;
var fileName;
$(document).on('click', '.browse', function () { //gestion du faux input file
	var file = $(this).parent().parent().parent().find('.file');
	file.trigger('click');
});

function handleFiles(file) { //gestion de l'input pour la video
	if (isSomething(file[0])) {
		document.getElementById("input-file-name").innerHTML = file[0].name;
		//infos sur la video courante
		myFiles.set(file[0].name, file[0]);

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
		'<input type="text" class="form-control chapter-title" id="input-title-' + nbOfChapters + '" placeholder="Titre" required pattern="^[A-Za-zÀ-ÖØ-öø-ÿ0-9_.,!:-? ]*$">' +
		'<input type="text" class="form-control chapter-date" id="input-date-' + nbOfChapters + '" placeholder="(HH:)MM:SS" required pattern="((0?[0-9]|1[0-9]):)?([0-5]?[0-9]:)([0-5][0-9])">';
	chapcontainer.appendChild(div1);
	checkVideoOptions();
}

function removeChapterInput() {
	if (nbOfChapters > 0) { //si il y a des inputs dans la liste
		chapcontainer.removeChild(chapcontainer.lastChild);
		nbOfChapters--;
	}
	checkVideoOptions();
}

function checkVideoOptions() { //checkboxes conditionnelles pour les options sur la video
	if (customCheck3.checked && nbOfChapters != 0) {
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
	if (nbOfChapters != 0) {
		customCheck7.disabled = false;
	} else {
		customCheck7.checked = false;
		customCheck7.disabled = true;
	}
}

/* ╚═══════FIN═══════╝ VIDEO CREATOR ==================================================*/

/* ╔══════DEBUT══════╗ PDF ============================================================*/
//code umprunté au tuto https://pspdfkit.com/blog/2019/implement-pdf-viewer-pdf-js/
let currentPageIndex = 0;
let pageMode = 1;
let cursorIndex = Math.floor(currentPageIndex / pageMode);
let pdfInstance = null;
let totalPagesCount = 0;
var pdfName = "";
var nbPdfChapters = 0;

const viewport = document.querySelector("#viewport");
window.initPDFViewer = function (pdfURL) {
	pdfjsLib.getDocument(pdfURL).then(pdf => {
		pdfInstance = pdf;
		totalPagesCount = pdf.numPages;
		initPager();
		render();
	});
};

function onPagerButtonsClick(event) {
	const action = event.target.getAttribute("data-pager");
	if (action === "prev") {
		if (currentPageIndex === 0) {
			return;
		}
		currentPageIndex -= pageMode;
		if (currentPageIndex < 0) {
			currentPageIndex = 0;
		}
		render();
	}
	if (action === "next") {
		if (currentPageIndex === totalPagesCount - 1) {
			return;
		}
		currentPageIndex += pageMode;
		if (currentPageIndex > totalPagesCount - 1) {
			currentPageIndex = totalPagesCount - 1;
		}
		render();
	}
	pagecounter.innerHTML = currentPageIndex + 1 + "/" + totalPagesCount;
}

function initPager() {
	pagecounter.innerHTML = "1/" + totalPagesCount;
	const pager = document.querySelector("#pager");
	pager.addEventListener("click", onPagerButtonsClick);
	return () => {
		pager.removeEventListener("click", onPagerButtonsClick);
	};
}

function render() {
	cursorIndex = Math.floor(currentPageIndex / pageMode);
	const startPageIndex = cursorIndex * pageMode;
	const endPageIndex =
		startPageIndex + pageMode < totalPagesCount ?
		startPageIndex + pageMode - 1 :
		totalPagesCount - 1;

	const renderPagesPromises = [];
	for (let i = startPageIndex; i <= endPageIndex; i++) {
		renderPagesPromises.push(pdfInstance.getPage(i + 1));
	}

	Promise.all(renderPagesPromises).then(pages => {
		const pagesHTML = `<div style="width: ${
		  pageMode > 1 ? "50%" : "100%"
		}"><canvas></canvas></div>`.repeat(pages.length);
		viewport.innerHTML = pagesHTML;
		pages.forEach(renderPage);
	});
}

function renderPage(page) {
	let pdfViewport = page.getViewport(1);

	const container =
		viewport.children[page.pageIndex - cursorIndex * pageMode];
	pdfViewport = page.getViewport(container.offsetWidth / pdfViewport.width);
	const canvas = container.children[0];
	const context = canvas.getContext("2d");
	canvas.height = pdfViewport.height;
	canvas.width = pdfViewport.width;

	page.render({
		canvasContext: context,
		viewport: pdfViewport
	});
}

function resetPdf() {
	currentPageIndex = 0;
	cursorIndex = Math.floor(currentPageIndex / pageMode);
	pdfInstance = null;
	totalPagesCount = 0;
	viewport.innerHTML = "";
	document.getElementById("input-pdf-name").innerHTML = "Choisir un fichier pdf";
}

function handlePdf(file) { //gestion input file pdf
	//infos sur le pdf courante
	if (isSomething(file[0])) {


		myFiles.set(file[0].name, file[0]);

		resetPdf();
		fileUrl = URL.createObjectURL(file[0]);
		pdfName = file[0].name
		document.getElementById("input-pdf-name").innerHTML = pdfName;
		pager.style.display = "block";
		myURLs.set(file[0].name, fileUrl);
		initPDFViewer(fileUrl);
	}
}

function createPdfChapter() { //ajoute un chapitre
	nbPdfChapters++;

	var div1 = document.createElement("div");
	div1.className = "input-group my-1";
	div1.id = "chapter" + nbPdfChapters;
	div1.innerHTML = '<div class="input-group-prepend">' +
		'<span class="input-group-text">Chapitre ' + nbPdfChapters + '</span>' +
		'</div>' +
		'<input type="text" class="form-control pdfchapter-title" id="pdfinput-title-' + nbPdfChapters + '" placeholder="Titre" required pattern="^[A-Za-zÀ-ÖØ-öø-ÿ0-9_.,!:-? ]*$">' +
		'<input type="number" min="0" class="form-control pdfchapter-slide" id="pdfinput-slide-' + nbPdfChapters + '" placeholder="N° page" required >';
	//on utilise pas directement chappdfcontainer.innerHTML sinon les inputs se reset
	chappdfcontainer.appendChild(div1);
	checkPdfOptions()
}

function removePdfChapter() {
	if (nbPdfChapters > 0) {
		chappdfcontainer.removeChild(chappdfcontainer.lastChild);
		nbPdfChapters--;
		checkPdfOptions()
	}
}

function checkPdfOptions() { //checkboxes conditionnelles pour les options du pdf
	if (pdfOption1.checked && nbPdfChapters != 0) {
		pdfOption2.disabled = false;
	} else {
		pdfOption2.checked = false;
		pdfOption2.disabled = true;
	}
	if (pdfOption2.checked) {
		pdfOption3.disabled = false;
	} else {
		pdfOption3.checked = false;
		pdfOption3.disabled = true;
	}
}
/* ╚═══════FIN═══════╝ PDF ============================================================*/

/* ╔══════DEBUT══════╗ EXPORTS ========================================================*/
//export vers le fichier de config json
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
class ConfigPdfJson {
	constructor(pdfName, options, chapters) {
		this.pageName = currentPageName;
		this.pageNumber = currentPageNumber;
		this.type = "pdf";
		this.pdf = pdfName;
		this.options = options;
		this.chapters = chapters;
	}
}

var myConfig = new maConfig("", [], []);

/* ======= VIDEO =======*/
function saveVideoConfig() {
	var chapterTitleElts = document.getElementsByClassName("chapter-title");
	var chapterDateElts = document.getElementsByClassName("chapter-date");
	var videoOptionsElts = document.getElementsByClassName("video-option");

	var chapters = [];
	var options = [];
	var index = 0;
	//var pour l'affichage des erreurs
	var complete = true;
	var errorMessages = new Set([]);
	videoerror.innerHTML = "";

	for (var eltTitle of chapterTitleElts) { //on recupere les titres dans les inputs pour les chapitres
		var newChap = new ChapJson(eltTitle.value, "-1");
		if (!eltTitle.checkValidity()) { //format non valide selon la regex
			complete = false;
			errorMessages.add("Un titre ne respecte pas le format autorisé");
			eltTitle.className = "form-control chapter-title border-danger";
		} else {
			eltTitle.className = "form-control chapter-title border-success";
		}
		chapters.push(newChap);
	}
	var prevDate = -1;
	for (var eltDate of chapterDateElts) { //on recupere les dates dans les inputs pour les chapitres
		chapters[index].date = eltDate.value;
		if (!eltDate.checkValidity()) { //format non valide selon la regex
			complete = false;
			errorMessages.add("Au moins un timer ne respecte pas le format (HH:)MM:SS (Heure facultative)");
			eltDate.className = "form-control chapter-date border-danger";
		} else {
			if (prevDate < toSeconds(eltDate.value)) {
				eltDate.className = "form-control chapter-date border-success";
			} else {
				complete = false;
				errorMessages.add("Les timers doivent être dans un ordre croissant et compris dans le temps de la video");
				eltDate.className = "form-control chapter-date border-danger";
			}
			prevDate = toSeconds(eltDate.value);
		}

		if (eltDate && myPlayer.duration() < toSeconds(eltDate.value)) { //si la video est plus longue que la date du dernier chap
			complete = false;
			eltDate.className = "form-control chapter-date border-danger";
			errorMessages.add("Les timers doivent être dans un ordre croissant et compris dans le temps de la video");
		}


		index++;
	}
	for (const videoOptionElt of videoOptionsElts) { //on recupere les options selectionnees ou non dans les checkboxes
		options.push(videoOptionElt.checked);
	}

	if (!isSomething(fileName) || !isSomething(myPlayer.src())) {
		complete = false;
		errorMessages.add("Veuillez importer un fichier video");
	}

	if (complete) { //la config video est complete et correcte
		let newVideoConfig = new ConfigVideoJson(fileName, fileType, options, chapters);
		myConfig.pages[currentPageNumber - 1] = newVideoConfig; //On sauvergarde les infos de la page (type video) pour le futur export
		updatePagesState(2);
		myPlayer.reset();
		videoerror.innerHTML = "";
		inputGroupVideo.value = "";
		return true;
	} else {
		//on affiche la liste de message d'erreur
		for (const message of errorMessages) {
			videoerror.innerHTML += bAlert(message);
		}
		return false;
	}
}

/* ======= TEXT ========*/
function saveTextConfig() {
	var cont = quill.getContents();
	let newTextConfig = new ConfigTextJson(cont);
	myConfig.pages[currentPageNumber - 1] = newTextConfig; //On sauvergarde les infosde la page (type video) pour le futur export
	updatePagesState(1);
	return true;
}

/* ======= PDF =========*/
function savePdfConfig() {

	var chapters = [];
	var options = [];

	var errorMessages = new Set([]);
	pdferror.innerHTML = "";

	if (pdfInstance === null) { //aucun pdf n'a ete chargé
		errorMessages.add(bAlert("Ajouter un pdf"));
	} else { //pdf ok
		var prevSlide = -1;
		var index = 0;
		//pour chaque chapitre
		for (const chap of chappdfcontainer.children) {
			var titleElt = chap.getElementsByClassName("pdfchapter-title")[0];
			var slideElt = chap.getElementsByClassName("pdfchapter-slide")[0];
			chapters[index] = new ChapJson(titleElt.value, slideElt.value);

			if (titleElt.checkValidity()) { // le titre est valide 
				titleElt.classList.add("border-success");
				titleElt.classList.remove("border-danger");
			} else { //titre pas valide
				errorMessages.add(bAlert("Titre invalide"));
				titleElt.classList.remove("border-success");
				titleElt.classList.add("border-danger");
			}
			if (slideElt.checkValidity()) { //le numero de slide est valide
				slideElt.classList.add("border-success");
				slideElt.classList.remove("border-danger");
				if ((prevSlide >= +slideElt.value) || (+slideElt.value > totalPagesCount)) { //dans l'ordre et compris dans le diapo
					errorMessages.add(bAlert("Chap pas dans l'ordre, pas compris dans le nb de page, mauvais format"));
					slideElt.classList.remove("border-success");
					slideElt.classList.add("border-danger");
				}
				if (slideElt.value) { //pour controler l'ordre on met a jour prevSlide
					prevSlide = slideElt.value;
				}
			} else { //numero de slide non valide
				errorMessages.add(bAlert("Chap pas dans l'ordre, pas compris dans le nb de page, mauvais format"));
				slideElt.classList.remove("border-success");
				slideElt.classList.add("border-danger");
			}
			index++;
		}
	}


	for (const mess of errorMessages) {
		pdferror.innerHTML += mess;
	}

	//si il n'y a pas d'erreur
	if (pdferror.innerHTML === "") {
		//on check les options
		for (const optionElt of document.getElementsByClassName("pdf-option")) { //on recupere les options selectionnees ou non dans les checkboxes
			options.push(optionElt.checked);
		}
		let newPdfConfig = new ConfigPdfJson(pdfName, options, chapters);
		myConfig.pages[currentPageNumber - 1] = newPdfConfig; //On sauvergarde les infosde la page (type pdf) pour le futur export
		updatePagesState(3);
		inputGroupPdf.value = "";
		return true;
	}
	return false;
}

/* ======= CONFIG ======*/
function finishConfig(localDownload) {
	var options = [];
	mainerror.innerHTML = "";
	var errorMessages = new Set([]);
	for (const optionElt of document.getElementsByClassName("config-option")) {
		options.push(optionElt.checked);
	}
	//ajout des infos a la config
	myConfig.name = document.getElementById("config-name").value;
	myConfig.options = options;

	if (configChecker() == true) {
		console.log(JSON.stringify(myConfig));

		if (localDownload) {
			//lien de telechargement du json
			var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(myConfig));
			var dlAnchorElem = document.getElementById('download-config');
			dlAnchorElem.setAttribute("href", dataStr);
			dlAnchorElem.setAttribute("download", myConfig.name + ".json");
			dlAnchorElem.click();
		} else {
			checkDbx();
		}

	} else {
		for (const message of errorMessages) {
			mainerror.innerHTML += bAlert(message);
		}
	}

	function configChecker() { //vérifie que tout est bon dans la config
		if (!pagesState.every(isSet)) {
			errorMessages.add("Au moins une page n'a pas été configurée");
		}
		if (!pagesState.length > 0) {
			errorMessages.add("Veuillez ajouter au moins une page");
		}
		if (!isSomething(myConfig.name)) {
			errorMessages.add("Veuillez ajouter un nom à votre configuration");
			document.getElementById("config-name").className = "form-control border-danger";
		} else {
			document.getElementById("config-name").className = "form-control border-success";
		}
		return pagesState.every(isSet) && pagesState.length > 0 && isSomething(myConfig.name)
	}

}

const dbx = new Dropbox.Dropbox({
	accessToken: DBX_TOKEN
})

function checkDbx() {
	var isok = true;



	dbx.filesListFolder({
			path: ''
		})
		.then(function (response) {
			for (const entrie of response.result.entries) {
				if (entrie.name === myConfig.name) {
					mainerror.innerHTML += bAlert('La configuration ' + myConfig.name + ' existe déja dans la base, veuillez choisir un nouveau nom');
					isok = false;
				}
			}
			if (isok) {
				uploadToDbx();
			}
		})
		.catch(function (error) {
			mainerror.innerHTML += bAlert('Impossible de vérifier l\'existance de la configuration dans la base');
		});
}

var filesToUpload = []

function uploadToDbx() {
	$("#btnUploadDbxText").hide();
	$("#btnUploadDbxSpinner").show();

	var dataStr = JSON.stringify(myConfig);
	filesToUpload = new Array()

	//parmis les médias en mémoire on garde ceux utiles pour la config
	for (page of myConfig.pages) {
		if (page.type == 'video') {
			//filesToUpload.set(page.videoName, myURLs.get(page.videoName));
			filesToUpload.push({
				name: page.videoName,
				file: myFiles.get(page.videoName)
			})
		} else if (page.type == 'pdf') {
			//filesToUpload.set(page.pdf, myURLs.get(page.pdf));
			filesToUpload.push({
				name: page.pdf,
				file: myFiles.get(page.pdf)
			})
		}
	}

	dbx.filesUpload({
			path: '/' + myConfig.name + '/' + myConfig.name + ".json",
			mode: {
				".tag": "overwrite"
			},
			contents: dataStr
		})
		.then(function (response) {
			console.log(response);
			if (filesToUpload.length > 0)
				uploadFiles(0);
		})
		.catch(function (error) {
			mainerror.innerHTML += bAlert('Impossible d\'envoyer le fichier de config vers la base : ' + error);
		});

	console.log(filesToUpload);
}

function uploadFiles(i) {

	if (filesToUpload[i]) {

		const file = filesToUpload[i].file
		console.log(file);

		dbx.filesUpload({
				path: '/' + myConfig.name + '/' + filesToUpload[i].name,
				mode: {
					".tag": "overwrite"
				},
				contents: file
			})
			.then(function (response) {
				console.log(response);
				uploadFiles(i + 1);
			})
			.catch(function (error) {
				mainerror.innerHTML += bAlert('Impossible d\'envoyer les fichiers vers la base : ' + error);
			});
	} else {
		console.log("finito");
		$("#btnUploadDbxText").show();
		$("#btnUploadDbxSpinner").hide();
	}
}


/* ╚═══════FIN═══════╝ EXPORTS ========================================================*/

/* ╔══════DEBUT══════╗ TOOLS ==========================================================*/
function hideByClass(className) { //cacher les elements du DOM ayant la classe ClassName
	for (eltsToHide of document.getElementsByClassName(className)) {
		eltsToHide.style.display = 'none';
	}
}

function showByClass(className) { //montrer les elements (...)
	for (eltsToHide of document.getElementsByClassName(className)) {
		eltsToHide.style.display = 'block';
		eltsToHide.classList.add("fadein")
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

function bAlert(message) { //message d'erreur
	return '<div class="alert alert-warning alert-dismissible" role="alert">' +
		'<strong>Erreur</strong> ' + message +
		'<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
		'<span aria-hidden="true">&times;' +
		'</span></button></div>';

}

function missingAlert(message) { //message de fichiers maquants
	return '<div class="alert alert-info alert-dismissible" role="alert">' +
		'<strong>Fichier requis</strong> ' + message +
		'<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
		'<span aria-hidden="true">&times;' +
		'</span></button></div>';
}

function toSeconds(time) { //transforme un format HH:MM:SS en secondes 
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