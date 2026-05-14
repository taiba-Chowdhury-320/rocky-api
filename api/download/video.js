const axios = require("axios");

module.exports = async (req, res) => {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: "No link provided" });
  }

  try {
    const response = await axios.get(
      `https://auto-download-all-in-one.p.rapidapi.com/v1/social/autolink`,
      {
        params: { url: link },
        headers: {
          "x-rapidapi-key": "YOUR_RAPIDAPI_KEY",
          "x-rapidapi-host": "auto-download-all-in-one.p.rapidapi.com"
        },
        timeout: 15000
      }
    );

    const medias = response.data?.data?.medias;
    const videoUrl = medias?.[0]?.url;

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
