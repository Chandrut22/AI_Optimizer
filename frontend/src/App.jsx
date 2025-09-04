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
import AdminLayout from './components/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UserManagement from './pages/admin/UserManagement.jsx';
import Analytics from './pages/admin/Analytics.jsx';
import Settings from './pages/admin/Settings.jsx';

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
                            <Route path='/admin' element={<AdminLayout />}>
                                <Route index element={<AdminDashboard />} />
                                <Route path='users' element={<UserManagement />} />
                                <Route path='analytics' element={<Analytics />} />
                                <Route path='settings' element={<Settings />} />
                            </Route>
                        </Routes>
                        <SpeedInsights />
                    </AuthProvider>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App;