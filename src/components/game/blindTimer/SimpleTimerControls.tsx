import React from 'react';

interface SimpleTimerControlsProps {
  onStart?: () => void;
  onPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onToggleSound?: () => void;
  onToggleFullScreen?: () => void;
  onOpenNewWindow?: () => void;
  isRunning?: boolean;
  soundEnabled?: boolean;
}

export default function SimpleTimerControls({
  onStart = () => console.log("Start clicked"),
  onPause = () => console.log("Pause clicked"),
  onNext = () => console.log("Next clicked"),
  onPrevious = () => console.log("Previous clicked"),
  onToggleSound = () => console.log("Sound clicked"),
  onToggleFullScreen = () => console.log("Fullscreen clicked"),
  onOpenNewWindow = () => console.log("New window clicked"),
  isRunning = false,
  soundEnabled = true
}: SimpleTimerControlsProps) {

  const buttonStyle = {
    padding: '12px 24px',
    margin: '0 8px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(10px)'
  };

  const mainButtonStyle = {
    ...buttonStyle,
    padding: '16px 32px',
    fontSize: '18px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    border: '3px solid white'
  };

  const smallButtonStyle = {
    ...buttonStyle,
    padding: '8px 12px',
    fontSize: '14px',
    margin: '0 4px'
  };

  return (
    <>
      {/* Controles principais - centro inferior */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <button
          style={buttonStyle}
          onClick={onPrevious}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.borderColor = '#dfce61';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          ⏮️ ANTERIOR
        </button>

        <button
          style={mainButtonStyle}
          onClick={isRunning ? onPause : onStart}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
            e.currentTarget.style.color = 'black';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.color = 'white';
          }}
        >
          {isRunning ? '⏸️ PAUSAR' : '▶️ INICIAR'}
        </button>

        <button
          style={buttonStyle}
          onClick={onNext}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
            e.currentTarget.style.borderColor = '#dfce61';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
          }}
        >
          PRÓXIMO ⏭️
        </button>
      </div>

      {/* Controles auxiliares - canto inferior esquerdo */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          zIndex: 9999,
          display: 'flex',
          gap: '8px'
        }}
      >
        <button
          style={smallButtonStyle}
          onClick={onToggleSound}
          title={soundEnabled ? "Som Ativado" : "Som Desativado"}
        >
          {soundEnabled ? '🔔' : '🔕'}
        </button>

        <button
          style={smallButtonStyle}
          onClick={onToggleFullScreen}
          title="Tela Cheia"
        >
          ⛶
        </button>
      </div>

      {/* Botão nova janela - canto inferior direito */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 9999
        }}
      >
        <button
          style={{
            ...smallButtonStyle,
            backgroundColor: 'rgba(223, 198, 97, 0.1)',
            borderColor: '#dfce61',
            color: '#dfce61'
          }}
          onClick={onOpenNewWindow}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#dfce61';
            e.currentTarget.style.color = 'black';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(223, 198, 97, 0.1)';
            e.currentTarget.style.color = '#dfce61';
          }}
        >
          🔗 NOVA JANELA
        </button>
      </div>
    </>
  );
}