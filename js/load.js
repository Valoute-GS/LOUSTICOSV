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

var startTimeOnTest = 0;
var startTimeOnPage = 0;

var previousTime = 0; //timer de la video mis a jour tout le temps (utile pour connaitre le timer avant et apres une action comme nav sur seekbar)
var myReachedPage = 0; //page vers laquelle on se déplace

//editeur de texte Quill (ici juste un conteneur)
var quill = new Quill('#editor', {
	modules: {
		imageResize: false,
		toolbar: false
	},

	theme: 'snow'
});
//on desactive l'edition
quill.disable()

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

/* ╔══════DEBUT══════╗ CHARGEMENT CONFIG ==============================================*/
$(document).on('click', '.browse', function () { //gestion du faux input file
	var file = $(this).parent().parent().parent().find('.file');
	file.trigger('click');
});

function loadFiles(files) { //import des fichiers + affichage
	//iteration sur les fichiers selectionnés
	for (const file of files) {
		if (file.type === "application/json") {
			if (myConfig != "") { //On ne garde que le premier fichier json et on avertis si pls ont été choisis
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
				//on demande ensuite a charger les fichiers annexe et on change les contraintes de l'input
				document.getElementById("input-file-name").innerHTML = "Importer les fichiers annexes requis";
				input.accept = "video/*, application/pdf";
				input.multiple = true;
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
	var missingFiles = new Set([]);
	var errorMessages = "";
	mainerror.innerHTML = "";
	$('[data-toggle="popover"]').popover("hide"); //on force le popover à se fermer car il se bloque parfois

	if (myConfig !== "") { //Si un config a été chargée
		//check les fichiers importés/necessaires
		var imp = [];
		for (const impFile of importedFiles.values()) {
			imp.push(impFile.name)
		}
		for (const page of myConfig.pages) { //check si les fichiers nécessaires ont bien été importés
			if (page.type === "video") {
				if (!imp.includes(page.videoName)) {
					missingFiles.add("Veuillez ajouter le fichier manquant : " + page.videoName);
					isCorrect = false;
				}
			}
			if (page.type === "pdf") {
				if (!imp.includes(page.pdf)) {
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
		document.getElementById("input-file-name").className = "browse btn btn-outline-success";
		document.getElementById("input-file-name").disabled = true;
		document.getElementById("import-btn").className = "browse btn btn-outline-success";
		document.getElementById("import-btn").disabled = true;
		if (continueToInfos) {
			// a partir de la on demandera avant de quitter ou refrech la page
			window.onbeforeunload = function () {
				return "";
			};
			personnalInfos()
		};
	} else { //sinon on affiches les erreurs
		//document.getElementById("input-file-name").className = "browse btn btn-outline-primary";
		for (const message of missingFiles) {
			mainerror.innerHTML += missingAlert(message);
		}
		if (errorMessages != "") {
			mainerror.innerHTML += bAlert(errorMessages);
		}
	}
}
/* ╚═══════FIN═══════╝ CHARGEMENT CONFIG ==============================================*/

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
	startTimeOnTest = 0;
	startTimeOnPage = 0;
	previousTime = 0;
	myReachedPage = 0;
	tPlay = 0;
	tPlayCSV = 0;
	tChapCSV = 0;
	tPause = 0;
	tChap = 0;
	chapFrom = 0;
	chapTo = 0;

	testID = generateUniqueID();
	ident.value = testID;
}

function startConfig() { //démarre le test si les infos saisies sont conformes
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

		//SOMMAIRE
		if (myConfig.options[0]) { //on affiche la liste des pages si l'option dans la config est cochée
			if (myConfig.options[1]) { //on affiche le bouton page precedente
				pagesNameIndex.innerHTML += '<li class="page-item" id="btnPrevPage"><a class="page-link" onclick="prevPage()">Précédent</a></li>'
			} else {
				pagesNameIndex.innerHTML += '<li class="page-item" id="btnPrevPage" style="display : none"><a class="page-link" onclick="prevPage()">&laquo;</a></li>'
			}
			for (const page of myConfig.pages) {
				//Si la page n'a pas de nom on lui met un nom par defaut (son index)
				var name = (page.pageNumber)
				if (myConfig.options[2] && page.pageName != "") {
					name = page.pageName;
				}
				pagesNameIndex.innerHTML += '<li class="page-item"><a class="page-link" onclick="jumpToPage(' + (page.pageNumber - 1) + ')">' + name + '&#8203</a></li>'
			}
		}
		//on affiche toujour le bouton page suivant
		pagesNameIndex.innerHTML += '<li class="page-item active-custom" id="btnNextPage"><a class="page-link" onclick="nextPage()">Suivant</a></li>'
		showByClass("pages-index");

		//init csv
		myCsvLogs = new CsvLogs();
		//init le json qui sera transfo en csv a la fin (plus facile a manipuler car en colonnes)
		myJSONGeneral = new InfosGeneralJSON();
		for (const page of myConfig.pages) {
			infosDiapo = new InfosDiapo();
			if (page.type === "video") {
				for (const chapter of page.chapters) {
					infosDiapo.infosChaps.push(new InfosChap());
				}
			}
			myJSONGeneral.diapos.push(infosDiapo);
			myJSONGeneral.sommaire.clicsOn.push(0);
			myJSONGeneral.nth.push(0); //pour compter les visites sur chaque page
		}

		startTimeOnTest = Date.now();
		loadPage();
	}
}

function loadPage() { //charge la page suivante en fonction de son type et inc de l'indice de la page actuelle
	if (myConfig.options[0]) {
		if (currentPageNumber < 1) {
			btnPrevPage.className = "page-item disabled-custom";
		} else {
			btnPrevPage.className = "page-item active-custom";
		}
	}

	pauseVideo(false);
	if (myConfig.pages.length === currentPageNumber) { //si fini
		finishConfig();
	} else {
		if (myConfig.options[0]) {
			//page active ou non
			var i = 0;
			for (pageNameIndex of pagesNameIndex.getElementsByTagName("li")) {
				if (currentPageNumber + 1 === i) {
					pageNameIndex.classList.add("active");
				} else if (i != 0 && i != myConfig.pages.length + 1) {
					pageNameIndex.classList.remove("active");
				}
				i++;
			}
		}

		var currentPage = myConfig.pages[currentPageNumber];
		startTimeOnPage = Date.now();
		currentChapterNumber = 0;
		myCsvLogs.addLine("START_PAGE");
		switch (currentPage.type) {
			case "video":
				loadVideo();
				break;
			case "text":
				loadText();
				break;
			case "pdf":
				loadPdf();
				break;

			default:
				break;
		}
	}

}

function nextPage() { //page suivante
	myCsvLogs.addLine("NEXT_PAGE");
	currentPageNumber++;
	loadPage();
}

function prevPage() { //page precedente
	myCsvLogs.addLine("PREV_PAGE");
	currentPageNumber--;
	loadPage();
}

function jumpToPage(pageNumber) { //utilisation du sommaire
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
	myCsvLogs.addLine("END");
	console.log(myCsvLogs.toString());
	console.log(myJSONGeneral);
	dlcsv();
}

function dlcsv() { //génère le lien de téléchargement pour les CSVs
	// NOTE: a décommenter dans la version final
	var dlAnchorElem = document.getElementById('download-link');
	dlAnchorElem.setAttribute("href", myJSONGeneral.toCSV());
	dlAnchorElem.setAttribute("download", testID + "_syn" + ".csv");
	dlAnchorElem.click()
	dlAnchorElem.setAttribute("href", myCsvLogs);
	dlAnchorElem.setAttribute("download", testID + "_logs" + ".csv");
	dlAnchorElem.click();;
}
/* ╚═══════FIN═══════╝ DEROULEMENT DU TEST ============================================*/

/* ╔══════DEBUT══════╗ PLAYER VIDEO  ==================================================*/
function loadVideo() { //page de type video, change l'interface et remplit les champs en fonction de la configuration
	//FIXME: Redondances sur certaine partie qui n'ont besoin d'etre executée qu'une fois et non a chaque loadVideo()
	hideByClass("load");
	var currentPage = myConfig.pages[currentPageNumber];
	var currentFile = importedFiles.get(currentPage.videoName);

	//Pour plus de lisibilité du code on stock es options
	const PPLLOWED = currentPage.options[0];
	const FREENAV = currentPage.options[1];
	const VISIBLECHAPZONE = currentPage.options[2];
	const VISIBLECHAP = currentPage.options[3];
	const VISIBLEDATECHAP = currentPage.options[4];
	const CLICKABLECHAP = currentPage.options[5];
	const NAVIGABLECHAP = currentPage.options[6];

	myPlayer.one('playing', function () { // La lecture de la video à commencé (premièere seulement)
		myCsvLogs.addLine("VIDEO_START");
	});
	myPlayer.on('timeupdate', function () {
		checkChap();
		if (myConfig.pages[currentPageNumber].type == "video" && VISIBLECHAP) {
			chapTimerUpdate();
		}
	});

	//on met a jour la liste des chapitres courants
	currentChapters = new Map();
	var index = 0;
	for (const chapter of myConfig.pages[currentPageNumber].chapters) {
		currentChapters.set(toSeconds(chapter.date), index);
		index++;
	}
	//currentChapters = new Map([...currentChapters.entries()].sort((a, b) => a[0] - b[0])); //tri par date obselete -> date dans l'ordre 

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
	});
	myPlayer.controlBar.progressControl.seekBar.on('mousedown', function (event) {
		myCsvLogs.addLine("NAVBAR_USED");
	});
	//BARRE DE NAVIGATION VISIBLE
	if (FREENAV) {
		document.querySelector(".vjs-progress-control").style.pointerEvents = "auto";
	} else {
		document.querySelector(".vjs-progress-control").style.pointerEvents = "none";
	}
	//ZONE DE CHAPITRE PRESENTE
	chapcontainer.innerHTML = "";
	if (VISIBLECHAPZONE) {
		chapcontainer.style.display = "block";

	} else {
		chapcontainer.style.display = "none";
	}
	//CHAPITRES VISIBLES
	if (VISIBLECHAP) {
		chapcontainer.innerHTML += '<li class="list-group-item border-0 bg-transparent my-1">Chapitres</li>';
		if (VISIBLEDATECHAP) {
			for (const chapter of myConfig.pages[currentPageNumber].chapters) { //berk
				chapcontainer.innerHTML += '<li class="list-group-item bg-transparent my-1 p-0">' +
					'<button class="btn btn-block btn-outline-primary btn-chapter p-0" type="button" onclick="gotoTime(this.children[1].innerHTML)">' +
					chapter.name + ' : ' + chapter.date + '<div class="background">&#8203</div>' +
					'<div style="display : none;">' + chapter.date + '</div>' +
					'</button>' +
					'</li>';
			}
		} else {
			for (const chapter of myConfig.pages[currentPageNumber].chapters) { //berk
				chapcontainer.innerHTML += '<li class="list-group-item bg-transparent my-1 p-0">' +
					'<button class="btn btn-block btn-outline-primary btn-chapter p-0" type="button" onclick="gotoTime(this.children[1].innerHTML)">' +
					chapter.name + '<div class="background">&#8203</div>' +
					'<div style="display : none;">' + chapter.date + '</div>' +
					'</button>' +
					'</li>';
			}
		}
	}
	//CHAPITRES CLIQUABLE
	if (!CLICKABLECHAP) {
		for (const btn of document.getElementsByClassName("btn-chapter")) {
			btn.disabled = "true";
			btn.className = "btn btn-block text-primary btn-outline-secondary btn-chapter"
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
	showByClass("load-video");
}

function playVideo(withLog) {
	if (withLog) {
		myCsvLogs.addLine("PLAY");
	}
	myPlayer.play();
}

function pauseVideo(withLog) {
	if (withLog) {
		myCsvLogs.addLine("PAUSE");
	}
	myPlayer.pause();
}

function gotoTime(time) {
	myPlayer.currentTime(toSeconds(time));
	myCsvLogs.addLine("CHAP_USED");
}

function videoEnded() {
	myCsvLogs.addLine("VIDEO_END");
}

var chapFrom = 0;
var chapTo = 0;

function checkChap() { //check quel est le chapitre courant durant la lecture d'une video
	previousTime = myPlayer.currentTime();
	if (myConfig.pages[currentPageNumber].type === "video") { // on n'execute les verifs que pdt une page video
		var tmp = 0;
		for (const chapterDate of currentChapters.keys()) { //on parcourt la liste des chaps
			if (myPlayer.currentTime() >= chapterDate) {
				tmp = currentChapters.get(chapterDate) + 1; //on prend le numéro du chapitre courant
			}
		}
		if (tmp != currentChapterNumber) { //si on arrive a un nouveau chap
			chapFrom = currentChapterNumber;
			chapTo = tmp;
			if (!myPlayer.seeking()) { //supprime le seektime
				currentChapterNumber = tmp; //mise jour de la var chapitre courrant
				myCsvLogs.addLine("CHAP_ATT");
				console.log("CHAP_ATT : " + chapFrom + "-->" + chapTo);
			}

		}
	}

}

function chapTimerUpdate() { //permet de mettre a jour la barre de progression du chapitre en cours
	if (myConfig.pages[currentPageNumber].options[4]) { //si les timer de chapitres sont visibles
		var i = 1;
		for (const chap of document.getElementsByClassName("background")) {
			if (i === currentChapterNumber) {
				//On calcule le pourcentage de progression
				var chapCurrentTime = myPlayer.currentTime() - toSeconds(myConfig.pages[currentPageNumber].chapters[currentChapterNumber - 1].date);
				var chapDuration = 1;
				if (currentChapterNumber == myConfig.pages[currentPageNumber].chapters.length) { //si c'est le dernier chap
					chapDuration = myPlayer.duration() - toSeconds(myConfig.pages[currentPageNumber].chapters[currentChapterNumber - 1].date);
				} else {
					chapDuration = toSeconds(myConfig.pages[currentPageNumber].chapters[currentChapterNumber].date) - toSeconds(myConfig.pages[currentPageNumber].chapters[currentChapterNumber - 1].date);
				}
				//on applique ce pourcentage via le CSS
				chap.style.width = (100 * chapCurrentTime / chapDuration) + '%';

			} else {
				//chapitre non en cours -> vide
				chap.style.width = "0%";
			}
			i++;
		}
	} else {
		var i = 1;
		for (const btnchap of document.getElementsByClassName("btn-chapter")) {
			if (i === currentChapterNumber) {
				btnchap.classList.add("border-danger");
			} else {
				//chapitre non en cours -> 
				btnchap.classList.remove("border-danger");
			}
			i++;
		}
	}
}

function nextChap() {
	if (currentChapterNumber === myConfig.pages[currentPageNumber].chapters.length) {

	} else {
		myPlayer.currentTime(toSeconds(myConfig.pages[currentPageNumber].chapters[currentChapterNumber].date));
		myCsvLogs.addLine("NEXT_CHAP");
	}
}

function prevChap() {
	if (currentChapterNumber === 0) {
		myPlayer.currentTime(0);
	} else if (currentChapterNumber === 1) {
		myPlayer.currentTime(0);
	} else {
		myPlayer.currentTime(toSeconds(myConfig.pages[currentPageNumber].chapters[currentChapterNumber - 2].date));
	}
	myCsvLogs.addLine("PREV_CHAP");
}
/* ╚═══════FIN═══════╝ PLAYER VIDEO  ==================================================*/

/* ╔══════DEBUT══════╗ TEXT  ==========================================================*/
function loadText() { //page de type texte
	hideByClass("load");
	showByClass("load-text");

	quill.setContents(myConfig.pages[currentPageNumber].text)
}
/* ╚═══════FIN═══════╝ TEXT  ==========================================================*/

/* ╔══════DEBUT══════╗ PDF  ===========================================================*/
function loadPdf() { //page de type pdf
	hideByClass("load");
	resetPdf();
	pdfchapcontainer.innerHTML = "";
	var currentPage = myConfig.pages[currentPageNumber];
	var currentFile = importedFiles.get(currentPage.pdf);
	initPDFViewer(URL.createObjectURL(currentFile));

	const VISIBLECHAPZONE = currentPage.options[0];
	const VISIBLECHAP = currentPage.options[1];
	const CLICKABLECHAP = currentPage.options[2];

	if (VISIBLECHAPZONE) {
		pdfchapcontainer.style.display = "block";
	} else {
		pdfchapcontainer.style.display = "none";
	}

	if (VISIBLECHAP) {
		if (CLICKABLECHAP) { //visible et cliquable
			for (const chapter of currentPage.chapters) {
				pdfchapcontainer.innerHTML += '<li class="list-group-item bg-transparent my-1 p-0">' +
					'<button class="btn btn-block btn-outline-primary btn-chapter btn-chap-pdf p-0" type="button" onclick="gotoSlide(this.children[0].innerHTML)">' +
					chapter.name + ' : ' + chapter.date +
					'<div style="display : none;">' + chapter.date + '</div>' +
					'</button>' +
					'</li>';;
			}
		} else { //Visible seulement
			for (const chapter of currentPage.chapters) {
				pdfchapcontainer.innerHTML += '<li class="list-group-item bg-transparent my-1 p-0">' +
					'<button class="btn btn-block text-primary btn-outline-secondary btn-chapter btn-chap-pdf p-0 disabled" type="button">' +
					chapter.name + ' : ' + chapter.date + '<div class="background">&#8203</div>' +
					'</button>' +
					'</li>';;
			}
		}
	}


	showByClass("load-pdf");
}
/* ╚═══════FIN═══════╝ PDF  ===========================================================*/
/* ╔══════DEBUT══════╗ PDF JS =========================================================*/
//code umprunté au tuto https://pspdfkit.com/blog/2019/implement-pdf-viewer-pdf-js/
let currentPageIndex = 0;
let pageMode = 1;
let cursorIndex = Math.floor(currentPageIndex / pageMode);
let pdfInstance = null;
let totalPagesCount = 0;
var pdfName;
var fromSlide = 0;
var chapChecker = [];

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
		} else { //on charge une page du slide
			fromSlide = currentPageIndex+1;
			myCsvLogs.addLine("PREV_SLIDE");
			render();
		}
	}
	if (action === "next") {
		if (currentPageIndex === totalPagesCount - 1) {
			return;
		}
		currentPageIndex += pageMode;
		if (currentPageIndex > totalPagesCount - 1) {
			currentPageIndex = totalPagesCount - 1;
		} else { //on charge une page du slide
			fromSlide = currentPageIndex-1;
			myCsvLogs.addLine("NEXT_SLIDE");
			render();
		}
	}
}

function initPager() {
	chapChecker = [];
	for(const chap of myConfig.pages[currentPageNumber].chapters){
		chapChecker.push(chap.date);
	}
	chapChecker.push(Number.MAX_SAFE_INTEGER);

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

	slidecounter.innerHTML = currentPageIndex + 1 + "/" + totalPagesCount
	var i = 0;
	for(const chap of myConfig.pages[currentPageNumber].chapters){
		var btn = document.getElementsByClassName("btn-chap-pdf")[i];

		if(chap.date == (currentPageIndex+1)){
			myCsvLogs.addLine("CHAP_SLIDE_ATT")
		}

		if(currentPageIndex+1>=chapChecker[i] && currentPageIndex+1<chapChecker[i+1]){
			btn.classList.add("border-danger");
		}else{
			btn.classList.remove("border-danger");
		}
		i++;
	}
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
}

function gotoSlide(n) {
	if (currentPageIndex != (n - 1)) {
		fromSlide = currentPageIndex;
		currentPageIndex = n - 1;
		myCsvLogs.addLine("GOTO_SLIDE");
		render();
	}

}
/* ╚═══════FIN═══════╝ PDF JS =========================================================*/
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

//Variables pour le controle du temps ecoulé en fonction de l'état du player
var tPlay = 0; //pour calculer le temps passé en lecture
var tPlayCSV = 0;
var tChapCSV = 0;
var tfChapSlide = 0;
var tPause = 0; //pour calculer le temps passé en pause
var tChap = 0; //pour calculer le temps passé sur un chap
class CsvLogs extends Csv { //TODO: melange csvlog et json tres complexe dans la methode addline : THE MONSTROUS PART
	constructor() {
		super();
		this.lines.push("Timer;Current page;Current chap;Reached page;Reched chap;Action;Time from test begining;Time from page begining;Video timer;Time from chap begining;Time from PLAY;Curr slide Chap;Reached slide Chap;Time from chap slide begining");
	}

	addLine(action) {
		//var pour l'aout de ligne CSV
		var now = Date.now();
		var d = new Date();

		// timer  cPageNumber  cChapterNumber  reachedPage  reachedChap  action  tfTest  tfPage  videoTimer  tfChap  tfPlay
		var timer = d.toLocaleDateString() + "(" + d.toLocaleDateString("fr-FR", {
			weekday: "short"
		}) + ")-" + d.toLocaleTimeString();
		var cPageNumber = currentPageNumber + 1;
		var cChapterNumber = "";
		var reachedPage = "";
		var reachedChap = "";
		//action
		var tfTest = duration(startTimeOnTest, now);
		var tfPage = duration(startTimeOnPage, now);
		var videoTimer = "";
		var tfChap = "";
		var tfPlay = "";

		// on assigne videotimer si necessaire (aka si sur une page de type video)
		if (currentPageNumber < myConfig.pages.length && myConfig.pages[currentPageNumber].type === "video") {
			cChapterNumber = currentChapterNumber + 1;
			// reachedChap cf CHAP_ATT
			videoTimer = myPlayer.currentTime();
			tfChap = duration(tChapCSV, now);
			if (tfChap > 1500000000) {
				tfChap = "";
			}
			tfPlay = duration(tPlayCSV, now);
			if (tfPlay > 1500000000) {
				tfPlay = "";
			}
		}
		var tfChapS = ""
		if(currentPageNumber < myConfig.pages.length && myConfig.pages[currentPageNumber].type === "pdf"){
			tfChapS = duration(tfChapSlide, now);
			if (tfChapS > 1500000000) {
				tfChapS = ""
			}else{
				tfChapS = toNum(tfChapS);
			}
		}

		/*console.log(action +
		    "\n    ├ page : " + currentPageNumber +
		    "\n    └ chapter : " + currentChapterNumber);*/
		switch (action) {
			// ═══════════════════════════════════════════════════════════════════════════════════════════════════════ START_PAGE ══════╗ */
			case "START_PAGE":
				tfChapSlide = 0;
				myJSONGeneral.nth[currentPageNumber]++;
				myJSONGeneral.visites.push(new InfosVisite(tfTest));

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + "" + ";" + "" + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + "0" + ";" + "" + ";" + "" + ";" + "" + ";" + "" + ";" + "" + ";" + "");
				break;
				// ═══════════════════════════════════════════════════════════════════════════════════════════════════ START_PAGE ══════╝ */
				// ═════════════════════════════════════════════════════════════════════════════════════════════════════ CHAP_ATT ══════╗ */
			case "CHAP_ATT":
				tChapCSV = now;
				reachedChap = chapTo;
				if (chapFrom > 0) {
					if (tPlay != 0) {
						myJSONGeneral.diapos[currentPageNumber].infosChaps[chapFrom - 1].dureePlay += duration(tPlay, now);
						myJSONGeneral.diapos[currentPageNumber].dureePlay += duration(tPlay, now);
						tPlay = now;
					}
					if (tPause != 0) {
						myJSONGeneral.diapos[currentPageNumber].infosChaps[chapFrom - 1].dureePause += duration(tPause, now);
						myJSONGeneral.diapos[currentPageNumber].dureePause += duration(tPause, now);
						tPause = now;
					}
					if (tChap != 0) {
						myJSONGeneral.diapos[currentPageNumber].infosChaps[chapFrom - 1].duree += duration(tChap, now);
						tChap = now;
					}
				}
				if (!myPlayer.paused()) {
					tPlay = now;
				} else {
					tPause = now;
				}
				tChap = now;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + "" + ";" +
					reachedChap + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(videoTimer) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + "");
				break;
				// ═════════════════════════════════════════════════════════════════════════════════════════════════════ CHAP_ATT ══════╝ */
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ CHAP_USED ══════╗ */
			case "CHAP_USED":
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].nbChapList++;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + "" + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(previousTime) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + "");
				break;
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ CHAP_USED ══════╝ */
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ PREV_CHAP ══════╗ */
			case "PREV_CHAP":
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].nbChapPrec++;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + "" + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(previousTime) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + "");
				break;
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ PREV_CHAP ══════╝ */
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ NEXT_CHAP ══════╗ */
			case "NEXT_CHAP":
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].nbChapSuiv++;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + "" + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(previousTime) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + "");
				break;
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ NEXT_CHAP ══════╝ */
				// ══════════════════════════════════════════════════════════════════════════════════════════════════ VIDEO_START ══════╗ */
			case "VIDEO_START":

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + "" + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(videoTimer) + ";" + "" + ";" + "" + ";" + "" + ";" + "" + ";" + "");
				break;
				// ══════════════════════════════════════════════════════════════════════════════════════════════════ VIDEO_START ══════╝ */
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ VIDEO_END ══════╗ */
			case "VIDEO_END":
				tPlay = 0;
				tPause = 0;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + "" + ";" + "" + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(videoTimer) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + "");
				break;
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ VIDEO_END ══════╝ */
				// ═════════════════════════════════════════════════════════════════════════════════════════════════════════ PLAY ══════╗ */
			case "PLAY":
				tPlayCSV = now;
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].nbPlay++;
				if (currentChapterNumber > 0) {
					if (tPause != 0) {
						myJSONGeneral.diapos[currentPageNumber].infosChaps[currentChapterNumber - 1].dureePause += duration(tPause, now);
						myJSONGeneral.diapos[currentPageNumber].dureePause += duration(tPause, now);
					}
					myJSONGeneral.diapos[currentPageNumber].infosChaps[currentChapterNumber - 1].nbPlay++;
					tPlay = now;
				}
				tPause = 0;
				myJSONGeneral.diapos[currentPageNumber].nbPlay++;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + "" + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(videoTimer) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + "");
				break;
				// ═════════════════════════════════════════════════════════════════════════════════════════════════════════ PLAY ══════╝ */
				// ════════════════════════════════════════════════════════════════════════════════════════════════════════ PAUSE ══════╗ */
			case "PAUSE":
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].nbPause++;
				console.log(action + " page : " + currentPageNumber + " chap : " + currentChapterNumber)
				if (currentChapterNumber > 0) {
					if (tPlay != 0) {
						myJSONGeneral.diapos[currentPageNumber].infosChaps[currentChapterNumber - 1].dureePlay += duration(tPlay, now);
						myJSONGeneral.diapos[currentPageNumber].dureePlay += duration(tPlay, now);
					}
					myJSONGeneral.diapos[currentPageNumber].infosChaps[currentChapterNumber - 1].nbPause++;
					tPause = now;
				}
				tPlay = 0;
				myJSONGeneral.diapos[currentPageNumber].nbPause++;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + "" + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(videoTimer) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + "");
				break;
				// ═════════════════════════════════════════════════════════════════════════════════════════════════════════ PLAY ══════╝ */
				// ══════════════════════════════════════════════════════════════════════════════════════════════════ NAVBAR_USED ══════╗ */
			case "NAVBAR_USED":
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].nbNavBar++;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + "" + ";" + "" + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(previousTime) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + "");
				break;
				// ══════════════════════════════════════════════════════════════════════════════════════════════════ NAVBAR_USED ══════╝ */
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ NEXT_PAGE ══════╗ */
			case "NEXT_PAGE":
				update_durees();

				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].fin = tfTest;
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].duree = myJSONGeneral.visites[myJSONGeneral.visites.length - 1].fin - myJSONGeneral.visites[myJSONGeneral.visites.length - 1].debut;

				//on ajoute une ligne au csv de log
				var nexPageNumber = (cPageNumber + 1);
				if (nexPageNumber > myConfig.pages.length) { //on n'affice pas si c'est la fin de la config
					nexPageNumber = ""
				}
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + nexPageNumber + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(videoTimer) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + tfChapS);
				break;
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ NEXT_PAGE ══════╝ */
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ PREV_PAGE ══════╗ */
			case "PREV_PAGE":
				update_durees();

				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].fin = tfTest;
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].duree = myJSONGeneral.visites[myJSONGeneral.visites.length - 1].fin - myJSONGeneral.visites[myJSONGeneral.visites.length - 1].debut;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + (cPageNumber - 1) + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(videoTimer) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" + tfChapS);
				break;
				// ════════════════════════════════════════════════════════════════════════════════════════════════════ PREV_PAGE ══════╝ */
				// ═════════════════════════════════════════════════════════════════════════════════════════════════════ SOMMAIRE ══════╗ */
			case "SOMMAIRE":
				update_durees();

				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].fin = tfTest;
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].duree = myJSONGeneral.visites[myJSONGeneral.visites.length - 1].fin - myJSONGeneral.visites[myJSONGeneral.visites.length - 1].debut;
				myJSONGeneral.sommaire.totalClics++;
				myJSONGeneral.sommaire.clicsOn[myReachedPage]++;
				reachedPage = myReachedPage + 1;

				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + cChapterNumber + ";" + reachedPage + ";" +
					"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + toNum(videoTimer) + ";" + toNum(tfChap) + ";" + toNum(tfPlay) + ";" + "" + ";" + "" + ";" +  tfChapS);
				break;
				// ═════════════════════════════════════════════════════════════════════════════════════════════════════ SOMMAIRE ══════╝ */
				// ══════════════════════════════════════════════════════════════════════════════════════════════════════════ END ══════╗ */
			case "END":
				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + "" + ";" + "" + ";" + "" + ";" + "" + ";" + action + ";" + toNum(tfTest) + ";" + "" + ";" + "" + ";" + "" + ";" + "" + ";" + "" + ";" + "" + ";" + "");
				break;
				// ══════════════════════════════════════════════════════════════════════════════════════════════════════════ END ══════╝ */





				// ═══════════════════════════════════════════════════════════════════════════════════════════════════ NEXT_SLIDE ══════╗ */
			case "NEXT_SLIDE":
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].nbPdfSuiv++;				
				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + "" + ";" + "" + ";" +
				"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + "" + ";" + "" + ";" + "" + ";" + (currentPageIndex) + ";" + "" + ";" + tfChapS);
				break;
				// ═══════════════════════════════════════════════════════════════════════════════════════════════════ NEXT_SLIDE ══════╝ */
				// ═══════════════════════════════════════════════════════════════════════════════════════════════════ PREV_SLIDE ══════╗ */
			case "PREV_SLIDE":
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].nbPdfPrec++;
				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + "" + ";" + "" + ";" +
				"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + "" + ";" + "" + ";" + "" + ";" + (currentPageIndex+2) + ";" + "" + ";" + tfChapS);
				break;
				// ═══════════════════════════════════════════════════════════════════════════════════════════════════ PREV_SLIDE ══════╝ */
				// ═══════════════════════════════════════════════════════════════════════════════════════════════════ GOTO_SLIDE ══════╗ */
			case "GOTO_SLIDE":
				myJSONGeneral.visites[myJSONGeneral.visites.length - 1].nbPdfChap++;
				//on ajoute une ligne au csv de log 
				this.lines.push(timer + ";" + cPageNumber + ";" + "" + ";" + "" + ";" +
				"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + "" + ";" + "" + ";" + "" + ";" + (fromSlide+1) + ";" + "" + ";" + tfChapS);
				break;
				// ═══════════════════════════════════════════════════════════════════════════════════════════════════ GOTO_SLIDE ══════╝ */
				// ═══════════════════════════════════════════════════════════════════════════════════════════════════ GOTO_SLIDE ══════╗ */
			case "CHAP_SLIDE_ATT":
				//on ajoute une ligne au csv de log
				this.lines.push(timer + ";" + cPageNumber + ";" + "" + ";" + "" + ";" +
				"" + ";" + action + ";" + toNum(tfTest) + ";" + toNum(tfPage) + ";" + "" + ";" + "" + ";" + "" + ";" + (fromSlide+1) + ";" + (currentPageIndex+1) + ";" + tfChapS);
				tfChapSlide = now;
				break;
				// ═══════════════════════════════════════════════════════════════════════════════════════════════════ GOTO_SLIDE ══════╝ */












				// ══════════════════════════════════════════════════════════════════════════════════════════════════════ default ══════╗ */
			default:
				console.error("Unknown Action : " + action);
				break;
				// ══════════════════════════════════════════════════════════════════════════════════════════════════════ default ══════╝ */
		}

		function update_durees() {
			if (currentChapterNumber > 0) {
				if (tPlay != 0) {
					myJSONGeneral.diapos[currentPageNumber].infosChaps[currentChapterNumber - 1].dureePlay += duration(tPlay, now);
					myJSONGeneral.diapos[currentPageNumber].dureePlay += duration(tPlay, now);
					tPlay = now;
				}
				if (tPause != 0) {
					myJSONGeneral.diapos[currentPageNumber].infosChaps[currentChapterNumber - 1].dureePause += duration(tPause, now);
					myJSONGeneral.diapos[currentPageNumber].dureePause += duration(tPause, now);
					tPause = now;
				}
				if (tChap != 0) {
					myJSONGeneral.diapos[currentPageNumber].infosChaps[currentChapterNumber - 1].duree += duration(tChap, now);
					tChap = now;
				}
			}
			myJSONGeneral.diapos[currentPageNumber].duree += tfPage;
		}
	}
}
//classes qui seront transformé en CSV par la suite
class InfosGeneralJSON {
	constructor() {
		this.config = myConfig.name; //OK:
		this.participant = "nom_du_participant" + testID; //OK:
		this.diapos = []; //ISSUE: cf InfosDiapos
		this.sommaire = new InfosSommaire; //OK:
		this.visites = []; //OK:
		this.nth = []; //OK:
	}

