import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Search,
} from "lucide-react";

function SurahSelection({
  onBack,
  allSurahs,
  search,
  setSearch,
  onSelectSurah,
}) {
  const filteredSurahs =
    allSurahs.filter((surah) =>
      `${surah.englishName} ${surah.name} ${surah.number}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  return (
    <section className="selection-screen">

      {/* TOP */}

      <div className="selection-top">

        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="selection-meta">
          QURAN DIRECTORY
        </div>

      </div>


      {/* HEADING */}

      <div className="selection-heading premium-heading">

        <div className="heading-icon">
          <BookOpen size={22} />
        </div>

        <div>

          <div className="eyebrow">
            114 SURAHS
          </div>

          <h2>
            Choose a Surah
          </h2>

          <p>
            Select a Surah to open it from
            its first Ayah.
          </p>

        </div>

      </div>


      {/* SEARCH */}

      <div className="selection-search">

        <Search size={17} />

        <input
          type="text"
          placeholder="Search by Surah name or number..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        {search && (
          <button
            className="clear-search"
            onClick={() => setSearch("")}
          >
            Clear
          </button>
        )}

      </div>


      {/* DIRECTORY */}

      <div className="surah-directory premium-directory">

        {filteredSurahs.length === 0 ? (

          <div className="empty-state">
            No Surah found.
          </div>

        ) : (

          filteredSurahs.map((surah) => (

            <button
              key={surah.number}
              className="surah-item"
              onClick={() =>
                onSelectSurah(surah.number)
              }
            >

              <div className="surah-index">
                {String(surah.number).padStart(
                  3,
                  "0"
                )}
              </div>


              <div className="surah-name">

                <div className="surah-top-line">

                  <strong>
                    {surah.englishName}
                  </strong>

                  <span>
                    {surah.englishNameTranslation}
                  </span>

                </div>

                <small>
                  {surah.numberOfAyahs} Ayahs
                  {" • "}
                  {surah.revelationType}
                </small>

              </div>


              <div className="arabic-name">
                {surah.name}
              </div>


              <div className="surah-arrow-wrapper">
                <ArrowRight
                  size={17}
                />
              </div>

            </button>

          ))

        )}

      </div>

    </section>
  );
}

export default SurahSelection;