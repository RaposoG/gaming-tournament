"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament } from "@/types/tournament";
import { PlusCircle, Trophy, Users, Calendar } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const loadedTournaments = storageService.getTournaments();
    setTournaments(loadedTournaments);
  }, []);

  return (
    <main className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Torneios de Jogos</h1>
        <Link href="/tournaments/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Torneio
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <Link href={`/tournaments/${tournament.id}`} key={tournament.id}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  {tournament.name}
                </CardTitle>
                <CardDescription>{tournament.game}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{tournament.teams.length} times</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>Início: {new Date(tournament.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="mt-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${tournament.status === "ongoing" ? "bg-green-100 text-green-800" : tournament.status === "completed" ? "bg-gray-100 text-gray-800" : "bg-blue-100 text-blue-800"}`}>{tournament.status === "ongoing" ? "Em andamento" : tournament.status === "completed" ? "Finalizado" : "Próximo"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {tournaments.length === 0 && (
          <div className="col-span-full text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">Nenhum torneio encontrado</h2>
            <p className="text-gray-500">Crie seu primeiro torneio clicando no botão "Novo Torneio"</p>
          </div>
        )}
      </div>
    </main>
  );
}
