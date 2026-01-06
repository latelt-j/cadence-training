# 🎯 CADENCE

### *Le QG de la Transformation de Jean-Charles*
#### Born Loser. Die Winner. 💀➡️🏆

---

## 🚀 C'est quoi ce bordel ?

**Cadence** c'est pas juste une app de suivi d'entraînement. C'est le **Centre de Commandement** d'un athlète en devenir. Un tableau de bord qui transforme un mec normal en machine de guerre cardiovasculaire.

> *"Courir à 7:30, 8:00 ou 9:00 min/km, on a l'impression de piétiner, d'avoir une foulée dégueulasse et que les grands-mères nous doublent en marchant. C'est NORMAL."*
>
> — **Coach Gemini**, philosophe moderne

---

## 🎭 La Mission

Jean-Charles était un **loser ordinaire**. Le genre de mec qui s'essouffle en montant les escaliers. Qui prend l'ascenseur pour un étage. Qui considère que marcher jusqu'au frigo c'est du cardio.

**Mais ça, c'était avant.**

Maintenant, Jean-Charles a Cadence. Et Cadence ne rigole pas.

---

## ⚡ Features de Fou

### 📅 Calendrier Drag & Drop
Planifie tes séances comme un général planifie ses batailles. Déplace-les à la souris quand t'as la flemme (on juge pas).
- **Vue desktop** : grille 7 jours avec météo
- **Vue mobile** : swipe entre les jours avec animations fluides
- **Couleurs par sport** : 🚴 Rose (vélo) / 🏃 Bleu (course) / 💪 Rouge (renfo)

### 🔥 Sync Strava Intelligente
Tes activités Strava débarquent automatiquement avec tous les détails :
- Tours / Intervalles détaillés
- Fréquence cardiaque (avg & max)
- Puissance (pour les cyclistes qui ont vendu un rein pour un capteur)
- **Métriques avancées calculées** : IF, VI, Aerobic Decoupling, VAM
- Remplacement automatique des séances prévues du même sport

### 📊 Phases d'Entraînement
La **vraie** périodisation comme les pros :
- **Phases** : Base, Build, Peak, Taper, Recovery...
- **Objectifs par phase** avec mots-clés pour l'IA
- **Répartition volume** : slider vélo/course qui s'ajuste auto
- **Challenges** : parce que faut se faire mal
- **Semaine X/Y** affichée dans le calendrier

### 🎯 Objectifs & Courses
Planifie tes objectifs A/B/C :
- Course Trail ou Vélo Route
- Distance, D+, D-
- Compte à rebours J-XX automatique
- Priorité A (principale) / B (secondaire) / C (préparation)

### 👤 Profil Athlète
Tes données physiologiques :
- **FTP** : pour calculer les zones de puissance
- **FC Max & Repos** : pour la réserve cardiaque
- **Environnement** : contexte terrain (plat, montagne, home trainer...)
- Tout est inclus dans les prompts coach

### ✅ Validation Manuelle
Pas envie de publier sur Strava ta séance de gainage ?
- Bouton **"Marquer comme fait"**
- **Ressenti rapide** : 💪 Super / 👍 OK / 😓 Dur
- Modification de la durée réelle
- Possibilité de **revenir en "prévu"** si erreur

### 🗣️ Bilan Coach
Un bouton **"🗣️ Bilan coach"** qui copie le résumé de ta semaine :
```
📅 BILAN SEMAINE
janvier 2025

✅ RÉALISÉ (3)
• lun. 6 - 🚴 Sweet spot 2x20 (1h30)
• mar. 7 - 💪 Renfo gainage (30min)
• jeu. 9 - 🏃 Footing Z2 (45min)

📋 PRÉVU (1)
• sam. 11 - 🚴 Sortie longue (3h00)

💬 Qu'en penses-tu ? Je peux ajouter une séance ?
```

### 📋 Copier pour Coach (Détaillé)
Un bouton magique qui copie TOUTES les données d'une séance :
- Métriques complètes (IF, VI, TSS...)
- Tours détaillés avec FC/puissance
- Commentaire personnel optionnel
- Prêt à coller dans Gemini/ChatGPT

### 🤖 Génération de Plan IA
Demande un plan à Coach Gemini avec :
- **Ton profil** : FTP, FC, fatigue actuelle
- **Tes objectifs** : courses A/B/C avec J-XX
- **Ta phase** : semaine X/Y avec mots-clés
- **Ton bilan** : séances Strava de la semaine passée
- **Tes contraintes** : "pas dispo mardi", "envie de D+"

L'IA génère du **JSON prêt à importer** avec :
- Séances structurées
- **Fichiers Zwift XML** pour le vélo indoor
- Descriptions avec échauffement/corps/récup

### 🌤️ Météo Intégrée
- Prévisions 7 jours sur chaque jour du calendrier
- Température min/max
- Vent (direction + vitesse)
- Géolocalisation automatique

### 📱 PWA Mobile
- **Installable** sur téléphone comme une vraie app
- **Responsive** : UI adaptée mobile/desktop
- **Offline** : cache local pour accès rapide

---

## 💬 La Sagesse de Coach Gemini

> *"La zone 2, c'est comme regarder la peinture sécher. Mais c'est là que tu construis ton moteur diesel."*

> *"T'as l'impression de pas avancer ? Parfait. Continue."*

> *"Le jour où ça devient facile, c'est que t'es mort. Ou que t'as triché sur ta FC max."*

> *"Chaque sortie où t'as envie d'abandonner mais où tu finis quand même, c'est une victoire. Les autres comptent pas."*

---

## 🛠️ Stack Technique

Parce que même les losers en devenir méritent de la belle tech :

- **Vue 3** + Composition API + TypeScript
- **Tailwind CSS** + **DaisyUI** (dark mode by default)
- **Supabase** (PostgreSQL + Edge Functions + Auth)
- **Strava API** (OAuth2 + Streams pour métriques avancées)
- **Open-Meteo API** (météo gratuite et précise)
- **PWA** avec Vite PWA plugin

---

## 🏁 L'Objectif Final

```
Avant Cadence:  😮‍💨 "Je suis essoufflé"
Après Cadence:  😤 "JE SUIS LA TEMPÊTE"
```

Jean-Charles ne sera plus jamais le même.

**Born Loser. Die Winner.**

---

## 🚀 Installation

```bash
# Clone
git clone https://github.com/ton-repo/cadence.git
cd cadence

# Install
npm install

# Config (.env)
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_STRAVA_CLIENT_ID=xxx

# Dev
npm run dev

# Build
npm run build
```

---

## 📜 License

MIT - Parce que la souffrance doit être partagée.

---

<p align="center">
  <i>Fait avec 💦 sueur et ☕ café</i>
  <br>
  <b>2024-2025 - L'année où tout change</b>
</p>
