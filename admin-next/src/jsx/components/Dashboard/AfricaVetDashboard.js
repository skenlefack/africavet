import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../../../services/AuthService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

// Lazy load react-leaflet to avoid production build issues
let MapContainer, TileLayer, CircleMarker, LTooltip;
let leafletLoaded = false;
try {
    const rl = require('react-leaflet');
    MapContainer = rl.MapContainer;
    TileLayer = rl.TileLayer;
    CircleMarker = rl.CircleMarker;
    LTooltip = rl.Tooltip;
    require('leaflet/dist/leaflet.css');
    leafletLoaded = true;
} catch (e) {
    console.warn('Leaflet not available:', e.message);
}

// African country coordinates + name normalization
const COUNTRY_COORDS = {
    'algérie': [28.03, 1.66], 'algerie': [28.03, 1.66], 'angola': [-11.20, 17.87],
    'afrique du sud': [-30.56, 22.94], 'bénin': [9.31, 2.31], 'benin': [9.31, 2.31],
    'botswana': [-22.33, 24.68], 'burkina faso': [12.36, -1.56], 'burundi': [-3.37, 29.92],
    'cameroun': [7.37, 12.35], 'cameroon': [7.37, 12.35], 'cap-vert': [16.00, -24.01],
    'centrafrique': [6.61, 20.94], 'comores': [-11.88, 43.87], 'congo': [-0.23, 15.83],
    'côte d\'ivoire': [7.54, -5.55], 'cote d\'ivoire': [7.54, -5.55],
    'djibouti': [11.59, 43.15], 'égypte': [26.82, 30.80], 'egypte': [26.82, 30.80],
    'érythrée': [15.18, 39.78], 'eswatini': [-26.52, 31.47],
    'éthiopie': [9.15, 40.49], 'ethiopie': [9.15, 40.49],
    'gabon': [-0.80, 11.61], 'gambie': [13.44, -15.31], 'ghana': [7.95, -1.02],
    'guinée': [9.95, -9.70], 'guinee': [9.95, -9.70], 'guinée équatoriale': [1.65, 10.27],
    'guinée-bissau': [11.80, -15.18], 'kenya': [-0.02, 37.91],
    'lesotho': [-29.61, 28.23], 'liberia': [6.43, -9.43], 'libye': [26.34, 17.23],
    'madagascar': [-18.77, 46.87], 'malawi': [-13.25, 34.30], 'mali': [17.57, -4.00],
    'maroc': [31.79, -7.09], 'morocco': [31.79, -7.09],
    'maurice': [-20.35, 57.55], 'mauritanie': [21.01, -10.94],
    'mozambique': [-18.67, 35.53], 'namibie': [-22.96, 18.49],
    'niger': [17.61, 8.08], 'nigeria': [9.08, 8.68], 'ouganda': [1.37, 32.29],
    'rd congo': [-4.04, 21.76], 'rdc': [-4.04, 21.76], 'rwanda': [-1.94, 29.87],
    'são tomé-et-príncipe': [0.19, 6.61], 'sénégal': [14.50, -14.45], 'senegal': [14.50, -14.45],
    'seychelles': [-4.68, 55.49], 'sierra leone': [8.46, -11.78],
    'somalie': [5.15, 46.20], 'soudan': [12.86, 30.22], 'soudan du sud': [6.88, 31.31],
    'tanzanie': [-6.37, 34.89], 'tchad': [15.45, 18.73], 'chad': [15.45, 18.73],
    'togo': [8.62, 1.21], 'tunisie': [33.89, 9.54],
    'zambie': [-13.13, 27.85], 'zimbabwe': [-19.02, 29.15],
};

const COLORS = ['#7ac142', '#354e84', '#E67E22', '#E74C3C', '#9B59B6', '#3498DB', '#1ABC9C', '#F39C12'];

