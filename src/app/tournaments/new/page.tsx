"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament } from "@/types/tournament";
import { ArrowLeft, Plus, Trash } from "lucide-react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export default function NewTournament() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [players, setPlayers] = useState<string[]>([""]);

  const handleAddPlayer = () => {
    setPlayers([...players, ""]);
  };

  const handleRemovePlayer = (index: number) => {
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

  const handlePlayerChange = (index: number, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = value;
    setPlayers(newPlayers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error("Por favor, insira o nome do torneio");
      return;
    }

    const validPlayers = players.filter((player) => player.trim() !== "");
    if (validPlayers.length < 2) {
      toast.error("Por favor, insira pelo menos 2 jogadores");
      return;
    }

    const tournament: Tournament = {
      id: uuidv4(),
      name,
      players: validPlayers,
      matches: [],
      status: "in_progress",
    };

    storageService.saveTournament(tournament);
    toast.success("Torneio criado com sucesso!");
    router.push(`/tournaments/${tournament.id}`);
  };

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <h1 className="text-4xl font-bold">Novo Torneio</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Criar Torneio</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Nome do Torneio
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Digite o nome do torneio" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Jogadores</label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddPlayer}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Jogador
                </Button>
              </div>

              <div className="space-y-2">
                {players.map((player, index) => (
                  <div key={index} className="flex gap-2">
                    <Input value={player} onChange={(e) => handlePlayerChange(index, e.target.value)} placeholder={`Jogador ${index + 1}`} />
                    {players.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => handleRemovePlayer(index)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-4">
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
