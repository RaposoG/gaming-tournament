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
    homePlayerId: "",
    awayPlayerId: "",
    date: "",
    time: "",
  });
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
  }, [resolvedParams.id, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.date || !formData.time) {
      toast.error("Por favor, preencha a data e hora do jogo");
      return;
    }

    if (!formData.homePlayerId || !formData.awayPlayerId) {
      toast.error("Por favor, selecione os jogadores para o jogo");
      return;
    }

    if (formData.homePlayerId === formData.awayPlayerId) {
      toast.error("Os jogadores não podem ser iguais");
      return;
    }

    const homePlayer = tournament!.players.find((p) => p === formData.homePlayerId);
    const awayPlayer = tournament!.players.find((p) => p === formData.awayPlayerId);

    if (!homePlayer || !awayPlayer) {
      toast.error("Jogadores não encontrados");
      return;
    }

    const homeTeam: Team = {
      id: crypto.randomUUID(),
      name: homePlayer,
      game: tournament!.game,
      players: [homePlayer],
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    };

    const awayTeam: Team = {
      id: crypto.randomUUID(),
      name: awayPlayer,
      game: tournament!.game,
      players: [awayPlayer],
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
                    Jogador 1
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Select value={formData.homePlayerId} onValueChange={(value) => setFormData({ ...formData, homePlayerId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um jogador" />
                        </SelectTrigger>
                        <SelectContent>
                          {tournament.players.map((player) => (
                            <SelectItem key={player} value={player}>
                              {player}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Jogador 2
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Select value={formData.awayPlayerId} onValueChange={(value) => setFormData({ ...formData, awayPlayerId: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um jogador" />
                        </SelectTrigger>
                        <SelectContent>
                          {tournament.players.map((player) => (
                            <SelectItem key={player} value={player}>
                              {player}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