	toCSV() {
		var res = "";
		//infos générales
		var titles = ""; //ligne 1 du csv
		var values = ""; //ligne 2 du csv
		//infos visite sur chaque page
		var titlesV = ""; //ligne 1 du deuxieme tableau
		var valuesV = ""; //ligne 2 du deuxieme tableau

		titles += "Participant;Config"
		values += this.participant + ";" + this.config;

		var iDiapo = 1; //numero de diapo
		for (const diapo of this.diapos) { //chaque diapo
			var d = "D" + iDiapo + "-"; //D1-duree D1-dureePlay etc.
			titles += ";" + d + "duree" + ";" + d + "dureePlay" + ";" + d + "dureePause" + ";" + d + "nbPlay" + ";" + d + "nbPause";
			values += ";" + toNum(diapo.duree) + ";" + toNum(diapo.dureePlay) + ";" + toNum(diapo.dureePause) + ";" + diapo.nbPlay + ";" + diapo.nbPause;

			var iChap = 1; //numero de chap
			for (const chap of diapo.infosChaps) { //chaque chap de chaque diapo
				d = "D" + iDiapo + "-C" + iChap + "-"; //D1-C1-duree D1-C1-dureePlay (...) D1-C2-duree D1-C2-dureePlay etc.
				titles += ";" + d + "duree" + ";" + d + "dureePlay" + ";" + d + "dureePause" + ";" + d + "nbPlay" + ";" + d + "nbPause";
				values += ";" + toNum(chap.duree) + ";" + toNum(chap.dureePlay) + ";" + toNum(chap.dureePause) + ";" + chap.nbPlay + ";" + chap.nbPause;
				iChap++;
			}
			iDiapo++;
		}
		titles += ";Clics sommaire";
		values += ";" + this.sommaire.totalClics;
		var iSom = 1; //numero de sommaire
		for (const clic of this.sommaire.clicsOn) {
			titles += ";Sommaire " + iSom;
			values += ";" + clic;
			iSom++;
		}
		//console.log((titles.match(/;/g) || []).length + 1); //logs 3 

		titlesV += "\n\nDiapo; Nieme visite; Debut; Fin; Duree; Nb vid play; Nb vid pause; Nb vid chap suiv; Nb vid chap prec; Nb vid chap list; Nb vid navbar;Nb pdf prec; Nb pdf suiv; Nb pdf chap list\n";
		for (const visite of this.visites) {
			valuesV += (1 + visite.diapoNum) + ";" +
				visite.nth + ";" +
				toNum(visite.debut) + ";" +
				toNum(visite.fin) + ";" +
				toNum(visite.duree) + ";" +
				visite.nbPlay + ";" +
				visite.nbPause + ";" +
				visite.nbChapSuiv + ";" +
				visite.nbChapPrec + ";" +
				visite.nbChapList + ";" +
				visite.nbNavBar + ";" +
				visite.nbPdfPrec + ";" +
				visite.nbPdfSuiv + ";" +
				visite.nbPdfChap + "\n";
		}
		res += titles + "\n" + values + titlesV + valuesV;
		return "data:text/csv;charset=utf-8," + res;
	}
}
class InfosSommaire {
	constructor() {
		this.totalClics = 0; //OK:
		this.clicsOn = []; //OK: nb de clic sur le n eme sommaire
	}
}
class InfosDiapo {
	constructor() {
		this.duree = 0; //ISSUE: ne prend pas en compte le chap 0
		this.dureePlay = 0; //ISSUE: ne prend pas en compte le chap 0
		this.dureePause = 0; //ISSUE: ne prend pas en compte le chap 0
		this.nbPlay = 0; //OK:
		this.nbPause = 0; //OK:
		this.infosChaps = []; //OK:tab de InfosChap
	}
}
class InfosChap {
	constructor() {
		this.duree = 0; //OK:
		this.dureePlay = 0; //OK:
		this.dureePause = 0; //OK: 
		this.nbPlay = 0; //OK:
		this.nbPause = 0; //OK:
	}
}

