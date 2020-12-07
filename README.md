# (Refonte de la doc en cours, les liens peuvent etres mauvais et la documentation incomplète pour le moment)

# LOUSTIC BTT - Behavior Tracking Tool
LOUSTIC OS est un outil de suivi basé sur les technologies HTML5/CSS3/Javascript8.
L'objectif est de pouvoir créer une suite de médias qu'un participant pourra ensuite visionner, tout en récupérant son activité sur la page. 
L'application se découpe en trois grandes parties :

 - Une interface de **configuration** : onglet **Configurateur**
 - Un générateur de **lien** pour réaliser un test en ligne : onglet **Partager un test**
 - Une interface de **test** locale : onglet **Lancer un test (Local)**

De plus une application en ligne est déployée afin de pouvoir réaliser des tests en ligne. Cette interface est accessible depuis un lien spécifique généré par l'outil de configuration présent. Les résultats de ces tests en ligne seront automatiquement envoyés dans une Dropbox. 

### Sommaire :

 - Installation
 - Créer / Modifier une configuration
 - Lancer un test
 - Données de sortie

 *(Ceci étant un projet en cours de développement, toutes ces informations sont succeptibles d'être mises à jour à chaque update.)*

Un tutoriel détaillé et imagé est disponible via [ce lien](https://docs.google.com/presentation/d/1lUJykDOnX4R6eeXbdpBOb0G16N9s28p8Di44IV6U5E0/edit?usp=sharing)
# Installation
**Sous Windows :**

 1. Sur [cette page](https://github.com/Valoute-GS/LOUSTICOSV/tree/master) si ce n'est pas déja le cas 
**⤓ Code** ➔ **Download ZIP**
 2. Extraire l'archive dans le répertoire désiré.
 3. Entrer dans le dossier
 4. Exécuter le ficher `index.html` dans votre navigateur dépféré


 Navigateurs testées : Chrome/Mozilla/Opéra

# Créer / modifier une configuration
Cette fonction est accessible depuis l'accueil ou depuis l'onglet **Configurateur** dans la barre de navigation.
Elle est destinée à être utilisée par le chercheur qui veut créer une nouvelle configuration de zéro ou bien modifier une configuration existante.

Une **Configuration** est composée de :

 - Un **Titre** nécessaire
 - Des **Options** activables
 - Une liste non nulle de **Pages** configurables

Chaque **Page** est définie par :

 - Un **Titre** (facultatif)
 - Un **Format** : vidéo/texte (d'autres formats sont prévus et en cours de développement)

La page peut être configurée en appuyant sur le bouton **Configurer**, cette action menant sur une page spécifique en fonction du format sélectionné au préalable.
Une page, une fois finie et valide, peut être sauvegardée via le bouton **Sauvegarder**. Il est aussi possible d'abandonner les modifications avec le bouton **Annuler**.

La configuration, une fois finie et valide, peut être : 
 - Téléchargée en local via le bouton **Local**, cela déclenche le téléchargement d'un fichier de configuration au format `.json`
 - Envoyée dans une Dropbox via le bouton **Dropbox**, cela déclenche l'envoi des fichiers, si une configuration similaire existe déjà vous pouvez la renomer, ou bien il vous sera proposé de l'écraser.

### Format Vidéo
Une page de type **Vidéo** est composée de :

 - Un **fichier vidéo** : nécessaire au format .mp4 (conseillé), .webm, .mov (suivant les navigateurs certains formats ne son pas pris en charge), **fichier local** à importer dans le champs prévu
 - Des **Options** activables : changeant la mise en forme et les interactions possibles lors du test
 - Une liste de **Chapitres** (facultatifs) :  composé d'un **Titre** et d'un **Timestamp** nécessaires.

### Format Editeur de texte/médias
Une page de type **Editeur de texte/médias** est composée de :
 - Une **zone de texte** simple mais riche. Il est ainsi possible d'insérer des images, des vidéos du web (nécessite une connexion internet),etc. en plus des fonction d'éditions classiques.
 - Des **Options** activables : changeant les interactions de l'utilisateur possible avec l'éditeur de text.

### Format PDF
Une page de type **PDF** est composé de :
 - Un **fichier PDF** : nécessaire au format .PDF, .webm, .mov (suivant les navigateurs certains formats ne son pas pris en charge), **fichier local** à importer dans le champ en bas de page
 - Des **Options** activables : changeant la mise en forme et les interactions possibles lors du test
 - Une liste de **Chapitres** (facultatifs) :  composé d'un **Titre** et d'un **numéro de pages** nécessaires.

### Modifier une configuration
Il est possible de charger une configuration, présente sur l'ordinateur, au format .json depuis le champs **Charger un fichier de configuration** puis ses **fichiers associés**. Une fois tous les fichiers importés, cliquer sur **Charger**. Ensuite cela se déroule comme pour une nouvelle configuration.

Infos : afin de garder les modification il est nécessaire de télécharger de nouveau la configuration, le fichier de configuration téléchargé n'écrasera pas la configuration source même si elle a le même nom.
De plus une configuration dsponnible sur le Dropbox ne peut pour le moment pas directement être modifiée. Il faut la télécharger sur votre ordinateur avec ses fichiers liés pour la modifier dans l'outil, vous pourrez tout de même la réenvoyer vers la Dropbox pour la remplacer.

# Partager un test

Cette interface permet de générer des liens de partage permettant de réaliser un test en ligne. Il peut donc être diffusé, les résultats seront concentrés dans la Dropbox.
La liste de toutes les configurations existantes s'affiche, en cliquant sur l'une d'entre elle un lien cera généré dans le champ supérieur. Vous pourrez ensuite copier ce lien pour le partager ou accéder à un test en ligne.

# Lancer un test
Cette fonction est accessible depuis l'accueil ou depuis l'onglet **Lancer un test** dans la barre de navigation. Elle permet de charger puis d'exécuter une configuration précédemment créée et sauvegardée localement. Il est nécessaire d'importer la **configuration** au format .json puis ses **fichiers associés**.

### Début du test
L'utilisateur entre les infos personnelles requises et démarre le test.

### Fin du test
A la fin du test les fichiers de suivi d'activité sont téléchargés automatiquement au format .csv, ils sont alors disponnibles dans le dossier de téléchargement par défaut. Aucun fichier déjà existant ne pourra être écrasé.

Il est ensuite possible de relancer une session avec un nouvel utilisateur sans avoir à recharger les données en cliquant sur le bouton **Relancer**.

### Exemple
Une configuration et ses fichiers sont disponibles dans le dossier [examples](https://github.com/Valoute-GS/LOUSTICOSV/tree/master/examples). **lien a mettre a jour**

# Données de sortie
A la fin de chaque test sont téléchargés/envoyés vers la dropbox deux fichiers CSV ainsi que d'éventuel fichiers HTML. Deux exemples de fichiers CSV sont disponnibles dans le dossier [examples](https://github.com/Valoute-GS/LOUSTICOSV/tree/v2/output_examples) **lien a mettre a jour**.

### Fichier de log
Fichier contenant l'**intégralité de l'activité** du test.

### Fichier de synthèse
Fichier contenant une **synthèse** du fichier log, avec des infos complémentaires/calculées comme les temps cumulés, des compteurs d'action etc.

### Fichiers HTML
Fichier contenant **une version simplifiée des textes** modifiés/créés par l'utilisateur (surlignage, saisie libre). Il est possible de les visualiser en les ouvrant dans votre navigateur préféré. 