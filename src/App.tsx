import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthInit } from "@/hooks/useAuthInit";
import { useAuthStore } from "@/stores/authStore";
import OnboardingPage from "./pages/OnboardingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CreateProfilePage from "./pages/CreateProfilePage";
import MapFullPage from "./pages/MapFullPage";
import ChannelsListPage from "./pages/ChannelsListPage";
import ChatPage from "./pages/ChatPage";
import VoiceRoomPage from "./pages/VoiceRoomPage";
import ProfileFullPage from "./pages/ProfileFullPage";

const queryClient = new QueryClient();

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isInitialized } = useAuthStore();
  if (!isInitialized) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
    </div>
  );
  if (!session) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { session, profile, isInitialized } = useAuthStore();
  if (!isInitialized) return null;
  if (!session) return <Navigate to="/welcome" replace />;
  if (!profile) return <Navigate to="/create-profile" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  useAuthInit();
  const { session, profile } = useAuthStore();

  return (
    <Routes>
      <Route path="/welcome" element={session ? (profile ? <Navigate to="/" /> : <Navigate to="/create-profile" />) : <OnboardingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/create-profile" element={<RequireAuth><CreateProfilePage /></RequireAuth>} />
      <Route path="/" element={<RequireProfile><MapFullPage /></RequireProfile>} />
      <Route path="/channels" element={<RequireProfile><ChannelsListPage /></RequireProfile>} />
      <Route path="/chat/:channelId" element={<RequireProfile><ChatPage /></RequireProfile>} />
      <Route path="/voice/:channelId" element={<RequireProfile><VoiceRoomPage /></RequireProfile>} />
      <Route path="/profile" element={<RequireProfile><ProfileFullPage /></RequireProfile>} />
      <Route path="*" element={<Navigate to={session ? "/" : "/welcome"} replace />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
