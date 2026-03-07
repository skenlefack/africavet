import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { elearningApi } from '../../services/api';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import Pagination from '../../component/shared/Pagination';
import CourseCard from '../../component/elearning/CourseCard';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import './elearning.scss';

const LEVELS = [
  { value: '', label: 'Tous les niveaux' },
  { value: 'debutant', label: 'Debutant' },
  { value: 'intermediaire', label: 'Intermediaire' },
  { value: 'avance', label: 'Avance' },
];

const CourseCatalogPage = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9;

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadCourses();
  }, [currentPage, selectedCategory, selectedLevel, search]);

  const loadCategories = async () => {
    const res = await elearningApi.getCategories();
    if (res.success && res.data) {
      setCategories(res.data);
    }
  };

  const loadCourses = async () => {
    setLoading(true);
    setError(null);

    const params = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (search) params.search = search;
    if (selectedCategory) params.category = selectedCategory;
    if (selectedLevel) params.level = selectedLevel;

    const res = await elearningApi.getCourses(params);

    if (res.success) {
      setCourses(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
      setTotalItems(res.pagination?.total || 0);
    } else {
      setError(res.message || 'Erreur lors du chargement des formations.');
    }

    setLoading(false);
  };

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1);
  };

  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    setCurrentPage(1);
  };

  // Debounce search
  const [searchTimeout, setSearchTimeout] = useState(null);
  const handleSearchDebounced = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (searchTimeout) clearTimeout(searchTimeout);
    setSearchTimeout(
      setTimeout(() => {
        setCurrentPage(1);
      }, 500)
    );
  };

  return (
    <div className="elearning-catalog">
      <div className="container">
        {/* Hero Section */}
        <div className="catalog-hero">
          <h1>Formations en ligne</h1>
          <p>
            Developpez vos competences en sante animale, elevage et medecine
            veterinaire avec nos formations certifiantes.
          </p>
        </div>

        {/* Filters */}
        <div className="catalog-filters">
          <div className="row g-3">
            <div className="col-md-6">
              <div className="search-box">
                <FontAwesome name="search" />
                <input
                  type="text"
                  placeholder="Rechercher une formation..."
                  value={search}
                  onChange={handleSearchDebounced}
                />
              </div>
            </div>
            <div className="col-md-3">
              <select
                className="filter-select"
                value={selectedCategory}
                onChange={handleCategoryChange}
              >
                <option value="">Toutes les categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug || cat.id}>
                    {cat.name_fr || cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <select
                className="filter-select"
                value={selectedLevel}
                onChange={handleLevelChange}
              >
                {LEVELS.map((lvl) => (
                  <option key={lvl.value} value={lvl.value}>
                    {lvl.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        {!loading && (
          <div className="catalog-stats">
            {totalItems} formation{totalItems !== 1 ? 's' : ''} trouvee{totalItems !== 1 ? 's' : ''}
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSpinner text="Chargement des formations..." />}

        {/* Error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            <FontAwesome name="exclamation-triangle" /> {error}
          </div>
        )}

        {/* Course Grid */}
        {!loading && !error && (
          <>
            {courses.length === 0 ? (
              <div className="text-center py-5">
                <FontAwesome name="graduation-cap" style={{ fontSize: 48, color: '#ccc' }} />
                <h4 className="mt-3" style={{ color: '#888' }}>Aucune formation trouvee</h4>
                <p style={{ color: '#aaa' }}>Essayez de modifier vos criteres de recherche.</p>
              </div>
            ) : (
              <div className="row g-4">
                {courses.map((course) => (
                  <div key={course.id} className="col-md-6 col-lg-4">
                    <CourseCard course={course} />
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            <div className="mt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CourseCatalogPage;
