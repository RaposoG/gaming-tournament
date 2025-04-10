"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament, Team } from "@/types/tournament";
import { toast } from "sonner";
import { PlusCircle, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function NewTournament() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    game: "",
    startDate: "",
    maxPlayers: "",
    scheduleType: "manual",
  });
  const [players, setPlayers] = useState<string[]>([]);
  const [newPlayer, setNewPlayer] = useState("");

  const handleAddPlayer = () => {
    if (!newPlayer.trim()) {
      toast.error("Por favor, insira um nome de jogador");
      return;
    }

    if (players.length >= parseInt(formData.maxPlayers)) {
      toast.error(`Limite máximo de ${formData.maxPlayers} jogadores atingido`);
      return;
    }

    if (players.includes(newPlayer.trim())) {
      toast.error("Este jogador já foi adicionado");
      return;
    }

    setPlayers([...players, newPlayer.trim()]);
    setNewPlayer("");
  };

  const handleRemovePlayer = (player: string) => {
    setPlayers(players.filter((p) => p !== player));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.game || !formData.startDate || !formData.maxPlayers) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      return;
    }

    if (players.length === 0) {
      toast.error("Adicione pelo menos um jogador ao torneio");
      return;
    }

    // Create initial teams for each player with zero points
    const initialTeams: Team[] = players.map((player) => ({
      id: crypto.randomUUID(),
      name: player,
      game: formData.game,
      players: [player],
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
    }));

    const newTournament: Tournament = {
      id: crypto.randomUUID(),
      name: formData.name,
      game: formData.game,
      teams: initialTeams,
      matches: [],
      startDate: formData.startDate,
      status: "upcoming",
      maxPlayers: parseInt(formData.maxPlayers),
      players: players,
      scheduleType: formData.scheduleType as "manual" | "automatic",
    };

    storageService.saveTournament(newTournament);
    toast.success("Torneio criado com sucesso!");
    router.push("/");
  };

  return (
    <main className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Criar Novo Torneio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome do Torneio
              </label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Brasileirão de League of Legends" />
            </div>

            <div className="space-y-2">
              <label htmlFor="game" className="text-sm font-medium">
                Jogo
              </label>
              <Input id="game" value={formData.game} onChange={(e) => setFormData({ ...formData, game: e.target.value })} placeholder="Ex: League of Legends" />
            </div>

            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium">
                Data de Início
              </label>
              <Input id="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="maxPlayers" className="text-sm font-medium">
                  Número Máximo de Jogadores
                </label>
                <Input id="maxPlayers" type="number" min="2" value={formData.maxPlayers} onChange={(e) => setFormData({ ...formData, maxPlayers: e.target.value })} placeholder="Ex: 8" />
              </div>

              <div className="space-y-2">
                <label htmlFor="scheduleType" className="text-sm font-medium">
                  Tipo de Programação
                </label>
                <Select value={formData.scheduleType} onValueChange={(value) => setFormData({ ...formData, scheduleType: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de programação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="manual">Manual</SelectItem>
                    <SelectItem value="automatic">Automática</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Jogadores</label>
              <div className="flex gap-2">
                <Input value={newPlayer} onChange={(e) => setNewPlayer(e.target.value)} placeholder="Nome do jogador" />
                <Button type="button" onClick={handleAddPlayer}>
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {players.map((player) => (
                  <div key={player} className="flex items-center justify-between p-2 bg-gray-100 rounded-md">
                    <span>{player}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemovePlayer(player)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500">
                {players.length} de {formData.maxPlayers || "?"} jogadores
              </p>
            </div>

            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={() => router.push("/")}>
                Cancelar
              </Button>
              <Button type="submit">Criar Torneio</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
