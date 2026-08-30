import {
  ArrowRight,
  BookOpen,
  Search,
  Sparkles,
  Mic2,
  ShieldCheck,
} from "lucide-react";

function StartScreen({
  setStartMode,
  search,
  setSearch,
}) {
  return (
    <section className="start-screen">

      {/* HERO */}

      <div className="hero-wrapper">

        <div className="hero-decoration hero-decoration-left">
          ۞
        </div>

        <div className="hero-decoration hero-decoration-right">
          ۞
        </div>

        <div className="hero-badge">
          <Sparkles size={13} />
          AI-ASSISTED QURAN RECITATION
        </div>

        <h1>
          Read the Quran.
          <span>
            Perfect your recitation.
          </span>
        </h1>

        <p className="hero-description">
          A focused Quran reading experience designed
          to help you read, listen and improve your
          recitation with intelligent guidance.
        </p>


        {/* QUICK STATS */}

        <div className="hero-stats">

          <div>
            <strong>30</strong>
            <span>Paras</span>
          </div>

          <div className="stat-divider"></div>

          <div>
            <strong>114</strong>
            <span>Surahs</span>
          </div>

          <div className="stat-divider"></div>

          <div>
            <strong>6,000+</strong>
            <span>Ayahs</span>
          </div>

        </div>

      </div>


      {/* START CARDS */}

      <div className="start-options">

        {/* PARA */}

        <button
          className="start-option premium-option"
          onClick={() => {
            setStartMode("juz");
            setSearch("");
          }}
        >

          <div className="option-number">
            01
          </div>

          <div className="option-icon">
            <BookOpen size={24} />
          </div>

          <div className="option-content">

            <div className="option-label">
              BEGIN YOUR READING
            </div>

            <strong>
              Start from Para
            </strong>

            <span>
              Choose any of the 30 Paras and
              start directly from its beginning.
            </span>

          </div>

          <div className="option-arrow">
            <ArrowRight size={19} />
          </div>

        </button>


        {/* SURAH */}

        <button
          className="start-option premium-option"
          onClick={() => {
            setStartMode("surah");
            setSearch("");
          }}
        >

          <div className="option-number">
            02
          </div>

          <div className="option-icon surah-option-icon">
            س
          </div>

          <div className="option-content">

            <div className="option-label">
              CHOOSE A CHAPTER
            </div>

            <strong>
              Start from Surah
            </strong>

            <span>
              Find a Surah and begin directly
              from its first Ayah.
            </span>

          </div>

          <div className="option-arrow">
            <ArrowRight size={19} />
          </div>

        </button>

      </div>


      {/* SEARCH */}

      <div className="quran-search-box">

        <Search size={18} />

        <input
          type="text"
          placeholder="Search Surah, Ayah or Quran..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <span className="search-shortcut">
          Search
        </span>

      </div>


      {/* AI INFO */}

      <div className="ai-home-banner">

        <div className="ai-home-icon">
          <Mic2 size={18} />
        </div>

        <div className="ai-home-content">

          <strong>
            Intelligent Recitation
          </strong>

          <span>
            AI assistance activates only when you
            choose to start recitation.
          </span>

        </div>

        <ShieldCheck
          size={18}
          className="ai-secure-icon"
        />

      </div>


      {/* QURAN DECORATION */}

      <div className="home-quran-mark">
        وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا
      </div>

    </section>
  );
}

export default StartScreen;