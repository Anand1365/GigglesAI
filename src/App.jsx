import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPageDarkMode from "./pages/LandingPageDarkMode";
import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ProfilePage from "./pages/ProfilePage";
import AvtarSectionPage from "./pages/AvtarSectionPage";
import FriendAvtarChatPage from "./pages/FriendAvtarChatPage";
import EducatorAvtarChatPage from "./pages/EducatorAvtarChatPage";
import ComedianAvtarChatPage from "./pages/ComedianAvtarChatPage";
import MeanGuyAvtarChatPage from "./pages/MeanGuyAvtarChatPage";
import AboutPage from "./pages/AboutPage";
import PricingPage from "./pages/PricingPage";
import ContactPage from "./pages/ContactPage";
import LandingPageLightMode from "./pages/LandingPageLightMode";
import { useState, useEffect } from "react";

function App() {
  // Add state to track if user is authenticated
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is logged in on component mount
  useEffect(() => {
    // Check localStorage or sessionStorage for auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Function to handle successful login/signup
  const handleAuth = () => {
    setIsAuthenticated(true);
    localStorage.setItem('authToken', 'dummy-token');
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPageDarkMode />} />
      
      {/* Pass auth handler to login and signup pages */}
      <Route path="/login-page" element={<LoginPage onLoginSuccess={handleAuth} />} />
      <Route path="/sign-up-page" element={<SignUpPage onSignupSuccess={handleAuth} />} />
      
      {/* Protected routes - redirect to login if not authenticated */}
      <Route 
        path="/profile-page" 
        element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login-page" />} 
      />
      <Route 
        path="/avtar-section-page" 
        element={isAuthenticated ? <AvtarSectionPage /> : <Navigate to="/login-page" />} 
      />
      <Route 
        path="/friend-avtar-chat-page" 
        element={isAuthenticated ? <FriendAvtarChatPage /> : <Navigate to="/login-page" />} 
      />
      <Route 
        path="/educator-avtar-chat-page" 
        element={isAuthenticated ? <EducatorAvtarChatPage /> : <Navigate to="/login-page" />} 
      />
      <Route 
        path="/comedian-avtar-chat-page" 
        element={isAuthenticated ? <ComedianAvtarChatPage /> : <Navigate to="/login-page" />} 
      />
      <Route 
        path="/mean-guy-avtar-chat-page" 
        element={isAuthenticated ? <MeanGuyAvtarChatPage /> : <Navigate to="/login-page" />} 
      />
      
      {/* Update routes for other pages mentioned in LandingPageDarkMode */}
      <Route path="/about-page-2" element={<AboutPage />} />
      <Route path="/pricing-page-3" element={<PricingPage />} />
      <Route path="/contact-page" element={<ContactPage />} />
      <Route path="/landing-page-light-mode-1" element={<LandingPageLightMode />} />
    </Routes>
  );
}

export default App;
