import React, { useContext } from "react";
import { Routes, Route, Outlet } from "react-router-dom";

/// Css
import "./index.css";
import "./chart.css";
import "./step.css";

/// Layout
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";
import ScrollToTop from "./layouts/ScrollToTop";

/// AfricaVet Dashboard
import AfricaVetDashboard from "./components/Dashboard/AfricaVetDashboard";

/// Pages - Content Management
import PostsList from "./pages/Posts/PostsList";
import PostEditor from "./pages/Posts/PostEditor";
import CategoriesList from "./pages/Categories/CategoriesList";
import CategoryEditor from "./pages/Categories/CategoryEditor";
import PagesList from "./pages/Pages/PagesList";
import PageEditor from "./pages/Pages/PageEditor";
import MediaLibrary from "./pages/Media/MediaLibrary";
import MenusList from "./pages/Menus/MenusList";
import MenuEditor from "./pages/Menus/MenuEditor";
import MenuItemEditor from "./pages/Menus/MenuItemEditor";

/// Pages - Modules
import SlidersList from "./pages/Sliders/SlidersList";
import SliderEditor from "./pages/Sliders/SliderEditor";
import SlideEditor from "./pages/Sliders/SlideEditor";
import NewsletterPage from "./pages/Newsletter/NewsletterPage";
import CampaignEditor from "./pages/Newsletter/CampaignEditor";

/// Pages - Page Builder
import PageBuilder from "./pages/PageBuilder/PageBuilder";

/// Pages - Users & Groups
import UsersList from "./pages/Users/UsersList";
import UserEditor from "./pages/Users/UserEditor";
import GroupsList from "./pages/Groups/GroupsList";
import GroupEditor from "./pages/Groups/GroupEditor";

/// Pages - Annuaire
import AnnuaireDashboard from "./pages/Annuaire/AnnuaireDashboard";
import AnnuaireList from "./pages/Annuaire/AnnuaireList";

/// Pages - E-Learning
import ELearningDashboard from "./pages/ELearning/ELearningDashboard";
import CoursesList from "./pages/ELearning/CoursesList";
import CourseEditor from "./pages/ELearning/CourseEditor";
import ModulesList from "./pages/ELearning/ModulesList";
import QuestionsList from "./pages/ELearning/QuestionsList";
import QuestionEditor from "./pages/ELearning/QuestionEditor";
import QuizzesList from "./pages/ELearning/QuizzesList";
import QuizEditor from "./pages/ELearning/QuizEditor";
import StudentsList from "./pages/ELearning/StudentsList";
import CertificatesList from "./pages/ELearning/CertificatesList";
import CertificateTemplateEditor from "./pages/ELearning/CertificateTemplateEditor";
import LearningPathsList from "./pages/ELearning/LearningPathsList";
import LearningPathEditor from "./pages/ELearning/LearningPathEditor";
import ELearningCategories from "./pages/ELearning/ELearningCategories";

/// Pages - Settings & Admin
import SettingsPage from "./pages/Settings/SettingsPage";
import ModulesPage from "./pages/Modules/ModulesPage";
import ProfilePage from "./pages/Profile/ProfilePage";
import ThemesPage from "./pages/Themes/ThemesPage";

/// Pages - Ads
import AdsDashboard from "./pages/Ads/AdsDashboard";
import AdvertisementsList from "./pages/Ads/AdvertisementsList";
import AdvertisementEditor from "./pages/Ads/AdvertisementEditor";
import PlacementsList from "./pages/Ads/PlacementsList";
import PlacementEditor from "./pages/Ads/PlacementEditor";
import ProvidersSettings from "./pages/Ads/ProvidersSettings";
import AdStatistics from "./pages/Ads/AdStatistics";

/// Error Pages
import LockScreen from "./pages/LockScreen";
import Error400 from "./pages/Error400";
import Error403 from "./pages/Error403";
import Error404 from "./pages/Error404";
import Error500 from "./pages/Error500";
import Error503 from "./pages/Error503";
import EmptyPage from "./pages/EmptyPage";

import { ThemeContext } from "../context/ThemeContext";

// Placeholder component for pages not yet migrated
const PlaceholderPage = ({ title }) => (
    <div className="card">
        <div className="card-body text-center py-5">
            <h3 className="mb-3">{title}</h3>
            <p className="text-muted">Cette page est en cours de développement...</p>
            <div className="spinner-border text-primary mt-3" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
);

