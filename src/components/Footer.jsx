import {
  BookOpen,
  Sparkles,
} from "lucide-react";

function Footer() {
  return (
    <footer className="footer-v2">

      <div className="footer-pattern"></div>

      <div className="container footer-inner">

        <div className="footer-brand">

          <div className="footer-icon">
            <BookOpen size={18} />
          </div>

          <div>

            <strong>
              Itqan Al-Qira'ah
            </strong>

            <span>
              AI-assisted Quran recitation learning
            </span>

          </div>

        </div>


        <div className="footer-center">

          <Sparkles size={14} />

          <span>
            Read • Listen • Improve
          </span>

        </div>


        <div className="footer-arabic">
          القرآن الكريم
        </div>

      </div>

    </footer>
  );
}

export default Footer;