import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { RootLayout } from "@/components/layouts/root-layout";
import { ROUTES } from "@/lib/routes";
import { LandingPage } from "@/pages/landing/Landing";

// Auth, onboarding, the student app, and the admin console are code-split so the landing page stays light.
const AuthLayout = lazy(() =>
  import("@/components/layouts/auth-layout").then((m) => ({
    default: m.AuthLayout,
  })),
);
const SignInPage = lazy(() =>
  import("@/pages/auth/Login").then((m) => ({ default: m.SignInPage })),
);
const SignUpPage = lazy(() =>
  import("@/pages/auth/Register").then((m) => ({ default: m.SignUpPage })),
);
const OnboardingLayout = lazy(() =>
  import("@/components/layouts/onboarding-layout").then((m) => ({
    default: m.OnboardingLayout,
  })),
);
const UniversityPage = lazy(() =>
  import("@/pages/onboarding/UniversityFinder").then((m) => ({
    default: m.UniversityPage,
  })),
);
const UniversityDocumentsPage = lazy(() =>
  import("@/pages/onboarding/UniversityDocuments").then((m) => ({
    default: m.UniversityDocumentsPage,
  })),
);
const TranscriptPage = lazy(() =>
  import("@/pages/onboarding/Transcript").then((m) => ({
    default: m.TranscriptPage,
  })),
);
const AppLayout = lazy(() =>
  import("@/components/layouts/app-layout").then((m) => ({ default: m.AppLayout })),
);
const OverviewPage = lazy(() =>
  import("@/pages/overview/Overview").then((m) => ({
    default: m.OverviewPage,
  })),
);
const SemesterPlanPage = lazy(() =>
  import("@/pages/semester-plan/SemesterPlan").then((m) => ({
    default: m.SemesterPlanPage,
  })),
);
const WhatIfPage = lazy(() =>
  import("@/pages/what-if/WhatIf").then((m) => ({ default: m.WhatIfPage })),
);
const CoursesPage = lazy(() =>
  import("@/pages/courses/Courses").then((m) => ({ default: m.CoursesPage })),
);
const SourcesPage = lazy(() =>
  import("@/pages/sources/Sources").then((m) => ({ default: m.SourcesPage })),
);
const AdvisorPage = lazy(() =>
  import("@/pages/advisor/Advisor").then((m) => ({ default: m.AdvisorPage })),
);
const AdminLayout = lazy(() =>
  import("@/components/layouts/admin-layout").then((m) => ({
    default: m.AdminLayout,
  })),
);
const AdminDashboardPage = lazy(() =>
  import("@/pages/admin/Dashboard").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const UniversitiesPage = lazy(() =>
  import("@/pages/admin/Universities").then((m) => ({
    default: m.UniversitiesPage,
  })),
);
const CoursesAdminPage = lazy(() =>
  import("@/pages/admin/Courses").then((m) => ({
    default: m.CoursesAdminPage,
  })),
);
const StudentsPage = lazy(() =>
  import("@/pages/admin/Students").then((m) => ({
    default: m.StudentsPage,
  })),
);
const CompletePage = lazy(() =>
  import("@/pages/onboarding/Complete").then((m) => ({
    default: m.CompletePage,
  })),
);

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path={ROUTES.home} element={<LandingPage />} />

            <Route element={<AuthLayout />}>
              <Route path={ROUTES.signIn} element={<SignInPage />} />
              <Route path={ROUTES.signUp} element={<SignUpPage />} />
            </Route>

            <Route path="/onboarding" element={<OnboardingLayout />}>
              <Route
                index
                element={<Navigate to={ROUTES.onboarding.university} replace />}
              />
              <Route
                path={ROUTES.onboarding.university}
                element={<UniversityPage />}
              />
              <Route
                path={ROUTES.onboarding.universityDocuments}
                element={<UniversityDocumentsPage />}
              />
              <Route
                path={ROUTES.onboarding.transcript}
                element={<TranscriptPage />}
              />
              <Route
                path={ROUTES.onboarding.complete}
                element={<CompletePage />}
              />
            </Route>

            <Route path={ROUTES.app.overview} element={<AppLayout />}>
              <Route index element={<OverviewPage />} />
              <Route path={ROUTES.app.plan} element={<SemesterPlanPage />} />
              <Route path={ROUTES.app.whatIf} element={<WhatIfPage />} />
              <Route path={ROUTES.app.courses} element={<CoursesPage />} />
              <Route path={ROUTES.app.sources} element={<SourcesPage />} />
              <Route path={ROUTES.app.advisor} element={<AdvisorPage />} />
              <Route
                path="*"
                element={<Navigate to={ROUTES.app.overview} replace />}
              />
            </Route>

            <Route path={ROUTES.admin.dashboard} element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route
                path={ROUTES.admin.universities}
                element={<UniversitiesPage />}
              />
              <Route
                path={ROUTES.admin.courses}
                element={<CoursesAdminPage />}
              />
              <Route path={ROUTES.admin.students} element={<StudentsPage />} />
              <Route
                path="*"
                element={<Navigate to={ROUTES.admin.dashboard} replace />}
              />
            </Route>

            <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
