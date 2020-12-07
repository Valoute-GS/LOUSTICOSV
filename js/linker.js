const DOMAIN = 'https://www.loustic.net/BTT/' + 'index.html';
console.log(window.location);
const DBX_TOKEN = '1zR2wsLvoWYAAAAAAAAAAU4A4cnN-u5xGrQrXagFL9iUWQa42RNViPnO_g65BzKg'

//detection pour generer l'effet de fondu
$(document).on('DOMSubtreeModified', function () {
	$(function () {
		$('.fadein').removeClass('fadein');
	})
});

//Dropbox access
const dbx = new Dropbox.Dropbox({
	accessToken: DBX_TOKEN
})

var params = {
	"config": "",
	"files": []
}

var paramsUrl;

dbx.filesListFolder({
		path: '/shared_folder'
	})
	.then(function (response) {
		console.log('response', response)
		displayFiles(response.result.entries);
	})
	.catch(function (error) {
		console.error(error);
	});

function displayFiles(files) {
	var filesList = document.getElementById('files');
	var li;
	for (var i = 0; i < files.length; i++) {
		li = document.createElement('li');
		li.classList.add(['list-group-item']);
		li.classList.add(['btn']);
		li.classList.add(['btn-outline-primary']);
		li.appendChild(document.createTextNode(files[i].name));
		$(li).click(function () {
			console.log(this.innerHTML);
			paramsUrl = '?param=' + new URLSearchParams(JSON.stringify(this.innerHTML));
			inputLink.value = DOMAIN +paramsUrl.slice(0, -1)
		})
		filesList.appendChild(li);
	}
}

function copyLink() {
	/* Get the text field */
	var copyText = document.getElementById("inputLink");

	/* Select the text field */
	copyText.select();
	copyText.setSelectionRange(0, 99999); /*For mobile devices*/

	/* Copy the text inside the text field */
	document.execCommand("copy");
}
