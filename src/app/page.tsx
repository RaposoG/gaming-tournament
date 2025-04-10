"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { storageService } from "@/services/storage";
import { Tournament } from "@/types/tournament";
import { ArrowRight, Calendar, Plus, Users } from "lucide-react";
import Link from "next/link";
import { ModeToggle } from "@/components/toggle/theme";

export default function Home() {
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);

  useEffect(() => {
    const loadTournaments = () => {
      const loadedTournaments = storageService.getTournaments();
      setTournaments(loadedTournaments);
    };

    loadTournaments();
  }, []);

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Torneios</h1>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Link href="/tournaments/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Torneio
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tournaments.map((tournament) => (
          <Card key={tournament.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push(`/tournaments/${tournament.id}`)}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{tournament.name}</span>
                <Button variant="ghost" size="icon">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{tournament.players.length} jogadores</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{tournament.matches.length} jogos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${tournament.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{tournament.status === "completed" ? "Finalizado" : "Em andamento"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {tournaments.length === 0 && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground mb-4">Nenhum torneio encontrado</p>
            <Link href="/tournaments/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Torneio
              </Button>
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
