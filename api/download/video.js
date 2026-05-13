const axios = require("axios");

export default async function handler(req, res) {
  const { link } = req.query;

  if (!link) {
    return res.status(400).json({ error: "No link provided" });
  }

  try {
    const response = await axios.post(
      "https://api.cobalt.tools/",
      { url: link, downloadMode: "auto", videoQuality: "720" },
      { headers: { "Accept": "application/json", "Content-Type": "application/json" } }
    );

    const data = response.data;

    if (data.status === "redirect" || data.status === "stream") {
      const videoRes = await axios({
        method: "get",
        url: data.url,
        responseType: "stream",
        timeout: 30000
      });
      res.setHeader("Content-Type", "video/mp4");
      videoRes.data.pipe(res);
    } else {
      return res.status(400).json({ error: "Failed", data });
    }

  } catch (err) {
    return res.status(500).json({ error: "Download failed", details: err.message });
  }
}
