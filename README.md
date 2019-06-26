# LOUSTIC OS - Outil de Suivi

LOUSTIC OS est un outil de suivi basé sur les technologies HTML5/CSS3/Javascript8.
L'objectif est de pouvoir créer une suite de médias qu'un candidat pourra ensuite visionner, tout en récupérant son activité sur la page. 
L'application se découpe en deux grandes parties :

 - Une interface de **création** : onglet **Créer**
 - Une interface de **test** : onglet **Charger**

### Sommaire :

 - Installation
 - Créer une configuration
 - Charger une configuration
 - Données de sortie

# Installation
Sous Windows :
L'installation est très simple, il suffit de :

 1. Télécharger le dossier compressé sur la [Dropbox du LOUSTIC](https://www.dropbox.com/home/Valentin%20Utiel-%20stage%20outil%20suivi) ou sur [GitHub](https://github.com/Valoute-GS/LOUSTICOSV/tree/v2) **Clone or Download -> Download ZIP**
 2. L'extraire dans le répertoire désiré.
 3. Entrer dans le dossier `./LOUSTIC_OS`
 4. Exécuter le ficher `index.html` dans votre navigateur préféré

~~Sous Android :~~
*Version en développement*

# Créer une configuration
Cette fonction est accessible depuis l'accueil ou bien depuis l'onglet **Créer** dans la barre de navigation.
Elle est destinée à être utilisée par le chercheur qui veut créer une nouvelle configuration de zéro.

Une **Configuration** est composée de :

 - Un **Titre** nécessaire
 - Des **Options** activables
 - Une liste non nulle de **Pages** configurables

Chaque **Page** est définie par :

 - Un **Titre** (facultatif)
 - Un **Format** : vidéo/texte (d'autres formats sont prévus et en cours de développement)

La page peut être configuré en appuyant sur le bouton **Configurer**, cette action menant sur une page spécifique en fonction du format sélectionné au préalable.
Une page, une fois finie et valide, peut être sauvegardée via le bouton **Sauvegarder**
La configuration, une fois finie et valide, peut être téléchargée via le bouton **Terminer**, cela entraine le téléchargement d'un fichier de configuration au format `.json`.

### Format Vidéo
Une page de type **Vidéo** est composée de :

 - Un **fichier vidéo** : nécessaire au format .mp4 (conseillé), .webm, .mov (suivant les navigateurs certains formats ne son pas pris en charge), **fichier local** à importer dans le champ en bas de page
 - Des **Options** activables : changeant la mise en forme et les interactions possibles lors du test
 - Une liste de **Chapitres** (facultatifs) :  composé d'un **Titre** et d'un **Timestamp** nécessaires

### Format Texte
Une page de type **Texte**  est simplement composé d'une zone de texte.
Elle peut cependant être formaté grace aux balises HTML simples pour personnaliser la zone de texte, à l'aide d'outil comme [Online HTML Editor](https://html-online.com/editor/) (un éditeur intégré est envisagé)

**ATTENTION** n'utiliser que des balises simples pour formater du texte (pas d'image, de vidéo, etc) sinon la configuration sera erronée et impossible à charger. Cette fonctionnalité est à utiliser avec précaution.

# Charger une configuration
Cette fonction est accessible depuis l'accueil ou bien depuis l'onglet **Charger** dans la barre de navigation. Elle est permet de charger une configuration précédemment créée et sauvegardée localement. Il est nécessaire d'importer la **configuration** au format JSON et les **fichiers associés**.

### Début du test
L'utilisateur entre les infos personnelles requises et démarre le test.

### Fin du test
A la fin du test les fichiers de suivi d'activité son téléchargé automatiquement au format CSV, ils sont alors disponnibles dans le dossier de téléchargement par défaut. Aucun fichier déjà existant ne pourra être écrasé.

Il est ensuite possible de relancer une session avec un nouvel utilisateur sans avoir à recharger les données en cliquant sur le bouton **Relancer**

# Données de sortie
A la fin de chaque test sont téléchargés deux fichiers CSV. Deux exemples de fichiers sont disponnibles dans le dossier [output_examples](https://github.com/Valoute-GS/LOUSTICOSV/tree/v2/output_examples).

### Fichier de log
Fichier contenant l'**intégralité de l'activité** du test.

### Fichier de synthèse
Fichier contenant une **synthèse** du fichier log, avec des infos complémentaires/calculées comme les temps cumulés, des compteurs d'action etc.
