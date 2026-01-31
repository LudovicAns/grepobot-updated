# DataExchanger — Répertoire des endpoints

Ce document répertorie les endpoints AJAX encapsulés par `src/js/DataExchanger.js`.
Objectif : identifier rapidement **quel endpoint** est utilisé, avec **quelle action**, **quelle méthode HTTP**, et **pour quel usage** (collecte/manipulation des données du jeu).

---

## Vue d’ensemble (liste unique)

- `/game/data`
- `/game/index`
- `/game/farm_town_info`
- `/game/farm_town_overviews`
- `/game/building_place`
- `/game/building_main`
- `/game/building_barracks`
- `/game/player`
- `/game/alliance`
- `/start`
- `/game/frontend_bridge`
- `/game/attack_planer`
- `/game/town_info`

---

## Détail par module (`DataExchanger.api.*`)

### Conventions communes

- `{{base_url}}` : `window.location.protocol + "//" + document.domain` (ex: `https://frX.grepolis.com`)
- `h` : token CSRF (`Game.csrfToken`)
- `town_id` : ID de la ville courante ou cible
- `nl_init` : flag d'initialisation (souvent `true`)

---

## 1) `api.game`

| Méthode | Endpoint | HTTP | `action` | Utilité |
|---|---|---:|---|---|
| `api.game.data(townId)` | `/game/data` | POST | `get` | Initialisation/Synchro globale des données (map, bar, backbone) |
| `api.game.switchTown(townId)` | `/game/index` | GET | `switch_town` | Change la ville active du joueur sur le serveur |

#### Détails techniques

**`api.game.data`**
- **Description** : Cet endpoint est crucial pour l'initialisation. Il récupère un "bundle" de données incluant les informations de la carte (coordonnées 0,0 par défaut), l'état de la barre d'interface et les modèles Backbone nécessaires au fonctionnement du frontend Grepolis.
- **URL** : `{{base_url}}/game/data?town_id={{townId}}&action=get&h={{csrfToken}}`
- **Payload (POST)** :
```json
{
  "json": {
    "types": [
      {"type": "map", "param": {"x": 0, "y": 0}},
      {"type": "bar"},
      {"type": "backbone"}
    ],
    "town_id": "{{townId}}",
    "nl_init": false
  }
}
```

**`api.game.switchTown`**
- **Description** : Informe le serveur que le joueur change de ville active. Indispensable pour que les requêtes suivantes soient traitées dans le contexte de la nouvelle ville.
- **URL** : `{{base_url}}/game/index?town_id={{townId}}&action=switch_town&h={{csrfToken}}`

---

## 2) `api.farm`

| Méthode | Endpoint | HTTP | `action` | Utilité |
|---|---|---:|---|---|
| `api.farm.claimLoad(...)` | `/game/farm_town_info` | POST | `claim_load` | Réclame les ressources d'un village de paysans |
| `api.farm.townOverviews(...)` | `/game/farm_town_overviews` | GET | `get_farm_towns_for_town` | Liste les villages de paysans de l'île (état, ressources) |
| `api.farm.claimLoads(...)` | `/game/farm_town_overviews` | POST | `claim_loads` | Pillage de masse : réclame sur plusieurs villages |

#### Détails techniques

**`api.farm.claimLoad`**
- **Description** : Permet de réclamer des ressources ou des unités auprès d'un unique village de paysans. Nécessite l'ID du village cible et les options de temps/quantité choisies.
- **URL** : `{{base_url}}/game/farm_town_info?town_id={{townId}}&action=claim_load&h={{csrfToken}}`
- **Payload (POST)** :
```json
{
  "json": {
    "target_id": "{{targetId}}",
    "claim_type": "{{claimOption}}",
    "time": "{{timeOption}}",
    "town_id": "{{townId}}",
    "nl_init": true
  }
}
```

