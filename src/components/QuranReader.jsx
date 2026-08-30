import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Mic2,
  Settings2,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import AIRecitationCard from "./AIRecitationCard";


function QuranReader({
  readerMode,
  selectedSurah,
  selectedJuz,
  readerAyahs,
  bookmarks = [],
  lastReading,
  onToggleBookmark,
  onSaveReadingPosition,
  onBack,
}) {

  // ===================================================
  // ACTIVE AYAH
  // ===================================================

  const [activeAyah, setActiveAyah] =
    useState(0);
  const [showAIRecitation, setShowAIRecitation] =
    useState(false);


  // ===================================================
  // SETTINGS
  // ===================================================

  const [showSettings, setShowSettings] =
    useState(false);

  const [fontSize, setFontSize] =
    useState(32);


  // ===================================================
  // READING PROGRESS
  // ===================================================

  const progress = useMemo(() => {

    if (!readerAyahs.length) {
      return 0;
    }

    return Math.round(
      ((activeAyah + 1) /
        readerAyahs.length) *
        100
    );

  }, [
    activeAyah,
    readerAyahs.length,
  ]);


  // ===================================================
  // RESTORE LAST READING
  // ===================================================

  useEffect(() => {

    if (
      !lastReading ||
      !readerAyahs.length
    ) {
      setActiveAyah(0);
      return;
    }


    const sameReader =
      lastReading.readerMode ===
      readerMode;


    const sameSurah =
      readerMode === "surah" &&
      lastReading.surahNumber ===
        selectedSurah?.number;


    const sameJuz =
      readerMode === "juz" &&
      lastReading.juzNumber ===
        selectedJuz;


    if (
      sameReader &&
      (sameSurah || sameJuz)
    ) {

      const savedIndex =
        Number(
          lastReading.ayahIndex
        );


      if (
        savedIndex >= 0 &&
        savedIndex <
          readerAyahs.length
      ) {

        setActiveAyah(
          savedIndex
        );

      }

    }

  }, [
    readerMode,
    selectedSurah,
    selectedJuz,
    readerAyahs,
    lastReading,
  ]);


  // ===================================================
  // SAVE POSITION WHEN AYAH CHANGES
  // ===================================================

  useEffect(() => {

    if (!readerAyahs.length) {
      return;
    }

    onSaveReadingPosition(
      activeAyah
    );

  }, [
    activeAyah,
    readerAyahs.length,
  ]);


  // ===================================================
  // GO TO AYAH
  // ===================================================

  function goToAyah(index) {

    if (
      index < 0 ||
      index >= readerAyahs.length
    ) {
      return;
    }


    setActiveAyah(index);


    setTimeout(() => {

      const element =
        document.getElementById(
          `ayah-${index}`
        );


      if (element) {

        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

      }

    }, 50);

  }


  // ===================================================
  // PREVIOUS
  // ===================================================

  function previousAyah() {

    goToAyah(
      activeAyah - 1
    );

  }


  // ===================================================
  // NEXT
  // ===================================================

  function nextAyah() {

    goToAyah(
      activeAyah + 1
    );

  }


  // ===================================================
  // CHECK BOOKMARK
  // ===================================================

  function isBookmarked(ayah) {

    const surahNumber =
      ayah?.surah?.number ||
      selectedSurah?.number;


    const ayahNumber =
      ayah?.numberInSurah ||
      ayah?.number;


    return bookmarks.some(
      (bookmark) =>
        bookmark.surahNumber ===
          surahNumber &&
        bookmark.ayahNumber ===
          ayahNumber
    );

  }


  // ===================================================
  // EMPTY STATE
  // ===================================================

  if (!readerAyahs.length) {

    return (

      <section className="reader-section">

        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to Quran
        </button>


        <div className="reader-empty">

          <BookOpen size={40} />

          <h2>
            Quran content unavailable
          </h2>

          <p>
            We couldn't load the
            requested reading.
          </p>

        </div>

      </section>

    );

  }


  // ===================================================
  // READER
  // ===================================================

  return (

    <section className="reader-section">


      {/* =================================================
          TOP NAVIGATION
      ================================================= */}

      <div className="reader-navigation">

        <button
          className="back-button"
          onClick={onBack}
        >
          <ArrowLeft size={16} />
          Back to Quran
        </button>


        <div className="reader-tools">

          <button
            className="reader-tool"
            title="Reading settings"
            onClick={() =>
              setShowSettings(
                !showSettings
              )
            }
          >
            <Settings2 size={17} />
          </button>


          {/* <button
            className="recite-button"
            title="AI Recitation - coming next phase"
          >
            <Mic2 size={16} />
            Start Recitation
          </button> */}
          <button
            className="recite-button"
            onClick={() =>
              setShowAIRecitation((current) => !current)
            }
          >
            <Mic2 size={16} />
            {showAIRecitation
              ? "Close Recitation"
              : "Start Recitation"}
          </button>

        </div>

      </div>


      {/* =================================================
          SETTINGS
      ================================================= */}

      {showSettings && (

        <div className="reader-settings">

          <div>
            <strong>
              Reading Settings
            </strong>

            <span>
              Adjust Arabic text size
            </span>
          </div>


          <div className="font-controls">

            <button
              onClick={() =>
                setFontSize(
                  Math.max(
                    24,
                    fontSize - 2
                  )
                )
              }
            >
              A−
            </button>


            <span>
              {fontSize}px
            </span>


            <button
              onClick={() =>
                setFontSize(
                  Math.min(
                    48,
                    fontSize + 2
                  )
                )
              }
            >
              A+
            </button>

          </div>

        </div>

      )}


      {/* =================================================
          STATUS BAR
      ================================================= */}

      <div className="reader-status-bar">

        <div className="reader-status-left">

          <div className="status-live-dot"></div>

          <span>
            Reading mode
          </span>

        </div>


        <div className="reader-status-right">

          {readerMode === "surah" &&
            selectedSurah && (

              <>
                <span>
                  Surah{" "}
                  {selectedSurah.number}
                </span>

                <span className="status-separator">
                  •
                </span>

                <span>
                  {
                    selectedSurah.numberOfAyahs
                  }{" "}
                  Ayahs
                </span>
              </>

            )}


          {readerMode === "juz" && (

            <>
              <span>
                Para {selectedJuz}
              </span>

              <span className="status-separator">
                •
              </span>

              <span>
                {readerAyahs.length}{" "}
                Ayahs
              </span>
            </>

          )}

        </div>

      </div>


      {/* =================================================
          PROGRESS
      ================================================= */}

      <div className="reader-progress">

        <div className="reader-progress-info">

          <span>
            Reading Progress
          </span>

          <strong>
            {progress}%
          </strong>

        </div>


        <div className="reader-progress-track">

          <div
            className="reader-progress-fill"
            style={{
              width: `${progress}%`,
            }}
          />

        </div>

      </div>


      {/* =================================================
          MUSHAF
      ================================================= */}

      <article className="mushaf-paper">


        {/* CORNERS */}

        <div className="mushaf-corner mushaf-corner-left">
          ۞
        </div>

        <div className="mushaf-corner mushaf-corner-right">
          ۞
        </div>


        {/* =================================================
            SURAH HEADER
        ================================================= */}

        {readerMode === "surah" &&
          selectedSurah && (

            <div className="surah-title">

              <div className="surah-title-ornament">

                <span></span>

                ۞

                <span></span>

              </div>


              <div className="surah-arabic-title">

                {
                  selectedSurah.name
                }

              </div>


              <h2>

                {
                  selectedSurah.englishName
                }

              </h2>


              <p>

                {
                  selectedSurah.revelationType
                }

                {" • "}

                {
                  selectedSurah.numberOfAyahs
                }

                {" Ayahs"}

              </p>


              {selectedSurah.number !==
                9 && (

                <div className="reader-bismillah">
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </div>

              )}

            </div>

          )}


        {/* =================================================
            JUZ HEADER
        ================================================= */}

        {readerMode === "juz" && (

          <div className="juz-title">

            <div className="surah-title-ornament">

              <span></span>

              ۞

              <span></span>

            </div>


            <div className="juz-label">
              PARA
            </div>


            <h1>
              {selectedJuz}
            </h1>


            <p>
              Para {selectedJuz}
              {" • "}
              Quran Reading
            </p>


            <div className="reader-bismillah">
              بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
            </div>

          </div>

        )}


        {/* =================================================
            QURAN FLOW
        ================================================= */}

        <div
          className="quran-flow"
          style={{
            "--quran-font-size":
              `${fontSize}px`,
          }}
        >

          {readerAyahs.map(
            (ayah, index) => {

              const previousAyah =
                readerAyahs[
                  index - 1
                ];


              const currentSurahNumber =
                ayah?.surah?.number;


              const previousSurahNumber =
                previousAyah?.surah?.number;


              const isNewSurah =
                readerMode === "juz" &&
                (
                  !previousAyah ||
                  currentSurahNumber !==
                    previousSurahNumber
                );


              const bookmarked =
                isBookmarked(ayah);


              const isActive =
                index === activeAyah;


              return (

                <div
                  key={
                    `${currentSurahNumber || "surah"}-${
                      ayah?.numberInSurah ||
                      index
                    }`
                  }
                >


                  {/* ===================================
                      SURAH BREAK IN JUZ
                  =================================== */}

                  {isNewSurah && (

                    <div className="juz-surah-break">

                      <div className="break-line">

                        <span></span>

                        <div>
                          ۞
                        </div>

                        <span></span>

                      </div>


                      <div className="break-arabic">

                        {
                          ayah?.surah?.name
                        }

                      </div>


                      <span className="break-english">

                        {
                          ayah?.surah?.englishName
                        }

                      </span>

                    </div>

                  )}


                  {/* ===================================
                      AYAH
                  =================================== */}

                  <div
                    id={`ayah-${index}`}
                    className={
                      isActive
                        ? "ayah-row active"
                        : "ayah-row"
                    }
                  >


                    <button
                      className={
                        bookmarked
                          ? "ayah-bookmark active"
                          : "ayah-bookmark"
                      }
                      onClick={() =>
                        onToggleBookmark(
                          ayah
                        )
                      }
                      title={
                        bookmarked
                          ? "Remove bookmark"
                          : "Bookmark Ayah"
                      }
                    >

                      <Bookmark
                        size={15}
                        fill={
                          bookmarked
                            ? "currentColor"
                            : "none"
                        }
                      />

                    </button>


                    <span
                      className="ayah"
                      onClick={() =>
                        goToAyah(
                          index
                        )
                      }
                    >

                      {ayah.text}


                      <span className="ayah-end">

                        {
                          ayah.numberInSurah
                        }

                      </span>

                    </span>

                  </div>

                </div>

              );

            }
          )}

        </div>


        {/* =================================================
            AYAH NAVIGATION
        ================================================= */}

        <div className="ayah-navigation">

          <button
            className="ayah-nav-button"
            onClick={
              previousAyah
            }
            disabled={
              activeAyah === 0
            }
          >

            <ArrowLeft size={16} />

            Previous Ayah

          </button>


          <div className="ayah-position">

            <strong>
              {activeAyah + 1}
            </strong>

            <span>
              /
            </span>

            <span>
              {readerAyahs.length}
            </span>

          </div>


          <button
            className="ayah-nav-button"
            onClick={
              nextAyah
            }
            disabled={
              activeAyah ===
              readerAyahs.length - 1
            }
          >

            Next Ayah

            <ArrowRight size={16} />

          </button>

        </div>

        
        {/* =================================================
            AI RECITATION
        ================================================= */}
        {showAIRecitation && (
          <AIRecitationCard
            ayah={readerAyahs[activeAyah]}
            selectedSurah={selectedSurah}
            selectedJuz={selectedJuz}
          />
        )}
        {/* <div className="ai-recitation-card">

          <div className="ai-recitation-top">

            <div className="ai-symbol">
              <Sparkles size={19} />
            </div>


            <div className="ai-info">

              <div className="ai-label">
                AI RECITATION
              </div>


              <strong>
                Intelligent recitation
                assistance
              </strong>


              <span>
                AI voice analysis and
                mistake correction will
                be enabled in the next
                phase.
              </span>

            </div>

          </div>


          <div className="ai-recitation-actions">

            <button
              className="ai-listen-button"
              disabled
            >
              <Headphones size={16} />
              Listen
            </button>


            <button
              className="ai-start"
              disabled
            >
              <Mic2 size={14} />
              AI Recitation
            </button>

          </div>

        </div> */}
        


        {/* =================================================
            FOOTER
        ================================================= */}

        <div className="mushaf-footer">

          <span>
            بِسْمِ اللَّهِ
          </span>


          <div className="mushaf-footer-line"></div>


          <span>
            Itqan Al-Qira'ah
          </span>

        </div>

      </article>


      {/* =================================================
          MOBILE QUICK NAV
      ================================================= */}

      <div className="reader-bottom-controls">

        <button
          onClick={
            previousAyah
          }
          disabled={
            activeAyah === 0
          }
        >
          <ChevronUp size={17} />
        </button>


        <span>
          Ayah {activeAyah + 1}
        </span>


        <button
          onClick={
            nextAyah
          }
          disabled={
            activeAyah ===
            readerAyahs.length - 1
          }
        >
          <ChevronDown size={17} />
        </button>

      </div>

    </section>

  );
}


export default QuranReader;