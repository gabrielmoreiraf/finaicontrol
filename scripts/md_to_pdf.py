# Converte um Markdown em PDF estilizado (markdown -> HTML -> PDF via xhtml2pdf).
# Uso: python scripts/md_to_pdf.py docs/ESTADO_ATUAL.md docs/ESTADO_ATUAL.pdf
import sys
import re
import markdown
from xhtml2pdf import pisa

# Emojis/símbolos que as fontes padrão do PDF não renderizam -> equivalentes em texto.
REPLACEMENTS = {
    "✅": "[OK]",
    "🔜": "[em breve]",
    "⚠️": "[!]",
    "⚠": "[!]",
    "📌": "-",
    "🎉": "",
    "🔧": "",
    "🗺️": "",
    "🧱": "",
    "🟠": "",
    "🔴": "",
    "🟡": "",
    "🟢": "",
    "→": "->",
    "↑": "^",
    "≥": ">=",
    "≤": "<=",
    "×": "x",
    "–": "-",
    "—": "-",
    "“": '"',
    "”": '"',
    "‘": "'",
    "’": "'",
}

CSS = """
@page { size: a4; margin: 1.8cm 1.6cm; }
body { font-family: Helvetica, Arial, sans-serif; font-size: 9.5pt; color: #1a1a1a; line-height: 1.5; }
h1 { color: #047857; font-size: 19pt; border-bottom: 2px solid #059669; padding-bottom: 6px; margin-top: 4px; }
h2 { color: #047857; font-size: 13pt; margin-top: 18px; border-bottom: 1px solid #d1d5db; padding-bottom: 3px; }
h3 { color: #065f46; font-size: 11pt; margin-top: 12px; }
p { margin: 6px 0; }
a { color: #047857; text-decoration: none; }
code { background: #f3f4f6; color: #b91c1c; font-family: Courier, monospace; font-size: 8.5pt; padding: 1px 3px; border-radius: 3px; }
pre { background: #f6f8fa; border: 1px solid #e5e7eb; border-radius: 5px; padding: 8px; font-family: Courier, monospace; font-size: 8pt; }
pre code { background: transparent; color: #111827; padding: 0; }
blockquote { border-left: 3px solid #059669; background: #ecfdf5; margin: 8px 0; padding: 6px 10px; color: #374151; font-size: 9pt; }
table { border-collapse: collapse; width: 100%; margin: 8px 0; font-size: 8.3pt; }
th { background: #047857; color: #ffffff; text-align: left; padding: 5px 7px; border: 1px solid #047857; }
td { padding: 5px 7px; border: 1px solid #d1d5db; vertical-align: top; }
tr:nth-child(even) td { background: #f9fafb; }
hr { border: none; border-top: 1px solid #d1d5db; margin: 14px 0; }
strong { color: #111827; }
ul, ol { margin: 6px 0 6px 4px; }
li { margin: 3px 0; }
"""


def main():
    src, out = sys.argv[1], sys.argv[2]
    with open(src, encoding="utf-8") as f:
        text = f.read()

    for k, v in REPLACEMENTS.items():
        text = text.replace(k, v)

    html_body = markdown.markdown(
        text, extensions=["tables", "fenced_code", "sane_lists"]
    )

    html = f"""<!DOCTYPE html><html><head><meta charset="utf-8">
<style>{CSS}</style></head><body>{html_body}</body></html>"""

    with open(out, "wb") as f:
        result = pisa.CreatePDF(html, dest=f, encoding="utf-8")

    if result.err:
        print(f"ERRO: {result.err} erro(s) na geração")
        sys.exit(1)
    print(f"OK: PDF gerado em {out}")


if __name__ == "__main__":
    main()
