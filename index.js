const express = require("express");
const {
  createProxyMiddleware,
  fixRequestBody,
} = require("http-proxy-middleware");
const bodyParser = require("body-parser");
const expressIp = require("express-ip");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressIp().getIpInfoMiddleware);

const defaultTarget = "http://160.20.109.251/";
const backupTarget = "http://185.254.238.19/";

app.use("/", (req, res) => {
  const clientIpInfo = req.ipInfo;

  // Choose the target based on the client's country
  const target =
    clientIpInfo && clientIpInfo.country === "TR" ? backupTarget : defaultTarget;

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
});

const PORT = process.env.PORT || 80;

app.listen(PORT, () => {
  console.log(
    `Reverse Proxy Başlatıldı! http://localhost:${PORT} adresinden erişebilirsiniz. (DDOS Korumalı bir sunucu üzerinde çalıştırarak kullanmanız tavsiye edilir.)`,
  );
});
