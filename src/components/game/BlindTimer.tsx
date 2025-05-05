
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BlindTimerProps {
  initialTime?: number;
}

export default function BlindTimer({ initialTime = 15 * 60 }: BlindTimerProps) {
  const [blindTimer, setBlindTimer] = useState<number>(initialTime);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);
  const [nextBlindTime, setNextBlindTime] = useState<number>(initialTime);
  
  // Blind timer
  useEffect(() => {
    let interval: number | undefined;
    
    if (timerRunning) {
      interval = window.setInterval(() => {
        setBlindTimer(prev => {
          // Play sound when 1 minute remaining or when blinds change
          if (prev === 60 || prev === 1) {
            playAlertSound();
          }
          
          if (prev <= 1) {
            // Reset timer when it reaches 0
            return nextBlindTime;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerRunning, nextBlindTime]);
  
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const playAlertSound = () => {
    // Simple beep sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.value = 800;
    gainNode.gain.value = 0.5;
    
    oscillator.start();
    
    setTimeout(() => {
      oscillator.stop();
    }, 500);
  };
  
  const toggleTimer = () => {
    setTimerRunning(prev => !prev);
  };
  
  const resetTimer = () => {
    setBlindTimer(nextBlindTime);
  };
  
  const changeBlindTime = (minutes: number) => {
    const seconds = minutes * 60;
    setNextBlindTime(seconds);
    setBlindTimer(seconds);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Cronômetro de Blinds</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-5xl font-bold tabular-nums">
            {formatTime(blindTimer)}
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={toggleTimer}
              className={timerRunning ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {timerRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            
            <Button
              onClick={resetTimer}
              variant="outline"
            >
              Reiniciar
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={() => changeBlindTime(10)} variant="outline" size="sm">10m</Button>
            <Button onClick={() => changeBlindTime(15)} variant="outline" size="sm">15m</Button>
            <Button onClick={() => changeBlindTime(20)} variant="outline" size="sm">20m</Button>
            <Button onClick={() => changeBlindTime(30)} variant="outline" size="sm">30m</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
