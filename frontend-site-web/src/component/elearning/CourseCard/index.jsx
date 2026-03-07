import React from 'react';
import { Link } from 'react-router-dom';
import FontAwesome from '../../uiStyle/FontAwesome';
import { getImageUrl as resolveImageUrl } from '../../../services/api';

const LEVEL_LABELS = {
  debutant: 'Debutant',
  intermediaire: 'Intermediaire',
  avance: 'Avance',
};

const CourseCard = ({ course, showProgress = false, progress = 0 }) => {
  const getImageUrl = (path) => resolveImageUrl(path, 'https://via.placeholder.com/400x250/354e84/ffffff?text=Formation');

  const formatDuration = (minutes) => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}min` : `${h}h`;
  };

  return (
    <div className="course-card">
      <div className="course-card__image">
        <Link to={`/formations/${course.slug}`}>
          <img src={getImageUrl(course.thumbnail || course.image)} alt={course.title_fr || course.title} />
        </Link>
        {course.level && (
          <span className={`course-card__level course-card__level--${course.level}`}>
            {LEVEL_LABELS[course.level] || course.level}
          </span>
        )}
        {course.category_name && (
          <span className="course-card__category">{course.category_name}</span>
        )}
      </div>

      <div className="course-card__body">
        <h3 className="course-card__title">
          <Link to={`/formations/${course.slug}`}>
            {course.title_fr || course.title}
          </Link>
        </h3>

        {course.instructor_name && (
          <div className="course-card__instructor">
            <FontAwesome name="user" /> {course.instructor_name}
          </div>
        )}

        <div className="course-card__meta">
          {course.duration && (
            <span>
              <FontAwesome name="clock-o" /> {formatDuration(course.duration)}
            </span>
          )}
          {course.lessons_count !== undefined && (
            <span>
              <FontAwesome name="book" /> {course.lessons_count} lecons
            </span>
          )}
          {course.enrollment_count !== undefined && (
            <span>
              <FontAwesome name="users" /> {course.enrollment_count} inscrits
            </span>
          )}
        </div>
      </div>

      {showProgress && (
        <div className="course-card__progress">
          <div className="progress">
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${progress}%` }}
              aria-valuenow={progress}
              aria-valuemin="0"
              aria-valuemax="100"
            />
          </div>
          <div className="course-card__progress-text">
            {progress}% termine
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseCard;
