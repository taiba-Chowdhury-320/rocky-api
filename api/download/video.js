const express = require("express");
const ytdl = require("@distube/ytdl-core");
const app = express();

app.get("/api/download/video", async (req, res) => {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: "No link provided" });
  }

  try {
    if (link.includes("youtube.com") || link.includes("youtu.be")) {
      if (!ytdl.validateURL(link)) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      const info = await ytdl.getInfo(link);
      const format = ytdl.chooseFormat(info.formats, {
        quality: "highestvideo",
        filter: "videoandaudio"
      });

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
      ytdl(link, { format }).pipe(res);

    } else {
      return res.status(400).json({ 
        error: "Platform not supported yet",
        supported: ["YouTube"]
      });
    }

  } catch (err) {
    return res.status(500).json({ error: "Download failed", details: err.message });
  }
});

module.exports = app;
