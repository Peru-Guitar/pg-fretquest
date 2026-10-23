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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

// Visual prototype: audio, storage, authentication and service worker are intentionally disconnected.