class InfosVisite {
	constructor(debut) {
		this.diapoNum = currentPageNumber; //OK:
		this.nth = myJSONGeneral.nth[currentPageNumber]; //OK:
		this.debut = debut; //OK:
		this.fin = 0; //OK:
		this.duree = 0; //OK:

		this.nbPlay = 0; //OK:
		this.nbPause = 0; //OK:
		this.nbChapSuiv = 0; //OK:
		this.nbChapPrec = 0; //OK:
		this.nbChapList = 0; //OK:
		this.nbNavBar = 0; //OK:

		this.nbPdfPrec = 0; //OK:
		this.nbPdfSuiv = 0; //OK:
		this.nbPdfChap = 0; //OK:

	}
}

/* ╚═══════FIN═══════╝ CSV ============================================================*/

/* ╔══════DEBUT══════╗ TOOLS ==========================================================*/
function reloadPage() {
	window.onbeforeunload = function () {

	};
	document.location.reload(true);
}

function hideByClass(className) {
	for (eltsToHide of document.getElementsByClassName(className)) {
		eltsToHide.style.display = 'none';
	}
}

function showByClass(className) {
	for (eltsToHide of document.getElementsByClassName(className)) {
		eltsToHide.style.display = 'block';
	}
}

function generateUniqueID() {
	var d = new Date();
	var timer = d.toLocaleDateString().replace(/[/]/g, "") +"_"+ d.toLocaleTimeString().replace(/[:]/g, "");

	id = myConfig.name + "_" + timer + document.getElementsByClassName("infos-perso")[0].value; 
	return id;
}

function bAlert(message) {
	return '<div class="alert alert-warning alert-dismissible" role="alert">' +
		'<strong>Erreur</strong> ' + message +
		'<button type="button" class="close" data-dismiss="alert" aria-label="Close">' +
		'<span aria-hidden="true">&times;' +
		'</span></button></div>';

}

function missingAlert(message) {
	return '<div class="alert alert-info alert-dismissible" role="alert">' +
		'<strong>Fichier requis</strong> ' + message +
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

function toNum(n) {
	if (n != "") {
		return n.toFixed(2).replace(".", ",");
	}
	return n;
};
/* ╚═══════FIN═══════╝ TOOLS ==========================================================*/