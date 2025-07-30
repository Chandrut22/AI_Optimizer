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
const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme='system' storageKey='ai-platform-theme'>
                <Sonner />
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Homepage />} />
                        <Route path='/login' element={<LoginPage />} />
                        <Route path='/register' element={<RegisterPage />} />
                        <Route path='/verify-email' element={<EmailVerificationPage />} />
                        <Route path='/forgot-password' element={<ForgotPasswordPage />} />
                        <Route path='/reset-password' element={<ResetPasswordPage />}/>
                        <Route path="/oauth-success" element={<OAuthSuccess />} />
                        <Route path="/dashboard" element={<PanelPage />} /> 
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App;