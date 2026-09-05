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

/// AfricaVET Dashboard
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
import AnnuaireView from "./pages/Annuaire/AnnuaireView";
import AnnuaireNew from "./pages/Annuaire/AnnuaireNew";
import AnnuaireEdit from "./pages/Annuaire/AnnuaireEdit";
import AnnuairePending from "./pages/Annuaire/AnnuairePending";
import AnnuaireImport from "./pages/Annuaire/AnnuaireImport";
import AnnuaireReport from "./pages/Annuaire/AnnuaireReport";

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

/// Pages - Analytics
import AnalyticsDashboard from "./pages/Analytics/AnalyticsDashboard";
import EditorialDashboard from "./pages/Analytics/EditorialDashboard";

/// Pages - Authors
import AuthorsList from "./pages/Authors/AuthorsList";
import AuthorEditor from "./pages/Authors/AuthorEditor";

/// Pages - Workflow
import PostReviewHistory from "./pages/Posts/PostReviewHistory";
import LanguageAudit from "./pages/Posts/LanguageAudit";

/// Pages - Tools
import UTMGenerator from "./pages/Tools/UTMGenerator";

/// Pages - RecallVET
import RecallVetDashboard from "./pages/RecallVET/RecallVetDashboard";
// Clinic
import PartyList from "./pages/RecallVET/Clinic/PartyList";
import PartyForm from "./pages/RecallVET/Clinic/PartyForm";
import AnimalList from "./pages/RecallVET/Clinic/AnimalList";
import AnimalForm from "./pages/RecallVET/Clinic/AnimalForm";
import AppointmentList from "./pages/RecallVET/Clinic/AppointmentList";
import AppointmentForm from "./pages/RecallVET/Clinic/AppointmentForm";
import EncounterList from "./pages/RecallVET/Clinic/EncounterList";
import EncounterForm from "./pages/RecallVET/Clinic/EncounterForm";
import VaccinationList from "./pages/RecallVET/Clinic/VaccinationList";
import VaccinationForm from "./pages/RecallVET/Clinic/VaccinationForm";
import PrescriptionList from "./pages/RecallVET/Clinic/PrescriptionList";
import PrescriptionForm from "./pages/RecallVET/Clinic/PrescriptionForm";
import InvoiceList from "./pages/RecallVET/Clinic/InvoiceList";
import InvoiceForm from "./pages/RecallVET/Clinic/InvoiceForm";
// Farm
import FarmList from "./pages/RecallVET/Farm/FarmList";
import FarmForm from "./pages/RecallVET/Farm/FarmForm";
import FarmView from "./pages/RecallVET/Farm/FarmView";
import HerdForm from "./pages/RecallVET/Farm/HerdForm";
import VisitForm from "./pages/RecallVET/Farm/VisitForm";
import HealthEventList from "./pages/RecallVET/Farm/HealthEventList";
import HealthEventForm from "./pages/RecallVET/Farm/HealthEventForm";
// Pharmacy
import ProductList from "./pages/RecallVET/Pharmacy/ProductList";
import ProductForm from "./pages/RecallVET/Pharmacy/ProductForm";
import SupplierList from "./pages/RecallVET/Pharmacy/SupplierList";
import SupplierForm from "./pages/RecallVET/Pharmacy/SupplierForm";
import PurchaseOrderList from "./pages/RecallVET/Pharmacy/PurchaseOrderList";
import PurchaseOrderForm from "./pages/RecallVET/Pharmacy/PurchaseOrderForm";
import GoodsReceiptForm from "./pages/RecallVET/Pharmacy/GoodsReceiptForm";
import StockOverview from "./pages/RecallVET/Pharmacy/StockOverview";
import StockMovementForm from "./pages/RecallVET/Pharmacy/StockMovementForm";
import DispenseForm from "./pages/RecallVET/Pharmacy/DispenseForm";
import RetailSaleForm from "./pages/RecallVET/Pharmacy/RetailSaleForm";
import SalesList from "./pages/RecallVET/Pharmacy/SalesList";

/// Pages - Documents
import DocumentsDashboard from "./pages/Documents/DocumentsDashboard";
import DocumentsList from "./pages/Documents/DocumentsList";
import DocumentEditor from "./pages/Documents/DocumentEditor";
import DocumentView from "./pages/Documents/DocumentView";
import DocumentCategoriesList from "./pages/Documents/DocumentCategoriesList";
import DocumentCategoryEditor from "./pages/Documents/DocumentCategoryEditor";

/// Pages - Alerts
import AlertsDashboard from "./pages/Alerts/AlertsDashboard";
import AlertsList from "./pages/Alerts/AlertsList";
import AlertView from "./pages/Alerts/AlertView";
import AlertEditor from "./pages/Alerts/AlertEditor";