function AfricaVetDashboard() {
    const [stats, setStats] = useState(null);
    const [recentPosts, setRecentPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axiosInstance.get('/dashboard/stats').then(r => { if (r.data.success) setStats(r.data.data); }).catch(console.error).finally(() => setLoading(false));
        axiosInstance.get('/posts?limit=5&sort=created_at&order=DESC').then(r => { if (r.data.success) setRecentPosts(r.data.data || []); }).catch(console.error);
    }, []);

    // Merge all geographic data (must be before early return)
    const geoData = useMemo(() => {
        const merged = {};
        const addData = (items, key) => {
            (items || []).forEach(item => {
                const name = (item.country || '').trim();
                if (!name) return;
                const k = name.toLowerCase();
                if (!merged[k]) merged[k] = { country: name, articles: 0, annuaire: 0, opportunities: 0 };
                merged[k][key] += item.count;
            });
        };
        addData(stats?.articlesByCountry, 'articles');
        addData(stats?.annuaireByCountry, 'annuaire');
        addData(stats?.opportunitiesByCountry, 'opportunities');
        // Also add user data
        addData(stats?.usersByCountry, 'users');
        return Object.values(merged)
            .map(d => {
                const coords = COUNTRY_COORDS[d.country.toLowerCase()];
                const total = d.articles + d.annuaire + d.opportunities;
                return coords ? { ...d, lat: coords[0], lng: coords[1], total } : null;
            })
            .filter(Boolean)
            .sort((a, b) => b.total - a.total);
    }, [stats]);

    if (loading) return <div style={{ textAlign: 'center', padding: '60px 0' }}><div className="spinner-border text-primary" /></div>;

    const statusData = [
        { name: 'Publiés', value: Number(stats?.posts?.published) || 0, color: '#27AE60' },
        { name: 'Brouillons', value: Number(stats?.posts?.drafts) || 0, color: '#F39C12' },
    ].filter(d => d.value > 0);

    const categoryData = (stats?.topCategories || []).map((cat, i) => ({
        name: (cat.name || '').substring(0, 14),
        articles: cat.count,
        fill: cat.color || COLORS[i % COLORS.length],
    }));

    const statCards = [
        { title: 'Articles', value: stats?.posts?.total || 0, sub: `${stats?.posts?.published || 0} publiés`, icon: 'fa-newspaper', color: '#27AE60', link: '/posts' },
        { title: 'Utilisateurs', value: stats?.users?.total || 0, sub: `${stats?.users?.active || 0} actifs`, icon: 'fa-users', color: '#3498DB', link: '/users' },
        { title: 'Catégories', value: stats?.categories?.total || 0, sub: 'actives', icon: 'fa-folder-open', color: '#E67E22', link: '/categories' },
        { title: 'Médias', value: stats?.media?.total || 0, sub: `${stats?.media?.total_size_mb || 0} MB`, icon: 'fa-photo-video', color: '#9B59B6', link: '/media' },
        { title: 'Newsletter', value: stats?.newsletter?.total || 0, sub: 'abonnés', icon: 'fa-envelope', color: '#E74C3C', link: '/newsletter' },
        { title: 'Commentaires', value: stats?.comments?.total || 0, sub: `${stats?.comments?.pending || 0} en attente`, icon: 'fa-comments', color: '#1ABC9C', link: '/posts' },
    ];

    // All layout via inline styles to avoid template CSS conflicts
    const card = { background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' };
    const cardHeader = { padding: '14px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' };
    const cardBody = { padding: '20px' };

    return (
        <div>
            {/* Banner */}
            <div style={{
                background: 'linear-gradient(135deg, #7ac142 0%, #4a7a5a 50%, #354e84 100%)',
                borderRadius: '14px', padding: '24px 28px', marginBottom: '24px',
                display: 'flex', alignItems: 'center', gap: '16px', color: '#fff'
            }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <i className="fas fa-paw" style={{ fontSize: '24px' }}></i>
                </div>
                <div>
                    <h3 style={{ margin: 0, fontWeight: '700', fontSize: '1.3rem' }}>Bienvenue sur AfricaVET</h3>
                    <p style={{ margin: 0, opacity: 0.85, fontSize: '0.88rem' }}>Panneau d'administration</p>
                </div>
            </div>

            {/* Stats Grid - 6 cards, 3 per row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                {statCards.map((s, i) => (
                    <Link key={i} to={s.link} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div style={{ ...card, borderLeft: `4px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: '14px', padding: '16px 18px', cursor: 'pointer', transition: 'box-shadow 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <i className={`fas ${s.icon}`} style={{ color: s.color, fontSize: '18px' }}></i>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.6rem', fontWeight: '800', color: s.color, lineHeight: 1 }}>{s.value}</div>
                                <div style={{ fontSize: '0.82rem', color: '#333', fontWeight: '600', marginTop: '2px' }}>
                                    {s.title} <span style={{ fontWeight: '400', color: '#999', fontSize: '0.75rem' }}>· {s.sub}</span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Map (left) + Charts (right) */}
            <div style={{ display: 'grid', gridTemplateColumns: '7fr 5fr', gap: '16px', marginBottom: '24px' }}>
                {/* Leaflet Map */}
                <div style={card}>
                    <div style={cardHeader}>
                        <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                            <i className="fas fa-globe-africa me-2" style={{ color: '#7ac142' }}></i>Répartition géographique
                        </h5>
                        <span style={{ background: '#354e84', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.7rem' }}>{geoData.length} pays</span>
                    </div>
                    <div style={{ ...cardBody, padding: 0, overflow: 'hidden', borderRadius: '0 0 12px 12px' }}>
                        {geoData.length > 0 && leafletLoaded && MapContainer ? (
                            <>
                                <div style={{ height: '340px' }}>
                                    <MapContainer
                                        center={[5, 20]}
                                        zoom={3}
                                        minZoom={2}
                                        maxZoom={7}
                                        style={{ height: '100%', width: '100%', borderRadius: '0 0 12px 12px' }}
                                        scrollWheelZoom={true}
                                        attributionControl={false}
                                    >
                                        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                                        {geoData.map((d, i) => {
                                            const maxTotal = Math.max(...geoData.map(g => g.total), 1);
                                            const radius = Math.max(8, Math.min(35, (d.total / maxTotal) * 35));
                                            return (
                                                <CircleMarker
                                                    key={i}
                                                    center={[d.lat, d.lng]}
                                                    radius={radius}
                                                    pathOptions={{
                                                        fillColor: '#7ac142',
                                                        fillOpacity: 0.6,
                                                        color: '#354e84',
                                                        weight: 2,
                                                    }}
                                                >
                                                    <LTooltip direction="top" offset={[0, -radius]} opacity={0.95}>
                                                        <div style={{ fontFamily: 'inherit', minWidth: '140px' }}>
                                                            <strong style={{ fontSize: '0.9rem', color: '#354e84' }}>{d.country}</strong>
                                                            <div style={{ borderTop: '1px solid #eee', marginTop: '4px', paddingTop: '4px', fontSize: '0.8rem', lineHeight: '1.6' }}>
                                                                {d.articles > 0 && <div><i className="fas fa-newspaper me-1" style={{ color: '#7ac142', width: '14px' }}></i> {d.articles} article{d.articles > 1 ? 's' : ''}</div>}
                                                                {d.annuaire > 0 && <div><i className="fas fa-address-book me-1" style={{ color: '#3498DB', width: '14px' }}></i> {d.annuaire} ressource{d.annuaire > 1 ? 's' : ''}</div>}
                                                                {d.opportunities > 0 && <div><i className="fas fa-briefcase me-1" style={{ color: '#E67E22', width: '14px' }}></i> {d.opportunities} opportunité{d.opportunities > 1 ? 's' : ''}</div>}
                                                            </div>
                                                        </div>
                                                    </LTooltip>
                                                </CircleMarker>
                                            );
                                        })}
                                    </MapContainer>
                                </div>
                                {/* Legend badges */}
                                <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '80px', overflowY: 'auto' }}>
                                    {geoData.slice(0, 20).map((d, i) => (
                                        <span key={i} style={{
                                            background: '#f0fdf4', color: '#166534', fontSize: '0.72rem',
                                            padding: '3px 8px', borderRadius: '6px', fontWeight: '500', whiteSpace: 'nowrap'
                                        }}>
                                            {d.country}: {d.articles > 0 ? `${d.articles}a` : ''}{d.annuaire > 0 ? ` ${d.annuaire}r` : ''}{d.opportunities > 0 ? ` ${d.opportunities}o` : ''}
                                        </span>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '60px 20px' }}>
                                <i className="fas fa-globe-africa" style={{ fontSize: '56px', opacity: 0.2 }}></i>
                                <p style={{ marginTop: '12px' }}>Données en cours de collecte</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Charts */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Donut - Articles par statut */}
                    <div style={card}>
                        <div style={cardHeader}>
                            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                <i className="fas fa-chart-pie me-2" style={{ color: '#F39C12' }}></i>Articles par statut
                            </h5>
                        </div>
                        <div style={{ padding: '10px 16px', height: '190px' }}>
                            {statusData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="45%"
                                            outerRadius={60} innerRadius={35} paddingAngle={4}>
                                            {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                        </Pie>
                                        <Tooltip formatter={v => `${v} articles`} />
                                        <Legend verticalAlign="bottom" iconType="circle" iconSize={8}
                                            formatter={(val, entry) => <span style={{ color: '#555', fontSize: '0.78rem' }}>{val}: {entry.payload.value}</span>} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : <p style={{ textAlign: 'center', color: '#999', paddingTop: '40px' }}>Aucune donnée</p>}
                        </div>
                    </div>

                    {/* Bars - Top catégories */}
                    <div style={{ ...card, flex: 1 }}>
                        <div style={cardHeader}>
                            <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                                <i className="fas fa-tags me-2" style={{ color: '#354e84' }}></i>Top catégories
                            </h5>
                        </div>
                        <div style={{ padding: '10px 8px', height: '230px' }}>
                            {categoryData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryData} layout="vertical" margin={{ left: 5, right: 20, top: 5, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                        <XAxis type="number" tick={{ fontSize: 11 }} />
                                        <YAxis type="category" dataKey="name" width={105} tick={{ fontSize: 11 }} />
                                        <Tooltip formatter={v => `${v} articles`} />
                                        <Bar dataKey="articles" radius={[0, 6, 6, 0]}>
                                            {categoryData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : <p style={{ textAlign: 'center', color: '#999', paddingTop: '40px' }}>Aucune donnée</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Posts + Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
                {/* Recent Posts */}
                <div style={card}>
                    <div style={cardHeader}>
                        <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                            <i className="fas fa-clock me-2" style={{ color: '#3498DB' }}></i>Articles récents
                        </h5>
                        <Link to="/posts" style={{ background: '#354e84', color: '#fff', padding: '5px 14px', borderRadius: '6px', fontSize: '0.78rem', textDecoration: 'none' }}>Voir tout</Link>
                    </div>
                    <div style={{ padding: 0 }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8fafc' }}>
                                    <th style={{ padding: '10px 16px', fontSize: '0.78rem', fontWeight: '600', color: '#666', textAlign: 'left' }}>Titre</th>
                                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', fontWeight: '600', color: '#666', textAlign: 'left' }}>Catégories</th>
                                    <th style={{ padding: '10px 12px', fontSize: '0.78rem', fontWeight: '600', color: '#666', textAlign: 'left' }}>Statut</th>
                                    <th style={{ padding: '10px 16px', fontSize: '0.78rem', fontWeight: '600', color: '#666', textAlign: 'left' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentPosts.length > 0 ? recentPosts.map(post => (
                                    <tr key={post.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '10px 16px' }}>
                                            <Link to={`/posts/${post.id}`} style={{ color: '#1f2937', fontWeight: '600', fontSize: '0.83rem', textDecoration: 'none' }}>
                                                {(post.title_fr || post.title || '').substring(0, 45)}{(post.title_fr || post.title || '').length > 45 ? '...' : ''}
                                            </Link>
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            {post.categories?.length > 0 ? post.categories.slice(0, 2).map(cat => (
                                                <span key={cat.id} style={{
                                                    display: 'inline-block', background: cat.color ? `${cat.color}20` : '#e5e7eb',
                                                    color: cat.color || '#6b7280', fontSize: '0.68rem', padding: '2px 7px',
                                                    borderRadius: '4px', marginRight: '4px', fontWeight: '500'
                                                }}>{cat.name_fr || cat.name}</span>
                                            )) : <span style={{ color: '#ccc' }}>—</span>}
                                        </td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <span style={{
                                                display: 'inline-block', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: '600',
                                                background: post.status === 'published' ? '#dcfce7' : '#fef3c7',
                                                color: post.status === 'published' ? '#166534' : '#92400e'
                                            }}>{post.status === 'published' ? 'Publié' : 'Brouillon'}</span>
                                        </td>
                                        <td style={{ padding: '10px 16px', color: '#9ca3af', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                                            {new Date(post.created_at).toLocaleDateString('fr-FR')}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" style={{ padding: '30px', textAlign: 'center', color: '#999' }}>Aucun article</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Quick Actions */}
                <div style={card}>
                    <div style={cardHeader}>
                        <h5 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                            <i className="fas fa-bolt me-2" style={{ color: '#F39C12' }}></i>Actions rapides
                        </h5>
                    </div>
                    <div style={{ padding: '12px 16px' }}>
                        {[
                            { title: 'Nouvel article', icon: 'fa-pen', color: '#27AE60', link: '/posts/new' },
                            { title: 'Annuaire', icon: 'fa-map-marked-alt', color: '#0d9488', link: '/annuaire' },
                            { title: 'E-Learning', icon: 'fa-graduation-cap', color: '#3498DB', link: '/elearning' },
                            { title: 'Newsletter', icon: 'fa-paper-plane', color: '#E74C3C', link: '/newsletter' },
                            { title: 'Alertes Vétérinaires', icon: 'fa-exclamation-triangle', color: '#F39C12', link: '/vet-alerts' },
                            { title: 'Paramètres', icon: 'fa-cog', color: '#6b7280', link: '/settings' },
                        ].map((a, i) => (
                            <Link key={i} to={a.link} style={{
                                display: 'flex', alignItems: 'center', gap: '12px',
                                padding: '10px 12px', marginBottom: '6px', borderRadius: '8px',
                                background: '#f8fafc', textDecoration: 'none', color: '#1f2937', transition: 'background 0.15s'
                            }}
                                onMouseEnter={e => e.currentTarget.style.background = `${a.color}10`}
                                onMouseLeave={e => e.currentTarget.style.background = '#f8fafc'}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: `${a.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                    <i className={`fas ${a.icon}`} style={{ color: a.color, fontSize: '13px' }}></i>
                                </div>
                                <span style={{ fontWeight: '600', fontSize: '0.85rem', flex: 1 }}>{a.title}</span>
                                <i className="fas fa-chevron-right" style={{ color: '#d1d5db', fontSize: '10px' }}></i>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Responsive override for mobile */}
            <style>{`
                @media (max-width: 992px) {
                    div[style*="gridTemplateColumns: repeat(3"] { grid-template-columns: repeat(2, 1fr) !important; }
                    div[style*="gridTemplateColumns: 7fr"] { grid-template-columns: 1fr !important; }
                    div[style*="gridTemplateColumns: 2fr"] { grid-template-columns: 1fr !important; }
                }
                @media (max-width: 576px) {
                    div[style*="gridTemplateColumns: repeat("] { grid-template-columns: 1fr !important; }
                }
            `}</style>
        </div>
    );
}

export default AfricaVetDashboard;
