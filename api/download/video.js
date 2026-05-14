const axios = require("axios");

module.exports = async (req, res) => {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: "No link provided" });
  }

  try {
    // Use y2mate style free API - no key needed
    let videoUrl = null;

    // Try saveig / snapinsta style scraper
    const scraperRes = await axios.get(
      `https://apis.davidcyriltech.my.id/download/alldownloader?url=${encodeURIComponent(link)}`,
      {
        timeout: 15000,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
      }
    );

    const data = scraperRes.data;

    // Try different response formats
    videoUrl =
      data?.result?.download_url ||
      data?.data?.download_url ||
      data?.download_url ||
      data?.url ||
      data?.result?.url ||
      data?.data?.url ||
      data?.result?.medias?.[0]?.url ||
      data?.medias?.[0]?.url ||
      null;

    if (!videoUrl) {
      // Try backup API
      const backup = await axios.get(
        `https://api.akuari.my.id/downloader/ttdl?url=${encodeURIComponent(link)}`,
        { timeout: 15000 }
      );
      videoUrl =
        backup.data?.result?.play ||
        backup.data?.data?.play ||
        backup.data?.play ||
        null;
    }

    if (!videoUrl) {
      return res.status(400).json({
        error: "No video found",
        tip: "Try a YouTube, TikTok, or Facebook link"
      });
    }

    // Stream the video
    const videoRes = await axios({
      method: "get",
      url: videoUrl,
      responseType: "stream",
      timeout: 60000,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
      }
    });

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="rocky_video.mp4"`);
    videoRes.data.pipe(res);

  } catch (err) {
    return res.status(500).json({
      error: "Download failed",
      details: err.response?.data || err.message
    });
  }
};
