const API = "https://api.alquran.cloud/v1";


// =====================================================
// REQUEST
// =====================================================

async function request(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Quran API request failed");
  }

  const result = await response.json();

  if (result.code !== 200) {
    throw new Error(
      result.status || "Quran API returned an error"
    );
  }

  return result.data;
}


// =====================================================
// SURAH INFO NORMALIZER
// =====================================================

function normalizeSurah(surah = {}) {
  return {
    number: surah.number ?? null,

    name: surah.name || "",

    englishName:
      surah.englishName || "",

    englishNameTranslation:
      surah.englishNameTranslation || "",

    revelationType:
      surah.revelationType || "",

    numberOfAyahs:
      surah.numberOfAyahs ?? 0,
  };
}


// =====================================================
// AYAH NORMALIZER
// =====================================================

function normalizeAyah(
  ayah = {},
  fallbackSurah = null
) {
  const surah =
    ayah.surah || fallbackSurah || {};

  return {
    number:
      ayah.number ?? null,

    numberInSurah:
      ayah.numberInSurah ??
      ayah.number ??
      null,

    text:
      ayah.text || "",

    surah:
      normalizeSurah(surah),
  };
}


// =====================================================
// ALL SURAHS
// =====================================================

export async function getAllSurahs() {
  const data =
    await request(`${API}/surah`);

  return data.map(normalizeSurah);
}


// =====================================================
// SINGLE SURAH
// =====================================================

export async function getSurah(surahNumber) {

  const data =
    await request(
      `${API}/surah/${surahNumber}/quran-uthmani`
    );

  const surahInfo =
    normalizeSurah(data);

  const ayahs =
    (data.ayahs || []).map((ayah) =>
      normalizeAyah(
        ayah,
        surahInfo
      )
    );

  return {
    ...surahInfo,
    ayahs,
  };
}


// =====================================================
// SINGLE JUZ / PARA
// =====================================================

export async function getJuz(juzNumber) {

  const data =
    await request(
      `${API}/juz/${juzNumber}/quran-uthmani`
    );

  const ayahs =
    (data.ayahs || []).map((ayah) =>
      normalizeAyah(
        ayah,
        ayah.surah
      )
    );
    

  return {
    ...data,
    number: juzNumber,
    ayahs,
  };
}