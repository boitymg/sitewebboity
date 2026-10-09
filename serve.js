const http = require('http');
const fs = require('fs');
const path = require('path');

let port = parseInt(process.env.PORT, 10) || 4173;

const MIME = {
  '.html': 'text/html; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8'
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('Erreur de lecture');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  let file = req.url.split('?')[0].split('#')[0];
  if (file === '/' || file === '') file = '/index.html';

  const decodedFile = decodeURIComponent(file);

  // 1. Direct path check (e.g. index.html, logo-boity.png, public/photo.jpg)
  const directPath = path.join(__dirname, decodedFile);
  fs.stat(directPath, (err, stats) => {
    if (!err && stats.isFile()) {
      return sendFile(directPath, res);
    }

    // 2. Fallback: check inside public/ directory if requested without /public/ prefix
    const publicPath = path.join(__dirname, 'public', decodedFile);
    fs.stat(publicPath, (pubErr, pubStats) => {
      if (!pubErr && pubStats.isFile()) {
        return sendFile(publicPath, res);
      }

      res.writeHead(404, { 'Content-Type': 'text/plain; charset=UTF-8' });
      res.end('404 - Fichier non trouvé : ' + decodedFile);
    });
  });
});

function startServer(p) {
  server.listen(p, '127.0.0.1', () => {
    console.log('\n============================================================');
    console.log('  ✦ BOITY STUDIO — SERVEUR LOCAL ✦');
    console.log('============================================================');
    console.log(`  ➜ Local:    http://localhost:${p}`);
    console.log(`  ➜ Dossier:  ${__dirname}`);
    console.log(`  ➜ Images:   Dossier "public/" actif`);
    console.log('============================================================');
    console.log('  Appuyez sur Ctrl + C pour arrêter le serveur.\n');
  });
}

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`Le port ${port} est déjà occupé, tentative sur le port ${port + 1}...`);
    port += 1;
    startServer(port);
  } else {
    console.error('Erreur serveur:', err);
  }
});

startServer(port);
