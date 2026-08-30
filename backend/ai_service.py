import sys
import json
import os
import re
import whisper

sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# Quran verses for the MVP
QURAN_AYahs = {
    ("1", "1"): "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    ("1", "2"): "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ",
    ("1", "3"): "الرَّحْمَٰنِ الرَّحِيمِ",
    ("1", "4"): "مَالِكِ يَوْمِ الدِّينِ",
    ("1", "5"): "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ",
    ("1", "6"): "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ",
    (
        "1",
        "7",
    ): "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
}


def normalize_arabic(text):
    """
    Remove Arabic diacritics and punctuation so that
    Whisper's output can be compared more reliably.
    """

    if not text:
        return ""

    # Remove Arabic tashkeel
    text = re.sub(r"[\u064B-\u065F\u0670]", "", text)

    # Normalize common Arabic characters
    text = text.replace("أ", "ا")
    text = text.replace("إ", "ا")
    text = text.replace("آ", "ا")
    text = text.replace("ٱ", "ا")

    # Remove punctuation
    text = re.sub(r"[^\w\s\u0600-\u06FF]", " ", text)

    # Remove extra spaces
    text = " ".join(text.split())

    return text.strip()


def compare_recitation(transcription, expected):

    actual = normalize_arabic(transcription)
    target = normalize_arabic(expected)

    actual_words = actual.split()
    target_words = target.split()

    errors = []

    # Compare word-by-word
    max_length = max(len(actual_words), len(target_words))

    for i in range(max_length):

        actual_word = actual_words[i] if i < len(actual_words) else None
        target_word = target_words[i] if i < len(target_words) else None

        if actual_word != target_word:

            if target_word and actual_word:
                errors.append(
                    {
                        "type": "word_mismatch",
                        "expected": target_word,
                        "heard": actual_word,
                        "position": i + 1,
                    }
                )

            elif target_word:
                errors.append(
                    {"type": "missing_word", "expected": target_word, "position": i + 1}
                )

            elif actual_word:
                errors.append(
                    {"type": "extra_word", "heard": actual_word, "position": i + 1}
                )

    # Simple word accuracy score
    correct_words = 0

    for i in range(min(len(actual_words), len(target_words))):
        if actual_words[i] == target_words[i]:
            correct_words += 1

    if len(target_words) > 0:
        score = round((correct_words / len(target_words)) * 100)
    else:
        score = 0

    return score, errors


def analyze_audio(audio_path, surah_number=None, ayah_number=None):

    if not os.path.exists(audio_path):
        return {"success": False, "message": "Audio file not found"}

    print("Loading Whisper model...", file=sys.stderr)

    model = whisper.load_model("tiny")

    print("Transcribing audio...", file=sys.stderr)

    result = model.transcribe(audio_path, language="ar", fp16=False)

    transcription = result["text"].strip()

    key = (str(surah_number), str(ayah_number))

    expected_text = QURAN_AYahs.get(key)

    # If we don't have this ayah yet
    if not expected_text:

        return {
            "success": True,
            "message": "Audio transcribed successfully",
            "recitation": {"surahNumber": surah_number, "ayahNumber": ayah_number},
            "analysis": {
                "transcription": transcription,
                "expected": None,
                "score": None,
                "status": "transcribed",
                "errors": [],
            },
        }

    # Compare transcription with Quran text
    score, errors = compare_recitation(transcription, expected_text)

    return {
        "success": True,
        "message": "Audio analyzed successfully",
        "recitation": {"surahNumber": surah_number, "ayahNumber": ayah_number},
        "analysis": {
            "transcription": transcription,
            "expected": expected_text,
            "score": score,
            "status": "completed",
            "errors": errors,
        },
    }


if __name__ == "__main__":

    if len(sys.argv) < 2:

        print(json.dumps({"success": False, "message": "Audio path is required"}))

        sys.exit(1)

    audio_path = sys.argv[1]

    surah_number = sys.argv[2] if len(sys.argv) > 2 else None
    ayah_number = sys.argv[3] if len(sys.argv) > 3 else None

    try:

        result = analyze_audio(audio_path, surah_number, ayah_number)

        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:

        print(json.dumps({"success": False, "message": str(e)}))
