"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament, Team, Match } from "@/types/tournament";
import { ArrowLeft, Users } from "lucide-react";
import { toast } from "sonner";
import { use } from "react";

export default function NewMatch({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState({
    homeTeamId: "",
    awayTeamId: "",
    date: "",
    time: "",
  });
  const [homeTeamPlayers, setHomeTeamPlayers] = useState<string[]>([]);
  const [awayTeamPlayers, setAwayTeamPlayers] = useState<string[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState<string[]>([]);
  const resolvedParams = use(params);

  useEffect(() => {
    const tournaments = storageService.getTournaments();
    const foundTournament = tournaments.find((t) => t.id === resolvedParams.id);

    if (!foundTournament) {
      toast.error("Torneio não encontrado");
      router.push("/");
      return;
    }

    setTournament(foundTournament);
    setAvailablePlayers(foundTournament.players);
  }, [resolvedParams.id, router]);

  const handleAddPlayerToTeam = (player: string, team: "home" | "away") => {
    if (team === "home") {
      setHomeTeamPlayers([...homeTeamPlayers, player]);
    } else {
      setAwayTeamPlayers([...awayTeamPlayers, player]);
    }
    setAvailablePlayers(availablePlayers.filter((p) => p !== player));
  };

  const handleRemovePlayerFromTeam = (player: string, team: "home" | "away") => {
    if (team === "home") {
      setHomeTeamPlayers(homeTeamPlayers.filter((p) => p !== player));
    } else {
      setAwayTeamPlayers(awayTeamPlayers.filter((p) => p !== player));
    }
    setAvailablePlayers([...availablePlayers, player]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      toast.error("Por favor, preencha a data e hora do jogo");
      return;
    }

    if (homeTeamPlayers.length === 0 || awayTeamPlayers.length === 0) {
      toast.error("Por favor, selecione os jogadores para ambos os times");
      return;
    }

    const homeTeam: Team = {
      id: crypto.randomUUID(),
      name: `Time ${homeTeamPlayers.join(", ")}`,
      game: tournament!.game,
      players: homeTeamPlayers,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };

    const awayTeam: Team = {
      id: crypto.randomUUID(),
      name: `Time ${awayTeamPlayers.join(", ")}`,
      game: tournament!.game,
      players: awayTeamPlayers,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };

    const newMatch: Match = {
      id: crypto.randomUUID(),
      homeTeam,
      awayTeam,
      homeScore: 0,
      awayScore: 0,
      date: formData.date,
      time: formData.time,
      status: "pending",
      game: tournament!.game,
    };

    const updatedTournament = {
      ...tournament!,
      matches: [...tournament!.matches, newMatch],
    };

    storageService.saveTournament(updatedTournament);
    toast.success("Jogo adicionado com sucesso!");
    router.push(`/tournaments/${resolvedParams.id}`);
  };

  if (!tournament) {
    return null;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.push(`/tournaments/${resolvedParams.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold">Novo Jogo</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Adicionar Novo Jogo</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="date" className="text-sm font-medium">
                  Data do Jogo
                </label>
                <Input id="date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </div>

              <div className="space-y-2">
                <label htmlFor="time" className="text-sm font-medium">
                  Horário do Jogo
                </label>
                <Input id="time" type="time" value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Time da Casa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jogadores Disponíveis</label>
                      <Select onValueChange={(value) => handleAddPlayerToTeam(value, "home")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um jogador" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlayers.map((player) => (
                            <SelectItem key={player} value={player}>
                              {player}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jogadores Selecionados</label>
                      <div className="space-y-2">
                        {homeTeamPlayers.map((player) => (
                          <div key={player} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                            <span>{player}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemovePlayerFromTeam(player, "home")}>
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Time Visitante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jogadores Disponíveis</label>
                      <Select onValueChange={(value) => handleAddPlayerToTeam(value, "away")}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um jogador" />
                        </SelectTrigger>
                        <SelectContent>
                          {availablePlayers.map((player) => (
                            <SelectItem key={player} value={player}>
                              {player}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Jogadores Selecionados</label>
                      <div className="space-y-2">
                        {awayTeamPlayers.map((player) => (
                          <div key={player} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                            <span>{player}</span>
                            <Button type="button" variant="ghost" size="sm" onClick={() => handleRemovePlayerFromTeam(player, "away")}>
                              Remover
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/tournaments/${resolvedParams.id}`)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Jogo</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
