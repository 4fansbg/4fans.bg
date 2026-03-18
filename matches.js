export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");

  const today = new Date();
  const from  = today.toISOString().split("T")[0];
  const to    = new Date(today.getTime() + 14 * 86400000).toISOString().split("T")[0];

  const LEAGUE_IDS = [2021, 2001, 2014, 2002, 2019, 2015, 2003];
  const LEAGUE_INFO = {
    2021: { name: "Premier League",   flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    2001: { name: "Champions League", flag: "⭐" },
    2014: { name: "La Liga",          flag: "🇪🇸" },
    2002: { name: "Bundesliga",       flag: "🇩🇪" },
    2019: { name: "Serie A",          flag: "🇮🇹" },
    2015: { name: "Ligue 1",          flag: "🇫🇷" },
    2003: { name: "Eredivisie",       flag: "🇳🇱" },
  };

  const API_KEY = process.env.VITE_FOOTBALL_API_KEY;
  const all = [];

  for (const id of LEAGUE_IDS) {
    try {
      const r = await fetch(
        `https://api.football-data.org/v4/competitions/${id}/matches?dateFrom=${from}&dateTo=${to}&status=SCHEDULED`,
        { headers: { "X-Auth-Token": API_KEY } }
      );
      const data = await r.json();
      if (data.matches) {
        data.matches.slice(0, 4).forEach((m, i) => {
          const d = new Date(m.utcDate);
          const home = Math.floor(Math.random() * 50) + 20;
          const draw = Math.floor(Math.random() * 30) + 10;
          const away = Math.max(100 - home - draw, 5);
          all.push({
            id: `${id}-${i}`,
            league: LEAGUE_INFO[id].name,
            flag:   LEAGUE_INFO[id].flag,
            home:   m.homeTeam.shortName || m.homeTeam.name,
            away:   m.awayTeam.shortName || m.awayTeam.name,
            date:   d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
            time:   d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
            prob:   { home, draw, away },
          });
        });
      }
    } catch (e) {
      console.error(`League ${id} failed:`, e.message);
    }
  }

  res.status(200).json({ matches: all });
}
