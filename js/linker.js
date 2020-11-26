const DOMAIN = "";
const DBX_TOKEN = '1zR2wsLvoWYAAAAAAAAAAU4A4cnN-u5xGrQrXagFL9iUWQa42RNViPnO_g65BzKg'

//Dropbox access
const dbx = new Dropbox.Dropbox({
	accessToken: DBX_TOKEN
})

var params = {
	"config": "",
	"files": []
  }

var paramsUrl;

var button = Dropbox.createChooseButton({
	success: function (files) {
		for (const file of files) {
				const splitURL = file.link.split('/');
				const shortURL = (splitURL[splitURL.length-2] + '/' + splitURL[splitURL.length-1]).replace('?dl=0', '')
				if(shortURL.includes(".json")){
					params.config = shortURL;
				}else{
					params.files.push(shortURL)
				}
			}
		paramsUrl = '?param=' + new URLSearchParams(JSON.stringify(params)); 
		inputLink.value= DOMAIN + paramsUrl.slice(0,-1); //slice pour supprimer le "=" en trop a la fin
	},
	cancel: function () {
	},
	folderselect: false,
	multiselect: true
});

function copyLink() {
	/* Get the text field */
	var copyText = document.getElementById("inputLink");

	/* Select the text field */
	copyText.select();
	copyText.setSelectionRange(0, 99999); /*For mobile devices*/
  
	/* Copy the text inside the text field */
	document.execCommand("copy");
}

document.getElementById("dbxchooser").appendChild(button);