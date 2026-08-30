import {
  BookOpen,
  Bookmark,
  Moon,
  Sun,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";

import { useState } from "react";


function Navbar({
  darkMode,
  setDarkMode,
  onHome,
  onProgress,
  onBookmarks,
  activePage,
}) {

  const [mobileMenu, setMobileMenu] =
    useState(false);


  // =========================
  // CLOSE MOBILE MENU
  // =========================

  function closeMobile() {
    setMobileMenu(false);
  }


  return (

    <header className="site-header">

      <nav className="main-navbar">

        <div className="container navbar-inner">


          {/* =====================
              BRAND
          ===================== */}

          <button
            className="brand"
            onClick={() => {

              onHome();

              closeMobile();

            }}
          >

            <div className="brand-symbol">

              <div className="brand-symbol-inner">

                <BookOpen size={19} />

              </div>

            </div>


            <div className="brand-copy">

              <div className="brand-title">
                Itqan Al-Qira'ah
              </div>

              <div className="brand-caption">
                AI-assisted Quran learning
              </div>

            </div>

          </button>


          {/* =====================
              DESKTOP NAV
          ===================== */}

          <div className="desktop-nav">


            {/* QURAN */}

            <button
              className={
                activePage === "quran"
                  ? "nav-link-custom active"
                  : "nav-link-custom"
              }
              onClick={() => {

                onHome();

              }}
            >

              <BookOpen size={15} />

              Quran

            </button>


            {/* PROGRESS */}

            <button
              className={
                activePage === "progress"
                  ? "nav-link-custom active"
                  : "nav-link-custom"
              }
              onClick={() => {

                onProgress();

              }}
            >

              <TrendingUp size={15} />

              Progress

            </button>


            {/* BOOKMARK */}

            <button
              className={
                activePage === "bookmarks"
                  ? "icon-button active"
                  : "icon-button"
              }
              onClick={() => {

                onBookmarks();

              }}
              title="Bookmarks"
              aria-label="Open bookmarks"
            >

              <Bookmark size={17} />

            </button>


            {/* DARK MODE */}

            <button
              className="icon-button"
              onClick={() =>
                setDarkMode(!darkMode)
              }
              aria-label="Toggle theme"
              title="Toggle theme"
            >

              {darkMode ? (

                <Sun size={17} />

              ) : (

                <Moon size={17} />

              )}

            </button>


          </div>


          {/* =====================
              MOBILE ACTIONS
          ===================== */}

          <div className="mobile-actions">


            {/* MOBILE THEME */}

            <button
              className="icon-button"
              onClick={() =>
                setDarkMode(!darkMode)
              }
              aria-label="Toggle theme"
            >

              {darkMode ? (
                <Sun size={17} />
              ) : (
                <Moon size={17} />
              )}

            </button>


            {/* MOBILE MENU */}

            <button
              className="mobile-menu-button"
              onClick={() =>
                setMobileMenu(!mobileMenu)
              }
              aria-label="Open menu"
            >

              {mobileMenu ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}

            </button>

          </div>

        </div>


        {/* =====================
            MOBILE MENU
        ===================== */}

        {mobileMenu && (

          <div className="mobile-nav">


            {/* QURAN */}

            <button
              className={
                activePage === "quran"
                  ? "active"
                  : ""
              }
              onClick={() => {

                onHome();

                closeMobile();

              }}
            >

              <BookOpen size={16} />

              Quran

            </button>


            {/* PROGRESS */}

            <button
              className={
                activePage === "progress"
                  ? "active"
                  : ""
              }
              onClick={() => {

                onProgress();

                closeMobile();

              }}
            >

              <TrendingUp size={16} />

              Progress

            </button>


            {/* BOOKMARKS */}

            <button
              className={
                activePage === "bookmarks"
                  ? "active"
                  : ""
              }
              onClick={() => {

                onBookmarks();

                closeMobile();

              }}
            >

              <Bookmark size={16} />

              Bookmarks

            </button>

          </div>

        )}

      </nav>

    </header>

  );
}

export default Navbar;