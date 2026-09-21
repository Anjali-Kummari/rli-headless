import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;
const AEM_HOST = 'https://publish-p221102-e2272119.adobeaemcloud.com';

// Proxy /aem/* → AEM Publish (solves CORS — request is server-to-server)
app.use(
  '/aem',
  createProxyMiddleware({
    target: AEM_HOST,
    changeOrigin: true,
    pathRewrite: { '^/aem': '' },
  })
);

// Serve Vite production build
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback — always return index.html for unmatched routes
app.get('*', (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
