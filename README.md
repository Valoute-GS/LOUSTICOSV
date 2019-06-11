# LOUSTIC OS - Outil de Suivi

LOUSTIC OS est un outil de suivi basé sur les technologies HTML5/CSS3/Javascript8.
L'objectif est de pouvoir créer une suite de médias qu'un candidat pourra ensuite visionner, tout en récupérant son activité sur la page. 
L'application se découpe en deux grandes parties :

 - Une interface de **création** : onglet **Créer**
 - Une interface de **test** : onglet **Charger**

# Installation
Sous Windows :
L'installation est très simple, il suffit de :

 1. Télécharger le dossier compressé sur la [Dropbox du LOUSTIC](%5BHandlebars%20templates%5D%28http://handlebarsjs.com/%29).
 2. L'extraire dans le répertoire désiré.
 3. Entrer dans le dossier `./LOUSTIC_OS`
 4. Exécuter le ficher `index.html` dans votre navigateur préféré

~~Sous Android :~~
*Version en développement*

# Créer une configuration
Cette fonction est accessible depuis l'accueil ou bien depuis l'onglet **Créer** dans la barre de navigation.
Elle est destinée à être utilisée par le chercheur qui veut créer une nouvelle configuration de zéro.

Une **Configuration** est composée de :

 - Un **Titre** non nul
 - Une liste d'**Options** activables
 - Une liste non nulle de **Pages** configurables

Chaque **Page** est définie par :

 - Un **Titre** (facultatif)
 - Un **Format** : vidéo/texte (d'autres formats sont prévus et en cours de développement)

La page peut être configuré en appuyant sur le bouton **Configurer**, cette action menant sur une page spécifique en fonction du format sélectionné au préalable.
La configuration, si valide, peut une fois finie être téléchargée via le bouton **Terminer**, cela entraine le téléchargement d'un fichier de configuration au format `.json`.

## Format Vidéo

