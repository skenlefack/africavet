import React, { lazy, Suspense } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

// Layout
import LayoutTheme1 from "./component/Layout/LayoutTheme1";
import ProtectedRoute from "./component/auth/ProtectedRoute";
import LoadingSpinner from "./component/shared/LoadingSpinner";

// Existing pages
import HomePage from "./pages/HomePage";
import CategoryPage from "./pages/CategoryPage";
import CategoriesListPage from "./pages/CategoriesListPage";
import ArticlePage from "./pages/ArticlePage";
import InscriptionPage from "./pages/InscriptionPage";
import ConnexionPage from "./pages/ConnexionPage";
import About from "./pages/home/about";
import Contact from "./pages/home/contact";
import Error from "./pages/home/404";

// E-Learning pages (lazy loaded)
const CourseCatalogPage = lazy(() => import("./pages/elearning/CourseCatalogPage"));
const CourseDetailPage = lazy(() => import("./pages/elearning/CourseDetailPage"));
const LessonViewerPage = lazy(() => import("./pages/elearning/LessonViewerPage"));
const QuizPage = lazy(() => import("./pages/elearning/QuizPage"));
const QuizResultsPage = lazy(() => import("./pages/elearning/QuizResultsPage"));
const MyLearningPage = lazy(() => import("./pages/elearning/MyLearningPage"));
const LearningPathsPage = lazy(() => import("./pages/elearning/LearningPathsPage"));
const LearningPathDetailPage = lazy(() => import("./pages/elearning/LearningPathDetailPage"));
const CertificateVerifyPage = lazy(() => import("./pages/elearning/CertificateVerifyPage"));

// Opportunities pages
const OpportunitiesPage = lazy(() => import("./pages/opportunities/OpportunitiesPage"));
const OpportunityDetailPage = lazy(() => import("./pages/opportunities/OpportunityDetailPage"));
const OpportunityApplyPage = lazy(() => import("./pages/opportunities/OpportunityApplyPage"));

// Vet Alerts pages
const VetAlertsPage = lazy(() => import("./pages/vet-alerts/VetAlertsPage"));
const VetAlertDetailPage = lazy(() => import("./pages/vet-alerts/VetAlertDetailPage"));
const VetAlertSubmitPage = lazy(() => import("./pages/vet-alerts/VetAlertSubmitPage"));

// Documents / Library pages
const DocumentsLibraryPage = lazy(() => import("./pages/documents/DocumentsLibraryPage"));
const DocumentsCategoryPage = lazy(() => import("./pages/documents/DocumentsCategoryPage"));
const DocumentDetailPage = lazy(() => import("./pages/documents/DocumentDetailPage"));
const DocumentsSearchPage = lazy(() => import("./pages/documents/DocumentsSearchPage"));

// Annuaire pages
const AnnuairePage = lazy(() => import("./pages/annuaire/AnnuairePage"));
const ExpertDetailPage = lazy(() => import("./pages/annuaire/ExpertDetailPage"));
const OrganizationDetailPage = lazy(() => import("./pages/annuaire/OrganizationDetailPage"));
const AnnuaireSubmitPage = lazy(() => import("./pages/annuaire/AnnuaireSubmitPage"));

// Newsletter pages
const NewsletterConfirmPage = lazy(() => import("./pages/newsletter/NewsletterConfirmPage"));
const NewsletterUnsubscribePage = lazy(() => import("./pages/newsletter/NewsletterUnsubscribePage"));

// Profile pages
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const DashboardPage = lazy(() => import("./pages/profile/DashboardPage"));
const NotificationsPage = lazy(() => import("./pages/profile/NotificationsPage"));

// RecallVET
const RecallVetPage = lazy(() => import("./pages/recallvet/RecallVetPage"));

// Legal pages
const ConditionsPage = lazy(() => import("./pages/legal/ConditionsPage"));
const ConfidentialitePage = lazy(() => import("./pages/legal/ConfidentialitePage"));
const MentionsLegalesPage = lazy(() => import("./pages/legal/MentionsLegalesPage"));

// Email verification
const EmailVerificationPage = lazy(() => import("./pages/EmailVerificationPage"));

const Lazy = ({ children }) => (
  <Suspense fallback={<LoadingSpinner fullPage />}>{children}</Suspense>
);

