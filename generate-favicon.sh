#!/bin/bash

# Script to generate favicon.ico from favicon.svg
# Requires ImageMagick or an online converter

echo "Generating favicon.ico from favicon.svg..."

# Check if ImageMagick is installed
if command -v convert &>/dev/null; then
	echo "Using ImageMagick to convert..."
	convert -background none -resize 16x16 src/favicon.svg src/favicon-16.png
	convert -background none -resize 32x32 src/favicon.svg src/favicon-32.png
	convert -background none -resize 48x48 src/favicon.svg src/favicon-48.png
	convert src/favicon-16.png src/favicon-32.png src/favicon-48.png src/favicon.ico
	rm src/favicon-16.png src/favicon-32.png src/favicon-48.png
	echo "✓ favicon.ico generated successfully!"
elif command -v magick &>/dev/null; then
	echo "Using ImageMagick (magick) to convert..."
	magick -background none -resize 16x16 src/favicon.svg src/favicon-16.png
	magick -background none -resize 32x32 src/favicon.svg src/favicon-32.png
	magick -background none -resize 48x48 src/favicon.svg src/favicon-48.png
	magick src/favicon-16.png src/favicon-32.png src/favicon-48.png src/favicon.ico
	rm src/favicon-16.png src/favicon-32.png src/favicon-48.png
	echo "✓ favicon.ico generated successfully!"
else
	echo "⚠ ImageMagick not found."
	echo ""
	echo "To generate favicon.ico, you can:"
	echo "1. Install ImageMagick: brew install imagemagick"
	echo "   Then run this script again."
	echo ""
	echo "2. Use an online converter:"
	echo "   - Visit: https://www.favicon-generator.org/"
	echo "   - Upload: src/favicon.svg"
	echo "   - Download and save as: src/favicon.ico"
	echo ""
	echo "Note: Modern browsers support SVG favicons directly!"
fi
