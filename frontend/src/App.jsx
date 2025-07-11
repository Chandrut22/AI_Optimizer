import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
import { Toaster as Sonner } from "@/components/ui/sonner";
import Homepage from './pages/Homepage';
import LoginPage from './pages/Login';
import RegisterPage from './pages/Register';

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
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App;