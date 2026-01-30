# DataExchanger API

Ce document decrit la structure de `DataExchanger` et les endpoints exposes
pour centraliser les requetes AJAX du jeu.

## Vue d'ensemble

`DataExchanger` est un objet global qui regroupe les appels reseau vers
Grepolis. Il expose une API structuree via `DataExchanger.api` et conserve
les anciens noms pour assurer la compatibilite.

Principes cles :
- Toutes les requetes passent par `sendRequest` et `default_handler`.
- Les callbacks recoivent par defaut `response.json` (reponse normalisee).
- Certains appels demandent la reponse complete (voir "useFullResponse").

## Conventions communes

- Base URL : `protocol + "//" + document.domain`
- Parametres query : construits avec `$["param"]`.
- Payload JSON : `json: JSON.stringify(data)`
- CSRF : `h: Game["csrfToken"]`

Signature typique :

```js
DataExchanger.api.<group>.<method>(...params, callback);
```

Le callback recoit `responseJson` (ou le payload complet si `useFullResponse`
est actif).

## Normalisation des reponses (`default_handler`)

Avant de passer la reponse au callback, `default_handler` gere :
- `redirect` : redirection vers l'URL donnee.
- `maintenance` : ouverture de la fenetre de maintenance.
- `notifications` : ingestion par `NotificationLoader`.
- `bar.gift` : ouverture de la fenetre de reward si necessaire.

## API structuree

### game

- `data(townId, callback)`
  - POST `/game/data?action=get`
  - Params : `town_id`, `h`
  - Body : `{ types: [map, bar, backbone], town_id, nl_init:false }`

- `switchTown(townId, callback)`
  - GET `/game/index?action=switch_town`
  - Params : `town_id`, `h`

### farm

- `claimLoad(townId, claimOption, timeOption, targetId, callback)`
  - POST `/game/farm_town_info?action=claim_load`
  - Body : `{ target_id, claim_type, time, town_id, nl_init:true }`

- `townOverviews(townId, callback)`
  - GET `/game/farm_town_overviews`
  - Params : `town_id`, `action=get_farm_towns_for_town`, `h`
  - Body : island coords + recherches + batiments

- `claimLoads(townId, farmTownIds, claimOption, timeOption, callback)`
  - POST `/game/farm_town_overviews?action=claim_loads`
  - Body : `{ farm_town_ids, time_option, claim_factor, current_town_id, ... }`

### buildings

- `place(townId, callback)`
  - GET `/game/building_place?action=culture`
  - Body : `{ town_id, nl_init:true }`
  - useFullResponse: true

- `main(townId, callback)`
  - GET `/game/building_main?action=index`
  - Body : `{ town_id, nl_init:true }`

- `startCelebration(townId, celebrationType, callback)`
  - POST `/game/building_place?action=start_celebration`
  - Body : `{ celebration_type, town_id, nl_init:true }`
  - useFullResponse: true

- `barracks(townId, requestData, callback)`
  - POST `/game/building_barracks?action=build`
  - Body : `requestData`

### player

- `emailValidation(callback)`
  - GET `/game/player?action=email_validation`
  - Body : `{ town_id, nl_init:true }`
  - useFullResponse: true

### alliance

- `membersShow(callback)`
  - GET `/game/alliance?action=members_show`
  - Body : `{ town_id, nl_init:true }`

### bridge

- `execute(townId, requestData, callback)`
  - POST `/game/frontend_bridge?action=execute`
  - Body : `requestData`

### attack

- `planner(townId, callback)`
  - GET `/game/attack_planer?action=attacks`
  - Body : `{ town_id, nl_init:true }`

- `townInfoAttack(townId, attackData, callback)`
  - GET `/game/town_info?action=attack`
  - Body : `{ id, origin_town_id, preselect_units, town_id, nl_init:true }`

- `sendUnits(townId, attackType, targetTownId, unitsPayload, callback)`
  - POST `/game/town_info?action=send_units`
  - Body : `{ id, type, town_id, nl_init:true, ...unitsPayload }`

### auth

- `loginToGameWorld(worldId)`
  - Redirect `/start?action=login_to_game_world`

## Compatibilite (alias historiques)

Ces alias pointent vers l'API structuree :
- `game_data` -> `api.game.data`
- `switch_town` -> `api.game.switchTown`
- `claim_load` -> `api.farm.claimLoad`
- `farm_town_overviews` -> `api.farm.townOverviews`
- `claim_loads` -> `api.farm.claimLoads`
- `building_place` -> `api.buildings.place`
- `building_main` -> `api.buildings.main`
- `start_celebration` -> `api.buildings.startCelebration`
- `email_validation` -> `api.player.emailValidation`
- `members_show` -> `api.alliance.membersShow`
- `login_to_game_world` -> `api.auth.loginToGameWorld`
- `frontend_bridge` -> `api.bridge.execute`
- `building_barracks` -> `api.buildings.barracks`
- `attack_planner` -> `api.attack.planner`
- `town_info_attack` -> `api.attack.townInfoAttack`
- `send_units` -> `api.attack.sendUnits`

