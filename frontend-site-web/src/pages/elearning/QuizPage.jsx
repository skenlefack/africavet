import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { elearningApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../component/shared/LoadingSpinner';
import FontAwesome from '../../component/uiStyle/FontAwesome';
import './elearning.scss';

const QuizPage = () => {
  const { slug, quizId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('single'); // 'single' or 'all'

  // Timer
  const [timeRemaining, setTimeRemaining] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    loadQuiz();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quizId]);

  const loadQuiz = async () => {
    setLoading(true);
    setError(null);

    const res = await elearningApi.getQuiz(quizId, token);
    if (res.success && res.data) {
      setQuiz(res.data);

      // Start timer if quiz has a time limit
      if (res.data.time_limit) {
        const totalSeconds = res.data.time_limit * 60;
        setTimeRemaining(totalSeconds);
        startTimer(totalSeconds);
      }
    } else {
      setError(res.message || 'Quiz introuvable.');
    }

    setLoading(false);
  };

  const startTimer = (seconds) => {
    let remaining = seconds;
    timerRef.current = setInterval(() => {
      remaining -= 1;
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        clearInterval(timerRef.current);
        handleSubmit(true);
      }
    }, 1000);
  };

  const formatTime = (seconds) => {
    if (seconds === null) return '';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectAnswer = (questionId, answerId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answerId }));
  };

  const handleSubmit = useCallback(
    async (autoSubmit = false) => {
      if (submitting) return;

      if (!autoSubmit) {
        const answeredCount = Object.keys(answers).length;
        const totalQuestions = quiz?.questions?.length || 0;

        if (answeredCount < totalQuestions) {
          const confirmed = window.confirm(
            `Vous avez repondu a ${answeredCount} question(s) sur ${totalQuestions}. Voulez-vous vraiment soumettre ?`
          );
          if (!confirmed) return;
        }
      }

      setSubmitting(true);

      if (timerRef.current) clearInterval(timerRef.current);

      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, answerId]) => ({
        question_id: parseInt(questionId),
        answer_id: parseInt(answerId),
      }));

      const res = await elearningApi.submitQuiz(quizId, formattedAnswers, token);
      if (res.success) {
        // Navigate to results page, passing result data via state
        navigate(`/formations/${slug}/quiz/${quizId}/resultats`, {
          state: { results: res.data },
        });
      } else {
        alert(res.message || 'Erreur lors de la soumission du quiz.');
        setSubmitting(false);
      }
    },
    [answers, quiz, submitting, token, quizId, slug, navigate]
  );

  const goToQuestion = (index) => {
    setCurrentQuestion(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingSpinner fullPage text="Chargement du quiz..." />;
  }

  if (error || !quiz) {
    return (
      <div className="container text-center py-5">
        <FontAwesome name="exclamation-triangle" style={{ fontSize: 48, color: '#ccc' }} />
        <h3 className="mt-3" style={{ color: '#888' }}>{error || 'Quiz introuvable'}</h3>
        <Link to={`/formations/${slug}`} className="btn btn-outline-secondary mt-3">
          <FontAwesome name="arrow-left" /> Retour a la formation
        </Link>
      </div>
    );
  }

  const questions = quiz.questions || [];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercent = totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const renderQuestion = (question, index) => (
    <div key={question.id} className="question-card">
      <div className="question-number">
        Question {index + 1} sur {totalQuestions}
      </div>
      <div className="question-text">
        {question.question_fr || question.question}
      </div>

      {question.image && (
        <img
          src={question.image}
          alt="Illustration de la question"
          className="question-image"
        />
      )}

      <div className="answer-options">
        {(question.answers || question.options || []).map((answer, aIndex) => {
          const isSelected = answers[question.id] === answer.id;
          return (
            <div
              key={answer.id}
              className={`answer-option ${isSelected ? 'selected' : ''}`}
              onClick={() => handleSelectAnswer(question.id, answer.id)}
            >
              <span className="answer-letter">{LETTERS[aIndex]}</span>
              <span>{answer.text_fr || answer.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="quiz-page">
      <div className="container">
        {/* Header */}
        <div className="quiz-header">
          <div>
            <h1>{quiz.title_fr || quiz.title}</h1>
            {quiz.description_fr || quiz.description ? (
              <p style={{ margin: 0, opacity: 0.85, fontSize: 14 }}>
                {quiz.description_fr || quiz.description}
              </p>
            ) : null}
          </div>
          {timeRemaining !== null && (
            <div className={`quiz-timer ${timeRemaining < 60 ? 'warning' : ''}`}>
              <FontAwesome name="clock-o" />
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>

        {/* View Mode Toggle */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${viewMode === 'single' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('single')}
              style={viewMode === 'single' ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}
            >
              <FontAwesome name="square" /> Une par une
            </button>
            <button
              className={`btn ${viewMode === 'all' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('all')}
              style={viewMode === 'all' ? { background: 'linear-gradient(135deg, #7ac142 0%, #354e84 100%)', border: 'none' } : {}}
            >
              <FontAwesome name="th-list" /> Toutes
            </button>
          </div>
          <span style={{ fontSize: 14, color: '#888' }}>
            {answeredCount}/{totalQuestions} repondu{answeredCount !== 1 ? 'es' : 'e'}
          </span>
        </div>

        {/* Progress */}
        <div className="quiz-progress">
          <div className="progress">
            <div
              className="progress-bar"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="quiz-progress__text">
            Progression: {answeredCount} sur {totalQuestions}
          </div>
        </div>

        {/* Questions */}
        {viewMode === 'single' ? (
          <>
            {questions.length > 0 && renderQuestion(questions[currentQuestion], currentQuestion)}

            {/* Single question navigation */}
            <div className="d-flex justify-content-between mt-3">
              <button
                className="btn btn-outline-secondary"
                disabled={currentQuestion === 0}
                onClick={() => goToQuestion(currentQuestion - 1)}
              >
                <FontAwesome name="arrow-left" /> Precedente
              </button>
              {currentQuestion < totalQuestions - 1 ? (
                <button
                  className="btn btn-outline-secondary"
                  onClick={() => goToQuestion(currentQuestion + 1)}
                >
                  Suivante <FontAwesome name="arrow-right" />
                </button>
              ) : null}
            </div>
          </>
        ) : (
          questions.map((q, i) => renderQuestion(q, i))
        )}

        {/* Navigation & Submit */}
        <div className="quiz-navigation">
          <div className="question-dots">
            {questions.map((q, i) => (
              <button
                key={q.id}
                className={`dot ${answers[q.id] ? 'answered' : ''} ${viewMode === 'single' && i === currentQuestion ? 'active' : ''}`}
                onClick={() => {
                  if (viewMode === 'single') goToQuestion(i);
                }}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            className="btn-submit-quiz"
            onClick={() => handleSubmit(false)}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <span className="spinner-border spinner-border-sm" /> Soumission...
              </>
            ) : (
              <>
                <FontAwesome name="paper-plane" /> Soumettre le quiz
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
