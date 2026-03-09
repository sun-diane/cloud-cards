import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/context/GameContext";
import AppNav from "@/components/AppNav";
import OpenPacksPage from "@/pages/OpenPacksPage";
import CollectionPage from "@/pages/CollectionPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <GameProvider>
        <HashRouter>
          <AppNav />
          <Routes>
            <Route path="/" element={<OpenPacksPage />} />
            <Route path="/collection" element={<CollectionPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter>
      </GameProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
