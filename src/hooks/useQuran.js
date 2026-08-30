import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getAllSurahs,
  getJuz,
  getSurah,
} from "../services/quranApi";


function useQuran() {

  const [surahs, setSurahs] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);


  // ===================================================
  // LOAD ALL SURAHS
  // ===================================================

  useEffect(() => {

    async function loadSurahs() {

      try {

        setError(null);

        const data =
          await getAllSurahs();

        setSurahs(data);

      } catch (error) {

        console.error(
          "Surah loading error:",
          error
        );

        setError(
          "Unable to load Quran data."
        );

      }

    }

    loadSurahs();

  }, []);


  // ===================================================
  // LOAD SURAH
  // ===================================================

  const loadSurah =
    useCallback(
      async (surahNumber) => {

        setLoading(true);
        setError(null);

        try {

          const data =
            await getSurah(
              surahNumber
            );

          return data;

        } catch (error) {

          console.error(
            "Surah error:",
            error
          );

          setError(
            "Unable to open this Surah."
          );

          throw error;

        } finally {

          setLoading(false);

        }

      },
      []
    );


  // ===================================================
  // LOAD JUZ
  // ===================================================

  const loadJuz =
    useCallback(
      async (juzNumber) => {

        setLoading(true);
        setError(null);

        try {

          const data =
            await getJuz(
              juzNumber
            );

          return data;

        } catch (error) {

          console.error(
            "Juz error:",
            error
          );

          setError(
            "Unable to open this Para."
          );

          throw error;

        } finally {

          setLoading(false);

        }

      },
      []
    );


  return {
    surahs,
    loading,
    error,
    loadSurah,
    loadJuz,
  };
}


export default useQuran;