## Exemple d'utilisation

```js
DataExchanger.api.farm.townOverviews(Game.townId, function (response) {
  console.log("Farm towns:", response.farm_town_list);
});
```

## Exemples par module

### Autofarm (donnees villages et recoltes)

```js
DataExchanger.api.game.data(townId, function (response) {
  var mapData = response.map.data.data.data;
  // ... filtrer les villages sur l'ile
});

DataExchanger.api.farm.townOverviews(townId, function (response) {
  // ... preparer les villages a piller
});

DataExchanger.api.farm.claimLoad(
  townId,
  "normal",
  "short",
  farmTownId,
  function (response) {
    // ... traiter la recolte
  },
);
```

### Autoculture (place et celebrations)

```js
DataExchanger.api.buildings.place(townId, function (response) {
  // ... etat culturel de la ville
});

DataExchanger.api.buildings.startCelebration(
  townId,
  "small_party",
  function (response) {
    // ... confirmation de lancement
  },
);
```

### Autobuild (batiments et files)

```js
DataExchanger.api.buildings.main(townId, function (response) {
  // ... lecture des batiments et slots dispo
});

DataExchanger.api.bridge.execute(
  townId,
  {
    model_url: "BuildingOrder",
    action_name: "buildUp",
    arguments: { building_id: "academy" },
    town_id: townId,
    nl_init: true,
  },
  function (response) {
    // ... validation d'un upgrade
  },
);
```

### Autoattack (planification et envoi)

```js
DataExchanger.api.attack.planner(Game.townId, function (response) {
  // ... liste des attaques planifiees
});

DataExchanger.api.attack.townInfoAttack(
  townId,
  { target_id: targetId, town_id: townId, units: unitsPayload },
  function (response) {
    // ... preselection d'attaque
  },
);

DataExchanger.api.attack.sendUnits(
  townId,
  "attack",
  targetId,
  unitsPayload,
  function (response) {
    // ... confirmation d'envoi
  },
);
```

## Reponses observees (dossier `data/`)

Notes :
- Certains fichiers contiennent l'objet `jqXHR` (`readyState`, `status`,
  `responseJSON`). Dans ce cas, la reponse utile est dans `responseJSON`.
- Le callback de `DataExchanger` recoit en general `payload.json`
  (donc `responseJSON.json` dans les exemples `jqXHR`).

### Autofarm

- `api.game.data` -> `data/Autofarm.game.data .json`
  - Cles racine : `map`, `backbone`, `bar`, `benchmarks`, `t_token`.
  - `map.data` contient la carte, chunks et infos d'ile.
  - `backbone.models` et `backbone.collections` sont fournis.
- `api.farm.townOverviews` -> `data/Autofarm.farm.townOverviews.json`
  - `responseJSON.json.farm_town_list` (liste des villages).
  - `responseJSON.json.loads_data` (options 300/1200/5400/14400).
  - `responseJSON.plain.html` (popup HTML).
- `api.farm.claimLoad` -> `data/Autofarm.farm.claimLoad.json`
  - Exemple d'erreur : `error`.
- `api.farm.claimLoads` -> `data/Autofarm.farm.claimLoads.json`
  - Erreur de parsing (`statusText: "parsererror"`, `responseText` vide).
- `api.bridge.execute` (claim) -> `data/Autofarm.bridge.claim.txt`
  - Erreur JS locale (relation id manquant), pas de reponse serveur.

### Autoculture

- `api.buildings.place` -> `data/Autoculture.buildings.place.json`
  - `json.menu`, `json.t_token`.
  - `plain.html` pour la vue de place.
- `api.buildings.startCelebration` -> `data/Autoculture.buildings.startCelebration.json`
  - Exemple d'erreur : `json.error` + `json.t_token`.

### Autobuild

- `api.buildings.main` -> `data/Autobuild.buildings.main.json`
  - `responseJSON.json.menu`, `responseJSON.json.html`, `responseJSON.json.t_token`.
  - Dans cet exemple, `responseJSON.json.json` est `null`.
- `api.bridge.execute` (buildUp) -> `data/Autobuild.bridge.buildUp.json`
  - Erreur : `responseJSON.json.error`.
- `api.bridge.execute` (buyInstant) -> `data/Autobuild.bridge.buyInstant.json`
  - Erreur : `responseJSON.json.error`.
- `api.buildings.barracks` -> `data/Autobuild.buildings.barracks.json`
  - `responseJSON.json.t_token` + `responseJSON.plain.html`.
  - Le `responseText` contient aussi `json.notifications`.

### Autoattack

- `api.attack.planner` -> `data/Autoattack.attack.planner.json`
  - `data.attacks` (liste), `templates`, `l10n`, `menu`, `t_token`.
- `api.attack.townInfoAttack` -> `data/Autoattack.attack.townInfoAttack.txt`
  - Erreur JS locale (attack undefined), pas de reponse serveur.
- `api.attack.sendUnits` -> `data/Autoattack.attack.sendUnits.txt`
  - Erreur JS locale (attack undefined), pas de reponse serveur.
