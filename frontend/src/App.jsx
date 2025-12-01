import React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import MainPage from './pages/MainPage.jsx';
import { Analytics } from "@vercel/analytics/react";
import AboutPage from './pages/AboutPage.jsx';
import FeaturesPage from './pages/FeaturesPage.jsx';
import StatsPage from './pages/StatsPage.jsx';
import SupportPage from './pages/SupportPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import ComplaintsPage from './pages/ComplaintsPage.jsx';
import StaffDashboard from './pages/StaffDashboard.jsx';
import StudyLab from './pages/StudyLab.jsx';
import PdfLab from './pages/PdfLab.jsx';
import MentorLab from './pages/MentorLab.jsx';
import ExamLab from './pages/ExamLab.jsx';
import ExamQuiz from './pages/ExamQuiz.jsx';
import StudyTools from './pages/StudyTools.jsx';
import TicketDetailPage from './pages/TicketDetailPage.jsx';
import MyTicketsPage from './pages/MyTicketsPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import Layout from './components/Layout.jsx';
import { getStoredUser } from './services/authStorage.js';
import StaffTicketsPage from './pages/staff/StaffTicketsPage.jsx';
import StaffUserManagementPage from './pages/staff/StaffUserManagementPage.jsx';
import StaffStudentInsightsPage from './pages/staff/StaffStudentInsightsPage.jsx';
import StaffAiLimitsPage from './pages/staff/StaffAiLimitsPage.jsx';
import StaffTicketConfigPage from './pages/staff/StaffTicketConfigPage.jsx';
import StaffPdfMaintenancePage from './pages/staff/StaffPdfMaintenancePage.jsx';

function ProtectedRoute({ children, allowedRoles }) {
  const user = getStoredUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    console.warn('Access denied. User role:', user.role, 'Allowed roles:', allowedRoles);
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/features" element={<FeaturesPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/support" element={<SupportPage />} />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="pdf-lab" element={<PdfLab />} />
        <Route path="mentor-lab" element={<MentorLab />} />
        <Route path="exam-lab" element={<ExamLab />} />
        <Route path="exam-lab/:sessionId" element={<ExamQuiz />} />
        <Route path="study-tools" element={<StudyTools />} />
        <Route path="study-lab" element={<StudyLab />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="my-tickets" element={<MyTicketsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="tickets/:ticketId" element={<TicketDetailPage />} />
        <Route
          path="staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="tickets" replace />} />
          <Route path="tickets" element={<StaffTicketsPage />} />
          <Route path="user-management" element={<StaffUserManagementPage />} />
          <Route path="student-insights" element={<StaffStudentInsightsPage />} />
          <Route path="ai-limits" element={<StaffAiLimitsPage />} />
          <Route path="ticket-config" element={<StaffTicketConfigPage />} />
          <Route path="pdf-maintenance" element={<StaffPdfMaintenancePage />} />
        </Route>
      </Route>

      <Route
        path="/ticket/:ticketId"
        element={
          <ProtectedRoute>
            <TicketDetailPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
