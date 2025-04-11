"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament, Team } from "@/types/tournament";
import { ArrowLeft, Calendar, Flag, PlusCircle, Users } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { use } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TournamentDetails({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [standings, setStandings] = useState<Team[]>([]);
  const resolvedParams = use(params);
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");

  useEffect(() => {
    const loadTournamentData = () => {
      const tournaments = storageService.getTournaments();
      const foundTournament = tournaments.find((t) => t.id === resolvedParams.id);

      if (!foundTournament) {
        toast.error("Torneio não encontrado");
        router.push("/");
        return;
      }

      setTournament(foundTournament);
      calculateStandings(foundTournament);
    };

    loadTournamentData();
  }, [resolvedParams.id, router, searchParams]);

  const calculateStandings = (tournament: Tournament) => {
    // Criar um objeto para armazenar as estatísticas dos jogadores
    const playerStatsObj: Record<
      string,
      {
        name: string;
        points: number;
        goalsFor: number;
        goalsAgainst: number;
        wins: number;
        draws: number;
        losses: number;
      }
    > = {};

    // Inicializar estatísticas para todos os jogadores
    tournament.players.forEach((player) => {
      playerStatsObj[player] = {
        name: player,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        wins: 0,
        draws: 0,
        losses: 0,
      };
    });

    // Calcular estatísticas com base nos jogos
    tournament.matches.forEach((match) => {
      if (match.status === "completed") {
        const homePlayer = match.homeTeam.players[0];
        const awayPlayer = match.awayTeam.players[0];

        const homeStats = playerStatsObj[homePlayer];
        const awayStats = playerStatsObj[awayPlayer];

        if (homeStats && awayStats) {
          homeStats.goalsFor += match.homeScore;
          homeStats.goalsAgainst += match.awayScore;
          awayStats.goalsFor += match.awayScore;
          awayStats.goalsAgainst += match.homeScore;

          if (match.homeScore > match.awayScore) {
            homeStats.wins++;
            awayStats.losses++;
          } else if (match.homeScore < match.awayScore) {
            awayStats.wins++;
            homeStats.losses++;
          } else {
            homeStats.draws++;
            awayStats.draws++;
          }
        }
      }
    });

    // Calcular pontos e criar objetos Team
    const standings = Object.values(playerStatsObj).map((stats) => {
      const points = stats.wins * 3 + stats.draws;
      return {
        id: crypto.randomUUID(),
        name: stats.name,
        game: tournament.game,
        players: [stats.name],
        points: points,
        wins: stats.wins,
        draws: stats.draws,
        losses: stats.losses,
        goalsFor: stats.goalsFor,
        goalsAgainst: stats.goalsAgainst,
      } as Team;
    });

    const sortedStandings = standings.sort((a, b) => {
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

  const handleAddPlayer = () => {
    if (!tournament || !newPlayerName.trim()) return;

    // Verificar se o jogador já existe
    if (tournament.players.includes(newPlayerName.trim())) {
      toast.error("Este jogador já está no torneio");
      return;
    }

    // Verificar se o torneio já atingiu o número máximo de jogadores
    if (tournament.players.length >= tournament.maxPlayers) {
      toast.error(`O torneio já atingiu o número máximo de ${tournament.maxPlayers} jogadores`);
      return;
    }

    // Adicionar o novo jogador
    const updatedTournament = {
      ...tournament,
      players: [...tournament.players, newPlayerName.trim()],
    };

    // Salvar o torneio atualizado
    storageService.saveTournament(updatedTournament);
    setTournament(updatedTournament);
    calculateStandings(updatedTournament);

    // Limpar o formulário e fechar o modal
    setNewPlayerName("");
    setIsAddPlayerModalOpen(false);

    toast.success(`Jogador ${newPlayerName.trim()} adicionado com sucesso!`);
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
                  <TableRow key={team.name}>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Jogadores ({tournament.players.length}/{tournament.maxPlayers})
            </CardTitle>
            {tournament.status !== "completed" && tournament.players.length < tournament.maxPlayers && (
              <Button variant="outline" size="sm" onClick={() => setIsAddPlayerModalOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Jogador
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tournament.players.map((player, index) => (
                <div key={`${player}-${index}`} className="p-2 bg-muted rounded-md">
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
                  <div className="flex-1 text-right">{match.homeTeam.players[0]}</div>
                  <div className="px-4 font-bold">{match.status === "completed" ? `${match.homeScore} - ${match.awayScore}` : "VS"}</div>
                  <div className="flex-1 text-left">{match.awayTeam.players[0]}</div>
                  <div className="ml-4 text-sm text-muted-foreground">
                    {new Date(match.date).toLocaleDateString()} {match.time}
                  </div>
                  {match.status === "pending" && tournament.status !== "completed" && (
                    <Button variant="outline" size="sm" className="ml-4" onClick={() => handleFinalizeMatch(match.id)}>
                      Finalizar
                    </Button>
                  )}
                </div>
              ))}

              {tournament.matches.length === 0 && <div className="text-center py-8 text-muted-foreground">Nenhum jogo registrado</div>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal para adicionar novo jogador */}
      <Dialog open={isAddPlayerModalOpen} onOpenChange={setIsAddPlayerModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Jogador</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="playerName">Nome do Jogador</Label>
              <Input id="playerName" value={newPlayerName} onChange={(e) => setNewPlayerName(e.target.value)} placeholder="Digite o nome do jogador" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddPlayerModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPlayer}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
