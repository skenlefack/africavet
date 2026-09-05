import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, getToken } from '../../../services/api';

const StatCard = ({ title, value, icon, color, to }) => (
  <div className="col-xl-3 col-sm-6">
    <Link to={to} className="text-decoration-none">
      <div className="card">
        <div className="card-body d-flex align-items-center justify-content-between">
          <div>
            <h2 className="fw-bold mb-0">{value}</h2>
            <span className="text-muted">{title}</span>
          </div>
          <div className={`rounded-circle p-3 bg-${color}-light`}
            style={{ background: `linear-gradient(135deg, ${color === 'primary' ? '#7ac142' : color === 'info' ? '#354e84' : color === 'warning' ? '#f0ad4e' : '#d9534f'} 0%, ${color === 'primary' ? '#354e84' : color === 'info' ? '#7ac142' : color === 'warning' ? '#ec971f' : '#c9302c'} 100%)`, width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <i className={`fas fa-${icon} text-white`} style={{ fontSize: 20 }}></i>
          </div>
        </div>
      </div>
    </Link>
  </div>
);

const RecallVetDashboard = () => {
  const [stats, setStats] = useState({ parties: 0, animals: 0, encounters: 0, appointments: 0, farms: 0, products: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = getToken();
      try {
        const [partiesRes, animalsRes] = await Promise.all([
          api.get('/v1/clinic/parties?limit=1', token),
          api.get('/v1/clinic/animals?limit=1', token),
        ]);
        setStats({
          parties: partiesRes?.pagination?.total || 0,
          animals: animalsRes?.pagination?.total || 0,
          encounters: 0,
          appointments: 0,
          farms: 0,
          products: 0,
        });
      } catch (e) {
        console.error('Dashboard stats error:', e);
      }
      setLoading(false);
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="mb-1">RecallVET</h3>
          <p className="text-muted mb-0">Gestion vétérinaire - Clinique, Élevage, Pharmacie</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : (
        <>
          <div className="row">
            <StatCard title="Clients" value={stats.parties} icon="users" color="primary" to="/recallvet/clinic/parties" />
            <StatCard title="Animaux" value={stats.animals} icon="paw" color="info" to="/recallvet/clinic/animals" />
            <StatCard title="Consultations" value={stats.encounters} icon="stethoscope" color="warning" to="/recallvet/clinic/encounters" />
            <StatCard title="Rendez-vous" value={stats.appointments} icon="calendar-check" color="danger" to="/recallvet/clinic/appointments" />
          </div>

          <div className="row mt-2">
            <div className="col-xl-4">
              <div className="card">
                <div className="card-header"><h5 className="mb-0"><i className="fas fa-clinic-medical me-2"></i>Clinique</h5></div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    <Link to="/recallvet/clinic/parties" className="list-group-item list-group-item-action"><i className="fas fa-users me-2 text-muted"></i>Clients / Propriétaires</Link>
                    <Link to="/recallvet/clinic/animals" className="list-group-item list-group-item-action"><i className="fas fa-paw me-2 text-muted"></i>Animaux / Patients</Link>
                    <Link to="/recallvet/clinic/appointments" className="list-group-item list-group-item-action"><i className="fas fa-calendar-check me-2 text-muted"></i>Rendez-vous</Link>
                    <Link to="/recallvet/clinic/encounters" className="list-group-item list-group-item-action"><i className="fas fa-stethoscope me-2 text-muted"></i>Consultations</Link>
                    <Link to="/recallvet/clinic/vaccinations" className="list-group-item list-group-item-action"><i className="fas fa-syringe me-2 text-muted"></i>Vaccinations</Link>
                    <Link to="/recallvet/clinic/prescriptions" className="list-group-item list-group-item-action"><i className="fas fa-prescription me-2 text-muted"></i>Ordonnances</Link>
                    <Link to="/recallvet/clinic/invoices" className="list-group-item list-group-item-action"><i className="fas fa-file-invoice me-2 text-muted"></i>Factures</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="card">
                <div className="card-header"><h5 className="mb-0"><i className="fas fa-warehouse me-2"></i>Élevage</h5></div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    <Link to="/recallvet/farm/farms" className="list-group-item list-group-item-action"><i className="fas fa-tractor me-2 text-muted"></i>Exploitations</Link>
                    <Link to="/recallvet/farm/herds" className="list-group-item list-group-item-action"><i className="fas fa-horse me-2 text-muted"></i>Troupeaux / Lots</Link>
                    <Link to="/recallvet/farm/visits" className="list-group-item list-group-item-action"><i className="fas fa-clipboard-check me-2 text-muted"></i>Visites</Link>
                    <Link to="/recallvet/farm/health-events" className="list-group-item list-group-item-action"><i className="fas fa-exclamation-triangle me-2 text-muted"></i>Événements sanitaires</Link>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-xl-4">
              <div className="card">
                <div className="card-header"><h5 className="mb-0"><i className="fas fa-pills me-2"></i>Pharmacie</h5></div>
                <div className="card-body p-0">
                  <div className="list-group list-group-flush">
                    <Link to="/recallvet/pharmacy/products" className="list-group-item list-group-item-action"><i className="fas fa-box me-2 text-muted"></i>Produits</Link>
                    <Link to="/recallvet/pharmacy/suppliers" className="list-group-item list-group-item-action"><i className="fas fa-truck me-2 text-muted"></i>Fournisseurs</Link>
                    <Link to="/recallvet/pharmacy/purchase-orders" className="list-group-item list-group-item-action"><i className="fas fa-shopping-cart me-2 text-muted"></i>Bons de commande</Link>
                    <Link to="/recallvet/pharmacy/stock" className="list-group-item list-group-item-action"><i className="fas fa-cubes me-2 text-muted"></i>Stock</Link>
                    <Link to="/recallvet/pharmacy/dispensing" className="list-group-item list-group-item-action"><i className="fas fa-prescription-bottle me-2 text-muted"></i>Délivrance</Link>
                    <Link to="/recallvet/pharmacy/sales" className="list-group-item list-group-item-action"><i className="fas fa-cash-register me-2 text-muted"></i>Vente comptoir</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default RecallVetDashboard;
