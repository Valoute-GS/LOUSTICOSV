# Documentation Temporaire

Afin de faire fonctionner l'outil en local (sur votre ordinateur) il est pour le moment nécessaire qu'il tourne sur un serveur local. Pas de panique je vais vous expliquer comment faire cela très facilement.

## Récuper l'application
- Accéder à mon [dépot GitHub](https://github.com/Valoute-GS/LOUSTICOSV/tree/v2)
- **Code** > **Download ZIP**
- Dézipper l'archive téléchargée à l'endroit voulu

## Démarrage de l'application
- [Installer Visual Studio Code](https://code.visualstudio.com) sur votre machine
- Démarrer VS Code
- Cliquer sur l'icone **Extensions** (dernière icone du bandeau latéral gauche) ou *Ctrl+Shift+X*
- Dans la barre de recherche taper **Live Server** > Premier résultat (extension de Ritwick Dey) > **install**
- **File** > **Open Folder** > Choisir le dossier de l'application
- Cliquer sur l'icone **Explorer** (première icone du bandeau latéral gauche) ou *Ctrl+Shift+E*
- Dans l'explorer cliquer sur **index.html** (un éditeur de fichier s'ouvre sur la droite)
- **Go Live** (tout en bas à droite de la fenêtre, dans le bandeau inférieur)
- L'application s'ouvre toute seule dans votre navigateur par défaut

Pour arreter le serveur vous pouvez quitter VS Code ou bien cliquer de nouveau sur le bouton Live Server en bas à droite (**⊘ Port:5500** - ou autre chiffre)

# (Refonte de la doc en cours, les liens peuvent etres mauvais et la documentation incomplète pour le moment)

# LOUSTIC OS - Outil de Suivi 
LOUSTIC OS est un outil de suivi basé sur les technologies HTML5/CSS3/Javascript8.
L'objectif est de pouvoir créer une suite de médias qu'un participant pourra ensuite visionner, tout en récupérant son activité sur la page. 
L'application se découpe en deux grandes parties :

 - Une interface de **configuration** : onglet **Configurateur**
 - Une interface de **test** : onglet **Lancer un test**

### Sommaire :

 - Installation
 - Créer / Modifier une configuration
 - Lancer un test
 - Données de sortie

 *(Ceci étant un projet en cours de développement, toutes ces informations sont succeptibles d'être mises à jour à chaque update.)*

Un tutoriel détaillé et imagé est disponible via [ce lien](https://docs.google.com/presentation/d/1lUJykDOnX4R6eeXbdpBOb0G16N9s28p8Di44IV6U5E0/edit?usp=sharing)
# Installation
**Sous Windows :**

 1. Télécharger le dossier compressé sur la [Dropbox du LOUSTIC](https://www.dropbox.com/home/Valentin%20Utiel-%20stage%20outil%20suivi) ou sur [GitHub](https://github.com/Valoute-GS/LOUSTICOSV/tree/master) **Clone or Download -> Download ZIP**
 2. L'extraire dans le répertoire désiré.
 3. Exécuter `Loustic - OS` dans votre navigateur préféré.

*Alternative*

 3. Entrer dans le dossier `./src`
 4. Exécuter le ficher `index.html` 


 Navigateurs testées : Chrome/Mozilla/Opéra

~~**Sous Android :**~~
*abandonnée par manque de temps*

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

La configuration, une fois finie et valide, peut être téléchargée via le bouton **Sauvegarder**, cela entraine le téléchargement d'un fichier de configuration au format `.json`.

### Format Vidéo
Une page de type **Vidéo** est composée de :

 - Un **fichier vidéo** : nécessaire au format .mp4 (conseillé), .webm, .mov (suivant les navigateurs certains formats ne son pas pris en charge), **fichier local** à importer dans le champs prévu
 - Des **Options** activables : changeant la mise en forme et les interactions possibles lors du test
 - Une liste de **Chapitres** (facultatifs) :  composé d'un **Titre** et d'un **Timestamp** nécessaires.

### Format Editeur de texte/médias
Une page de type **Editeur de texte/médias** se configure de façon traditionnelle, c'est un éditeur de texte simple mais riche. Il est ainsi possible d'insérer des images, des vidéos du web (nécessite une connexion internet),etc. en plus des fonction d'éditions classiques.

### Format PDF
Une page de type **PDF** est composé de :
 - - Un **fichier PDF** : nécessaire au format .PDF, .webm, .mov (suivant les navigateurs certains formats ne son pas pris en charge), **fichier local** à importer dans le champ en bas de page
 - Des **Options** activables : changeant la mise en forme et les interactions possibles lors du test
 - Une liste de **Chapitres** (facultatifs) :  composé d'un **Titre** et d'un **numéro de pages** nécessaires.

### Modifier une configuration
Il est possible de charger une configuration existante au format .json depuis le champs **Charger un fichier de configuration** puis ses **fichiers associés**. Une fois tous les fichiers importés, cliquer sur **Charger**. Ensuite cela se déroule comme pour une nouvelle configuration.

Info : le fichier de configuration téléchargé n'écrasera pas la configuration source.

# Lancer un test
Cette fonction est accessible depuis l'accueil ou depuis l'onglet **Lancer un test** dans la barre de navigation. Elle permet de charger puis d'exécuter une configuration précédemment créée et sauvegardée localement. Il est nécessaire d'importer la **configuration** au format .json puis ses **fichiers associés**.

### Début du test
L'utilisateur entre les infos personnelles requises et démarre le test.

### Fin du test
A la fin du test les fichiers de suivi d'activité sont téléchargés automatiquement au format .csv, ils sont alors disponnibles dans le dossier de téléchargement par défaut. Aucun fichier déjà existant ne pourra être écrasé.

Il est ensuite possible de relancer une session avec un nouvel utilisateur sans avoir à recharger les données en cliquant sur le bouton **Relancer**.

### Exemple
Une configuration et ses fichiers sont disponibles dans le dossier [examples](https://github.com/Valoute-GS/LOUSTICOSV/tree/master/examples).

# Données de sortie
A la fin de chaque test sont téléchargés deux fichiers CSV. Deux exemples de fichiers sont disponnibles dans le dossier [examples](https://github.com/Valoute-GS/LOUSTICOSV/tree/v2/output_examples).

### Fichier de log
Fichier contenant l'**intégralité de l'activité** du test.

### Fichier de synthèse
Fichier contenant une **synthèse** du fichier log, avec des infos complémentaires/calculées comme les temps cumulés, des compteurs d'action etc.
