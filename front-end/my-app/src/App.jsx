import { Route, Routes, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./sections/Home.jsx";
import Onboarding from "./pages/Onboarding.jsx";
import Login from "./pages/Login.jsx";
import SupportBoard from "./pages/SupportBoard.jsx";
import NavBar from "./components/NavBar.jsx";
import Register from "./pages/Register.jsx";

// Protected Route wrapper component
const ProtectedRoute = ({ children, isAuthenticated, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Verify token with your backend
      const response = await fetch('/api/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF6] text-slate-900">
      <NavBar isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}/>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        
        {/* Login route - redirect to support if already authenticated */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/support" replace /> : <Login setIsAuthenticated={setIsAuthenticated} />
          } 
        />
        
       {/* Register route - ADD THIS */}
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/support" replace /> : <Register setIsAuthenticated={setIsAuthenticated} />  
          } 
        />

        {/*Register*/}
        <Route path = "/register" element = {<Register/>}/>
        
        {/* Protected routes */}
        <Route 
          path="/support" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated} isLoading={isLoading}>
              <SupportBoard />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all redirect */}
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/support" : "/"} replace />} 
        />
      </Routes>
    </div>
  );
};

export default App;