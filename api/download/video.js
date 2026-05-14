const axios = require("axios");

module.exports = async (req, res) => {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: "No link provided" });
  }

  try {
    // socialdownloader API — free, no key needed
    const response = await axios.get(
      `https://social-media-video-downloader.p.rapidapi.com/smvd/get/all`,
      {
        params: { url: link },
        headers: {
          "X-RapidAPI-Key": "SIGN-UP-FOR-KEY",
          "X-RapidAPI-Host": "social-media-video-downloader.p.rapidapi.com"
        },
        timeout: 15000
      }
    );

    const data = response.data;
    const videoUrl = data.links?.[0]?.link;

    if (!videoUrl) {
      return res.status(400).json({ error: "No video found" });
    }

    const videoRes = await axios({
      method: "get",
      url: videoUrl,
      responseType: "stream",
      timeout: 60000
    });

    res.setHeader("Content-Type", "video/mp4");
    res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
    videoRes.data.pipe(res);

  } catch (err) {
    return res.status(500).json({
      error: "Download failed",
      details: err.response?.data || err.message
    });
  }
};
