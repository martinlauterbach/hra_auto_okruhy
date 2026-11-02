import http.server, os, sys
class H(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = super().translate_path(path)
        if not os.path.exists(p):
            d, f = os.path.split(p); lp = os.path.join(d.lower() if not os.path.exists(d) else d, f.lower())
            if os.path.exists(lp): return lp
        return p
    def log_message(self, *a): pass
http.server.ThreadingHTTPServer(('127.0.0.1', 8765), H).serve_forever()
