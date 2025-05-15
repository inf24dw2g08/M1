       const fs = require('fs');
       const path = require('path');
       
       function findJsFiles(dir) {
         const files = [];
         const entries = fs.readdirSync(dir, { withFileTypes: true });
         
         for (const entry of entries) {
           const fullPath = path.join(dir, entry.name);
           if (entry.isDirectory()) {
             files.push(...findJsFiles(fullPath));
           } else if (entry.name.endsWith('.js')) {
             files.push(fullPath);
           }
         }
         return files;
       }
       
       const jsFiles = findJsFiles('./src');
       
       for (const file of jsFiles) {
         let content = fs.readFileSync(file, 'utf8');
         if (content.includes('bcryptjsjsjs')) {
           console.log(`Fixing `);
           content = content.replace(/bcryptjsjsjs/g, 'bcryptjs');
           fs.writeFileSync(file, content);
         }
         if (content.includes('require("bcrypt"') || content.includes('require('bcrypt'')) {
           console.log(`Fixing imports in `);
           content = content.replace(/require(['"]bcrypt['"])/g, 'require("bcryptjs")');
           fs.writeFileSync(file, content);
         }
       }
       
       console.log('Fix completed');
       EOF
       &&
       node /app/bcrypt-fix.js &&
       npm install passport passport-google-oauth20 node-fetch@2 --save &&
       node index.js