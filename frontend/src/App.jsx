import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster as Sonner } from "@/components/ui/sonner";
import Homepage from './pages/Homepage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';
import EmailVerificationPage from './pages/EmailVerification';
import ForgotPasswordPage from './pages/ForgotPassword';
import ResetPasswordPage from './pages/ResetPassword';
import OAuthSuccess from './pages/OAuthSuccess';
import PanelPage from './pages/PanelPage';
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from './context/AuthContext.jsx';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Analytics } from "@vercel/analytics/next"

const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme='system' storageKey='ai-platform-theme'>
                <Sonner />
                <BrowserRouter>
                    <AuthProvider>
                        <Routes>
                            <Route path='/' element={<Homepage />} />
                            <Route path='/login' element={<LoginPage />} />
                            <Route path='/register' element={<RegisterPage />} />
                            <Route path='/verify-email' element={<EmailVerificationPage />} />
                            <Route path='/forgot-password' element={<ForgotPasswordPage />} />
                            <Route path='/reset-password' element={<ResetPasswordPage />}/>
                            <Route path="/oauth-success" element={<OAuthSuccess />} />
                            <Route path="/dashboard" element={<ProtectedRoute> <PanelPage /> </ProtectedRoute>} /> 
                        </Routes>
                        <SpeedInsights />
                        <Analytics />
                    </AuthProvider>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App;