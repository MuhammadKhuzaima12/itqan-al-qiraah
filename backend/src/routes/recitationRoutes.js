import express from "express";
import multer from "multer";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const router = express.Router();


// =========================================================
// PATHS
// =========================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const backendDirectory = path.resolve(__dirname, "../..");

const aiServicePath = path.join(
    backendDirectory,
    "ai_service.py"
);


// =========================================================
// PYTHON WORKER
// =========================================================
//
// Python starts ONCE.
// Whisper model loads ONCE.
// Worker stays alive.
//
// =========================================================

console.log("Starting Quran AI worker...");

const python = spawn(
    "python",
    [
        aiServicePath,
        "--worker"
    ],
    {
        cwd: backendDirectory,

        env: {
            ...process.env
        },

        stdio: [
            "pipe",   // stdin
            "pipe",   // stdout
            "pipe"    // stderr
        ]
    }
);


// =========================================================
// WORKER STATE
// =========================================================

let aiWorkerReady = false;

const pendingRequests = new Map();


// =========================================================
// PYTHON STDOUT
// =========================================================

let stdoutBuffer = "";

python.stdout.on("data", (data) => {

    stdoutBuffer += data.toString();

    const lines = stdoutBuffer.split("\n");

    stdoutBuffer = lines.pop();

    for (const line of lines) {

        const trimmed = line.trim();

        if (!trimmed) {
            continue;
        }

        try {

            const message = JSON.parse(trimmed);

            // ---------------------------------------------
            // MODEL READY
            // ---------------------------------------------

            if (message.type === "ready") {

                aiWorkerReady = true;

                console.log(
                    "Quran AI worker is READY."
                );

                continue;
            }

            // ---------------------------------------------
            // AI RESULT
            // ---------------------------------------------

            if (message.id) {

                const pending =
                    pendingRequests.get(message.id);

                if (!pending) {
                    continue;
                }

                pendingRequests.delete(
                    message.id
                );

                pending.resolve(
                    message.result
                );
            }

        } catch (error) {

            console.error(
                "Invalid AI worker output:",
                trimmed
            );
        }
    }
});


// =========================================================
// PYTHON STDERR
// =========================================================

python.stderr.on("data", (data) => {

    const message = data.toString().trim();

    if (message) {
        console.log(
            "[AI Worker]",
            message
        );
    }
});


// =========================================================
// PYTHON PROCESS ERROR
// =========================================================

python.on("error", (error) => {

    console.error(
        "Failed to start Python AI worker:",
        error
    );

    aiWorkerReady = false;

    for (const [
        id,
        pending
    ] of pendingRequests) {

        pending.reject(error);

        pendingRequests.delete(id);
    }
});


// =========================================================
// PYTHON PROCESS CLOSED
// =========================================================

python.on("close", (code) => {

    console.error(
        `Python AI worker stopped. Exit code: ${code}`
    );

    aiWorkerReady = false;

    for (const [
        id,
        pending
    ] of pendingRequests) {

        pending.reject(
            new Error(
                "AI worker stopped unexpectedly"
            )
        );

        pendingRequests.delete(id);
    }
});


// =========================================================
// SEND REQUEST TO PYTHON WORKER
// =========================================================

function analyzeWithAI({
    audioPath,
    surahNumber,
    ayahNumber
}) {
    if (!aiWorkerReady) {
        return Promise.reject(
            new Error(
                "Quran AI model is still loading. Please try again in a few seconds."
            )
        );
    }

    return new Promise(
        (resolve, reject) => {

            const id =
                crypto.randomUUID();

            pendingRequests.set(
                id,
                {
                    resolve,
                    reject
                }
            );

            const request = JSON.stringify({

                id,

                audioPath,

                surahNumber:
                    surahNumber || "",

                ayahNumber:
                    ayahNumber || ""
            });

            python.stdin.write(
                request + "\n"
            );
        }
    );
}


// =========================================================
// MULTER
// =========================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {

        const extension =
            path.extname(
                file.originalname
            ) || ".webm";

        cb(
            null,
            `recitation-${Date.now()}${extension}`
        );
    }
});


const upload = multer({

    storage,

    limits: {
        fileSize:
            25 * 1024 * 1024
    }
});


// =========================================================
// ANALYZE ROUTE
// =========================================================

router.post(
    "/analyze",
    upload.single("audio"),
    async (req, res) => {

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message:
                    "No audio file received"
            });
        }


        const {
            surahNumber,
            ayahNumber
        } = req.body;


        const audioPath =
            path.resolve(
                req.file.path
            );


        // -------------------------------------------------
        // Check worker
        // -------------------------------------------------

        if (!python || python.killed) {

            return res.status(500).json({

                success: false,

                message:
                    "AI worker is not running"
            });
        }


        try {

            console.log(
                "Sending audio to persistent AI worker..."
            );


            const result =
                await analyzeWithAI({

                    audioPath,

                    surahNumber,

                    ayahNumber
                });


            return res.json(result);

        } catch (error) {

            console.error(
                "AI analysis error:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "AI analysis failed",

                error:
                    error.message
            });ai_service.p
        }
    }
);


export default router;