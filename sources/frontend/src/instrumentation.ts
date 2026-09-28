export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs' || !process.env.NEXT_RUNTIME) {
    const http = await import('http');
    const https = await import('https');

    const patchEmit = (serverClass: typeof http.Server | typeof https.Server) => {
      const origEmit = serverClass.prototype.emit;
      serverClass.prototype.emit = function (event: string, ...args: unknown[]) {
        if (event === 'request') {
          const req = args[0] as { url?: string };
          if (req && typeof req.url === 'string') {
            const [pathPart, queryPart] = req.url.split('?');
            
            // Chỉ can thiệp nếu đường dẫn chứa // hoặc là route tra cứu sản phẩm có trailing slash
            const hasConsecutiveSlashes = pathPart.includes('//');
            const isProductRouteWithTrailingSlash = /^\/\d+\//.test(pathPart) && pathPart.endsWith('/');

            if (hasConsecutiveSlashes || isProductRouteWithTrailingSlash) {
              const segments = pathPart.split('/');
              // segments[0] là chuỗi rỗng trước dấu "/" đầu tiên
              if (segments.length > 2) {
                for (let i = 1; i < segments.length; i++) {
                  if (segments[i] === '') {
                    segments[i] = '-';
                  }
                }
                req.url = segments.join('/') + (queryPart !== undefined ? `?${queryPart}` : '');
              }
            }
          }
        }
        return (origEmit as (...a: unknown[]) => boolean).apply(this, [event, ...args]);
      };
    };

    patchEmit(http.Server);
    patchEmit(https.Server);
  }
}
