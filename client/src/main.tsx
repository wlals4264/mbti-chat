import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.scss';
import MainPage from './pages/MainPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainPage />
  </StrictMode>
);
