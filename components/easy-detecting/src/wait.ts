import { createServer } from 'http';
import { parse } from 'url';

export const wait = async (config: {
  hostname: string,
  port: number,
  api: string,
  onCloseErr?: (err?: Error) => void,
}) => {
  const { hostname, port, api, onCloseErr } = config;
  const server = createServer((req, resp) => {
    const parsedUrl = parse(req.url!, true);
    if (req.method === 'GET' && parsedUrl.pathname === api) {
      resp.statusCode = 200;
      resp.end('');
    } else {
      resp.statusCode = 404;
      resp.setHeader('Content-Type', 'text/plain');
      resp.end('Not Found\n');
    }
  });

  await new Promise(resolve => {
    server.listen(port, hostname, () => {
      resolve(true);
    });
  });

  return () => {
    server.close(onCloseErr);
  }
}