import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function saveUilPlugin() {
  return {
    name: 'save-uil-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.toLowerCase().includes('at_logo.bin')) {
          res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
          res.setHeader('Pragma', 'no-cache');
          res.setHeader('Expires', '0');
        }
        console.log(`REQ: ${req.url}`); next();
      });
      server.middlewares.use(async (req, res, next) => {
        if (req.url === '/api/save-uil' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body);
              if (payload.uil) {
                const uilPath = path.resolve(__dirname, 'public/assets/data/uil.1746999829739.json');
                const uilContent = JSON.parse(fs.readFileSync(uilPath, 'utf8'));
                Object.assign(uilContent, payload.uil);
                fs.writeFileSync(uilPath, JSON.stringify(uilContent, null, 2));
              }
              if (payload.projects) {
                const projectsPath = path.resolve(__dirname, 'public/assets/data/cms_projects.json');
                fs.writeFileSync(projectsPath, JSON.stringify(payload.projects, null, 2));
              }
              if (payload.menu) {
                const menuPath = path.resolve(__dirname, 'public/assets/data/cms_menu.json');
                fs.writeFileSync(menuPath, JSON.stringify(payload.menu, null, 2));
              }
              if (payload.settings) {
                const settingsPath = path.resolve(__dirname, 'public/assets/data/cms_settings.json');
                fs.writeFileSync(settingsPath, JSON.stringify(payload.settings, null, 2));
                
                try {
                  const execSync = require('child_process').execSync;
                  execSync('node scripts/convert-logo.cjs', { cwd: __dirname });
                } catch(e) {
                  console.log("Auto-convert logo failed", e);
                }
              }
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true }));
            } catch (err) {
              console.error('Error saving uil:', err);
              res.statusCode = 500;
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          });
        } else if (req.url === '/api/log-url' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => body += chunk.toString());
          req.on('end', () => {
            console.log("APP FETCHED URL: ", body);
            fs.appendFileSync(path.resolve(__dirname, 'fetch.log'), body + '\n');
            res.end('ok');
          });
        } else {
          console.log(`REQ: ${req.url}`); next();
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), saveUilPlugin()],
});