**`api.farm.townOverviews`**
- **Description** : Récupère l'aperçu complet des villages de paysans situés sur la même île que la ville donnée. Inclut les informations sur les recherches (Butin, Diplomatie) et le niveau du Bureau de commerce pour calculer les capacités d'échange.
- **URL** : `{{base_url}}/game/farm_town_overviews`
- **Paramètres (GET)** :
    - `town_id`: `{{Game.townId}}`
    - `action`: `get_farm_towns_for_town`
    - `h`: `{{csrfToken}}`
    - `json`: 
```json
{
  "island_x": "{{x}}",
  "island_y": "{{y}}",
  "current_town_id": "{{townId}}",
  "booty_researched": true,
  "diplomacy_researched": true,
  "itrade_office": "{{level}}",
  "town_id": "{{Game.townId}}",
  "nl_init": true
}
```

**`api.farm.claimLoads`**
- **Description** : Utilitaire pour le pillage de masse. Envoie une liste d'IDs de villages de paysans pour réclamer les ressources simultanément sur tous ces villages.
- **URL** : `{{base_url}}/game/farm_town_overviews?town_id={{Game.townId}}&action=claim_loads&h={{csrfToken}}`
- **Payload (POST)** :
```json
{
  "json": {
    "farm_town_ids": ["{{id1}}", "{{id2}}"],
    "time_option": "{{timeOption}}",
    "claim_factor": "{{claimOption}}",
    "current_town_id": "{{townId}}",
    "town_id": "{{Game.townId}}",
    "nl_init": true
  }
}
```

---

## 3) `api.buildings`

| Méthode | Endpoint | HTTP | `action` | Utilité |
|---|---|---:|---|---|
| `api.buildings.place(townId)` | `/game/building_place` | GET | `culture` | Vue Agora (Points de culture, Festivals) |
| `api.buildings.main(townId)` | `/game/building_main` | GET | `index` | Vue Sénat (Construction, Niveaux) |
| `api.buildings.startCelebration(...)` | `/game/building_place` | POST | `start_celebration` | Lance un événement culturel (JO, Marche triomphale...) |
| `api.buildings.barracks(...)` | `/game/building_barracks` | POST | `build` | Recrutement de troupes à la Caserne |

#### Détails techniques

**`api.buildings.place`**
- **Description** : Simule l'ouverture de l'Agora. Utilisé pour vérifier l'état des points de culture du joueur et les célébrations en cours ou disponibles.
- **URL** : `{{base_url}}/game/building_place`
- **Paramètres (GET)** : `town_id={{townId}}`, `action=culture`, `h={{csrfToken}}`, `json={"town_id":"{{townId}}","nl_init":true}`

**`api.buildings.main`**
- **Description** : Simule l'ouverture du Sénat. Permet d'obtenir l'état des bâtiments de la ville et la file d'attente de construction.
- **URL** : `{{base_url}}/game/building_main`
- **Paramètres (GET)** : `town_id={{townId}}`, `action=index`, `h={{csrfToken}}`, `json={"town_id":"{{townId}}","nl_init":true}`

**`api.buildings.startCelebration`**
- **Description** : Déclenche une célébration culturelle dans la ville spécifiée. Types communs : `festival`, `olympic`, `triumph`, `theater`.
- **URL** : `{{base_url}}/game/building_place?town_id={{townId}}&action=start_celebration&h={{csrfToken}}`
- **Payload (POST)** :
```json
{
  "json": {
    "celebration_type": "{{type}}",
    "town_id": "{{townId}}",
    "nl_init": true
  }
}
```

**`api.buildings.barracks`**
- **Description** : Envoie un ordre de recrutement de troupes. Le payload doit contenir les types d'unités et leurs quantités respectives.
- **URL** : `{{base_url}}/game/building_barracks?town_id={{townId}}&action=build&h={{csrfToken}}`
- **Payload (POST)** :
```json
{
  "json": {
    "unit_id": "{{unitId}}",
    "amount": "{{amount}}",
    "town_id": "{{townId}}"
  }
}
```
*(Note: `requestData` passé à la méthode est directement stringifié dans `json`)*

---

## 4) `api.player`

