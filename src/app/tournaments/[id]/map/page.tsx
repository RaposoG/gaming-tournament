"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament, Territory, GeopoliticalMatch } from "@/types/tournament";
import { ArrowLeft, Flag, Map } from "lucide-react";
import { toast } from "sonner";
import { use } from "react";

export default function TournamentMap({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<Territory | null>(null);
  const [targetTerritory, setTargetTerritory] = useState<Territory | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    const loadTournamentData = () => {
      const tournaments = storageService.getTournaments();
      const foundTournament = tournaments.find((t) => t.id === resolvedParams.id);

      if (!foundTournament) {
        toast.error("Torneio não encontrado");
        router.push("/");
        return;
      }

      if (foundTournament.type !== "geopolitical") {
        toast.error("Este torneio não é do tipo geopolítico");
        router.push(`/tournaments/${resolvedParams.id}`);
        return;
      }

      setTournament(foundTournament);
    };

    loadTournamentData();
  }, [resolvedParams.id, router]);

  const handleTerritoryClick = (territory: Territory) => {
    if (!tournament) return;

    // Se não há território selecionado, seleciona este
    if (!selectedTerritory) {
      setSelectedTerritory(territory);
      return;
    }

    // Se o território clicado é o mesmo que já está selecionado, deseleciona
    if (selectedTerritory.id === territory.id) {
      setSelectedTerritory(null);
      setTargetTerritory(null);
      return;
    }

    // Verifica se o território clicado está conectado ao território selecionado
    if (selectedTerritory.connections.includes(territory.id)) {
      setTargetTerritory(territory);
    } else {
      toast.error("Territórios não estão conectados");
    }
  };

  const handleAttack = () => {
    if (!tournament || !selectedTerritory || !targetTerritory) return;

    // Verifica se é o turno do jogador atual
    if (tournament.currentTurn !== selectedTerritory.ownerId) {
      toast.error("Não é seu turno");
      return;
    }

    // Cria um novo jogo geopolítico
    const newMatch: GeopoliticalMatch = {
      id: crypto.randomUUID(),
      attackerId: selectedTerritory.ownerId || "",
      defenderId: targetTerritory.ownerId,
      attackerTerritoryId: selectedTerritory.id,
      defenderTerritoryId: targetTerritory.id,
      date: new Date().toISOString().split("T")[0],
      time: new Date().toTimeString().split(" ")[0].substring(0, 5),
      status: "pending",
      game: tournament.game,
    };

    // Atualiza o torneio com o novo jogo
    const updatedTournament = {
      ...tournament,
      geopoliticalMatches: [...(tournament.geopoliticalMatches || []), newMatch],
    };

    // Salva o torneio atualizado
    storageService.saveTournament(updatedTournament);
    setTournament(updatedTournament);

    // Redireciona para a página de finalização do jogo
    router.push(`/tournaments/${resolvedParams.id}/matches/${newMatch.id}/finalize`);
  };

  const getTerritoryColor = (territory: Territory) => {
    if (!territory.ownerId) return "bg-muted";

    // Encontra o jogador dono do território
    const owner = tournament?.players.find((p) => p === territory.ownerId);
    if (!owner) return "bg-muted";

    // Gera uma cor baseada no nome do jogador
    const colors = ["bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500"];

    const index = tournament?.players.indexOf(owner) || 0;
    return colors[index % colors.length];
  };

  const getTerritoryStyle = (territory: Territory) => {
    const color = getTerritoryColor(territory);
    const isSelected = selectedTerritory?.id === territory.id;
    const isTarget = targetTerritory?.id === territory.id;

    return `
      ${color} 
      ${isSelected ? "ring-4 ring-primary" : ""} 
      ${isTarget ? "ring-4 ring-destructive" : ""}
      absolute rounded-full w-12 h-12 flex items-center justify-center cursor-pointer
      transform -translate-x-1/2 -translate-y-1/2
      hover:scale-110 transition-transform
    `;
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
        <h1 className="text-4xl font-bold">Mapa Geopolítico: {tournament.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              Mapa de Territórios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative w-full h-[500px] border rounded-lg bg-background overflow-hidden">
              {/* Renderiza as conexões entre territórios */}
              {tournament.territories?.map((territory) => (
                <div key={`connections-${territory.id}`}>
                  {territory.connections.map((connectionId) => {
                    const connectedTerritory = tournament.territories?.find((t) => t.id === connectionId);
                    if (!connectedTerritory) return null;

                    return (
                      <svg key={`connection-${territory.id}-${connectionId}`} className="absolute top-0 left-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
                        <line x1={`${territory.position.x}%`} y1={`${territory.position.y}%`} x2={`${connectedTerritory.position.x}%`} y2={`${connectedTerritory.position.y}%`} stroke="var(--border)" strokeWidth="2" />
                      </svg>
                    );
                  })}
                </div>
              ))}

              {/* Renderiza os territórios */}
              {tournament.territories?.map((territory) => (
                <div
                  key={territory.id}
                  className={getTerritoryStyle(territory)}
                  style={{
                    left: `${territory.position.x}%`,
                    top: `${territory.position.y}%`,
                    zIndex: selectedTerritory?.id === territory.id || targetTerritory?.id === territory.id ? 10 : 5,
                  }}
                  onClick={() => handleTerritoryClick(territory)}
                >
                  <span className="text-xs font-bold text-white">{territory.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5" />
              Informações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Turno Atual</h3>
                <p className="text-muted-foreground">{tournament.currentTurn ? tournament.currentTurn : "Nenhum turno definido"}</p>
              </div>

              <div>
                <h3 className="font-medium mb-2">Território Selecionado</h3>
                {selectedTerritory ? (
                  <div className="p-2 bg-muted rounded-md">
                    <p className="font-medium">{selectedTerritory.name}</p>
                    <p className="text-sm text-muted-foreground">Dono: {selectedTerritory.ownerId || "Sem dono"}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum território selecionado</p>
                )}
              </div>

              <div>
                <h3 className="font-medium mb-2">Território Alvo</h3>
                {targetTerritory ? (
                  <div className="p-2 bg-muted rounded-md">
                    <p className="font-medium">{targetTerritory.name}</p>
                    <p className="text-sm text-muted-foreground">Dono: {targetTerritory.ownerId || "Sem dono"}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Nenhum território alvo selecionado</p>
                )}
              </div>

              {selectedTerritory && targetTerritory && (
                <Button className="w-full" onClick={handleAttack} disabled={tournament.currentTurn !== selectedTerritory.ownerId}>
                  Atacar Território
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
