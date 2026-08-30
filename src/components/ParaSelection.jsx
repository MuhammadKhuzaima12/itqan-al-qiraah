import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Search,
} from "lucide-react";

import { useMemo, useState } from "react";

import Loading from "./Loading";


// Commonly used names/opening words of the 30 Juz
const paraNames = {
  1: "الم",
  2: "سَيَقُولُ",
  3: "تِلْكَ الرُّسُلُ",
  4: "لَنْ تَنَالُوا",
  5: "وَالْمُحْصَنَاتُ",
  6: "لَا يُحِبُّ اللَّهُ",
  7: "وَإِذَا سَمِعُوا",
  8: "وَلَوْ أَنَّنَا",
  9: "قَالَ الْمَلَأُ",
  10: "وَاعْلَمُوا",
  11: "يَعْتَذِرُونَ",
  12: "وَمَا مِنْ دَابَّةٍ",
  13: "وَمَا أُبَرِّئُ",
  14: "رُبَمَا",
  15: "سُبْحَانَ الَّذِي",
  16: "قَالَ أَلَمْ",
  17: "اقْتَرَبَ لِلنَّاسِ",
  18: "قَدْ أَفْلَحَ",
  19: "وَقَالَ الَّذِينَ",
  20: "أَمَّنْ خَلَقَ",
  21: "اتْلُ مَا أُوحِيَ",
  22: "وَمَنْ يَقْنُتْ",
  23: "وَمَا لِيَ",
  24: "فَمَنْ أَظْلَمُ",
  25: "إِلَيْهِ يُرَدُّ",
  26: "حم",
  27: "قَالَ فَمَا خَطْبُكُمْ",
  28: "قَدْ سَمِعَ اللَّهُ",
  29: "تَبَارَكَ الَّذِي",
  30: "عَمَّ",
};


function ParaSelection({
  onBack,
  onSelectPara,
  loading,
}) {

  const [search, setSearch] = useState("");


  // Search/filter Paras
  const filteredParas = useMemo(() => {

    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return Array.from(
        { length: 30 },
        (_, index) => index + 1
      );
    }

    return Array.from(
      { length: 30 },
      (_, index) => index + 1
    ).filter((number) => {

      const arabicName =
        paraNames[number] || "";

      return (
        String(number).includes(query) ||
        `para ${number}`
          .toLowerCase()
          .includes(query) ||
        `juz ${number}`
          .toLowerCase()
          .includes(query) ||
        arabicName.includes(search.trim())
      );

    });

  }, [search]);


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
            30 PARAS
          </div>

          <h2>
            Choose a Para
          </h2>

          <p>
            Select a Para to open its reading
            directly from the beginning.
          </p>

        </div>

      </div>


      {/* SEARCH */}

      <div className="selection-search">

        <Search size={17} />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Find a Para..."
          aria-label="Search Para"
        />

      </div>


      {/* CONTENT */}

      {loading ? (

        <Loading />

      ) : (

        <>

          {filteredParas.length > 0 ? (

            <div className="para-grid">

              {filteredParas.map((number) => (

                <button
                  key={number}
                  className="para-card"
                  onClick={() =>
                    onSelectPara(number)
                  }
                >

                  {/* CARD TOP */}

                  <div className="para-card-top">

                    <div className="para-card-number">
                      {String(number).padStart(2, "0")}
                    </div>

                    <ArrowRight
                      size={16}
                      className="para-card-arrow"
                    />

                  </div>


                  {/* ARABIC JUZ NAME */}

                  <div className="para-card-arabic">
                    {paraNames[number]}
                  </div>


                  {/* PARA NUMBER */}

                  <div className="para-card-title">
                    Para {number}
                  </div>


                  {/* SECONDARY LABEL */}

                  <div className="para-card-caption">
                    Juz {number}
                  </div>

                </button>

              ))}

            </div>

          ) : (

            <div className="empty-selection">

              <BookOpen size={28} />

              <h3>
                No Para found
              </h3>

              <p>
                Try searching with a Para number,
                Juz number, or Arabic name.
              </p>

            </div>

          )}

        </>

      )}

    </section>
  );
}

export default ParaSelection;