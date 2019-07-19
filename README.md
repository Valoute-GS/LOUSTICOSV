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
 - Une liste de **Chapitres** (facultatifs) :  composé d'un **Titre** et d'un **Timer** nécessaires.

Note : Le **Timer** d'un chapitre représente le début de ce dernier, c'est à dire que :
 - Le chapitre 1 dure du Timer 1 jusqu'au Timer 2.
 - Entre le début de la vidéo et le premier chapitre aucune statistique avancée ne sera recuillie, il est possible de creéer un chapitre commençant à 0:00 pour remédier à cela.
 - Le dernier chapitre dure de son Timer jusqu'à la fin de la vidéo.
 
### Format Editeur de texte/médias
Une page de type **Editeur de texte/médias** se configure de façon traditionnelle, c'est un éditeur de texte simple mais riche. Il est ainsi possible d'insérer des images, des vidéos du web (nécessite une connexion internet),etc. en plus des fonction d'éditions classiques.

### Format PDF
Une page de type **PDF** est composé de :
 - Un **fichier PDF** : nécessaire au format .PDF, .webm, .mov (suivant les navigateurs certains formats ne son pas pris en charge), **fichier local** à importer dans le champ en bas de page
 - Des **Options** activables : changeant la mise en forme et les interactions possibles lors du test
 - Une liste de **Chapitres** (facultatifs) :  composé d'un **Titre** et d'un **Numéro de page** nécessaires.

Note : Le fonctionnement des chapitres est similaire à ceux d'une vidéo.

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
A la fin de chaque test sont téléchargés deux fichiers CSV. Deux exemples de fichiers sont disponnibles dans le dossier [examples](https://github.com/Valoute-GS/LOUSTICOSV/tree/master/examples).

### Fichier de log
Fichier contenant l'**intégralité de l'activité** du test.

### Fichier de synthèse
Fichier contenant une **synthèse** du fichier log, avec des infos complémentaires/calculées comme les temps cumulés, des compteurs d'action etc.

### Détail _log.csv
| Nom de la colonne | Description |
| ------ | ----------- |
| Timer   | Date et heure à laquelle est survenu l'événement |
| Current page | Numéro de la page en cours |
| Current chap | Numéro du chapitre en cours (vidéo) |
| Reached page | Numéro de la page atteinte lors d'un changement de page courante |
| Reached chap | Numéro du chapitre atteint lors d'un changement de chapitre courant |
| Action | Nature de l'événement |
| Time from test begining | Temps en secondes depuis le début du test |
| Time from page begining | Temps en secondes depuis le début de la page |
| Video timer | Timer de la video courante |
| Time from chap begining | Temps en secondes depuis le début du chapitre courant (vidéo) |
| Time from PLAY | Temps en secondes depuis le dernier événement PLAY |
| Curr slide Chap | Numéro du chapitre en cours (PDF) |
| Reached slide Chap | Numéro du chapitre atteint lors d'un changement de chapitre courant |
| Time from chap slide begining | Temps en secondes depuis le début du chapitre courant (pdf) |

### Liste des actions
| Nom de l'événement | Description |
| ------ | ----------- |
| START_PAGE | Une page commence |
| CHAP_ATT | Un chapitre vidéo a été atteint (ie changement du chapitre courant) |
| CHAP_USED | Le candidat a utilisé un **lien vers un chapitre** vidéo |
| PREV_CHAP | Le candidat a utilisé le bouton **chapitre vidéo précédent** |
| NEXT_CHAP | Le candidat a utilisé le bouton **chapitre vidéo suivant** |
| VIDEO_START | Une vidéo a commencé à être lu (ie première lecture depuis l'arrivée sur la page) |
| VIDEO_END | Une vidéo a finit sa lecture (cela ne signifie pas que toute la vidéo a été visionné, seulement que la dernière image de la vidéo a été lue) |
| PLAY | Le candidat a utilisé le bouton de **lecture vidéo** |
| PAUSE | Le candidat a utilisé le bouton de **pause vidéo** |
| NAVBAR_USED | Le candidat a utilisé la **barre de navigation** pour se déplacer dans la vidéo |
| NEXT_PAGE | Le candidat a utilisé le bouton **suivant** pour se rendre sur la page suivante |
| PREV_PAGE | Le candidat a utilisé le bouton **précedent** pour se rendre sur la page suivante |
| SOMMAIRE | Le candidat a utilisé le sommaire pour se rendre sur une page précise |
| NEXT_SLIDE | Le candidat a utilisé le bouton **diapo suivant** |
| PREV_SLIDE | Le candidat a utilisé le bouton **diapo précédente** |
| GOTO_SLIDE | Le candidat a utilisé un **lien vers un chapitre pdf** (ie vers une page précise) |
| CHAP_SLIDE_ATT | Un chapitre pdf a été atteint (ie changement du chapitre courant) |
| END | Le test est fini |

### Détail _syn.csv
| Nom de la colonne | Description |
| ------ | ----------- |
| Participant | id du participant |
| Config | nom de la config |
|  |  |
| Di-(Cj-)duree | Temps total cumulée en secondes passé sur la page *i* (sur le chapitre *j*)|
| Di-(Cj-)durrePlay | Temps total cumulée en secondes passé en lecture vidéo sur la page *i* (sur le chapitre *j*) |
| Di-(Cj-)dureePause | Temps total cumulée en secondes passé en pause vidéo sur la page *i* (sur le chapitre *j*) |
| Di-(Cj-)nbPlay | Nombre total cumulée d'utilisation du bouton de lecture vidéo sur la page *i* (sur le chapitre *j*) |
| Di-(Cj-)nbPause | Nombre total cumulée d'utilisation du bouton de pause vidéo sur la page *i* (sur le chapitre *j*) |
|  |  |
| Clics sommaire |  Nombre total cumulée d'utilisation du **sommaire** de pages |
| Sommaire i | Nombre total cumulée d'utilisation du **sommaire** pour atteindre la page *i* |
|  |  |
| Diapo | Numéro de la page concernée |
| Nieme visite | Combien-ième visite sur cette page |
| Début | Temps (depuis le début du test) en seconde : **début de la lecture** de la page |
| Fin | Temps (depuis le début du test) en seconde : **fin de la lecture** de la page |
| Durée | Durée en seconde passé sur la page (ie Fin - début) |
| Nb vid play | Nombre d'utilisation du bouton de **lecture vidéo** sur la page |
| Nb vid pause | Nombre d'utilisation du bouton de **pause vidéo** sur la page |
| Nb vid chap suiv | Nombre d'utilisation du bouton **chapitre vidéo suivant** sur la page |
| Nb vid chap prec | Nombre d'utilisation du bouton **chapitre vidéo précédent** sur la page |
| Nb vid chap list | Nombre d'utilisation de **lien vers un chapitre** vidéo sur la page |
| Nb vid navbar | Nombre d'utilisation de la **barre de navigation** sur la page |
| Nb pdf prec | Nombre d'utilisation du bouton **diapo suivant** sur la page |
| Nb pdf suiv | Nombre d'utilisation du bouton **diapo précedent** sur la page |
| Nb pdf chap liste | Nombre d'utilisation de **lien vers un chapitre** pdf sur la page |