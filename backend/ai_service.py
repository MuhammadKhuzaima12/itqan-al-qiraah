import sys
import json
import os
import re
from difflib import SequenceMatcher

# =========================================================
# FORCE UTF-8
# =========================================================

sys.stdin.reconfigure(encoding="utf-8")
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

import torch
from transformers import pipeline

# =========================================================
# CONFIG
# =========================================================

MODEL_NAME = "tarteel-ai/whisper-base-ar-quran"
DEVICE = 0 if torch.cuda.is_available() else -1


# =========================================================
# QURAN MVP DATA
# =========================================================

QURAN_AYAHS = {
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


# =========================================================
# LOAD MODEL ONCE
# =========================================================

print(f"Loading Quran ASR model: {MODEL_NAME}", file=sys.stderr, flush=True)

asr_pipeline = pipeline("automatic-speech-recognition", model=MODEL_NAME, device=DEVICE)

print("Quran ASR model loaded.", file=sys.stderr, flush=True)


# =========================================================
# ARABIC NORMALIZATION
# =========================================================


def normalize_arabic(text):
    if not text:
        return ""

    # Remove Arabic harakat / tashkeel
    text = re.sub(r"[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]", "", text)

    # Normalize Alif variations
    text = text.replace("أ", "ا")
    text = text.replace("إ", "ا")
    text = text.replace("آ", "ا")
    text = text.replace("ٱ", "ا")

    # Normalize common Arabic letter variations
    text = text.replace("ى", "ي")
    text = text.replace("ة", "ه")

    # Remove punctuation
    text = re.sub(r"[^\w\s\u0600-\u06FF]", " ", text)

    # Normalize whitespace
    text = " ".join(text.split())

    return text.strip()


# =========================================================
# WORD SIMILARITY
# =========================================================


def word_similarity(a, b):
    if not a or not b:
        return 0.0

    return SequenceMatcher(None, a, b).ratio()


# =========================================================
# QURAN-AWARE SEQUENCE ALIGNMENT
# =========================================================


def align_words(actual_words, expected_words):

    matcher = SequenceMatcher(None, actual_words, expected_words, autojunk=False)

    operations = []

    for tag, i1, i2, j1, j2 in matcher.get_opcodes():

        # -------------------------------------------------
        # CORRECT
        # -------------------------------------------------

        if tag == "equal":

            for i, j in zip(range(i1, i2), range(j1, j2)):
                operations.append(
                    {
                        "type": "correct",
                        "expected": expected_words[j],
                        "heard": actual_words[i],
                        "position": j + 1,
                        "similarity": 1.0,
                    }
                )

        # -------------------------------------------------
        # REPLACE
        # -------------------------------------------------

        elif tag == "replace":

            actual_chunk = actual_words[i1:i2]
            expected_chunk = expected_words[j1:j2]

            max_len = max(len(actual_chunk), len(expected_chunk))

            for k in range(max_len):

                actual_word = actual_chunk[k] if k < len(actual_chunk) else None

                expected_word = expected_chunk[k] if k < len(expected_chunk) else None

                if actual_word and expected_word:

                    similarity = word_similarity(actual_word, expected_word)

                    if similarity >= 0.75:
                        error_type = "minor_mismatch"
                    else:
                        error_type = "word_mismatch"

                    operations.append(
                        {
                            "type": error_type,
                            "expected": expected_word,
                            "heard": actual_word,
                            "position": j1 + k + 1,
                            "similarity": round(similarity, 3),
                        }
                    )

                elif expected_word:

                    operations.append(
                        {
                            "type": "missing_word",
                            "expected": expected_word,
                            "heard": None,
                            "position": j1 + k + 1,
                            "similarity": 0.0,
                        }
                    )

                elif actual_word:

                    operations.append(
                        {
                            "type": "extra_word",
                            "expected": None,
                            "heard": actual_word,
                            "position": j1 + k + 1,
                            "similarity": 0.0,
                        }
                    )

        # -------------------------------------------------
        # DELETE
        # -------------------------------------------------

        elif tag == "delete":

            for j in range(j1, j2):

                operations.append(
                    {
                        "type": "missing_word",
                        "expected": expected_words[j],
                        "heard": None,
                        "position": j + 1,
                        "similarity": 0.0,
                    }
                )

        # -------------------------------------------------
        # INSERT
        # -------------------------------------------------

        elif tag == "insert":

            for i in range(i1, i2):

                operations.append(
                    {
                        "type": "extra_word",
                        "expected": None,
                        "heard": actual_words[i],
                        "position": j1 + 1,
                        "similarity": 0.0,
                    }
                )

    return operations


# =========================================================
# DETAILED SCORING
# =========================================================


def calculate_score(alignment, expected_words):

    if not expected_words:
        return 0

    total_score = 0.0

    for item in alignment:

        if item["type"] == "correct":

            total_score += 1.0

        elif item["type"] == "minor_mismatch":

            total_score += 0.65

        elif item["type"] == "word_mismatch":

            similarity = item.get("similarity", 0.0)

            total_score += similarity * 0.35

    score = (total_score / len(expected_words)) * 100

    return max(0, min(100, round(score)))


# =========================================================
# CONFIDENCE / UNCERTAINTY
# =========================================================


def calculate_confidence(score, transcription, expected):

    if not transcription:

        return {"level": "very_low", "value": 0, "reason": "No speech was detected."}

    normalized_actual = normalize_arabic(transcription)

    normalized_expected = normalize_arabic(expected)

    text_similarity = SequenceMatcher(
        None, normalized_actual, normalized_expected
    ).ratio()

    confidence = (score * 0.7) + (text_similarity * 100 * 0.3)

    confidence = round(max(0, min(100, confidence)))

    if confidence >= 85:
        level = "high"

    elif confidence >= 65:
        level = "medium"

    else:
        level = "low"

    return {
        "level": level,
        "value": confidence,
        "textSimilarity": round(text_similarity * 100),
    }


# =========================================================
# ANALYZE AUDIO
# =========================================================


def analyze_audio(audio_path, surah_number=None, ayah_number=None):

    if not os.path.exists(audio_path):

        return {"success": False, "message": "Audio file not found"}

    print("Transcribing Quran recitation...", file=sys.stderr, flush=True)

    try:

        # IMPORTANT:
        # Reuses the already-loaded model.
        result = asr_pipeline(audio_path)

    except Exception as e:

        return {
            "success": False,
            "message": "ASR transcription failed",
            "error": str(e),
        }

    transcription = result.get("text", "").strip()

    key = (str(surah_number), str(ayah_number))

    expected_text = QURAN_AYAHS.get(key)

    # =====================================================
    # NO EXPECTED AYAH
    # =====================================================

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

    # =====================================================
    # NORMALIZE
    # =====================================================

    normalized_actual = normalize_arabic(transcription)

    normalized_expected = normalize_arabic(expected_text)

    actual_words = normalized_actual.split()
    expected_words = normalized_expected.split()

    # =====================================================
    # ALIGN
    # =====================================================

    alignment = align_words(actual_words, expected_words)

    # =====================================================
    # SCORE
    # =====================================================

    score = calculate_score(alignment, expected_words)

    # =====================================================
    # ERRORS
    # =====================================================

    errors = [item for item in alignment if item["type"] != "correct"]

    # =====================================================
    # CONFIDENCE
    # =====================================================

    confidence = calculate_confidence(score, transcription, expected_text)

    # =====================================================
    # STATISTICS
    # =====================================================

    correct_count = sum(1 for item in alignment if item["type"] == "correct")

    minor_count = sum(1 for item in alignment if item["type"] == "minor_mismatch")

    mismatch_count = sum(1 for item in alignment if item["type"] == "word_mismatch")

    missing_count = sum(1 for item in alignment if item["type"] == "missing_word")

    extra_count = sum(1 for item in alignment if item["type"] == "extra_word")

    return {
        "success": True,
        "message": "Quran recitation analyzed successfully",
        "recitation": {"surahNumber": surah_number, "ayahNumber": ayah_number},
        "analysis": {
            "transcription": transcription,
            "expected": expected_text,
            "score": score,
            "status": "completed",
            "confidence": confidence,
            "statistics": {
                "expectedWords": len(expected_words),
                "heardWords": len(actual_words),
                "correctWords": correct_count,
                "minorMismatches": minor_count,
                "wordMismatches": mismatch_count,
                "missingWords": missing_count,
                "extraWords": extra_count,
            },
            "errors": errors,
        },
    }


# =========================================================
# PERSISTENT WORKER
# =========================================================
#
# Node.js keeps this Python process alive.
#
# Input:
# {"id":"123","audioPath":"...","surahNumber":"1","ayahNumber":"2"}
#
# Output:
# {"id":"123","result":{...}}
#
# =========================================================


def run_worker():

    # Tell Node that the model is ready.
    print(
        json.dumps(
            {"type": "ready", "message": "Quran ASR model ready"}, ensure_ascii=False
        ),
        flush=True,
    )

    # Keep reading requests forever.
    for line in sys.stdin:

        line = line.strip()

        if not line:
            continue

        try:

            request = json.loads(line)

            request_id = request.get("id")

            audio_path = request.get("audioPath")

            surah_number = request.get("surahNumber")

            ayah_number = request.get("ayahNumber")

            result = analyze_audio(audio_path, surah_number, ayah_number)

            response = {"id": request_id, "result": result}

        except Exception as e:

            response = {
                "id": (request.get("id") if "request" in locals() else None),
                "result": {
                    "success": False,
                    "message": "AI worker error",
                    "error": str(e),
                },
            }

        # Send exactly ONE JSON object per line.
        print(json.dumps(response, ensure_ascii=False), flush=True)


# =========================================================
# CLI MODE
# =========================================================


def run_cli():

    if len(sys.argv) < 2:

        print(
            json.dumps(
                {"success": False, "message": "Audio path is required"},
                ensure_ascii=False,
            )
        )

        sys.exit(1)

    audio_path = sys.argv[1]

    surah_number = sys.argv[2] if len(sys.argv) > 2 else None

    ayah_number = sys.argv[3] if len(sys.argv) > 3 else None

    try:

        result = analyze_audio(audio_path, surah_number, ayah_number)

        print(json.dumps(result, ensure_ascii=False))

    except Exception as e:

        print(json.dumps({"success": False, "message": str(e)}, ensure_ascii=False))

        sys.exit(1)


# =========================================================
# MAIN
# =========================================================

if __name__ == "__main__":

    # Worker mode:
    #
    # python ai_service.py --worker
    #
    if len(sys.argv) > 1 and sys.argv[1] == "--worker":

        run_worker()

    # Normal CLI testing mode:
    #
    # python ai_service.py audio.ogg 1 2
    #
    else:

        run_cli()
