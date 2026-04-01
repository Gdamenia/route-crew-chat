import { lazy, Suspense } from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuthInit } from "@/hooks/useAuthInit";
import { useAuthStore } from "@/stores/authStore";

// Lazy load all pages
const OnboardingPage = lazy(() => import("./pages/OnboardingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignupPage = lazy(() => import("./pages/SignupPage"));
const CreateProfilePage = lazy(() => import("./pages/CreateProfilePage"));
const MapFullPage = lazy(() => import("./pages/MapFullPage"));
const ChannelsListPage = lazy(() => import("./pages/ChannelsListPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const VoiceRoomPage = lazy(() => import("./pages/VoiceRoomPage"));
const ProfileFullPage = lazy(() => import("./pages/ProfileFullPage"));

const queryClient = new QueryClient();

const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
  </div>
);

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, isInitialized } = useAuthStore();
  if (!isInitialized) return <LoadingSpinner />;
  if (!session) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function RequireProfile({ children }: { children: React.ReactNode }) {
  const { session, profile, isInitialized } = useAuthStore();
  if (!isInitialized) return <LoadingSpinner />;
  if (!session) return <Navigate to="/welcome" replace />;
  if (!profile) return <Navigate to="/create-profile" replace />;
  return <>{children}</>;
}

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useAuthInit();
  return <>{children}</>;
}

function AppRoutes() {
  const { session, profile, isInitialized } = useAuthStore();

  if (!isInitialized) return <LoadingSpinner />;

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/welcome" element={session ? (profile ? <Navigate to="/" /> : <Navigate to="/create-profile" />) : <OnboardingPage />} />
        <Route path="/login" element={session ? <Navigate to="/" /> : <LoginPage />} />
        <Route path="/signup" element={session ? <Navigate to="/" /> : <SignupPage />} />
        <Route path="/create-profile" element={<RequireAuth><CreateProfilePage /></RequireAuth>} />
        <Route path="/" element={<RequireProfile><MapFullPage /></RequireProfile>} />
        <Route path="/channels" element={<RequireProfile><ChannelsListPage /></RequireProfile>} />
        <Route path="/chat/:channelId" element={<RequireProfile><ChatPage /></RequireProfile>} />
        <Route path="/voice/:channelId" element={<RequireProfile><VoiceRoomPage /></RequireProfile>} />
        <Route path="/profile" element={<RequireProfile><ProfileFullPage /></RequireProfile>} />
        <Route path="*" element={<Navigate to={session ? "/" : "/welcome"} replace />} />
      </Routes>
    </Suspense>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthInitializer>
          <AppRoutes />
        </AuthInitializer>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
