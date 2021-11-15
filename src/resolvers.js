const NodeCache = require('node-cache');
const axios = require('axios');

const cache = new NodeCache({ stdTTL: 3600, checkperiod: 3650 });
const baseURI = 'https://fantasy.premierleague.com/api';

//populating cache
//1.Cache boostrap-static

const request = (url) => {
  return axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'graphql-fpl'
    }
  })
    .then((response) => {
      return response.data;
    })
}

request(`${baseURI}/bootstrap-static/`).then((json) => {
  cache.set('events', json.events);
  cache.set('teams', json.teams);
  cache.set('players', json.elements);
});

request(`${baseURI}/bootstrap-static/`).then((json) =>
  cache.set('fixtures', json)
);

const getTeam = (id) => {
  cached = cache.get('teams');
  if (cached == undefined) {
    return request(`${baseURI}/bootstrap-static/`).then(
      (json) => {
        cache.set('teams', json.teams);
        return json.teams.find((t) => t.id == id);
      }
    );
  }
  return cached.find((t) => t.id == id);
};

const getTeamShortName = async (id) => {
  team = await getTeam(id);
  return await team.short_name;
};

const getPlayer = (id) => {
  cached = cache.get('players');
  if (cached == undefined) {
    return request(`${baseURI}/bootstrap-static/`).then(
      (json) => {
        cache.set('players', json.elements);
        return json.elements.find((p) => p.id == id);
      }
    );
  }
  return cached.find((p) => p.id == id);
};

const getPlayerByName = (web_name) => {
  cached = cache.get('players');
  if (cached == undefined) {
    return request(`${baseURI}/bootstrap-static/`).then(
      (json) => {
        cache.set('players', json.elements);
        return json.elements.find((p) => p.web_name === web_name);
      }
    );
  }
  return cached.find((p) => p.web_name == web_name);
};

const resolvers = {
  Query: {
    event: (_, args) => {
      const { id } = args;
      cached = cache.get('events');
      if (cached == undefined) {
        return request(`${baseURI}/bootstrap-static/`).then(
          (json) => {
            cache.set('events', json.events);
            return json.events.find((g) => g.id == id);
          }
        );
      }
      return cached.find((g) => g.id == id);
    },

    events: () => {
      cached = cache.get('events');
      if (cached == undefined) {
        return request(`${baseURI}/bootstrap-static/`).then(
          (json) => {
            cache.set('events', json);
            return json;
          }
        );
      }
      return cached;
    },

    team: (_, args) => getTeam(args.id),

    fixture: (_, args) => {
      const { id } = args;
      cached = cache.get('fixtures');
      if (cached == undefined) {
        return request(`${baseURI}/bootstrap-static/`).then(
          (json) => {
            cache.set('fixtures', json);
            return json.find((f) => f.id == id);
          }
        );
      }
      return cached.find((f) => f.id == id);
    },

    player: (_, args) =>
      args.id ? getPlayer(args.id) : getPlayerByName(args.name),

    entry: async (_, args) => {
      const { id } = args;
      return await request(`${baseURI}/entry/${id}/`);
    },

    entryHistory: async (_, args) => {
      return await request(`${baseURI}/entry/${args.id}/history`);
    },

    live: async (_, args) => {
      data = await request(`${baseURI}/event/${args.event}/live/`);
      elements = data.elements;
      return elements.find((el) => el.id == args.id);
    },

    picks: async (_, args) => {
      return await request(`${baseURI}/entry/${args.entry}/event/${args.event}/picks/`);
    },

    playerSummary: async (_, args) => {
      return await request(`${baseURI}/element-summary/${args.id}/`)
    },
  },

  Team: {
    players: (parent) => {
      const { id } = parent;
      cached = cache.get('players');
      if (cache.get('players') == undefined) {
        return request(`${baseURI}/bootstrap-static/`).then(
          (json) => {
            cache.set('players', json.elements);
            return json.elements.filter((p) => p.team == id);
          }
        );
      }
      return cached.filter((p) => p.team == id);
    },
    fixtures: (parent) => {
      const { id } = parent;
      cached = cache.get('fixtures');
      if (cached == undefined) {
        return request(`${baseURI}/fixtures/`).then((json) => {
          cache.set('fixtures', json);
          return json.filter((x) => x.team_a == id || x.team_a == id);
        });
      }
      return cached.filter((x) => x.team_a == id || x.team_h == id);
    },
  },

  Fixture: {
    team_h: (parent) => getTeam(parent.team_h),

    team_a: (parent) => getTeam(parent.team_a),

    stats: (parent) =>
      parent.stats.filter((x) => x.a.length + x.h.length !== 0),
  },

  FixtureStat: {
    player: (parent) => getPlayer(parent.element),
  },

  Player: {
    team: (parent) => getTeam(parent.team),
  },

  Event: {
    most_selected: (parent) => getPlayer(parent.most_selected),
    most_transferred_in: (parent) => getPlayer(parent.most_transferred_in),
    top_element: (parent) => getPlayer(parent.top_element),
    most_captained: (parent) => getPlayer(parent.most_captained),
    most_vice_captained: (parent) => getPlayer(parent.most_transferred_in),
    fixtures: (parent) => {
      const { id } = parent;
      const cached = cache.get('fixtures');
      if (cached == undefined) {
        return request(`${baseURI}/fixtures/`).then((json) => {
          cache.set('fixtures', json);
          return json.filter((f) => f.event == id);
        });
      }
      return cached.filter((f) => f.event == id);
    },
  },

  EntryHistory: {
    current: (parent) => parent.current,
  },

  EventHistory: {
    event: (parent) => {
      const id = parent.event;
      return request(`${baseURI}/bootstrap-static/`).then((json) => json.events.find((g) => g.id == id));
    },
  },

  Live: {
    player: (parent) => getPlayer(parent.id),
    explain: (parent) => parent.explain[0],
  },

  Explain: {
    fixture: (parent) => {
      const id = parent.fixture;
      return request(`${baseURI}/fixtures/`).then((json) =>
        json.find((f) => f.id == id)
      );
    },
  },

  Pick: {
    player: (parent) => getPlayer(parent.element),
  },

  PlayerSummary: {
    fixtures: async (parent) => {
      return parent.fixtures.map(async (fx) => ({
        ...fx,
        team_h_name: await getTeamShortName(fx.team_h),
        team_a_name: await getTeamShortName(fx.team_a),
      }));
    },

    history: (parent) => {
      return parent.history.map(async (h) => ({
        ...h,
        opponent_team: await getTeamShortName(h.opponent_team),
      }));
    },
  },
};

module.exports = resolvers;
