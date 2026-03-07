import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import './elearning.scss';

const QuizResultsPage = () => {
  const { slug, quizId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [results, setResults] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    // Get results from navigation state
    if (location.state?.results) {
      setResults(location.state.results);
    } else {
      // If no state, redirect back to quiz
      navigate(`/formations/${slug}/quiz/${quizId}`, { replace: true });
    }
  }, [location.state, slug, quizId, navigate]);

  if (!results) {
    return <LoadingSpinner fullPage text="Chargement des resultats..." />;
  }

  const score = results.score || 0;
  const passingScore = results.passing_score || 70;
  const passed = score >= passingScore;
  const totalQuestions = results.total_questions || 0;
  const correctAnswers = results.correct_answers || 0;
  const incorrectAnswers = totalQuestions - correctAnswers;

  return (
    <div className="quiz-results">
      <div className="container">
        {/* Results Card */}
        <div className="results-card">
          <div className={`results-header ${!passed ? 'failed' : ''}`}>
            <div className="score-circle">
              <span className="score-value">{Math.round(score)}%</span>
              <span className="score-label">Score</span>
            </div>
            <h2>
              {passed ? (
                <>
                  <FontAwesome name="trophy" /> Felicitations !
                </>
              ) : (
                <>
                  <FontAwesome name="times-circle" /> Dommage !
                </>
              )}
            </h2>
            <p>
              {passed
                ? 'Vous avez reussi le quiz avec succes.'
                : `Le score minimum requis est de ${passingScore}%. N'hesitez pas a reessayer.`}
            </p>
          </div>

          <div className="results-body">
            {/* Stats */}
            <div className="results-stats">
              <div className="stat-item">
                <div className="stat-value">{correctAnswers}</div>
                <div className="stat-label">Bonnes reponses</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{incorrectAnswers}</div>
                <div className="stat-label">Mauvaises reponses</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{totalQuestions}</div>
                <div className="stat-label">Total questions</div>
              </div>
            </div>

            {/* Actions */}
            <div className="results-actions">
              {passed && results.certificate_id ? (
                <Link
                  to={`/certificat/verification/${results.certificate_code || results.certificate_id}`}
                  className="btn-action primary"
                >
                  <FontAwesome name="certificate" /> Voir mon certificat
                </Link>
              ) : !passed ? (
                <Link
                  to={`/formations/${slug}/quiz/${quizId}`}
                  className="btn-action primary"
                >
                  <FontAwesome name="refresh" /> Retenter le quiz
                </Link>
              ) : null}

              <Link
                to={`/formations/${slug}`}
                className="btn-action secondary"
              >
                <FontAwesome name="arrow-left" /> Retour a la formation
              </Link>

              {isAuthenticated && (
                <Link
                  to="/mon-apprentissage"
                  className="btn-action secondary"
                >
                  <FontAwesome name="book" /> Mon apprentissage
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Answer Review */}
        {results.review && results.review.length > 0 && (
          <div className="answers-review">
            <div className="d-flex justify-content-between align-items-center">
              <h3>
                <FontAwesome name="list" /> Revision des reponses
              </h3>
              <button
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setShowReview(!showReview)}
              >
                {showReview ? 'Masquer' : 'Afficher'}
              </button>
            </div>

            {showReview && (
              <div className="mt-3">
                {results.review.map((item, index) => {
                  const isCorrect = item.is_correct;
                  return (
                    <div
                      key={item.question_id || index}
                      className={`review-item ${isCorrect ? 'correct' : 'incorrect'}`}
                    >
                      <div className="review-question">
                        <span style={{ color: '#888', fontWeight: 400 }}>
                          Q{index + 1}.{' '}
                        </span>
                        {item.question_fr || item.question}
                      </div>

                      {/* User's answer */}
                      {item.user_answer && (
                        <div
                          className={`review-answer ${isCorrect ? 'user-correct' : 'user-incorrect'}`}
                        >
                          {isCorrect ? (
                            <FontAwesome name="check" />
                          ) : (
                            <FontAwesome name="times" />
                          )}{' '}
                          Votre reponse : {item.user_answer_text || item.user_answer}
                        </div>
                      )}

                      {/* Correct answer if user was wrong */}
                      {!isCorrect && item.correct_answer_text && (
                        <div className="review-answer correct-answer">
                          <FontAwesome name="check" /> Bonne reponse :{' '}
                          {item.correct_answer_text}
                        </div>
                      )}

                      {/* Explanation */}
                      {item.explanation && (
                        <div
                          style={{
                            fontSize: 13,
                            color: '#666',
                            marginTop: 8,
                            padding: '8px 12px',
                            background: '#f8f9fa',
                            borderRadius: 6,
                          }}
                        >
                          <FontAwesome name="info-circle" /> {item.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizResultsPage;
