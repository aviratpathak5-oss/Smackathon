import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import Home from './pages/Home';
import AgroAI from './pages/AgroAI';
import GovScheme from './pages/GovScheme';
import WeatherCalendar from './pages/WeatherCalendar';
import VendorFarmer from './pages/VendorFarmer';
import ServiceContact from './pages/ServiceContact';

export function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <BrowserRouter>
          <div className="flex flex-col min-h-screen bg-background text-on-surface">
            <NavBar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/agro-ai" element={<AgroAI />} />
                <Route path="/gov-schemes" element={<GovScheme />} />
                <Route path="/weather-calendar" element={<WeatherCalendar />} />
                <Route path="/vendor-farmer" element={<VendorFarmer />} />
                <Route path="/service-contact" element={<ServiceContact />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
