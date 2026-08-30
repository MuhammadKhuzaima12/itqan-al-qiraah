import {
  useEffect,
  useState,
} from "react";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import StartScreen from "./components/StartScreen";
import ParaSelection from "./components/ParaSelection";
import SurahSelection from "./components/SurahSelection";
import QuranReader from "./components/QuranReader";
import BismillahIntro from "./components/BismillahIntro";

import useQuran from "./hooks/useQuran";

import "./index.css";


function App() {

  // =====================================================
  // QURAN HOOK
  // =====================================================

  const {
    surahs: allSurahs,
    loading,
    error: quranError,
    loadSurah,
    loadJuz,
  } = useQuran();


  // =====================================================
  // NAVIGATION STATE
  // =====================================================

  const [startMode, setStartMode] =
    useState(null);

  const [selectedSurah, setSelectedSurah] =
    useState(null);

  const [selectedJuz, setSelectedJuz] =
    useState(null);

  const [readerMode, setReaderMode] =
    useState(null);

  const [readerAyahs, setReaderAyahs] =
    useState([]);


  // =====================================================
  // UI STATE
  // =====================================================

  const [search, setSearch] =
    useState("");

  const [showBismillah, setShowBismillah] =
    useState(false);

  const [darkMode, setDarkMode] =
    useState(false);


  // =====================================================
  // BOOKMARKS
  // =====================================================

  const [bookmarks, setBookmarks] =
    useState(() => {

      try {

        const saved =
          localStorage.getItem(
            "itqan-bookmarks"
          );

        return saved
          ? JSON.parse(saved)
          : [];

      } catch {

        return [];

      }

    });


  // =====================================================
  // CONTINUE READING
  // =====================================================

  const [lastReading, setLastReading] =
    useState(() => {

      try {

        const saved =
          localStorage.getItem(
            "itqan-last-reading"
          );

        return saved
          ? JSON.parse(saved)
          : null;

      } catch {

        return null;

      }

    });


  // =====================================================
  // SAVE BOOKMARKS
  // =====================================================

  useEffect(() => {

    localStorage.setItem(
      "itqan-bookmarks",
      JSON.stringify(bookmarks)
    );

  }, [bookmarks]);


  // =====================================================
  // SAVE LAST READING
  // =====================================================

  function saveReadingPosition(
    ayahIndex
  ) {

    if (!readerMode) {
      return;
    }

    const data = {
      readerMode,

      surahNumber:
        selectedSurah?.number || null,

      surahName:
        selectedSurah?.englishName || null,

      juzNumber:
        selectedJuz || null,

      ayahIndex,

      ayahNumber:
        readerAyahs[
          ayahIndex
        ]?.numberInSurah || null,

      updatedAt:
        new Date().toISOString(),
    };


    localStorage.setItem(
      "itqan-last-reading",
      JSON.stringify(data)
    );


    setLastReading(data);
  }


  // =====================================================
  // TOGGLE BOOKMARK
  // =====================================================

  function toggleBookmark(ayah) {

    if (!ayah) {
      return;
    }

    const surah =
      ayah.surah ||
      selectedSurah;

    const id =
      `${surah?.number || "unknown"}-${
        ayah.numberInSurah ||
        ayah.number
      }`;


    const bookmark = {

      id,

      surahNumber:
        surah?.number || null,

      surahName:
        surah?.name || "",

      surahEnglishName:
        surah?.englishName || "",

      ayahNumber:
        ayah.numberInSurah ||
        ayah.number ||
        null,

      text:
        ayah.text || "",

      savedAt:
        new Date().toISOString(),

    };


    setBookmarks((current) => {

      const exists =
        current.some(
          (item) =>
            item.id === id
        );


      if (exists) {

        return current.filter(
          (item) =>
            item.id !== id
        );

      }


      return [
        ...current,
        bookmark,
      ];

    });

  }


  // =====================================================
  // OPEN SURAH
  // =====================================================

  async function openSurah(
    surahNumber
  ) {

    try {

      const data =
        await loadSurah(
          surahNumber
        );


      setReaderAyahs(
        data.ayahs || []
      );


      setSelectedSurah(data);

      setSelectedJuz(null);

      setReaderMode("surah");

      setStartMode(null);

      startBismillah();


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {

      console.error(
        "Opening Surah failed:",
        error
      );

    }

  }


  // =====================================================
  // OPEN JUZ
  // =====================================================

  async function openJuz(
    juzNumber
  ) {

    try {

      const data =
        await loadJuz(
          juzNumber
        );


      setReaderAyahs(
        data.ayahs || []
      );


      setSelectedJuz(
        juzNumber
      );

      setSelectedSurah(null);

      setReaderMode("juz");

      setStartMode(null);

      startBismillah();


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    } catch (error) {

      console.error(
        "Opening Juz failed:",
        error
      );

    }

  }


  // =====================================================
  // BISMILLAH
  // =====================================================

  function startBismillah() {

    setShowBismillah(true);


    setTimeout(() => {

      setShowBismillah(false);

    }, 2500);

  }


  // =====================================================
  // HOME
  // =====================================================

  function goHome() {

    setStartMode(null);

    setSelectedSurah(null);

    setSelectedJuz(null);

    setReaderMode(null);

    setReaderAyahs([]);

    setSearch("");


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  // =====================================================
  // CLOSE READER
  // =====================================================

  function closeReader() {

    setReaderMode(null);

    setReaderAyahs([]);

    setSelectedSurah(null);

    setSelectedJuz(null);

    setStartMode(null);


    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  }


  // =====================================================
  // CONTINUE READING
  // =====================================================

  async function continueReading() {

    if (!lastReading) {
      return;
    }


    if (
      lastReading.readerMode ===
      "surah" &&
      lastReading.surahNumber
    ) {

      await openSurah(
        lastReading.surahNumber
      );

      return;

    }


    if (
      lastReading.readerMode ===
      "juz" &&
      lastReading.juzNumber
    ) {

      await openJuz(
        lastReading.juzNumber
      );

    }

  }


  // =====================================================
  // RETURN
  // =====================================================

  return (

    <div
      className={
        darkMode
          ? "app dark-mode"
          : "app"
      }
    >

      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onHome={goHome}
      />


      <BismillahIntro
        show={showBismillah}
      />


      <main className="main-container">


        {/* GLOBAL API ERROR */}

        {quranError &&
          !readerMode &&
          !startMode && (

            <div className="quran-error">
              {quranError}
            </div>

          )}


        {/* HOME */}

        {!startMode &&
          !readerMode && (

            <StartScreen
              setStartMode={
                setStartMode
              }
              search={search}
              setSearch={setSearch}
            />

          )}


        {/* PARA */}

        {startMode === "juz" &&
          !readerMode && (

            <ParaSelection
              loading={loading}
              onBack={() =>
                setStartMode(null)
              }
              onSelectPara={
                openJuz
              }
            />

          )}


        {/* SURAH */}

        {startMode === "surah" &&
          !readerMode && (

            <SurahSelection
              allSurahs={
                allSurahs
              }
              search={search}
              setSearch={setSearch}
              onBack={() =>
                setStartMode(null)
              }
              onSelectSurah={
                openSurah
              }
            />

          )}


        {/* READER */}

        {readerMode && (

          <QuranReader

            readerMode={
              readerMode
            }

            selectedSurah={
              selectedSurah
            }

            selectedJuz={
              selectedJuz
            }

            readerAyahs={
              readerAyahs
            }

            bookmarks={
              bookmarks
            }

            lastReading={
              lastReading
            }

            onToggleBookmark={
              toggleBookmark
            }

            onSaveReadingPosition={
              saveReadingPosition
            }

            onBack={
              closeReader
            }

          />

        )}

      </main>


      <Footer />

    </div>

  );
}


export default App;