import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TimerState } from "../useTimerState";
import { PersistedTimerState } from "../hooks/useTimerPersistence";
import { TimerDiagnosticInfo } from "../hooks/useTimerDiagnostics";
import { AlertCircle, Clock, Wifi, WifiOff, Activity, RotateCcw } from "lucide-react";

interface TimerRecoveryPanelProps {
  currentState: TimerState;
  savedState: PersistedTimerState | null;
  diagnostics: TimerDiagnosticInfo;
  onRecover: () => void;
  onRestoreBackup: () => void;
  onClearData: () => void;
  onGetDiagnosticReport: () => void;
}

export function TimerRecoveryPanel({
  currentState,
  savedState,
  diagnostics,
  onRecover,
  onRestoreBackup,
  onClearData,
  onGetDiagnosticReport
}: TimerRecoveryPanelProps) {
  const [showDetails, setShowDetails] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('pt-BR');
  };

  return (
    <Card className="w-full max-w-2xl bg-background border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Estado do Timer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status da Conexão */}
        <div className="flex items-center gap-2">
          {diagnostics.isOnline ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-sm">
            {diagnostics.isOnline ? 'Online' : 'Offline'}
          </span>
          
          <Badge variant={diagnostics.connectionStable ? 'default' : 'destructive'}>
            {diagnostics.connectionStable ? 'Estável' : 'Instável'}
          </Badge>
        </div>

        {/* Alertas */}
        {diagnostics.timerResetCount > 0 && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Timer foi resetado {diagnostics.timerResetCount} vez(es). 
              Último reset: {formatTimestamp(diagnostics.lastResetTimestamp)}
            </AlertDescription>
          </Alert>
        )}

        {/* Estado Atual */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Estado Atual</h4>
            <div className="text-sm space-y-1">
              <div>Status: {currentState.isRunning ? '▶️ Rodando' : '⏸️ Pausado'}</div>
              <div>Nível: {currentState.currentLevelIndex + 1}</div>
              <div>Tempo no Nível: {formatTime(currentState.elapsedTimeInLevel)}</div>
              <div>Tempo Total: {formatTime(currentState.totalElapsedTime)}</div>
            </div>
          </div>

          {savedState && (
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Estado Salvo</h4>
              <div className="text-sm space-y-1">
                <div>Status: {savedState.state.isRunning ? '▶️ Rodando' : '⏸️ Pausado'}</div>
                <div>Nível: {savedState.state.currentLevelIndex + 1}</div>
                <div>Tempo no Nível: {formatTime(savedState.state.elapsedTimeInLevel)}</div>
                <div>Salvo em: {formatTimestamp(savedState.timestamp)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Ações de Recuperação */}
        <div className="flex flex-wrap gap-2">
          {savedState && (
            <Button 
              onClick={onRecover} 
              variant="default" 
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Recuperar Estado
            </Button>
          )}
          
          <Button 
            onClick={onRestoreBackup} 
            variant="outline" 
            size="sm"
          >
            Restaurar Backup
          </Button>
          
          <Button 
            onClick={onGetDiagnosticReport} 
            variant="outline" 
            size="sm"
          >
            Diagnóstico
          </Button>
          
          <Button 
            onClick={onClearData} 
            variant="destructive" 
            size="sm"
          >
            Limpar Dados
          </Button>
        </div>

        {/* Detalhes Técnicos */}
        <div className="pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs"
          >
            {showDetails ? 'Ocultar' : 'Mostrar'} Detalhes Técnicos
          </Button>
          
          {showDetails && (
            <div className="mt-2 text-xs space-y-1 font-mono bg-muted p-2 rounded">
              <div>Renders: {diagnostics.performanceMetrics.renderCount}</div>
              <div>Tempo médio render: {diagnostics.performanceMetrics.avgRenderTime.toFixed(2)}ms</div>
              <div>Última atualização contexto: {formatTimestamp(diagnostics.lastContextUpdate)}</div>
              <div>Resets detectados: {diagnostics.timerResetCount}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}