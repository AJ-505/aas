#!/usr/bin/env python3
import markdown
import sys

with open(sys.argv[1], 'r') as f:
    md_text = f.read()

html_body = markdown.markdown(md_text, extensions=['tables', 'fenced_code', 'toc'])

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Code Review Report v3 - Cedric Masters Autos</title>
<style>
@page {{
  size: A4;
  margin: 22mm 18mm 20mm 18mm;
  @bottom-center {{
    content: counter(page) " of " counter(pages);
    font-family: "DejaVu Sans", sans-serif;
    font-size: 9px;
    color: #94a3b8;
  }}
}}
@page :first {{
  @bottom-center {{ content: none; }}
}}
* {{ box-sizing: border-box; }}
body {{
  font-family: "DejaVu Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
  font-size: 11px;
  line-height: 1.55;
  color: #1a1a1a;
  margin: 0;
}}
h1 {{
  font-size: 24px;
  line-height: 1.15;
  margin: 0 0 8px;
  color: #0a0e0a;
  letter-spacing: -0.02em;
  border-bottom: 3px solid #c8ff00;
  padding-bottom: 10px;
}}
h2 {{
  font-size: 16px;
  margin: 28px 0 10px;
  color: #0a0e0a;
  border-bottom: 1px solid #dbe6dd;
  padding-bottom: 5px;
  break-after: avoid-page;
  page-break-after: avoid;
}}
h3 {{
  font-size: 13px;
  margin: 18px 0 6px;
  color: #1a1a1a;
  break-after: avoid-page;
  page-break-after: avoid;
}}
p {{ margin: 6px 0; }}
a {{ color: #0a7a2e; text-decoration: none; }}
strong {{ color: #0a0e0a; }}
code {{
  font-family: "DejaVu Sans Mono", "Courier New", monospace;
  font-size: 10px;
  background: #f3f4f6;
  padding: 1px 4px;
  border-radius: 3px;
  color: #0a0e0a;
}}
pre {{
  background: #0a0e0a;
  color: #d1e7ff;
  padding: 12px 14px;
  border-radius: 6px;
  overflow: auto;
  font-family: "DejaVu Sans Mono", monospace;
  font-size: 9.5px;
  line-height: 1.5;
  page-break-inside: avoid;
  white-space: pre-wrap;
  word-wrap: break-word;
}}
pre code {{
  background: none;
  color: inherit;
  padding: 0;
  font-size: inherit;
}}
table {{
  width: 100%;
  border-collapse: collapse;
  margin: 10px 0;
  font-size: 9.5px;
}}
th {{
  background: #f8fafc;
  border: 1px solid #dbe6dd;
  padding: 6px 8px;
  text-align: left;
  font-weight: 700;
  font-size: 9px;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}}
td {{
  border: 1px solid #eef2ee;
  padding: 6px 8px;
  vertical-align: top;
}}
tr {{
  break-inside: avoid;
  page-break-inside: avoid;
}}
tr:nth-child(even) {{ background: #fafdf9; }}
hr {{
  border: none;
  border-top: 1px solid #dbe6dd;
  margin: 24px 0;
}}
ul, ol {{ margin: 6px 0; padding-left: 20px; }}
li {{ margin: 3px 0; }}
blockquote {{
  border-left: 3px solid #c8ff00;
  margin: 10px 0;
  padding: 6px 12px;
  background: #f7fdf6;
  color: #475569;
}}
</style>
</head>
<body>
{html_body}
</body>
</html>"""

import os
if sys.argv[2] == '-':
    sys.stdout.write(html)
else:
    with open(sys.argv[2], 'w') as f:
        f.write(html)
