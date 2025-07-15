import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

console.log("DEBUG: main.tsx carregado e executando!");

createRoot(document.getElementById("root")!).render(<App />);
