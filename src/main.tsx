import "@fontsource-variable/plus-jakarta-sans";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "@fontsource-variable/geist-mono";
import "./styles/globals.css";
import { AppShell } from "@/components/AppShell";
import HomePage from "@/pages/Home";
import LessonPage from "@/pages/Lesson";
import LessonItemPage from "@/pages/LessonItem";
import PracticePage from "@/pages/Practice";
import LearnPage from "@/pages/Learn";
import ToolsPage, { MetronomePage, TunerPage } from "@/pages/Tools";
import AboutPage from "@/pages/About";
import LoginPage from "@/pages/Login";
import PlanPage from "@/pages/Plan";
import CommunityPage from "@/pages/Community";
import AccountPage from "@/pages/Account";
import GuidePage from "@/pages/Guide";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="lessons/:lessonId" element={<LessonPage />} />
          <Route path="train" element={<LearnPage />} />
          <Route path="exercises" element={<Navigate to="/train" replace />} />
          <Route path="learn" element={<Navigate to="/train" replace />} />
          <Route path="modules/:lessonId" element={<LessonPage />} />
          <Route path="modules/:moduleId/:lessonId" element={<LessonItemPage />} />
          <Route path="practice" element={<PracticePage />} />
          <Route path="practice/:exerciseId" element={<PracticePage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="tools/tuner" element={<TunerPage />} />
          <Route path="tools/metronome" element={<MetronomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="plan" element={<PlanPage />} />
          <Route path="community" element={<CommunityPage />} />
          <Route path="account" element={<AccountPage />} />
          <Route path="guide" element={<GuidePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

// Visual prototype: audio, storage, authentication and service worker are intentionally disconnected.
