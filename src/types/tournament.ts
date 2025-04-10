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

export interface Territory {
  id: string;
  name: string;
  ownerId?: string; // ID do jogador que é dono do território
  color?: string; // Cor do território
  flag?: string; // URL da bandeira do território
  position: {
    x: number;
    y: number;
  };
  connections: string[]; // IDs dos territórios conectados
}

export interface GeopoliticalMatch {
  id: string;
  attackerId: string; // ID do jogador atacante
  defenderId?: string; // ID do jogador defensor (opcional, pode ser um território sem dono)
  attackerTerritoryId: string; // ID do território de origem do ataque
  defenderTerritoryId: string; // ID do território alvo do ataque
  winnerId?: string; // ID do jogador vencedor
  homeScore?: number; // Pontuação do atacante
  awayScore?: number; // Pontuação do defensor
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
  type: "standard" | "geopolitical";
  // Campos específicos para torneios geopolíticos
  territories?: Territory[];
  geopoliticalMatches?: GeopoliticalMatch[];
  currentTurn?: string; // ID do jogador cujo turno é atual
  turnOrder?: string[]; // Ordem dos turnos dos jogadores
}