const Protected = ({ children }) => (
  <ProtectedRoute><Lazy>{children}</Lazy></ProtectedRoute>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <LayoutTheme1 />,
    errorElement: <Error />,
    children: [
      // Existing
      { index: true, element: <HomePage /> },
      { path: "categories", element: <CategoriesListPage /> },
      { path: "categorie/:slug", element: <CategoryPage /> },
      { path: "article/:slug", element: <ArticlePage /> },
      { path: "about", element: <About /> },
      { path: "contact", element: <Contact /> },
      { path: "inscription", element: <InscriptionPage /> },
      { path: "connexion", element: <ConnexionPage /> },
      { path: "verification-email/:token", element: <Lazy><EmailVerificationPage /></Lazy> },

      // E-Learning (requires login)
      { path: "formations", element: <Protected><CourseCatalogPage /></Protected> },
      { path: "formations/:slug", element: <Protected><CourseDetailPage /></Protected> },
      { path: "formations/:slug/lecon/:lessonId", element: <Protected><LessonViewerPage /></Protected> },
      { path: "formations/:slug/quiz/:quizId", element: <Protected><QuizPage /></Protected> },
      { path: "formations/:slug/quiz/:quizId/resultats", element: <Protected><QuizResultsPage /></Protected> },
      { path: "mon-apprentissage", element: <Protected><MyLearningPage /></Protected> },
      { path: "parcours", element: <Protected><LearningPathsPage /></Protected> },
      { path: "parcours/:slug", element: <Protected><LearningPathDetailPage /></Protected> },
      { path: "certificat/verification/:code", element: <Lazy><CertificateVerifyPage /></Lazy> },

      // Opportunities (requires login)
      { path: "opportunites", element: <Protected><OpportunitiesPage /></Protected> },
      { path: "opportunites/:id", element: <Protected><OpportunityDetailPage /></Protected> },
      { path: "opportunites/:id/postuler", element: <Protected><OpportunityApplyPage /></Protected> },

      // Vet Alerts
      { path: "alertes-veterinaires", element: <Lazy><VetAlertsPage /></Lazy> },
      { path: "alertes-veterinaires/:id", element: <Lazy><VetAlertDetailPage /></Lazy> },
      { path: "soumettre-alerte", element: <Protected><VetAlertSubmitPage /></Protected> },

      // Documents / Library (requires login)
      { path: "bibliotheque", element: <Protected><DocumentsLibraryPage /></Protected> },
      { path: "bibliotheque/categorie/:slug", element: <Protected><DocumentsCategoryPage /></Protected> },
      { path: "bibliotheque/document/:id", element: <Protected><DocumentDetailPage /></Protected> },
      { path: "bibliotheque/recherche", element: <Protected><DocumentsSearchPage /></Protected> },

      // Annuaire (requires login)
      { path: "annuaire", element: <Protected><AnnuairePage /></Protected> },
      { path: "annuaire/expert/:id", element: <Protected><ExpertDetailPage /></Protected> },
      { path: "annuaire/organisation/:id", element: <Protected><OrganizationDetailPage /></Protected> },
      { path: "annuaire/inscription", element: <Protected><AnnuaireSubmitPage /></Protected> },

      // RecallVET (public)
      { path: "recallvet", element: <Lazy><RecallVetPage /></Lazy> },

      // Legal pages (public)
      { path: "conditions", element: <Lazy><ConditionsPage /></Lazy> },
      { path: "confidentialite", element: <Lazy><ConfidentialitePage /></Lazy> },
      { path: "mentions-legales", element: <Lazy><MentionsLegalesPage /></Lazy> },

      // Newsletter
      { path: "newsletter/confirmation/:token", element: <Lazy><NewsletterConfirmPage /></Lazy> },
      { path: "newsletter/desinscription", element: <Lazy><NewsletterUnsubscribePage /></Lazy> },

      // Profile / Dashboard
      { path: "profil", element: <Protected><ProfilePage /></Protected> },
      { path: "tableau-de-bord", element: <Protected><DashboardPage /></Protected> },
      { path: "notifications", element: <Protected><NotificationsPage /></Protected> },

      // Fallback
      { path: "404", element: <Error /> },
      { path: "*", element: <Error /> },
    ],
  },
]);

function Router() {
  return <RouterProvider router={router} />;
}

export default Router;
