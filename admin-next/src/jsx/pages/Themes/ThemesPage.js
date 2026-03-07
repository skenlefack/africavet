import React, { useContext } from 'react';
import { ThemeContext } from '../../../context/ThemeContext';

const ThemesPage = () => {
    const {
        changePrimaryColor,
        changeSecondaryColor,
        changeNavigationHader,
        chnageHaderColor,
        chnageSidebarColor,
        changeSideBarStyle,
        changeSideBarLayout,
        changeBackground,
        changeContainerPosition,
        primaryColor,
        secondaryColor,
        navigationHader,
        haderColor,
        sidebarColor,
        sideBarStyle,
        sidebarLayout,
        background,
        containerPositionSize,
        colors,
        sideBarOption,
        layoutOption,
        backgroundOption,
        containerPosition,
    } = useContext(ThemeContext);

    const colorLabels = {
        color_1: '#6853E8', color_2: '#6610f2', color_3: '#6f42c1', color_4: '#354e84',
        color_5: '#4d9dea', color_6: '#20c997', color_7: '#7ac142', color_8: '#fd7e14',
        color_9: '#e74c3c', color_10: '#dc3545', color_11: '#f0ad4e', color_12: '#2F4858',
        color_13: '#1abc9c'
    };

    return (
        <>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="mb-1" style={{ fontWeight: '700' }}>Thèmes</h2>
                    <p className="text-muted mb-0">Personnaliser l'apparence du panneau d'administration</p>
                </div>
            </div>

            <div className="row">
                {/* Layout */}
                <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-columns me-2" style={{ color: '#354e84' }}></i>Disposition</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-4">
                                <label className="form-label fw-bold">Layout</label>
                                <div className="d-flex gap-2">
                                    {layoutOption.map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`btn btn-sm ${sidebarLayout.value === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => changeSideBarLayout(opt)}
                                            style={sidebarLayout.value === opt.value ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Style sidebar</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {sideBarOption.map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`btn btn-sm ${sideBarStyle.value === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => changeSideBarStyle(opt)}
                                            style={sideBarStyle.value === opt.value ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Mode</label>
                                <div className="d-flex gap-2">
                                    {backgroundOption.map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`btn btn-sm ${background.value === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => changeBackground(opt)}
                                            style={background.value === opt.value ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>
                                            <i className={`fas fa-${opt.value === 'light' ? 'sun' : 'moon'} me-1`}></i>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="form-label fw-bold">Conteneur</label>
                                <div className="d-flex gap-2">
                                    {containerPosition.map(opt => (
                                        <button key={opt.value} type="button"
                                            className={`btn btn-sm ${containerPositionSize.value === opt.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                                            onClick={() => changeContainerPosition(opt)}
                                            style={containerPositionSize.value === opt.value ? { background: '#7ac142', borderColor: '#7ac142' } : {}}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Colors */}
                <div className="col-lg-6 mb-4">
                    <div className="card h-100">
                        <div className="card-header">
                            <h5 className="mb-0"><i className="fas fa-palette me-2" style={{ color: '#7ac142' }}></i>Couleurs</h5>
                        </div>
                        <div className="card-body">
                            <div className="mb-4">
                                <label className="form-label fw-bold">Couleur primaire</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {colors.map(c => (
                                        <button key={c} type="button"
                                            className="btn btn-sm p-0 border-0"
                                            onClick={() => changePrimaryColor(c)}
                                            title={c}
                                            style={{
                                                width: '30px', height: '30px', borderRadius: '50%',
                                                background: colorLabels[c] || '#999',
                                                outline: primaryColor === c ? '3px solid #333' : 'none',
                                                outlineOffset: '2px'
                                            }}>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Couleur secondaire</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {colors.map(c => (
                                        <button key={c} type="button"
                                            className="btn btn-sm p-0 border-0"
                                            onClick={() => changeSecondaryColor(c)}
                                            title={c}
                                            style={{
                                                width: '30px', height: '30px', borderRadius: '50%',
                                                background: colorLabels[c] || '#999',
                                                outline: secondaryColor === c ? '3px solid #333' : 'none',
                                                outlineOffset: '2px'
                                            }}>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Navigation header</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {colors.map(c => (
                                        <button key={c} type="button"
                                            className="btn btn-sm p-0 border-0"
                                            onClick={() => changeNavigationHader(c)}
                                            title={c}
                                            style={{
                                                width: '30px', height: '30px', borderRadius: '50%',
                                                background: colorLabels[c] || '#999',
                                                outline: navigationHader === c ? '3px solid #333' : 'none',
                                                outlineOffset: '2px'
                                            }}>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label fw-bold">Header</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {colors.map(c => (
                                        <button key={c} type="button"
                                            className="btn btn-sm p-0 border-0"
                                            onClick={() => chnageHaderColor(c)}
                                            title={c}
                                            style={{
                                                width: '30px', height: '30px', borderRadius: '50%',
                                                background: colorLabels[c] || '#999',
                                                outline: haderColor === c ? '3px solid #333' : 'none',
                                                outlineOffset: '2px'
                                            }}>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="form-label fw-bold">Sidebar</label>
                                <div className="d-flex gap-2 flex-wrap">
                                    {colors.map(c => (
                                        <button key={c} type="button"
                                            className="btn btn-sm p-0 border-0"
                                            onClick={() => chnageSidebarColor(c)}
                                            title={c}
                                            style={{
                                                width: '30px', height: '30px', borderRadius: '50%',
                                                background: colorLabels[c] || '#999',
                                                outline: sidebarColor === c ? '3px solid #333' : 'none',
                                                outlineOffset: '2px'
                                            }}>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ThemesPage;