**`api.player.emailValidation`**
- **Description** : Vérifie l'état de validation de l'email du joueur.
- **URL** : `{{base_url}}/game/player`
- **HTTP** : GET
- **Paramètres** : `town_id={{Game.townId}}`, `action=email_validation`, `h={{csrfToken}}`, `json={"town_id":"{{Game.townId}}","nl_init":true}`

---

## 5) `api.alliance`

**`api.alliance.membersShow`**
- **Description** : Récupère la liste détaillée des membres de l'alliance du joueur (noms, points, rangs).
- **URL** : `{{base_url}}/game/alliance`
- **HTTP** : GET
- **Paramètres** : `town_id={{Game.townId}}`, `action=members_show`, `h={{csrfToken}}`, `json={"town_id":"{{Game.townId}}","nl_init":true}`

---

## 6) `api.auth`

**`api.auth.loginToGameWorld`**
- **Description** : Redirige le joueur vers un monde de jeu spécifique après authentification.
- **URL** : `{{base_url}}/start?action=login_to_game_world`
- **Méthode** : Redirection (Form Submit / POST / GET params)
- **Params** : `world={{worldId}}`, `facebook_session=`, `facebook_login=`, `portal_sid=`, `name=`, `password=`

---

## 7) `api.bridge`

**`api.bridge.execute`**
- **Description** : Exécute des commandes via le pont frontend (RPC).
- **URL** : `{{base_url}}/game/frontend_bridge?town_id={{townId}}&action=execute&h={{csrfToken}}`
- **HTTP** : POST
- **Payload** : `{ "json": "{{requestData_JSON}}" }`

---

## 8) `api.attack`

| Méthode | Endpoint | HTTP | `action` | Utilité |
|---|---|---:|---|---|
| `api.attack.planner(townId)` | `/game/attack_planer` | GET | `attacks` | Liste des attaques (Planificateur) |
| `api.attack.townInfoAttack(...)` | `/game/town_info` | GET | `attack` | Ouvre la fenêtre d'attaque avec pré-sélection |
| `api.attack.sendUnits(...)` | `/game/town_info` | POST | `send_units` | Envoi effectif de l'attaque/soutien |

#### Détails techniques

**`api.attack.planner`**
- **Description** : Récupère les attaques prévues via le planificateur d'attaques.
- **URL** : `{{base_url}}/game/attack_planer`
- **Paramètres (GET)** : `town_id={{townId}}`, `action=attacks`, `h={{csrfToken}}`, `json={"town_id":"{{townId}}","nl_init":true}`

**`api.attack.townInfoAttack`**
- **Description** : Prépare une attaque vers une cible avec une pré-sélection d'unités.
- **URL** : `{{base_url}}/game/town_info`
- **Paramètres (GET)** :
    - `town_id`: `{{townId}}`
    - `action`: `attack`
    - `h`: `{{csrfToken}}`
    - `json`:
```json
{
  "id": "{{target_id}}",
  "nl_init": true,
  "origin_town_id": "{{origin_town_id}}",
  "preselect": true,
  "preselect_units": "{{unitsPayload}}",
  "town_id": "{{Game.townId}}"
}
```

**`api.attack.sendUnits`**
- **Description** : Envoi final des unités (attaque ou soutien) vers une ville cible.
- **URL** : `{{base_url}}/game/town_info?town_id={{townId}}&action=send_units&h={{csrfToken}}`
- **Payload (POST)** :
```json
{
  "json": {
    "id": "{{targetTownId}}",
    "type": "{{attackType}}",
    "town_id": "{{townId}}",
    "nl_init": true,
    "units": {
       "sword": 10,
       "archer": 5
    }
  }
}
```

---

## Normalisation de réponse (comportement commun)

Avant d’appeler le callback, le wrapper traite typiquement :
- `redirect` → redirection navigateur
- `maintenance` → ouverture de la fenêtre maintenance
- `notifications` → dispatch via loader, puis nettoyage des champs
- `bar.gift` → ouverture potentielle de la récompense quotidienne
