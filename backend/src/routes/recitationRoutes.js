import express from "express";
import multer from "multer";
import { spawn } from "child_process";
import path from "path";

const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        const extension = path.extname(file.originalname) || ".webm";
        cb(null, `recitation-${Date.now()}${extension}`);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 25 * 1024 * 1024
    }
});

router.post("/analyze", upload.single("audio"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            success: false,
            message: "No audio file received"
        });
    }

    const { surahNumber, ayahNumber } = req.body;

    const audioPath = path.resolve(req.file.path);

    const python = spawn(
        "python",
        [
            path.resolve("src/../ai_service.py"),
            audioPath,
            surahNumber || "",
            ayahNumber || ""
        ]
    );
//     const ffmpegPath = "C:\\Users\\KHUZAIMA\\AppData\\Local\\Microsoft\\WinGet\\Packages\\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\\ffmpeg-9.0.1-full_build\\bin";

// const python = spawn(
//     path.resolve("../.venv_Itqan/Scripts/python.exe"),
//     [
//         path.resolve("ai_service.py"),
//         audioPath,
//         surahNumber || "",
//         ayahNumber || ""
//     ],
//     {
//         env: {
//             ...process.env,
//             PATH: `${ffmpegPath};${process.env.PATH}`
//         }
//     }
// );

    let output = "";
    let errorOutput = "";

    python.stdout.on("data", (data) => {
        output += data.toString();
    });

    python.stderr.on("data", (data) => {
        errorOutput += data.toString();
    });

    python.on("close", (code) => {
        if (code !== 0) {
            console.error("Python error:", errorOutput);

            return res.status(500).json({
                success: false,
                message: "AI analysis failed",
                error: errorOutput
            });
        }

        try {
            const result = JSON.parse(output);

            return res.json(result);
        } catch (error) {
            return res.status(500).json({
                success: false,
                message: "Invalid AI response",
                output
            });
        }
    });
});

export default router;