const Markup = () => {
    return (
        <>
            <Routes>
                {/* Error Pages */}
                <Route path='/page-lock-screen' element={<LockScreen />} />
                <Route path='/page-error-400' element={<Error400 />} />
                <Route path='/page-error-403' element={<Error403 />} />
                <Route path='/page-error-404' element={<Error404 />} />
                <Route path='/page-error-500' element={<Error500 />} />
                <Route path='/page-error-503' element={<Error503 />} />

                {/* Main Layout with Sidebar */}
                <Route element={<MainLayout />}>
                    {/* Dashboard */}
                    <Route path="/" element={<AfricaVetDashboard />} />
                    <Route path="/dashboard" element={<AfricaVetDashboard />} />

                    {/* Content Management - Posts */}
                    <Route path="/posts" element={<PostsList />} />
                    <Route path="/posts/new" element={<PostEditor />} />
                    <Route path="/posts/:id" element={<PostEditor />} />

                    {/* Content Management - Categories */}
                    <Route path="/categories" element={<CategoriesList />} />
                    <Route path="/categories/new" element={<CategoryEditor />} />
                    <Route path="/categories/:id" element={<CategoryEditor />} />

                    {/* Content Management - Pages */}
                    <Route path="/pages" element={<PagesList />} />
                    <Route path="/pages/new" element={<PageEditor />} />
                    <Route path="/pages/:id" element={<PageEditor />} />
                    <Route path="/pagebuilder" element={<PageBuilder />} />
                    <Route path="/pagebuilder/:id" element={<PageBuilder />} />

                    {/* Content Management - Media */}
                    <Route path="/media" element={<MediaLibrary />} />

                    {/* Content Management - Menus */}
                    <Route path="/menus" element={<MenusList />} />
                    <Route path="/menus/new" element={<MenuEditor />} />
                    <Route path="/menus/:id" element={<MenuEditor />} />
                    <Route path="/menus/:menuId/items/new" element={<MenuItemEditor />} />
                    <Route path="/menus/:menuId/items/:itemId" element={<MenuItemEditor />} />

                    {/* Modules */}
                    <Route path="/modules" element={<ModulesPage />} />
                    <Route path="/sliders" element={<SlidersList />} />
                    <Route path="/sliders/new" element={<SliderEditor />} />
                    <Route path="/sliders/:id" element={<SliderEditor />} />
                    <Route path="/sliders/:id/slides/new" element={<SlideEditor />} />
                    <Route path="/sliders/:id/slides/:slideId" element={<SlideEditor />} />
                    <Route path="/newsletter" element={<NewsletterPage />} />
                    <Route path="/newsletter/campaigns/new" element={<CampaignEditor />} />
                    <Route path="/newsletter/campaigns/:id" element={<CampaignEditor />} />

                    {/* Annuaire Panafricain */}
                    <Route path="/annuaire" element={<AnnuaireDashboard />} />
                    <Route path="/annuaire/list" element={<AnnuaireList />} />
                    <Route path="/annuaire/search" element={<AnnuaireList />} />
                    <Route path="/annuaire/view/:id" element={<PlaceholderPage title="Fiche Établissement" />} />
                    <Route path="/annuaire/new" element={<PlaceholderPage title="Nouvel Établissement" />} />
                    <Route path="/annuaire/edit/:id" element={<PlaceholderPage title="Modifier Établissement" />} />
                    <Route path="/annuaire/pending" element={<PlaceholderPage title="Soumissions en attente" />} />
                    <Route path="/annuaire/import" element={<PlaceholderPage title="Importer des données" />} />
                    <Route path="/annuaire/report/:id" element={<PlaceholderPage title="Signaler une erreur" />} />

                    {/* E-Learning */}
                    <Route path="/elearning" element={<ELearningDashboard />} />
                    <Route path="/elearning/courses" element={<CoursesList />} />
                    <Route path="/elearning/courses/new" element={<CourseEditor />} />
                    <Route path="/elearning/courses/:id" element={<CourseEditor />} />
                    <Route path="/elearning/modules" element={<ModulesList />} />
                    <Route path="/elearning/questions" element={<QuestionsList />} />
                    <Route path="/elearning/questions/new" element={<QuestionEditor />} />
                    <Route path="/elearning/questions/:id" element={<QuestionEditor />} />
                    <Route path="/elearning/quizzes" element={<QuizzesList />} />
                    <Route path="/elearning/quizzes/new" element={<QuizEditor />} />
                    <Route path="/elearning/quizzes/:id" element={<QuizEditor />} />
                    <Route path="/elearning/students" element={<StudentsList />} />
                    <Route path="/elearning/certificates" element={<CertificatesList />} />
                    <Route path="/elearning/certificate-templates/new" element={<CertificateTemplateEditor />} />
                    <Route path="/elearning/certificate-templates/:id" element={<CertificateTemplateEditor />} />
                    <Route path="/elearning/paths" element={<LearningPathsList />} />
                    <Route path="/elearning/paths/new" element={<LearningPathEditor />} />
                    <Route path="/elearning/paths/:id" element={<LearningPathEditor />} />
                    <Route path="/elearning/categories" element={<ELearningCategories />} />

                    {/* Administration - Users */}
                    <Route path="/users" element={<UsersList />} />
                    <Route path="/users/new" element={<UserEditor />} />
                    <Route path="/users/:id" element={<UserEditor />} />

                    {/* Administration - Groups */}
                    <Route path="/groups" element={<GroupsList />} />
                    <Route path="/groups/new" element={<GroupEditor />} />
                    <Route path="/groups/:id" element={<GroupEditor />} />

                    {/* Ads Management */}
                    <Route path="/ads/dashboard" element={<AdsDashboard />} />
                    <Route path="/ads" element={<AdvertisementsList />} />
                    <Route path="/ads/new" element={<AdvertisementEditor />} />
                    <Route path="/ads/:id" element={<AdvertisementEditor />} />
                    <Route path="/ads/placements" element={<PlacementsList />} />
                    <Route path="/ads/placements/new" element={<PlacementEditor />} />
                    <Route path="/ads/placements/:id" element={<PlacementEditor />} />
                    <Route path="/ads/providers" element={<ProvidersSettings />} />
                    <Route path="/ads/statistics" element={<AdStatistics />} />

                    {/* Administration - Settings */}
                    <Route path="/themes" element={<ThemesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Profile */}
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Empty Page */}
                    <Route path="/empty-page" element={<EmptyPage />} />

                    {/* 404 Fallback */}
                    <Route path="*" element={<Error404 />} />
                </Route>
            </Routes>
            <ScrollToTop />
        </>
    );
};

function MainLayout() {
    const { menuToggle } = useContext(ThemeContext);
    return (
        <div id="main-wrapper" className={`show ${menuToggle ? "menu-toggle" : ""}`}>
            <Nav />
            <div className="content-body" style={{ minHeight: window.screen.height - 45, background: '#f5f5f5' }}>
                <div className="container-fluid">
                    <Outlet />
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default Markup;
