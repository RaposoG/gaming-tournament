export interface Team {
  id: string;
  name: string;
  game: string;
  players: string[];
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  date: string;
  time: string;
  status: "pending" | "completed";
  game: string;
}

export interface Tournament {
  id: string;
  name: string;
  game: string;
  teams: Team[];
  matches: Match[];
  startDate: string;
  status: "upcoming" | "ongoing" | "completed";
  maxPlayers: number;
  players: string[];
  scheduleType: "manual" | "automatic";
}
