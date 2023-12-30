const express = require("express");
const { createProxyMiddleware, fixRequestBody } = require("http-proxy-middleware");
const bodyParser = require("body-parser");
const requestIp = require("request-ip");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(requestIp.mw());

const defaultTarget = "http://160.20.109.251/";
const backupTarget = "http://185.254.238.19/";

app.use("/", async (req, res) => {
  try {
    // Get the client's IP address
    const clientIp = req.clientIp;

    // Fetch country information using ipinfo.io API
    const { data: ipInfo } = await axios.get(`https://ipinfo.io/${clientIp}/json`);

    // Choose the target based on the client's country
    const target = ipInfo.country === "TR" ? backupTarget : defaultTarget;

    const proxyMiddleware = createProxyMiddleware({
      target,
      changeOrigin: true,
      onProxyReq: fixRequestBody,
    });

    proxyMiddleware(req, res, (err) => {
      if (err) {
        console.error("Proxy Error:", err);
        res.status(500).send("Proxy Error");
      }
    });
  } catch (error) {
    console.error("Error fetching IP information:", error);
    res.status(500).send("Error fetching IP information");
  }
});

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(
    `Reverse Proxy Başlatıldı! http://localhost:${PORT} adresinden erişebilirsiniz. (DDOS Korumalı bir sunucu üzerinde çalıştırarak kullanmanız tavsiye edilir.)`,
  );
});
