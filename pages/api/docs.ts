import type { NextApiRequest, NextApiResponse } from 'next';

const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>API Docs | Finance Manager</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js"></script>
    <script>
window.onload = () => {
  window.ui = SwaggerUIBundle({
    url: '/api/openapi.json',
    dom_id: '#swagger-ui',
    requestInterceptor: (req) => {
      req.credentials = 'include';
      return req;
    },
    presets: [SwaggerUIBundle.presets.apis, SwaggerUIStandalonePreset],
    layout: 'StandaloneLayout',
  });
};
    </script>
  </body>
</html>`;

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.status(200).send(html);
};

export default handler;
