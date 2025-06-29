import http from 'node:http';

/**
 * Utility: read the full request body and return it as a string.
 */
function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  // Only one endpoint: POST /echo
  if (req.method === 'POST' && req.url === '/echo') {
    try {
      const bodyText = await readBody(req);
      // If payload is JSON, try to preserve the original object;
      // otherwise just echo the raw string.
      let echo: unknown = bodyText;
      try { echo = JSON.parse(bodyText); } catch (_) { /* non-JSON */ }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ echo }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error reading body');
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
server.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
