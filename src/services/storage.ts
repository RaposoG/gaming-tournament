import { Tournament, Team, Match } from "@/types/tournament";

const STORAGE_KEYS = {
  TOURNAMENTS: "tournaments",
  TEAMS: "teams",
  MATCHES: "matches",
};

export const storageService = {
  // Tournament operations
  getTournaments: (): Tournament[] => {
    if (typeof window === "undefined") return [];
    const tournaments = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
    return tournaments ? JSON.parse(tournaments) : [];
  },

  saveTournament: (tournament: Tournament) => {
    const tournaments = storageService.getTournaments();
    const index = tournaments.findIndex((t) => t.id === tournament.id);

    if (index >= 0) {
      tournaments[index] = tournament;
    } else {
      tournaments.push(tournament);
    }

    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
  },

  deleteTournament: (id: string) => {
    const tournaments = storageService.getTournaments();
    const filtered = tournaments.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(filtered));
  },

  // Team operations
  getTeams: (): Team[] => {
    if (typeof window === "undefined") return [];
    const teams = localStorage.getItem(STORAGE_KEYS.TEAMS);
    return teams ? JSON.parse(teams) : [];
  },

  saveTeam: (team: Team) => {
    const teams = storageService.getTeams();
    const index = teams.findIndex((t) => t.id === team.id);

    if (index >= 0) {
      teams[index] = team;
    } else {
      teams.push(team);
    }

    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
  },

  deleteTeam: (id: string) => {
    const teams = storageService.getTeams();
    const filtered = teams.filter((t) => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(filtered));
  },

  // Match operations
  getMatches: (): Match[] => {
    if (typeof window === "undefined") return [];
    const matches = localStorage.getItem(STORAGE_KEYS.MATCHES);
    return matches ? JSON.parse(matches) : [];
  },

  saveMatch: (match: Match) => {
    const matches = storageService.getMatches();
    const index = matches.findIndex((m) => m.id === match.id);

    if (index >= 0) {
      matches[index] = match;
    } else {
      matches.push(match);
    }

    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  },

  deleteMatch: (id: string) => {
    const matches = storageService.getMatches();
    const filtered = matches.filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(filtered));
  },
};
