function BismillahIntro({ show }) {
  if (!show) {
    return null;
  }

  return (
    <div className="bismillah-intro">

      <div className="intro-glow"></div>

      <div className="intro-content">

        <div className="intro-top-ornament">
          ۞
        </div>

        <div className="intro-line"></div>

        <div className="intro-bismillah">
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </div>

        <div className="intro-line"></div>

        <div className="intro-subtitle">
          ITQAN AL-QIRAA'AH
        </div>

        <div className="intro-small">
          Quran Recitation & Learning
        </div>

      </div>

    </div>
  );
}

export default BismillahIntro;