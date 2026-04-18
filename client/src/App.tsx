import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/i18n/LanguageContext";
import { CurrentUserProvider, useCurrentUser } from "@/lib/useCurrentUser";
import Index from "./pages/Index.tsx";
import ChatPage from "./pages/ChatPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";
import NotFound from "./pages/NotFound.tsx";
import AuthLayout from "./pages/auth/AuthLayout.tsx";
import SignInPage from "./pages/auth/SignInPage.tsx";
import SignUpPage from "./pages/auth/SignUpPage.tsx";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage.tsx";
import CheckEmailPage from "./pages/auth/CheckEmailPage.tsx";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage.tsx";
import PasswordUpdatedPage from "./pages/auth/PasswordUpdatedPage.tsx";
import LinkErrorPage from "./pages/auth/LinkErrorPage.tsx";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage.tsx";
import MagicLinkPage from "./pages/auth/MagicLinkPage.tsx";
import OtpChallengePage from "./pages/auth/OtpChallengePage.tsx";
import MfaSetupPage from "./pages/auth/MfaSetupPage.tsx";
import MfaChallengePage from "./pages/auth/MfaChallengePage.tsx";
import WelcomePage from "./pages/auth/WelcomePage.tsx";

const queryClient = new QueryClient();

const LandingRoute = () => {
  const { user, loading } = useCurrentUser();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Index />;
};

const DashboardRoute = () => {
  const { user, loading } = useCurrentUser();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  return <Index />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <CurrentUserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingRoute />} />
              <Route path="/dashboard" element={<DashboardRoute />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/auth" element={<AuthLayout />}>
                <Route index element={<Navigate to="/auth/sign-in" replace />} />
                <Route path="sign-in" element={<SignInPage />} />
                <Route path="sign-up" element={<SignUpPage />} />
                <Route path="forgot-password" element={<ForgotPasswordPage />} />
                <Route path="check-email" element={<CheckEmailPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="password-updated" element={<PasswordUpdatedPage />} />
                <Route path="link-error" element={<LinkErrorPage />} />
                <Route path="verify-email" element={<VerifyEmailPage />} />
                <Route path="magic-link" element={<MagicLinkPage />} />
                <Route path="otp" element={<OtpChallengePage />} />
                <Route path="mfa-setup" element={<MfaSetupPage />} />
                <Route path="mfa-challenge" element={<MfaChallengePage />} />
                <Route path="welcome" element={<WelcomePage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CurrentUserProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
