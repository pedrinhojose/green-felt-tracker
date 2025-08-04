import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Users, Settings } from "lucide-react";
import { HostScheduleEntry, Player, Season } from "@/lib/db/models";
import { HostScheduleSetup } from "./HostScheduleSetup";
import { HostScheduleDisplay } from "./HostScheduleDisplay";
import { HostScheduleActions } from "./HostScheduleActions";

interface HostScheduleManagerProps {
  season: Season | null;
  players: Player[];
  hostSchedule: HostScheduleEntry[];
  onUpdateHostSchedule: (schedule: HostScheduleEntry[]) => void;
}

export function HostScheduleManager({ 
  season, 
  players, 
  hostSchedule, 
  onUpdateHostSchedule 
}: HostScheduleManagerProps) {
  const [activeTab, setActiveTab] = useState("setup");

  if (!season) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            Nenhuma temporada ativa. Crie uma temporada primeiro.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Cronograma de Anfitriões
        </CardTitle>
        <CardDescription>
          Configure automaticamente quem será o anfitrião de cada partida da temporada.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="setup" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configuração
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Cronograma
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Ações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="setup" className="space-y-4">
            <HostScheduleSetup
              season={season}
              players={players}
              hostSchedule={hostSchedule}
              onUpdateHostSchedule={onUpdateHostSchedule}
            />
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <HostScheduleDisplay
              hostSchedule={hostSchedule}
              onUpdateEntry={onUpdateHostSchedule}
            />
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <HostScheduleActions
              players={players}
              hostSchedule={hostSchedule}
              onUpdateHostSchedule={onUpdateHostSchedule}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}