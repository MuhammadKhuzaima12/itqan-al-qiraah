import { BookOpen } from "lucide-react";

function Loading() {
  return (
    <div className="loading-state">

      <div className="loading-symbol">
        <BookOpen size={22} />
      </div>

      <div className="loading-spinner"></div>

      <strong>
        Preparing Quran
      </strong>

      <span>
        Please wait a moment...
      </span>

    </div>
  );
}

export default Loading;