import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { ThemeProvider } from './components/ThemeProvider';
// import { Sonner } from './components/ui/sonner'
import Header from './components/Header';
// filepath: d:\deploy\ai_optimizer\frontend\src\App.jsx

const queryClient = new QueryClient();

const App = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider defaultTheme='system' storageKey='ai-platform-theme'>
                {/* <Sonner /> */}
                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<Header />} />
                        <Route path='/about' element={<div>About</div>} />
                        <Route path='/contact' element={<div>Contact</div>} />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    )
}

export default App;