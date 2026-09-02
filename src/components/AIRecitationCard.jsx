import { useRef, useState } from "react";
import {
    Mic2,
    Square,
    RotateCcw,
    Loader2,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://itqan-al-qiraah-backend.vercel.app";

function AIRecitationCard({
    ayah,
    selectedSurah,
}) {
    const [recording, setRecording] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState("");
    const [audioUrl, setAudioUrl] = useState(null);

    // Correct Quran recitation
    const [correctAudioUrl, setCorrectAudioUrl] = useState(null);
    const [loadingCorrectAudio, setLoadingCorrectAudio] = useState(false);

    const recorderRef = useRef(null);
    const streamRef = useRef(null);
    const chunksRef = useRef([]);

    const surahNumber =
        ayah?.surah?.number ||
        selectedSurah?.number;

    const ayahNumber =
        ayah?.numberInSurah ||
        ayah?.number;

    // ==========================================
    // START RECORDING
    // ==========================================

    async function startRecording() {
        try {
            setError("");
            setResult(null);

            if (!navigator.mediaDevices?.getUserMedia) {
                setError(
                    "Microphone recording is not supported in this browser."
                );
                return;
            }

            const stream =
                await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });

            streamRef.current = stream;

            const mimeType =
                MediaRecorder.isTypeSupported(
                    "audio/webm;codecs=opus"
                )
                    ? "audio/webm;codecs=opus"
                    : "audio/webm";

            const recorder =
                new MediaRecorder(stream, {
                    mimeType,
                });

            chunksRef.current = [];

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    chunksRef.current.push(event.data);
                }
            };

            recorder.onstop = async () => {
                stream
                    .getTracks()
                    .forEach((track) => track.stop());

                const blob = new Blob(
                    chunksRef.current,
                    {
                        type: mimeType,
                    }
                );

                const url =
                    URL.createObjectURL(blob);

                setAudioUrl(url);

                await analyzeAudio(blob);
            };

            recorderRef.current = recorder;

            recorder.start();

            setRecording(true);

        } catch (err) {
            console.error(err);

            setError(
                "Microphone permission was denied or microphone could not be accessed."
            );
        }
    }

    // ==========================================
    // STOP RECORDING
    // ==========================================

    function stopRecording() {
        if (
            recorderRef.current &&
            recorderRef.current.state !==
            "inactive"
        ) {
            recorderRef.current.stop();

            setRecording(false);
        }
    }

    // ==========================================
    // LOAD CORRECT QURAN RECITATION
    // ==========================================

    async function loadCorrectRecitation() {
        if (!surahNumber || !ayahNumber) {
            setError(
                "Please select an Ayah first."
            );
            return;
        }

        try {
            setLoadingCorrectAudio(true);
            setError("");

            const response = await fetch(
                `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ar.alafasy`
            );

            const data =
                await response.json();

            if (
                !response.ok ||
                data.code !== 200 ||
                !data.data?.audio
            ) {
                throw new Error(
                    "Could not load correct recitation."
                );
            }

            setCorrectAudioUrl(
                data.data.audio
            );

        } catch (err) {
            console.error(err);

            setError(
                "Could not load the correct recitation."
            );

        } finally {
            setLoadingCorrectAudio(false);
        }
    }

    // ==========================================
    // SEND AUDIO TO AI BACKEND
    // ==========================================

    async function analyzeAudio(blob) {
        setAnalyzing(true);
        setError("");

        try {
            const formData =
                new FormData();

            formData.append(
                "audio",
                blob,
                "recitation.webm"
            );

            formData.append(
                "surahNumber",
                String(surahNumber)
            );

            formData.append(
                "ayahNumber",
                String(ayahNumber)
            );

            const response =
                await fetch(
                    `${API_URL}/api/recitation/analyze`,
                    {
                        method: "POST",
                        body: formData,
                    }
                );

            const data =
                await response.json();

            if (
                !response.ok ||
                !data.success
            ) {
                throw new Error(
                    data.message ||
                    "AI analysis failed"
                );
            }

            setResult(data);

        } catch (err) {
            console.error(err);

            setError(
                err.message ||
                "Could not analyze recitation."
            );

        } finally {
            setAnalyzing(false);
        }
    }

    // ==========================================
    // RESET
    // ==========================================

    function reset() {
        setResult(null);
        setError("");
        setRecording(false);

        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }

        setAudioUrl(null);

        // Remove correct recitation audio
        setCorrectAudioUrl(null);

        chunksRef.current = [];
    }

    const analysis =
        result?.analysis;

    // ==========================================
    // UI
    // ==========================================

    return (
        <div className="ai-recitation-card">

            {/* TOP SECTION */}
            <div className="ai-recitation-top">

                <div className="ai-symbol">
                    <Mic2 size={19} />
                </div>

                <div className="ai-info">

                    <div className="ai-label">
                        AI RECITATION
                    </div>

                    <strong>
                        Recite this Ayah
                    </strong>

                    <span>
                        Record your recitation and AI
                        will compare it with the Ayah.
                    </span>

                </div>

            </div>


            {/* EXPECTED AYAH */}
            {ayah?.text && (
                <div
                    className="ai-expected-ayah"
                    dir="rtl"
                >
                    {ayah.text}
                </div>
            )}


            {/* ACTIONS */}
            <div className="ai-recitation-actions">

                {/* LISTEN TO CORRECT RECITATION */}
                <button
                    className="ai-listen-button"
                    onClick={
                        loadCorrectRecitation
                    }
                    disabled={
                        loadingCorrectAudio
                    }
                >
                    {loadingCorrectAudio ? (
                        <>
                            <Loader2
                                size={16}
                                className="ai-spin"
                            />

                            Loading...
                        </>
                    ) : (
                        <>
                            🔊
                            Listen to Correct Recitation
                        </>
                    )}
                </button>


                {/* START RECORDING */}
                {!recording &&
                    !analyzing && (
                        <button
                            className="ai-start"
                            onClick={
                                startRecording
                            }
                        >
                            <Mic2 size={16} />

                            Start Recording
                        </button>
                    )}


                {/* STOP & ANALYZE */}
                {recording && (
                    <button
                        className="ai-stop"
                        onClick={
                            stopRecording
                        }
                    >
                        <Square size={15} />

                        Stop & Analyze
                    </button>
                )}


                {/* ANALYZING */}
                {analyzing && (
                    <button
                        className="ai-start"
                        disabled
                    >
                        <Loader2
                            size={16}
                            className="ai-spin"
                        />

                        Analyzing...
                    </button>
                )}


                {/* CORRECT RECITATION PLAYER */}
                {correctAudioUrl && (
                    <audio
                        controls
                        src={
                            correctAudioUrl
                        }
                        className="ai-audio-player"
                    />
                )}


                {/* USER'S RECORDED AUDIO */}
                {audioUrl && (
                    <audio
                        controls
                        src={audioUrl}
                        className="ai-audio-player"
                    />
                )}


                {/* TRY AGAIN */}
                {(result || audioUrl) &&
                    !recording &&
                    !analyzing && (
                        <button
                            className="ai-listen-button"
                            onClick={reset}
                        >
                            <RotateCcw
                                size={15}
                            />

                            Try Again
                        </button>
                    )}

            </div>


            {/* ERROR */}
            {error && (
                <div className="ai-error">

                    <AlertCircle size={17} />

                    {error}

                </div>
            )}


            {/* RESULT */}
            {analysis && (
                <div className="ai-result">

                    {/* RESULT HEADER */}
                    <div className="ai-result-header">

                        <div>

                            <div className="ai-label">
                                RESULT
                            </div>

                            <strong>
                                Analysis Complete
                            </strong>

                        </div>


                        {/* SCORE */}
                        {analysis.score !==
                            null &&
                            analysis.score !==
                            undefined && (
                                <div className="ai-score">
                                    {
                                        analysis.score
                                    }%
                                </div>
                            )}

                    </div>


                    {/* HEARD */}
                    <div className="ai-result-section">

                        <span className="ai-result-label">
                            HEARD
                        </span>

                        <p dir="rtl">
                            {
                                analysis.transcription
                            }
                        </p>

                    </div>


                    {/* EXPECTED */}
                    {analysis.expected && (
                        <div className="ai-result-section">

                            <span className="ai-result-label">
                                EXPECTED
                            </span>

                            <p dir="rtl">
                                {
                                    analysis.expected
                                }
                            </p>

                        </div>
                    )}


                    {/* MISTAKES */}
                    {analysis.errors?.length >
                        0 ? (
                        <div className="ai-errors">

                            <div className="ai-errors-title">

                                <AlertCircle
                                    size={16}
                                />

                                Mistakes

                            </div>


                            {analysis.errors.map(
                                (
                                    item,
                                    index
                                ) => (
                                    <div
                                        className="ai-error-item"
                                        key={
                                            index
                                        }
                                    >

                                        <span>
                                            {
                                                item.type
                                            }
                                        </span>


                                        <div
                                            dir="rtl"
                                        >

                                            {item.expected && (
                                                <strong>
                                                    Expected:{" "}
                                                    {
                                                        item.expected
                                                    }
                                                </strong>
                                            )}


                                            {item.heard && (
                                                <small>
                                                    Heard:{" "}
                                                    {
                                                        item.heard
                                                    }
                                                </small>
                                            )}

                                        </div>

                                    </div>
                                )
                            )}

                        </div>

                    ) : (

                        /* SUCCESS */
                        <div className="ai-success">

                            <CheckCircle2
                                size={17}
                            />

                            No word-level mistakes detected.

                        </div>

                    )}

                </div>
            )}

        </div>
    );
}

export default AIRecitationCard;