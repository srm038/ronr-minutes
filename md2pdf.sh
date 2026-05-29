#!/usr/bin/env bash
set -euo pipefail

file="${1:?Usage: md2pdf.sh <file.minutes.md>}"
pandoc "$file" -o "${file%.md}.pdf" \
  --pdf-engine=xelatex \
  -V mainfont="Times New Roman" \
  -V fontsize=12pt \
  -V geometry:margin=1in
