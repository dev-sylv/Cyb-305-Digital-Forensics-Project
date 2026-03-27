import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./components/authProvider";
import ProtectedRoute from "./components/protectedRoute";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import UploadPage from "./pages/uploadPage";
import EvidenceListPage from "./pages/evidenceList";
import EvidenceDetailPage from "./pages/evidenceDetailedPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/evidence" element={<EvidenceListPage />} />
            <Route path="/evidence/:id" element={<EvidenceDetailPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
