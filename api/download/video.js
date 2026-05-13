const axios = require("axios");

module.exports = async (req, res) => {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: "No link provided" });
  }

  try {
    // cobalt.tools public API ব্যবহার করবো
    const response = await axios.post(
      "https://api.cobalt.tools/",
      {
        url: link,
        downloadMode: "auto",
        videoQuality: "720"
      },
      {
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json"
        }
      }
    );

    const data = response.data;

    if (data.status === "redirect" || data.status === "stream") {
      // Video URL পেয়েছি, এখন download করে পাঠাবো
      const videoRes = await axios({
        method: "get",
        url: data.url,
        responseType: "stream",
        timeout: 30000
      });

      res.setHeader("Content-Type", "video/mp4");
      res.setHeader("Content-Disposition", `attachment; filename="video.mp4"`);
      videoRes.data.pipe(res);

    } else if (data.status === "error") {
      return res.status(400).json({ error: data.error?.code || "Download failed" });
    } else {
      return res.status(400).json({ error: "Unexpected response", data });
    }

  } catch (err) {
    return res.status(500).json({ 
      error: "Download failed", 
      details: err.message 
    });
  }
};
