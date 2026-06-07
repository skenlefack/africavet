import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { loadingToggleAction, loginAction } from '../../store/actions/AuthActions';

function Login(props) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({ email: '', password: '' });
    const dispatch = useDispatch();

    function onLogin(e) {
        e.preventDefault();
        let error = false;
        const errorObj = { email: '', password: '' };

        if (email === '') {
            errorObj.email = 'L\'email est requis';
            error = true;
        }
        if (password === '') {
            errorObj.password = 'Le mot de passe est requis';
            error = true;
        }
        setErrors(errorObj);

        if (error) return;

        dispatch(loadingToggleAction(true));
        dispatch(loginAction(email, password, navigate));
    }

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #7ac142 0%, #5a9a3a 25%, #4a7a5a 50%, #3a6070 75%, #354e84 100%)',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Circular patterns */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                    <pattern id="circles" x="0" y="0" width="250" height="250" patternUnits="userSpaceOnUse">
                        <circle cx="125" cy="125" r="100" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                        <circle cx="125" cy="125" r="70" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
                        <circle cx="125" cy="125" r="40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#circles)"/>
            </svg>

            {/* Large rotating circles */}
            <div style={{
                position: 'absolute',
                top: '-15%',
                left: '-10%',
                width: '550px',
                height: '550px',
                border: '2px solid rgba(255,255,255,0.12)',
                borderRadius: '50%',
                animation: 'rotate1 35s linear infinite',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-5%',
                width: '450px',
                height: '450px',
                border: '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '50%',
                animation: 'rotate2 25s linear infinite',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-25%',
                right: '-10%',
                width: '600px',
                height: '600px',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                animation: 'rotate2 40s linear infinite',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                bottom: '-20%',
                right: '-5%',
                width: '500px',
                height: '500px',
                border: '1px dashed rgba(255,255,255,0.08)',
                borderRadius: '50%',
                animation: 'rotate1 30s linear infinite',
                pointerEvents: 'none'
            }} />
            <div style={{
                position: 'absolute',
                top: '30%',
                right: '-8%',
                width: '350px',
                height: '350px',
                border: '2px solid rgba(255,255,255,0.1)',
                borderRadius: '50%',
                animation: 'rotate1 20s linear infinite',
                pointerEvents: 'none'
            }} />


            {/* Login Card */}
            <div style={{
                width: '100%',
                maxWidth: '420px',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                padding: '48px 40px',
                boxShadow: '0 25px 80px rgba(0,0,0,0.25), 0 10px 30px rgba(0,0,0,0.1)',
                position: 'relative',
                zIndex: 10
            }}>
                {/* Logo */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        width: '90px',
                        height: '90px',
                        margin: '0 auto 20px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #0d9488 0%, #0891b2 100%)',
                        padding: '4px',
                        boxShadow: '0 15px 40px rgba(13, 148, 136, 0.4)'
                    }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            background: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden'
                        }}>
                            <img
                                src="/favicon-africavet.png"
                                alt="AfricaVET"
                                style={{ width: '60%', height: '60%', objectFit: 'contain' }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentElement.innerHTML = '<span style="font-size: 32px;">🐾</span>';
                                }}
                            />
                        </div>
                    </div>
                    <h2 style={{
                        color: '#0f172a',
                        fontWeight: '800',
                        fontSize: '28px',
                        marginBottom: '8px',
                        letterSpacing: '-0.5px'
                    }}>
                        Africa<span style={{ color: '#0d9488' }}>Vet</span>
                    </h2>
                    <p style={{
                        color: '#64748b',
                        fontSize: '15px',
                        margin: 0
                    }}>
                        Panneau d'administration
                    </p>
                </div>

                {/* Error Messages */}
                {props.errorMessage && (
                    <div style={{
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        marginBottom: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM10 6v4m0 4h.01" stroke="#ef4444" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span style={{ color: '#dc2626', fontSize: '14px' }}>{props.errorMessage}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={onLogin}>
                    <div style={{ marginBottom: '20px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#374151',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            Adresse email
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#0d9488'
                            }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M2.5 6.5L9.5 11L16.5 6.5M3.5 15.5h12a1 1 0 001-1v-9a1 1 0 00-1-1h-12a1 1 0 00-1 1v9a1 1 0 001 1z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@africavet.com"
                                style={{
                                    width: '100%',
                                    padding: '16px 16px 16px 48px',
                                    border: errors.email ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                    borderRadius: '14px',
                                    fontSize: '15px',
                                    transition: 'all 0.2s ease',
                                    outline: 'none',
                                    background: '#f9fafb'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#0d9488';
                                    e.target.style.background = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.email ? '#ef4444' : '#e5e7eb';
                                    e.target.style.background = '#f9fafb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                        </div>
                        {errors.email && (
                            <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                                {errors.email}
                            </p>
                        )}
                    </div>

                    <div style={{ marginBottom: '24px' }}>
                        <label style={{
                            display: 'block',
                            marginBottom: '8px',
                            color: '#374151',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            Mot de passe
                        </label>
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                position: 'absolute',
                                left: '16px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                color: '#0d9488'
                            }}>
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <rect x="3" y="8" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M6 8V5a4 4 0 118 0v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    <circle cx="10" cy="13" r="1.5" fill="currentColor"/>
                                </svg>
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                style={{
                                    width: '100%',
                                    padding: '16px 48px 16px 48px',
                                    border: errors.password ? '2px solid #ef4444' : '2px solid #e5e7eb',
                                    borderRadius: '14px',
                                    fontSize: '15px',
                                    transition: 'all 0.2s ease',
                                    outline: 'none',
                                    background: '#f9fafb'
                                }}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#0d9488';
                                    e.target.style.background = '#fff';
                                    e.target.style.boxShadow = '0 0 0 4px rgba(13, 148, 136, 0.1)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = errors.password ? '#ef4444' : '#e5e7eb';
                                    e.target.style.background = '#f9fafb';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                style={{
                                    position: 'absolute',
                                    right: '16px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#94a3b8',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
                                        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5"/>
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                        <path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z" stroke="currentColor" strokeWidth="1.5"/>
                                        <path d="M3 17L17 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                    </svg>
                                )}
                            </button>
                        </div>
                        {errors.password && (
                            <p style={{ color: '#ef4444', fontSize: '13px', marginTop: '6px', marginBottom: 0 }}>
                                {errors.password}
                            </p>
                        )}
                    </div>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '28px'
                    }}>
                        <label style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            color: '#64748b',
                            fontSize: '14px'
                        }}>
                            <input
                                type="checkbox"
                                style={{
                                    width: '18px',
                                    height: '18px',
                                    accentColor: '#0d9488',
                                    cursor: 'pointer'
                                }}
                            />
                            Se souvenir de moi
                        </label>
                        <Link
                            to="/forgot-password"
                            style={{
                                color: '#0d9488',
                                fontWeight: '600',
                                fontSize: '14px',
                                textDecoration: 'none'
                            }}
                        >
                            Mot de passe oublié?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={props.showLoading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: props.showLoading
                                ? '#94a3b8'
                                : 'linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0284c7 100%)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '14px',
                            fontSize: '16px',
                            fontWeight: '700',
                            cursor: props.showLoading ? 'not-allowed' : 'pointer',
                            boxShadow: props.showLoading
                                ? 'none'
                                : '0 10px 30px rgba(13, 148, 136, 0.4)',
                            transition: 'all 0.3s ease',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px'
                        }}
                        onMouseOver={(e) => {
                            if (!props.showLoading) {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = '0 15px 40px rgba(13, 148, 136, 0.5)';
                            }
                        }}
                        onMouseOut={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = '0 10px 30px rgba(13, 148, 136, 0.4)';
                        }}
                    >
                        {props.showLoading ? (
                            <>
                                <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: 'spin 1s linear infinite' }}>
                                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="40" strokeLinecap="round"/>
                                </svg>
                                Connexion en cours...
                            </>
                        ) : (
                            <>
                                Se connecter
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </>
                        )}
                    </button>
                </form>

            </div>

            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes rotate1 {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @keyframes rotate2 {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(-360deg); }
                }
            `}</style>
        </div>
    );
}

const mapStateToProps = (state) => {
    return {
        errorMessage: state.auth.errorMessage,
        successMessage: state.auth.successMessage,
        showLoading: state.auth.showLoading,
    };
};

export default connect(mapStateToProps)(Login);
