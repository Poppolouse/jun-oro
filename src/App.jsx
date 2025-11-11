import { Routes, Route, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import { ActiveSessionProvider } from "./contexts/ActiveSessionContext";
import TutorialOverlay from "./components/Tutorial/TutorialOverlay";
import ElementSelector from "./components/Tutorial/ElementSelector";
import HomePage from "./pages/HomePage";
import FAQPage from "./pages/FAQPage";

// Lazy load pages for better code splitting
const ArkadeDashboard = lazy(() => import("./pages/ArkadeDashboard"));
const ArkadeLibrary = lazy(() => import("./pages/ArkadeLibrary"));
const ArkadeActiveSession = lazy(() => import("./pages/ArkadeActiveSession"));
const BacklogPage = lazy(() => import("./pages/BacklogPage"));
const StatsPage = lazy(() => import("./pages/StatsPage"));
const WishlistPage = lazy(() => import("./pages/WishlistPage"));
const GalleryPage = lazy(() => import("./pages/GalleryPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const TutorialAdmin = lazy(() => import("./components/Tutorial/TutorialAdmin"));
const UpdatesAdmin = lazy(() => import("./components/Updates/UpdatesAdmin"));

// Protected Route Component
function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-xl">Yükleniyor...</div>
      </div>
    );
  }

  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Yükleniyor...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Erişim Reddedildi</h2>
          <p className="text-gray-400 mb-4">
            Bu sayfaya erişim için admin yetkisi gereklidir.
          </p>
          <button
            onClick={() => window.history.back()}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return children;
}

// App Routes Component
function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated() ? <Navigate to="/" replace /> : <LoginPage />
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/arkade"
        element={
          <ProtectedRoute>
            <ArkadeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/arkade/library"
        element={
          <ProtectedRoute>
            <ArkadeLibrary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/arkade/session"
        element={
          <ProtectedRoute>
            <ArkadeActiveSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/backlog"
        element={
          <ProtectedRoute>
            <BacklogPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/wishlist"
        element={
          <ProtectedRoute>
            <WishlistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gallery"
        element={
          <ProtectedRoute>
            <GalleryPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/faq"
        element={
          <ProtectedRoute>
            <FAQPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tutorials"
        element={
          <AdminRoute>
            <TutorialAdmin />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/updates"
        element={
          <AdminRoute>
            <UpdatesAdmin />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <ActiveSessionProvider>
          <div className="App">
            <AppRoutes />
            <TutorialOverlay />
            <ElementSelector />
          </div>
        </ActiveSessionProvider>
      </NavigationProvider>
    </AuthProvider>
  );
}

export default App;
