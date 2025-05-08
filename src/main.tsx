
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Create the root and render the App component with proper React wrapping
createRoot(document.getElementById("root")!).render(
  <App />
);
