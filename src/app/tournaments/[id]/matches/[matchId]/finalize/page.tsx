"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament, Match } from "@/types/tournament";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";
import { use } from "react";

export default function FinalizeMatch({ params }: { params: Promise<{ id: string; matchId: string }> }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [match, setMatch] = useState<Match | null>(null);
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

    const foundMatch = foundTournament.matches.find((m) => m.id === resolvedParams.matchId);

    if (!foundMatch) {
      toast.error("Jogo não encontrado");
      router.push(`/tournaments/${resolvedParams.id}`);
      return;
    }

    setTournament(foundTournament);
    setMatch(foundMatch);
  }, [resolvedParams.id, resolvedParams.matchId, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!tournament || !match) return;

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
    router.push(`/tournaments/${resolvedParams.id}`);
  };

  if (!tournament || !match) {
    return null;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.push(`/tournaments/${resolvedParams.id}`)}>
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
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <div className="text-center text-lg font-medium">
              {match.homeTeam.name} vs {match.awayTeam.name}
            </div>
            <div className="text-center text-sm text-gray-500 mt-1">
              {new Date(match.date).toLocaleDateString()} {match.time}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="text-center font-medium">{match.homeTeam.name}</div>
                <div className="space-y-2">
                  <label htmlFor="homeScore" className="text-sm font-medium">
                    Placar
                  </label>
                  <Input id="homeScore" type="number" min="0" value={scores.homeScore} onChange={(e) => setScores({ ...scores, homeScore: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jogadores</label>
                  <div className="space-y-2">
                    {match.homeTeam.players.map((player) => (
                      <div key={player} className="p-2 bg-gray-100 rounded-md">
                        {player}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center font-medium">{match.awayTeam.name}</div>
                <div className="space-y-2">
                  <label htmlFor="awayScore" className="text-sm font-medium">
                    Placar
                  </label>
                  <Input id="awayScore" type="number" min="0" value={scores.awayScore} onChange={(e) => setScores({ ...scores, awayScore: e.target.value })} placeholder="0" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Jogadores</label>
                  <div className="space-y-2">
                    {match.awayTeam.players.map((player) => (
                      <div key={player} className="p-2 bg-gray-100 rounded-md">
                        {player}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push(`/tournaments/${resolvedParams.id}`)}>
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
