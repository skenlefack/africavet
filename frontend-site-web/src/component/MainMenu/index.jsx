import React, { useState, useEffect } from "react";
import ProtoTypes from "prop-types";
import FontAwesome from "../uiStyle/FontAwesome";
import { Link, NavLink } from "react-router-dom";
import SidebarMenu from "../SidebarMenu";
import { useApp } from "../../context/AppContext";
import { menusApi } from "../../services/api";

const MainMenu = ({ className, dark }) => {
  const [sideShow, setSideShow] = useState(false);
  const [menus, setMenus] = useState([]);
  const { categories } = useApp();

  // Menu par défaut en cas d'échec de l'API
  const mainCategories = categories.filter(c => c.post_count > 0).slice(0, 8);
  const defaultMenus = [
    { id: 1, linkText: "Accueil", link: "/" },
    {
      id: 2,
      linkText: "Rubriques",
      child: true,
      icon: "angle-down",
      submenu: mainCategories.map((cat, index) => ({
        id: 20 + index,
        link: `/categorie/${cat.slug}`,
        linkText: cat.name_fr || cat.name,
      })),
    },
    { id: 3, linkText: "Actualités", link: "/categorie/news" },
    { id: 4, linkText: "One Health", link: "/categorie/one-health" },
    {
      id: 5,
      linkText: "Formations",
      child: true,
      icon: "angle-down",
      submenu: [
        { id: 51, linkText: "Catalogue", link: "/formations" },
        { id: 52, linkText: "Parcours", link: "/parcours" },
        { id: 53, linkText: "Mon apprentissage", link: "/mon-apprentissage" },
      ],
    },
    { id: 6, linkText: "Opportunités", link: "/opportunites" },
    { id: 7, linkText: "Alertes", link: "/alertes-veterinaires" },
    { id: 8, linkText: "Annuaire", link: "/annuaire" },
    { id: 9, linkText: "Contact", link: "/contact" },
  ];

  useEffect(() => {
    loadMenu();
  }, []);

  const loadMenu = async () => {
    try {
      const response = await menusApi.getByLocation('header');
      if (response.success && response.data && response.data.items) {
        const transformedMenus = transformMenuItems(response.data.items);
        setMenus(transformedMenus.length > 0 ? transformedMenus : defaultMenus);
      } else {
        setMenus(defaultMenus);
      }
    } catch (error) {
      console.error('Error loading menu:', error);
      setMenus(defaultMenus);
    }
  };

  // Convertir les anciennes URLs vers les nouvelles routes
  const transformUrl = (url) => {
    if (!url || url === '#') return url;

    // E-Learning
    if (url === '/vet-elearning/courses' || url === '/vet-elearning') return '/formations';
    if (url === '/vet-elearning/paths') return '/parcours';
    if (url === '/dashboard/certificates') return '/mon-apprentissage';

    // Opportunités
    if (url.startsWith('/opportunities')) return '/opportunites';

    // Alertes vétérinaires
    if (url === '/vet-alert/submit') return '/soumettre-alerte';
    if (url === '/vet-alert') return '/alertes-veterinaires';

    // Annuaire (vet-link)
    if (url.startsWith('/vet-link')) return '/annuaire';

    // Catégories d'articles
    if (url.startsWith('/news?category=')) {
      return `/categorie/${url.replace('/news?category=', '')}`;
    }
    if (url.startsWith('/news?type=')) return '/categorie/news';
    if (url === '/news') return '/categorie/news';

    // Zoonoses
    if (url === '/zoonoses') return '/categorie/zoonoses';

    return url;
  };

  // Transformer les items de l'API au format du composant
  const transformMenuItems = (items) => {
    return items.map(item => {
      const menuItem = {
        id: item.id,
        linkText: item.title || item.label_fr || item.label || 'Menu',
        link: transformUrl(item.url),
        target: item.target,
      };

      // Si l'item a des enfants
      if (item.children && item.children.length > 0) {
        menuItem.child = true;
        menuItem.icon = "angle-down";
        menuItem.submenu = item.children.map(child => ({
          id: child.id,
          linkText: child.title || child.label_fr || child.label || 'Sous-menu',
          link: transformUrl(child.url),
          target: child.target,
          // Support pour les sous-sous-menus
          child: child.children && child.children.length > 0,
          third_menu: child.children && child.children.length > 0
            ? child.children.map(third => ({
                id: third.id,
                linkText: third.title || third.label_fr || third.label || 'Item',
                link: transformUrl(third.url),
              }))
            : null,
        }));
      }

      return menuItem;
    });
  };

  // Utiliser le menu chargé ou le menu par défaut
  const activeMenus = menus.length > 0 ? menus : defaultMenus;

  return (
    <div className={`main-menu ${className ? className : ""}`} id="header">
      <Link to="#top" className="up_btn up_btn1">
        <FontAwesome name="chevron-double-up" />
      </Link>
      <div className="main-nav clearfix is-ts-sticky">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="nav-gradient-wrapper">
                <nav className="navbar navbar-expand-lg">
                  <div className="site-nav-inner">
                    <button
                      className="navbar-toggler"
                      onClick={() => setSideShow(true)}
                    >
                      <FontAwesome name="bars" />
                    </button>
                    <div
                      id="navbarSupportedContent"
                      className="collapse navbar-collapse navbar-responsive-collapse"
                    >
                      <ul className="nav navbar-nav" id="scroll">
                        {activeMenus.length > 0
                          ? activeMenus.map((item, i) => (
                              <li
                                key={i}
                                className={`${item.child ? "dropdown" : ""} nav-item`}
                              >
                                {item.child ? (
                                  <NavLink
                                    onClick={(e) => e.preventDefault()}
                                    to="/"
                                    className="menu-dropdown"
                                    data-toggle="dropdown"
                                  >
                                    {item.linkText}
                                    <FontAwesome name={item.icon} />
                                  </NavLink>
                                ) : (
                                  <NavLink
                                    to={item.link}
                                    className="menu-dropdown"
                                    data-toggle="dropdown"
                                  >
                                    {item.linkText}
                                    {item.icon && <FontAwesome name={item.icon} />}
                                  </NavLink>
                                )}

                                {item.child ? (
                                  <ul className="dropdown-menu" role="menu">
                                    {item.submenu.map((sub_item, j) => (
                                      <li
                                        key={j}
                                        className={sub_item.child ? "dropdown-submenu" : ""}
                                      >
                                        {sub_item.child ? (
                                          <NavLink
                                            onClick={(e) => e.preventDefault()}
                                            to="/"
                                          >
                                            {sub_item.linkText}
                                          </NavLink>
                                        ) : (
                                          <NavLink to={sub_item.link}>
                                            {sub_item.linkText}
                                          </NavLink>
                                        )}
                                        {sub_item.third_menu ? (
                                          <ul className="dropdown-menu">
                                            {sub_item.third_menu.map((third_item, k) => (
                                              <li key={k}>
                                                <NavLink to={third_item.link}>
                                                  {third_item.linkText}
                                                </NavLink>
                                              </li>
                                            ))}
                                          </ul>
                                        ) : null}
                                      </li>
                                    ))}
                                  </ul>
                                ) : null}
                              </li>
                            ))
                          : null}
                      </ul>
                    </div>
                    <SidebarMenu
                      sideShow={sideShow}
                      setSideShow={setSideShow}
                      menus={activeMenus}
                    />
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;

MainMenu.propTypes = {
  className: ProtoTypes.string,
  dark: ProtoTypes.bool,
};
