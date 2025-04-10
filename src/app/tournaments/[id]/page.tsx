"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament, Team } from "@/types/tournament";
import { PlusCircle, ArrowLeft, Users, Calendar, Flag } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { use } from "react";

export default function TournamentDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<Team[]>([]);
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
    calculateStandings(foundTournament);
  }, [resolvedParams.id, router]);

  const calculateStandings = (tournament: Tournament) => {
    const teamsWithStats = tournament.teams.map((team) => ({
      ...team,
      points: team.wins * 3 + team.draws,
      goalsFor: 0,
      goalsAgainst: 0,
      wins: 0,
      draws: 0,
      losses: 0,
    }));

    tournament.matches.forEach((match) => {
      if (match.status === "completed") {
        const homeTeam = teamsWithStats.find((t) => t.id === match.homeTeam.id);
        const awayTeam = teamsWithStats.find((t) => t.id === match.awayTeam.id);

        if (homeTeam && awayTeam) {
          homeTeam.goalsFor += match.homeScore;
          homeTeam.goalsAgainst += match.awayScore;
          awayTeam.goalsFor += match.awayScore;
          awayTeam.goalsAgainst += match.homeScore;

          if (match.homeScore > match.awayScore) {
            homeTeam.wins++;
            awayTeam.losses++;
          } else if (match.homeScore < match.awayScore) {
            awayTeam.wins++;
            homeTeam.losses++;
          } else {
            homeTeam.draws++;
            awayTeam.draws++;
          }
        }
      }
    });

    const sortedStandings = teamsWithStats.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const aGD = a.goalsFor - a.goalsAgainst;
      const bGD = b.goalsFor - b.goalsAgainst;
      if (bGD !== aGD) return bGD - aGD;
      return b.goalsFor - a.goalsFor;
    });

    setStandings(sortedStandings);
  };

  const handleFinishTournament = () => {
    if (!tournament) return;

    const updatedTournament = {
      ...tournament,
      status: "completed" as const,
    };

    storageService.saveTournament(updatedTournament);
    setTournament(updatedTournament);
    toast.success("Torneio finalizado com sucesso!");
  };

  const handleFinalizeMatch = (matchId: string) => {
    if (!tournament) return;

    router.push(`/tournaments/${resolvedParams.id}/matches/${matchId}/finalize`);
  };

  if (!tournament) {
    return null;
  }

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold">{tournament.name}</h1>
        {tournament.status !== "completed" && (
          <Button variant="destructive" className="ml-auto" onClick={handleFinishTournament}>
            <Flag className="mr-2 h-4 w-4" />
            Finalizar Torneio
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Classificação</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pos</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-center">P</TableHead>
                  <TableHead className="text-center">J</TableHead>
                  <TableHead className="text-center">V</TableHead>
                  <TableHead className="text-center">E</TableHead>
                  <TableHead className="text-center">D</TableHead>
                  <TableHead className="text-center">GP</TableHead>
                  <TableHead className="text-center">GC</TableHead>
                  <TableHead className="text-center">SG</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((team, index) => (
                  <TableRow key={team.id}>
                    <TableCell>{index + 1}º</TableCell>
                    <TableCell>{team.name}</TableCell>
                    <TableCell className="text-center">{team.points}</TableCell>
                    <TableCell className="text-center">{team.wins + team.draws + team.losses}</TableCell>
                    <TableCell className="text-center">{team.wins}</TableCell>
                    <TableCell className="text-center">{team.draws}</TableCell>
                    <TableCell className="text-center">{team.losses}</TableCell>
                    <TableCell className="text-center">{team.goalsFor}</TableCell>
                    <TableCell className="text-center">{team.goalsAgainst}</TableCell>
                    <TableCell className="text-center">{team.goalsFor - team.goalsAgainst}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Jogadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tournament.players.map((player) => (
                <div key={player} className="p-2 bg-gray-100 rounded-md">
                  {player}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Jogos
            </CardTitle>
            {tournament.status !== "completed" && (
              <Link href={`/tournaments/${resolvedParams.id}/matches/new`}>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Novo Jogo
                </Button>
              </Link>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tournament.matches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 text-right">{match.homeTeam.name}</div>
                  <div className="px-4 font-bold">{match.status === "completed" ? `${match.homeScore} - ${match.awayScore}` : "VS"}</div>
                  <div className="flex-1 text-left">{match.awayTeam.name}</div>
                  <div className="ml-4 text-sm text-gray-500">
                    {new Date(match.date).toLocaleDateString()} {match.time}
                  </div>
                  {match.status === "pending" && tournament.status !== "completed" && (
                    <Button variant="outline" size="sm" className="ml-4" onClick={() => handleFinalizeMatch(match.id)}>
                      Finalizar
                    </Button>
                  )}
                </div>
              ))}

              {tournament.matches.length === 0 && <div className="text-center py-8 text-gray-500">Nenhum jogo registrado</div>}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
