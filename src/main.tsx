import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import "@fontsource/nunito/400.css";
import "@fontsource/nunito/500.css";
import "@fontsource/nunito/600.css";
import "@fontsource/nunito/700.css";
import "@fontsource/nunito/800.css";
import "@fontsource/nunito/900.css";
import "@fontsource-variable/geist-mono";
import "./styles/globals.css";
import { AppShell } from "@/components/AppShell";
import HomePage from "@/pages/Home";
import LessonPage from "@/pages/Lesson";
import LessonItemPage from "@/pages/LessonItem";
import PracticePage from "@/pages/Practice";
import ProgressPage from "@/pages/Progress";
import LearnPage from "@/pages/Learn";
import ResultsPage from "@/pages/Results";
import ProfilePage from "@/pages/Profile";
import ToolsPage, { MetronomePage, TunerPage } from "@/pages/Tools";
import SettingsPage from "@/pages/Settings";
import AboutPage from "@/pages/About";

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
          <Route path="results" element={<ResultsPage />} />
          <Route path="progress" element={<ProgressPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="tools" element={<ToolsPage />} />
          <Route path="tools/tuner" element={<TunerPage />} />
          <Route path="tools/metronome" element={<MetronomePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="report" element={<Navigate to="/progress" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

// Visual prototype: audio, storage, authentication and service worker are intentionally disconnected.
