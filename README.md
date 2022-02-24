# graphql-fpl

A GraphQL wrapper for the Fantasy Premier League API, using node and graphql-yoga. [Demo](http://graphql-fpl.herokuapp.com/)

### Collaborations
A special thank you to @tanayv for his collaboration to fix errors related to axios. Collaborations are happily welcomed.

## FPL Rest API endpoints

- https://fantasy.premierleague.com/api/bootstrap-static/ : events (gameweeks), teams, players, game settings, phases,
  and elements (players)
- https://fantasy.premierleague.com/api/fixtures/ : fixtures
- [https://fantasy.premierleague.com/api/element-summary/{player_id}/](https://fantasy.premierleague.com/api/element-summary/215/) :
  stats of a given player.
- [https://fantasy.premierleague.com/api/event/{event_id}/live/](https://fantasy.premierleague.com/api/event/3/live/) : live
  stats, by player, for a given gameweek, and how much points he scored in fantasy.
- [https://fantasy.premierleague.com/api/entry/{entry_id}/history/](https://fantasy.premierleague.com/api/entry/663372/history/) :
  data for a given entry (a fantasy team) for the past gameweeks of the season, plus past seasons.
- [https://fantasy.premierleague.com/api/entry/{entry_id}/event/{event_id}/picks/](https://fantasy.premierleague.com/api/entry/6043795/event/3/picks/) :
  data of picks of a given fpl team for a given entry (gameweek)

## Usage

1. Download or clone this repository

```
git clone https://github.com/lastmaj/fpl-graphql.git
```

2. Move to the project directory and install dependencies

```
cd fpl-graphql
npm install
```

3. Start the server

```
npm start
```

The server will run at http://localhost:4000 with a graphql playground (browse docs and schema to know more about queries)

### Example

![2019-09-05 19_46_36-Playground - http___localhost_4000_](https://user-images.githubusercontent.com/16566237/64362042-d3a65380-d01e-11e9-9abe-cddfc84e5469.png)
Aguero's live stats for the 4the gameweek. You didn't captain him did you ?

## Feel free to fork :fork_and_knife:

If it helps you build something awesome, let me know.
Contributions are happily welcome.
