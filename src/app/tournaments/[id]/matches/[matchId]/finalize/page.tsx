"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament, Match, GeopoliticalMatch } from "@/types/tournament";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { use } from "react";

export default function FinalizeMatch({ params }: { params: Promise<{ id: string; matchId: string }> }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
  const [geopoliticalMatch, setGeopoliticalMatch] = useState<GeopoliticalMatch | null>(null);
  const [scores, setScores] = useState({
    homeScore: "",
    awayScore: "",
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

    // Verifica se é um torneio geopolítico
    if (foundTournament.type === "geopolitical") {
      const foundMatch = foundTournament.geopoliticalMatches?.find((m) => m.id === resolvedParams.matchId);

      if (!foundMatch) {
        toast.error("Jogo não encontrado");
        router.push(`/tournaments/${resolvedParams.id}/map`);
        return;
      }

      setTournament(foundTournament);
      setGeopoliticalMatch(foundMatch);
    } else {
      const foundMatch = foundTournament.matches.find((m) => m.id === resolvedParams.matchId);

      if (!foundMatch) {
        toast.error("Jogo não encontrado");
        router.push(`/tournaments/${resolvedParams.id}`);
        return;
      }

      setTournament(foundTournament);
      setMatch(foundMatch);
    }
  }, [resolvedParams.id, resolvedParams.matchId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournament) return;

    if (tournament.type === "geopolitical" && geopoliticalMatch) {
      if (!scores.homeScore || !scores.awayScore) {
        toast.error("Por favor, preencha o placar completo");
        return;
      }

      const homeScore = parseInt(scores.homeScore);
      const awayScore = parseInt(scores.awayScore);

      if (isNaN(homeScore) || isNaN(awayScore)) {
        toast.error("Por favor, insira valores numéricos válidos");
        return;
      }

      // Determina o vencedor
      const winnerId = homeScore > awayScore ? geopoliticalMatch.attackerId : homeScore < awayScore ? geopoliticalMatch.defenderId : null;

      // Atualiza o jogo com os resultados
      const updatedMatch: GeopoliticalMatch = {
        ...geopoliticalMatch,
        homeScore,
        awayScore,
        status: "completed",
        winnerId: winnerId!,
      };

      // Atualiza o território alvo com o novo dono
      const updatedTerritories = tournament.territories?.map((territory) => {
        if (territory.id === geopoliticalMatch.defenderTerritoryId && winnerId === geopoliticalMatch.attackerId) {
          return {
            ...territory,
            ownerId: geopoliticalMatch.attackerId,
          };
        }
        return territory;
      });

      // Atualiza a ordem de turnos
      const updatedTurnOrder = [...(tournament.turnOrder || [])];
      const currentPlayerIndex = updatedTurnOrder.indexOf(tournament.currentTurn || "");

      // Move para o próximo jogador
      const nextPlayerIndex = (currentPlayerIndex + 1) % updatedTurnOrder.length;
      const nextPlayer = updatedTurnOrder[nextPlayerIndex];

      // Atualiza o torneio com o jogo atualizado
      const updatedMatches = tournament.geopoliticalMatches?.map((m) => (m.id === geopoliticalMatch.id ? updatedMatch : m)) || [];

      const updatedTournament: Tournament = {
        ...tournament,
        territories: updatedTerritories,
        geopoliticalMatches: updatedMatches,
        currentTurn: nextPlayer,
      };

      // Salva o torneio atualizado
      storageService.saveTournament(updatedTournament);
      toast.success("Jogo finalizado com sucesso!");

      // Redireciona para o mapa
      router.push(`/tournaments/${resolvedParams.id}/map`);
    } else if (match) {
      if (!scores.homeScore || !scores.awayScore) {
        toast.error("Por favor, preencha o placar completo");
        return;
      }

      const homeScore = parseInt(scores.homeScore);
      const awayScore = parseInt(scores.awayScore);

      if (isNaN(homeScore) || isNaN(awayScore)) {
        toast.error("Por favor, insira valores numéricos válidos");
        return;
      }

      // Update the match with the scores
      const updatedMatch: Match = {
        ...match,
        homeScore,
        awayScore,
        status: "completed",
      };

      // Update the tournament with the updated match
      const updatedMatches = tournament.matches.map((m) => (m.id === match.id ? updatedMatch : m));

      const updatedTournament: Tournament = {
        ...tournament,
        matches: updatedMatches,
      };

      // Save the updated tournament
      storageService.saveTournament(updatedTournament);
      toast.success("Jogo finalizado com sucesso!");

      // Forçar atualização da página de detalhes
      setTimeout(() => {
        router.push(`/tournaments/${resolvedParams.id}?t=${Date.now()}`);
      }, 500);
    }
  };

  if (!tournament) {
    return null;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.push(tournament.type === "geopolitical" ? `/tournaments/${resolvedParams.id}/map` : `/tournaments/${resolvedParams.id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold">Finalizar Jogo</h1>
      </div>

      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Registrar Resultado</CardTitle>
        </CardHeader>
        <CardContent>
          {tournament.type === "geopolitical" && geopoliticalMatch ? (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="text-center text-lg font-medium">
                {geopoliticalMatch.attackerId} vs {geopoliticalMatch.defenderId || "Território Livre"}
              </div>
              <div className="text-center text-sm text-muted-foreground mt-1">
                {new Date(geopoliticalMatch.date).toLocaleDateString()} {geopoliticalMatch.time}
              </div>
              <div className="text-center text-sm text-muted-foreground mt-1">Território de origem: {geopoliticalMatch.attackerTerritoryId}</div>
              <div className="text-center text-sm text-muted-foreground">Território alvo: {geopoliticalMatch.defenderTerritoryId}</div>
            </div>
          ) : match ? (
            <div className="mb-6 p-4 bg-muted rounded-lg">
              <div className="text-center text-lg font-medium">
                {match.homeTeam.players[0]} vs {match.awayTeam.players[0]}
              </div>
              <div className="text-center text-sm text-muted-foreground mt-1">
                {new Date(match.date).toLocaleDateString()} {match.time}
              </div>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-center font-medium">{tournament.type === "geopolitical" && geopoliticalMatch ? geopoliticalMatch.attackerId : match?.homeTeam.players[0]}</div>
                <div className="space-y-2">
                  <label htmlFor="homeScore" className="text-sm font-medium">
                    Placar
                  </label>
                  <Input id="homeScore" type="number" min="0" value={scores.homeScore} onChange={(e) => setScores({ ...scores, homeScore: e.target.value })} placeholder="0" />
                </div>
                {tournament.type !== "geopolitical" && match && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jogadores</label>
                    <div className="space-y-2">
                      {match.homeTeam.players.map((player) => (
                        <div key={player} className="p-2 bg-muted rounded-md">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-center font-medium">{tournament.type === "geopolitical" && geopoliticalMatch ? geopoliticalMatch.defenderId || "Território Livre" : match?.awayTeam.players[0]}</div>
                <div className="space-y-2">
                  <label htmlFor="awayScore" className="text-sm font-medium">
                    Placar
                  </label>
                  <Input id="awayScore" type="number" min="0" value={scores.awayScore} onChange={(e) => setScores({ ...scores, awayScore: e.target.value })} placeholder="0" />
                </div>
                {tournament.type !== "geopolitical" && match && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Jogadores</label>
                    <div className="space-y-2">
                      {match.awayTeam.players.map((player) => (
                        <div key={player} className="p-2 bg-muted rounded-md">
                          {player}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push(tournament.type === "geopolitical" ? `/tournaments/${resolvedParams.id}/map` : `/tournaments/${resolvedParams.id}`)}>
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Salvar Resultado
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
