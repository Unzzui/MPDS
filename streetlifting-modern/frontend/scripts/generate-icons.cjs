#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Icon sizes for PWA
const iconSizes = [
  72, 96, 128, 144, 152, 167, 180, 192, 384, 512
];

// Create directories if they don't exist
const createDirectories = () => {
  const dirs = ['public/icons', 'public/splash'];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Generate SVG icon content
const generateSVGIcon = (size) => {
  const center = size / 2;
  const radius = size * 0.4;
  
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#0a0a0a"/>
  <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#00ff88" stroke-width="${size * 0.05}"/>
  <text x="${center}" y="${center + size * 0.1}" text-anchor="middle" fill="#00ff88" font-family="monospace" font-size="${size * 0.3}" font-weight="bold">MPDS</text>
  <text x="${center}" y="${center + size * 0.3}" text-anchor="middle" fill="#00ff88" font-family="monospace" font-size="${size * 0.15}">STREETLIFTING</text>
</svg>`;
};

// Generate splash screen content
const generateSplashScreen = (width, height) => {
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#0a0a0a"/>
  <circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) * 0.2}" fill="none" stroke="#00ff88" stroke-width="${Math.min(width, height) * 0.02}"/>
  <text x="${width / 2}" y="${height / 2 + Math.min(width, height) * 0.05}" text-anchor="middle" fill="#00ff88" font-family="monospace" font-size="${Math.min(width, height) * 0.08}" font-weight="bold">MPDS</text>
  <text x="${width / 2}" y="${height / 2 + Math.min(width, height) * 0.15}" text-anchor="middle" fill="#00ff88" font-family="monospace" font-size="${Math.min(width, height) * 0.04}">STREETLIFTING</text>
</svg>`;
};

// Generate icons
const generateIcons = () => {
  console.log('Generating PWA icons...');
  
  iconSizes.forEach(size => {
    const svgContent = generateSVGIcon(size);
    const filePath = path.join('public', 'icons', `icon-${size}x${size}.svg`);
    fs.writeFileSync(filePath, svgContent);
    console.log(`Generated: ${filePath}`);
  });
};

// Generate splash screens
const generateSplashScreens = () => {
  console.log('Generating splash screens...');
  
  const splashSizes = [
    { width: 2048, height: 2732, name: 'apple-splash-2048-2732' },
    { width: 1668, height: 2388, name: 'apple-splash-1668-2388' },
    { width: 1536, height: 2048, name: 'apple-splash-1536-2048' },
    { width: 1125, height: 2436, name: 'apple-splash-1125-2436' },
    { width: 1242, height: 2688, name: 'apple-splash-1242-2688' },
    { width: 750, height: 1334, name: 'apple-splash-750-1334' },
    { width: 640, height: 1136, name: 'apple-splash-640-1136' }
  ];
  
  splashSizes.forEach(({ width, height, name }) => {
    const svgContent = generateSplashScreen(width, height);
    const filePath = path.join('public', 'splash', `${name}.svg`);
    fs.writeFileSync(filePath, svgContent);
    console.log(`Generated: ${filePath}`);
  });
};

// Main execution
const main = () => {
  try {
    createDirectories();
    generateIcons();
    generateSplashScreens();
    console.log('PWA assets generated successfully!');
  } catch (error) {
    console.error('Error generating PWA assets:', error);
    process.exit(1);
  }
};

main(); 