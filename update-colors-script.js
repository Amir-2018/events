const fs = require('fs');
const path = require('path');

// Couleur personnalisée
const CUSTOM_COLOR = '#31a7df';
const CUSTOM_COLOR_DARK = '#2596d1';
const CUSTOM_COLOR_LIGHT = '#b3d9f2';

// Mappings des remplacements
const colorReplacements = [
  // Classes de background
  { from: 'bg-blue-600', to: `bg-[${CUSTOM_COLOR}]` },
  { from: 'bg-blue-700', to: `bg-[${CUSTOM_COLOR_DARK}]` },
  { from: 'bg-blue-500', to: `bg-[${CUSTOM_COLOR}]` },
  { from: 'bg-blue-100', to: 'bg-blue-50' }, // Garder les couleurs claires
  { from: 'bg-blue-50', to: 'bg-blue-50' },
  
  // Classes de texte
  { from: 'text-blue-600', to: `text-[${CUSTOM_COLOR}]` },
  { from: 'text-blue-700', to: `text-[${CUSTOM_COLOR_DARK}]` },
  { from: 'text-blue-500', to: `text-[${CUSTOM_COLOR}]` },
  
  // Classes de hover
  { from: 'hover:bg-blue-600', to: `hover:bg-[${CUSTOM_COLOR}]` },
  { from: 'hover:bg-blue-700', to: `hover:bg-[${CUSTOM_COLOR_DARK}]` },
  { from: 'hover:text-blue-600', to: `hover:text-[${CUSTOM_COLOR}]` },
  { from: 'hover:text-blue-700', to: `hover:text-[${CUSTOM_COLOR_DARK}]` },
  
  // Classes de focus et ring
  { from: 'focus:ring-blue-500', to: `focus:ring-[${CUSTOM_COLOR}]` },
  { from: 'focus:border-blue-500', to: `focus:border-[${CUSTOM_COLOR}]` },
  { from: 'ring-blue-500', to: `ring-[${CUSTOM_COLOR}]` },
  
  // Classes de shadow
  { from: 'shadow-blue-200', to: 'shadow-gray-200' },
  { from: 'shadow-blue-100', to: 'shadow-gray-100' },
];

function updateColorsInFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    colorReplacements.forEach(({ from, to }) => {
      if (content.includes(from)) {
        content = content.replace(new RegExp(from, 'g'), to);
        modified = true;
      }
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Updated: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

function updateColorsInDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  let totalUpdated = 0;
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      totalUpdated += updateColorsInDirectory(fullPath);
    } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
      if (updateColorsInFile(fullPath)) {
        totalUpdated++;
      }
    }
  });
  
  return totalUpdated;
}

// Exécuter le script
console.log('🚀 Mise à jour des couleurs dans le projet...\n');

const frontendSrcPath = path.join(__dirname, 'frontend', 'src');
const totalUpdated = updateColorsInDirectory(frontendSrcPath);

console.log(`\n🎉 Mise à jour terminée! ${totalUpdated} fichier(s) modifié(s).`);
console.log(`\n📋 Couleurs utilisées:`);
console.log(`   - Couleur principale: ${CUSTOM_COLOR}`);
console.log(`   - Couleur foncée: ${CUSTOM_COLOR_DARK}`);
console.log(`   - Couleur claire: ${CUSTOM_COLOR_LIGHT}`);