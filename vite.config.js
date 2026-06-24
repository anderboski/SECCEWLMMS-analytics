import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { createSheets, extractSheetId } from './server/sheets.mjs';

// Local API plugin: authenticates with the service account server-side and
// proxies read-only sheet ranges to the React app. Runs in the Vite Node
// process, so credentials are never shipped to the browser.
function sheetsApiPlugin(env) {
  const spreadsheetId = extractSheetId(env.SHEET_URL);
  const saFile = env.SERVICE_ACCOUNT_FILE || './useraccount.json';

  const RANGES = {
    '/api/scores': 'SCORES!A1:Q',
    '/api/selector': 'Selector!A1:A',
  };

  let sheets;
  const handler = (range) => async (req, res) => {
    try {
      if (!spreadsheetId) throw new Error('SHEET_URL missing/invalid in .env');
      if (!sheets) sheets = createSheets({ saFile });
      const values = await sheets.getValues(spreadsheetId, range);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ values }));
    } catch (e) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: String(e?.message || e) }));
    }
  };

  const attach = (server) => {
    for (const [path, range] of Object.entries(RANGES)) {
      server.middlewares.use(path, handler(range));
    }
  };

  return {
    name: 'sheets-api',
    configureServer: attach,
    configurePreviewServer: attach,
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), sheetsApiPlugin(env)],
  };
});
