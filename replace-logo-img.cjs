const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // PublicHeader & general Link
  content = content.replace(
    /<div style={{ backgroundColor: '#E85D04' }} className="w-8 h-8 rounded-lg flex items-center justify-center">\s*<span className="text-white font-bold text-sm">J<\/span>\s*<\/div>\s*<span style={{ color: '#E85D04' }} className="text-xl font-bold tracking-tight">JML Maroc<\/span>/g,
    '<img src="/logo.png" alt="JML Maroc" className="h-10 object-contain" />'
  );

  // AuthSidebar
  content = content.replace(
    /<div style={{ backgroundColor: '#E85D04' }} className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0">\s*<span className="text-white font-bold text-sm">J<\/span>\s*<\/div>\s*<span style={{ color: '#E85D04' }} className="text-lg font-bold tracking-tight truncate">JML Maroc<\/span>/g,
    '<img src="/logo.png" alt="JML Maroc" className="h-8 object-contain shrink-0" />'
  );

  // LoginPage, RegisterPage, PendingApprovalPage, BlockedPage, AdminLoginPage
  content = content.replace(
    /<div style={{ backgroundColor: '#E85D04' }} className="w-10 h-10 rounded-xl flex items-center justify-center">\s*<span className="text-white font-bold text-lg">J<\/span>\s*<\/div>\s*<div className="text-left">\s*<span className="text-\[#1A1A1A\] text-xl font-bold">JML Maroc<\/span>\s*<p className="text-xs tracking-widest font-bold" style={{ color: '#E8820C' }}>JMLMAROC\.MA<\/p>\s*<\/div>/g,
    '<img src="/logo.png" alt="JML Maroc" className="h-12 object-contain" />'
  );

  // LandingPage
  content = content.replace(
    /<div style={{ backgroundColor: '#E85D04' }} className="w-10 h-10 rounded-xl flex items-center justify-center">\s*<span className="text-white text-xl font-bold">J<\/span>\s*<\/div>\s*<div>\s*<span className="text-white text-xl font-bold">JML Maroc<\/span>\s*<p className="text-xs tracking-widest font-bold" style={{ color: '#E8820C' }}>JMLMAROC\.MA<\/p>\s*<\/div>/g,
    '<img src="/logo.png" alt="JML Maroc" className="h-12 object-contain" />'
  );

  // AdminLayout
  content = content.replace(
    /<div style={{ backgroundColor: '#E85D04' }} className="w-8 h-8 rounded-lg flex items-center justify-center">\s*<span className="text-white font-bold text-sm">J<\/span>\s*<\/div>\s*<div className="flex flex-col">\s*<p className="text-white font-bold text-sm">JML Maroc<\/p>\s*<p className="text-[#888888] text-\[10px\] uppercase tracking-wider">Admin Panel<\/p>\s*<\/div>/g,
    '<img src="/logo.png" alt="JML Maroc" className="h-8 object-contain" />\n              <div className="flex flex-col">\n                <p className="text-[#888888] text-[10px] uppercase tracking-wider">Admin Panel</p>\n              </div>'
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

const filesToUpdate = [
  'src/app/components/layout/PublicHeader.tsx',
  'src/app/components/layout/AuthSidebar.tsx',
  'src/app/pages/LoginPage.tsx',
  'src/app/pages/RegisterPage.tsx',
  'src/app/pages/PendingApprovalPage.tsx',
  'src/app/pages/BlockedPage.tsx',
  'src/app/pages/admin/AdminLayout.tsx',
  'src/app/pages/admin/AdminLoginPage.tsx',
  'src/app/pages/LandingPage.tsx'
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    replaceInFile(fullPath);
    console.log('Updated:', file);
  }
});
