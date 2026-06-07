import React from "react";
import PillarsSection from "../component/PillarsSection";
import PostGallery from "../component/PostGallery";
import FeatureNews from "../component/FeatureNews";
import TrendingNews from "../component/TrendingNews";
import FollowUs from "../component/FollowUs";
import MostView from "../component/MostView";
import NewsLetter from "../component/NewsLetter";
import CategoriesWidget from "../component/CategoriesWidget";
import CategorySection from "../component/CategorySection";
import PopularPosts from "../component/PopularPosts";
import InterviewsWidget from "../component/InterviewsWidget";
import DashboardSection from "../component/DashboardSection";
import AdBanner from "../component/AdBanner";

import { Link } from "react-router-dom";

function HomePage() {
  return (
    <>
      {/* Espace après le menu */}
      <div className="space-20" />

      {/* Gallery + Recent Posts */}
      <PostGallery className="fifth_bg" />

      {/* Les 5 Piliers AfricaVET */}
      <PillarsSection />

      {/* Featured News Carousel */}
      <FeatureNews />

      {/* Trending Section */}
      <div className="container">
        <div className="row" style={{ alignItems: 'stretch' }}>
          <div className="col-lg-8">
            <TrendingNews />
          </div>
          <div className="col-md-12 col-lg-4" style={{ display: 'flex', flexDirection: 'column' }}>
            <FollowUs title="Suivez-nous" />
            <MostView title="Les Plus Vus" />
            {/* Encadré publicitaire Sidebar */}
            {/* Position: sidebar-mostview - Géré dans le gestionnaire de publicités */}
            <div className="space-20" />
            <AdBanner
              placement="sidebar-mostview"
              className="sidebar-ad"
              style={{
                width: '100%',
                flex: 1,
                minHeight: '250px',
                overflow: 'hidden'
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-30" />

      {/* One Health Section - Carousel */}
      <CategorySection
        categorySlug="one-health"
        categoryName="One Health"
        categoryIcon="globe"
        layout="carousel"
        limit={8}
      />

      <div className="space-30" />

      {/* Santé Animale + Sidebar */}
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            <CategorySection
              categorySlug="sante-animale"
              categoryName="Santé Animale"
              categoryIcon="heartbeat"
              layout="cards"
              limit={6}
            />
            {/* Encadré publicitaire après Santé Animale - 728x90px (Leaderboard) */}
            {/* Position: content-sante-animale - Géré dans le gestionnaire de publicités */}
            <div className="space-20" />
            <AdBanner
              placement="content-sante-animale"
              className="content-ad"
              style={{
                width: '100%',
                maxWidth: '728px',
                height: '90px',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#f9f9f9'
              }}
            />
          </div>
          <div className="col-lg-4">
            <NewsLetter />
            <div className="space-30" />
            <CategoriesWidget />
          </div>
        </div>
      </div>

      <div className="space-30" />

      {/* Élevage Section - Grid */}
      <div className="fifth_bg">
        <div className="space-30" />
        <div className="container">
          <CategorySection
            categorySlug="elevage"
            categoryName="Élevage"
            categoryIcon="cow"
            layout="grid"
            limit={4}
          />
        </div>
        <div className="space-30" />
      </div>

      {/* Zoonoses + Pêches */}
      <div className="container">
        <div className="space-30" />
        <div className="row">
          <div className="col-lg-6">
            <CategorySection
              categorySlug="zoonoses"
              categoryName="Zoonoses"
              categoryIcon="virus"
              layout="list"
              limit={2}
            />
          </div>
          <div className="col-lg-6">
            <CategorySection
              categorySlug="peches"
              categoryName="Pêches & Aquaculture"
              categoryIcon="fish"
              layout="list"
              limit={2}
            />
          </div>
        </div>
      </div>

      <div className="space-30" />

      {/* Opportunités Carousel */}
      <section className="opportunities-section">
        <div className="container">
          <div className="opportunities-bg">
            {/* Cercles décoratifs */}
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
            <div className="circle circle-4"></div>
            <div className="circle circle-5"></div>
          </div>
          <div className="opportunities-content">
            <CategorySection
              categorySlug="opportunites"
              categoryName="Opportunités"
              categoryIcon="briefcase"
              layout="carousel"
              limit={8}
              dark={false}
            />
          </div>
        </div>
      </section>

      {/* Faune + Sidebar */}
      <div className="container">
        <div className="space-30" />
        <div className="row">
          <div className="col-lg-8">
            <CategorySection
              categorySlug="faune"
              categoryName="Faune Sauvage"
              categoryIcon="paw"
              layout="featured"
              limit={5}
            />
          </div>
          <div className="col-lg-4">
            <PopularPosts />
          </div>
        </div>
      </div>

      <div className="space-30" />

      {/* Publications + Bannière publicitaire */}
      <div className="container">
        <div className="row events-row">
          <div className="col-lg-8">
            <CategorySection
              categorySlug="publications"
              categoryName="Événements"
              categoryIcon="calendar"
              layout="events"
              limit={4}
            />
          </div>
          <div className="col-lg-4">
            <InterviewsWidget limit={5} categorySlug="news" title="Dernières Interviews" />
            {/* Encadré publicitaire après Dernières Interviews - 300x250px */}
            {/* Position: sidebar-interviews - Géré dans le gestionnaire de publicités */}
            <div className="space-20" />
            <AdBanner
              placement="sidebar-interviews"
              className="sidebar-ad"
              style={{
                width: '350px',
                height: '400px',
                maxWidth: '100%',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                overflow: 'hidden',
                backgroundColor: '#f9f9f9'
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-30" />

      {/* Antibiorésistance - Grid */}
      <div className="container">
        <CategorySection
          categorySlug="antibioresistance"
          categoryName="Antibiorésistance"
          categoryIcon="capsules"
          layout="grid"
          limit={4}
        />
      </div>

      <div className="space-30" />

      {/* Dashboard Section - Services AfricaVET */}
      <DashboardSection />

      {/* Vétérinaires Section */}
      <div className="fifth_bg">
        <div className="space-30" />
        <div className="container">
          <CategorySection
            categorySlug="veterinaires"
            categoryName="Vétérinaires"
            categoryIcon="user-md"
            layout="carousel"
            limit={8}
          />
        </div>
        <div className="space-30" />
      </div>

      <div className="space-70" />
    </>
  );
}

export default HomePage;
