import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import FontAwesome from "../../component/uiStyle/FontAwesome";
import LoadingSpinner from "../../component/shared/LoadingSpinner";
import Pagination from "../../component/shared/Pagination";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { notificationsApi } from "../../services/api";
import "./profile.scss";

const NOTIFICATION_TYPES = [
  { value: "all", label: "Tous", icon: "fa fa-inbox" },
  { value: "opportunity", label: "Opportunites", icon: "fa fa-briefcase" },
  { value: "vet_alert", label: "Alertes", icon: "fa fa-exclamation-triangle" },
  { value: "elearning", label: "E-Learning", icon: "fa fa-book" },
  { value: "system", label: "Systeme", icon: "fa fa-cog" },
];

const TYPE_CONFIG = {
  opportunity: { icon: "briefcase", color: "#2563eb", bgColor: "#eff6ff", label: "Opportunite" },
  vet_alert: { icon: "exclamation-triangle", color: "#dc2626", bgColor: "#fef2f2", label: "Alerte" },
  elearning: { icon: "book", color: "#7ac142", bgColor: "#f0fdf4", label: "E-Learning" },
  system: { icon: "cog", color: "#6b7280", bgColor: "#f3f4f6", label: "Systeme" },
  default: { icon: "bell", color: "#354e84", bgColor: "#eef2ff", label: "Notification" },
};

const NotificationsPage = () => {
  const { token } = useAuth();
  const { markAsRead: ctxMarkAsRead, markAllAsRead: ctxMarkAllAsRead, fetchUnreadCount } = useNotifications();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const loadNotifications = useCallback(async (page = 1, type = "all") => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (type !== "all") {
        params.type = type;
      }
      const response = await notificationsApi.getAll(token, params);
      if (response.success) {
        const data = response.data;
        if (Array.isArray(data)) {
          setNotifications(data);
          setTotalPages(response.pagination?.totalPages || 1);
          setTotalItems(response.pagination?.total || data.length);
        } else {
          setNotifications(data.notifications || data.items || []);
          setTotalPages(data.totalPages || data.pagination?.totalPages || 1);
          setTotalItems(data.total || data.pagination?.total || 0);
        }
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadNotifications(currentPage, activeFilter);
    }
  }, [token, currentPage, activeFilter, loadNotifications]);

  // Relative time formatting
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffSecs < 60) return "A l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return "Hier";
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffWeeks < 4) return `Il y a ${diffWeeks} semaine${diffWeeks > 1 ? "s" : ""}`;
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const getTypeConfig = (type) => {
    return TYPE_CONFIG[type] || TYPE_CONFIG.default;
  };

  // Handle notification click
  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      setActionLoading(notification.id);
      try {
        await ctxMarkAsRead(notification.id);
        setNotifications(prev =>
          prev.map(n => n.id === notification.id ? { ...n, is_read: 1 } : n)
        );
      } catch (error) {
        console.error("Error marking as read:", error);
      } finally {
        setActionLoading(null);
      }
    }

    if (notification.link) {
      if (notification.link.startsWith("http")) {
        window.open(notification.link, "_blank");
      } else {
        navigate(notification.link);
      }
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    setActionLoading("all");
    try {
      await ctxMarkAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      showToast("Toutes les notifications ont ete marquees comme lues");
    } catch (error) {
      showToast("Erreur lors de la mise a jour", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Delete notification
  const handleDelete = async (e, id) => {
    e.stopPropagation();
    setActionLoading(id);
    try {
      const response = await notificationsApi.delete(id, token);
      if (response.success) {
        setNotifications(prev => prev.filter(n => n.id !== id));
        setTotalItems(prev => prev - 1);
        fetchUnreadCount();
        showToast("Notification supprimee");
      } else {
        showToast("Erreur lors de la suppression", "error");
      }
    } catch (error) {
      showToast("Erreur lors de la suppression", "error");
    } finally {
      setActionLoading(null);
    }
  };

  // Filter change
  const handleFilterChange = (type) => {
    setActiveFilter(type);
    setCurrentPage(1);
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="notifications-page">
      <div className="container">

        {/* Toast */}
        {toast && (
          <div className={`profile-toast ${toast.type}`}>
            <FontAwesome name={toast.type === "success" ? "check-circle" : "exclamation-circle"} />
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="toast-close">
              <FontAwesome name="times" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="notifications-header">
          <div className="notifications-header-left">
            <h1><FontAwesome name="bell" /> Notifications</h1>
            {totalItems > 0 && (
              <span className="notifications-count">{totalItems} notification{totalItems > 1 ? "s" : ""}</span>
            )}
          </div>
          <div className="notifications-header-right">
            {unreadCount > 0 && (
              <button
                className="btn-mark-all-read"
                onClick={handleMarkAllAsRead}
                disabled={actionLoading === "all"}
              >
                {actionLoading === "all" ? (
                  <span className="spinner-border spinner-border-sm me-1"></span>
                ) : (
                  <FontAwesome name="check-double" />
                )}
                {" "}Marquer tout comme lu
              </button>
            )}
          </div>
        </div>

        {/* Type filters */}
        <div className="notifications-filters">
          {NOTIFICATION_TYPES.map(type => (
            <button
              key={type.value}
              className={`filter-btn ${activeFilter === type.value ? "active" : ""}`}
              onClick={() => handleFilterChange(type.value)}
            >
              <i className={type.icon}></i>
              <span>{type.label}</span>
            </button>
          ))}
        </div>

        {/* Notification list */}
        {loading ? (
          <LoadingSpinner text="Chargement des notifications..." />
        ) : notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="empty-icon">
              <FontAwesome name="bell-slash" />
            </div>
            <h3>Aucune notification</h3>
            <p>
              {activeFilter !== "all"
                ? "Aucune notification de ce type pour le moment."
                : "Vous n'avez aucune notification. Elles apparaitront ici quand vous en recevrez."
              }
            </p>
            {activeFilter !== "all" && (
              <button className="btn-show-all" onClick={() => handleFilterChange("all")}>
                <FontAwesome name="inbox" /> Voir toutes les notifications
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map(notification => {
                const typeConfig = getTypeConfig(notification.type);
                const isUnread = !notification.is_read;

                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${isUnread ? "unread" : "read"}`}
                    onClick={() => handleNotificationClick(notification)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && handleNotificationClick(notification)}
                  >
                    <div
                      className="notification-type-icon"
                      style={{ background: typeConfig.bgColor, color: typeConfig.color }}
                    >
                      <FontAwesome name={typeConfig.icon} />
                    </div>

                    <div className="notification-content">
                      <div className="notification-header-row">
                        <span className="notification-type-label" style={{ color: typeConfig.color }}>
                          {typeConfig.label}
                        </span>
                        <span className="notification-time">
                          {getRelativeTime(notification.created_at)}
                        </span>
                      </div>
                      <h4 className="notification-title">{notification.title}</h4>
                      {notification.message && (
                        <p className="notification-message">{notification.message}</p>
                      )}
                    </div>

                    <div className="notification-actions">
                      {isUnread && <span className="unread-dot"></span>}
                      <button
                        className="btn-delete-notification"
                        onClick={(e) => handleDelete(e, notification.id)}
                        disabled={actionLoading === notification.id}
                        title="Supprimer"
                      >
                        {actionLoading === notification.id ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <FontAwesome name="trash-o" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="notifications-pagination">
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

export default NotificationsPage;
