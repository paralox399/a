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

const hedefler = ["http://160.20.109.251/", "http://185.254.238.19/"];

app.use("/", (req, res) => {
  const clientIpInfo = req.ipInfo;

  // Eğer isteğin geldiği ülke Türkiye ise, ilk hedefi seç
  if (clientIpInfo && clientIpInfo.country === "TR") {
    return createProxyMiddleware({
      target: hedefler[1],
      changeOrigin: true,
      onProxyReq: fixRequestBody,
    })(req, res);
  }

  // Diğer durumda, ikinci hedefi seç
  return createProxyMiddleware({
    target: hedefler[0],
    changeOrigin: true,
    onProxyReq: fixRequestBody,
  })(req, res);
});

app.listen(80, () => {
  console.log(
    "Reverse Proxy Başlatıldı! http://localhost:80 adresinden erişebilirsiniz. (DDOS Korumalı bir sunucu üzerinde çalıştırarak kullanmanız tavsiye edilir.)",
  );
});