/// Pages - Opportunities
import OpportunitiesDashboard from "./pages/Opportunities/OpportunitiesDashboard";
import OpportunitiesList from "./pages/Opportunities/OpportunitiesList";
import OpportunityView from "./pages/Opportunities/OpportunityView";
import OpportunityEditor from "./pages/Opportunities/OpportunityEditor";

/// Pages - Ads
import AdsDashboard from "./pages/Ads/AdsDashboard";
import AdvertisementsList from "./pages/Ads/AdvertisementsList";
import AdvertisementEditor from "./pages/Ads/AdvertisementEditor";
import PlacementsList from "./pages/Ads/PlacementsList";
import PlacementEditor from "./pages/Ads/PlacementEditor";
import ProvidersSettings from "./pages/Ads/ProvidersSettings";
import AdStatistics from "./pages/Ads/AdStatistics";

/// Auth Pages
import Login from "./pages/Auth/Login";
import Registration from "./pages/Auth/Registration";
import ForgotPassword from "./pages/Auth/ForgotPassword";

/// Error Pages
import Error400 from "./pages/Error/Error400";
import Error403 from "./pages/Error/Error403";
import Error404 from "./pages/Error/Error404";
import Error500 from "./pages/Error/Error500";
import Error503 from "./pages/Error/Error503";
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
                {/* Auth Pages */}
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Registration />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />

                {/* Error Pages */}
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

                    {/* Analytics */}
                    <Route path="/analytics" element={<AnalyticsDashboard />} />

                    {/* Content Management - Posts */}
                    <Route path="/posts" element={<PostsList />} />
                    <Route path="/posts/new" element={<PostEditor />} />
                    <Route path="/posts/:id" element={<PostEditor />} />

                    <Route path="/posts/:id/reviews" element={<PostReviewHistory />} />
                    <Route path="/posts/pending-reviews" element={<PostReviewHistory />} />

                    {/* Authors */}
                    <Route path="/authors" element={<AuthorsList />} />
                    <Route path="/authors/new" element={<AuthorEditor />} />
                    <Route path="/authors/:id/edit" element={<AuthorEditor />} />

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
                    <Route path="/annuaire/view/:id" element={<AnnuaireView />} />
                    <Route path="/annuaire/new" element={<AnnuaireNew />} />
                    <Route path="/annuaire/edit/:id" element={<AnnuaireEdit />} />
                    <Route path="/annuaire/pending" element={<AnnuairePending />} />
                    <Route path="/annuaire/import" element={<AnnuaireImport />} />
                    <Route path="/annuaire/report/:id" element={<AnnuaireReport />} />

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

                    {/* Document Manager */}
                    <Route path="/documents" element={<DocumentsDashboard />} />
                    <Route path="/documents/list" element={<DocumentsList />} />
                    <Route path="/documents/new" element={<DocumentEditor />} />
                    <Route path="/documents/edit/:id" element={<DocumentEditor />} />
                    <Route path="/documents/view/:id" element={<DocumentView />} />
                    <Route path="/documents/categories" element={<DocumentCategoriesList />} />
                    <Route path="/documents/categories/new" element={<DocumentCategoryEditor />} />
                    <Route path="/documents/categories/edit/:id" element={<DocumentCategoryEditor />} />

                    {/* Alerts */}
                    <Route path="/alerts" element={<AlertsDashboard />} />
                    <Route path="/alerts/list" element={<AlertsList />} />
                    <Route path="/alerts/new" element={<AlertEditor />} />
                    <Route path="/alerts/edit/:id" element={<AlertEditor />} />
                    <Route path="/alerts/view/:id" element={<AlertView />} />

                    {/* Opportunities */}
                    <Route path="/opportunities" element={<OpportunitiesDashboard />} />
                    <Route path="/opportunities/list" element={<OpportunitiesList />} />
                    <Route path="/opportunities/view/:id" element={<OpportunityView />} />
                    <Route path="/opportunities/new" element={<OpportunityEditor />} />
                    <Route path="/opportunities/edit/:id" element={<OpportunityEditor />} />

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

                    {/* RecallVET */}
                    <Route path="/recallvet" element={<RecallVetDashboard />} />

                    {/* RecallVET - Clinic */}
                    <Route path="/recallvet/clinic/parties" element={<PartyList />} />
                    <Route path="/recallvet/clinic/parties/new" element={<PartyForm />} />
                    <Route path="/recallvet/clinic/parties/:id" element={<PartyForm />} />
                    <Route path="/recallvet/clinic/animals" element={<AnimalList />} />
                    <Route path="/recallvet/clinic/animals/new" element={<AnimalForm />} />
                    <Route path="/recallvet/clinic/animals/:id" element={<AnimalForm />} />
                    <Route path="/recallvet/clinic/appointments" element={<AppointmentList />} />
                    <Route path="/recallvet/clinic/appointments/new" element={<AppointmentForm />} />
                    <Route path="/recallvet/clinic/appointments/:id" element={<AppointmentForm />} />
                    <Route path="/recallvet/clinic/encounters" element={<EncounterList />} />
                    <Route path="/recallvet/clinic/encounters/new" element={<EncounterForm />} />
                    <Route path="/recallvet/clinic/encounters/:id" element={<EncounterForm />} />
                    <Route path="/recallvet/clinic/vaccinations" element={<VaccinationList />} />
                    <Route path="/recallvet/clinic/vaccinations/new" element={<VaccinationForm />} />
                    <Route path="/recallvet/clinic/vaccinations/:id" element={<VaccinationForm />} />
                    <Route path="/recallvet/clinic/prescriptions" element={<PrescriptionList />} />
                    <Route path="/recallvet/clinic/prescriptions/new" element={<PrescriptionForm />} />
                    <Route path="/recallvet/clinic/prescriptions/:id" element={<PrescriptionForm />} />
                    <Route path="/recallvet/clinic/invoices" element={<InvoiceList />} />
                    <Route path="/recallvet/clinic/invoices/new" element={<InvoiceForm />} />
                    <Route path="/recallvet/clinic/invoices/:id" element={<InvoiceForm />} />

                    {/* RecallVET - Farm */}
                    <Route path="/recallvet/farm/farms" element={<FarmList />} />
                    <Route path="/recallvet/farm/farms/new" element={<FarmForm />} />
                    <Route path="/recallvet/farm/farms/:id" element={<FarmView />} />
                    <Route path="/recallvet/farm/farms/:id/edit" element={<FarmForm />} />
                    <Route path="/recallvet/farm/herds" element={<FarmList />} />
                    <Route path="/recallvet/farm/herds/new" element={<HerdForm />} />
                    <Route path="/recallvet/farm/herds/:id" element={<HerdForm />} />
                    <Route path="/recallvet/farm/visits" element={<FarmList />} />
                    <Route path="/recallvet/farm/visits/new" element={<VisitForm />} />
                    <Route path="/recallvet/farm/visits/:id" element={<VisitForm />} />
                    <Route path="/recallvet/farm/health-events" element={<HealthEventList />} />
                    <Route path="/recallvet/farm/health-events/new" element={<HealthEventForm />} />
                    <Route path="/recallvet/farm/health-events/:id" element={<HealthEventForm />} />

                    {/* RecallVET - Pharmacy */}
                    <Route path="/recallvet/pharmacy/products" element={<ProductList />} />
                    <Route path="/recallvet/pharmacy/products/new" element={<ProductForm />} />
                    <Route path="/recallvet/pharmacy/products/:id" element={<ProductForm />} />
                    <Route path="/recallvet/pharmacy/suppliers" element={<SupplierList />} />
                    <Route path="/recallvet/pharmacy/suppliers/new" element={<SupplierForm />} />
                    <Route path="/recallvet/pharmacy/suppliers/:id" element={<SupplierForm />} />
                    <Route path="/recallvet/pharmacy/purchase-orders" element={<PurchaseOrderList />} />
                    <Route path="/recallvet/pharmacy/purchase-orders/new" element={<PurchaseOrderForm />} />
                    <Route path="/recallvet/pharmacy/purchase-orders/:id" element={<PurchaseOrderForm />} />
                    <Route path="/recallvet/pharmacy/goods-receipts/new" element={<GoodsReceiptForm />} />
                    <Route path="/recallvet/pharmacy/stock" element={<StockOverview />} />
                    <Route path="/recallvet/pharmacy/stock/movement/new" element={<StockMovementForm />} />
                    <Route path="/recallvet/pharmacy/dispensing" element={<DispenseForm />} />
                    <Route path="/recallvet/pharmacy/dispensing/new" element={<DispenseForm />} />
                    <Route path="/recallvet/pharmacy/sales" element={<SalesList />} />
                    <Route path="/recallvet/pharmacy/sales/new" element={<RetailSaleForm />} />

                    {/* Editorial Dashboard & Tools */}
                    <Route path="/editorial-dashboard" element={<EditorialDashboard />} />
                    <Route path="/language-audit" element={<LanguageAudit />} />
                    <Route path="/utm-generator" element={<UTMGenerator />} />

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
