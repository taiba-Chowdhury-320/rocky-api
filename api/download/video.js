const axios = require("axios");

module.exports = async (req, res) => {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: "No link provided" });
  }

  try {
    // Try cobalt.tools API
    const response = await axios.post(
      "https://api.cobalt.tools/",
      {
        url: link,
        videoQuality: "720",
        downloadMode: "auto"
      },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        },
        timeout: 15000
      }
    );

    const data = response.data;

    // cobalt returns url directly
    const videoUrl = data.url || (data.status === "redirect" && data.url) || null;

    if (videoUrl) {
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

    } else {
      return res.status(400).json({
        error: "No video URL received",
        cobalt_data: data
      });
    }

  } catch (err) {
    const errorDetail = err.response?.data || err.message;
    console.error("Rocky API Error:", errorDetail);
    return res.status(500).json({
      error: "Download failed",
      details: errorDetail
    });
  }
};
