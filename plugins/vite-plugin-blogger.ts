import { Plugin } from 'vite';
import * as fs from 'fs';
import * as path from 'path';
import { XMLValidator } from 'fast-xml-parser';

interface BloggerPluginOptions {
  template: string;
  output: string;
}

export default function bloggerPlugin(options: BloggerPluginOptions): Plugin {
  return {
    name: 'vite-plugin-blogger',
    async closeBundle() {
      const tempDir = path.resolve('.temp-build');
      const mainJsPath = path.join(tempDir, 'main.js');
      const seriesJsPath = path.join(tempDir, 'series.js');
      const homepageJsPath = path.join(tempDir, 'homepage.js');
      const cssPath = path.join(tempDir, 'style.css');

      if (!fs.existsSync(mainJsPath)) {
        console.error(`Main JS Asset not found at ${mainJsPath}`);
        return;
      }
      if (!fs.existsSync(seriesJsPath)) {
        console.error(`Series JS Asset not found at ${seriesJsPath}`);
        return;
      }
      if (!fs.existsSync(homepageJsPath)) {
        console.error(`Homepage JS Asset not found at ${homepageJsPath}`);
        return;
      }
      if (!fs.existsSync(cssPath)) {
        console.error(`CSS Asset not found at ${cssPath}`);
        return;
      }

      let mainJsContent = fs.readFileSync(mainJsPath, 'utf8').trim();
      let seriesJsContent = fs.readFileSync(seriesJsPath, 'utf8').trim();
      let homepageJsContent = fs.readFileSync(homepageJsPath, 'utf8').trim();
      let cssContent = fs.readFileSync(cssPath, 'utf8').trim();

      // Clean up JS content wrapper if necessary
      // For IIFE format, we can safely keep it.
      
      // Recursive include resolver
      function resolveIncludes(filePath: string): string {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const includeRegex = /<src:include\s+src=["']([^"']+)["']\s*(?:\/>|><\/src:include>)/g;

        return fileContent.replace(includeRegex, (_match: string, src: string) => {
          const resolvedPath = path.resolve(path.dirname(filePath), src);
          if (!fs.existsSync(resolvedPath)) {
            throw new Error(`Include file not found: ${resolvedPath} (imported from ${filePath})`);
          }
          return resolveIncludes(resolvedPath);
        });
      }

      // Icon resolver
      function resolveIcons(xmlContent: string): string {
        const iconRegex = /<icon:([a-z0-9-]+)([^>]*)\/>/g;
        return xmlContent.replace(iconRegex, (match: string, name: string, attributesStr: string) => {
          let iconPath = path.resolve('src', 'icons', `${name}.svg`);
          if (!fs.existsSync(iconPath)) {
            iconPath = path.resolve('node_modules', 'lucide-static', 'icons', `${name}.svg`);
          }
          if (!fs.existsSync(iconPath)) {
            console.warn(`Icon not found: ${name} (referenced in template)`);
            return match;
          }
          let svgContent = fs.readFileSync(iconPath, 'utf8').trim();

          const classMatch = attributesStr.match(/class=["']([^"']+)["']/);
          const className = classMatch ? classMatch[1] : '';

          svgContent = svgContent.replace(/<\?xml[^>]*\?>/g, '');
          svgContent = svgContent.replace(/<!--[^>]*-->/g, '');

          if (className) {
            if (svgContent.includes('class=')) {
              svgContent = svgContent.replace(/class=["']([^"']+)["']/, `class="$1 ${className}"`);
            } else {
              svgContent = svgContent.replace('<svg', `<svg class="${className}"`);
            }
          }

          const attrRegex = /([a-z0-9-]+)=["']([^"']+)["']/gi;
          let attrMatch;
          while ((attrMatch = attrRegex.exec(attributesStr)) !== null) {
            const attrName = attrMatch[1];
            const attrVal = attrMatch[2];
            if (attrName.toLowerCase() !== 'class') {
              const attrPattern = new RegExp(`${attrName}=["'][^"']+["']`, 'i');
              if (attrPattern.test(svgContent)) {
                svgContent = svgContent.replace(attrPattern, `${attrName}="${attrVal}"`);
              } else {
                svgContent = svgContent.replace('<svg', `<svg ${attrName}="${attrVal}"`);
              }
            }
          }

          return svgContent;
        });
      }

      console.log('Assembling Blogger template components...');
      const templatePath = path.resolve(options.template);
      if (!fs.existsSync(templatePath)) {
        throw new Error(`Main theme template not found: ${templatePath}`);
      }
      
      let assembledXML = resolveIncludes(templatePath);
      
      console.log('Resolving build-time icons...');
      assembledXML = resolveIcons(assembledXML);

      assembledXML = assembledXML.replace('/* [CSS_INJECT] */', () => cssContent);
      assembledXML = assembledXML.replace('/* [GLOBAL_JS_INJECT] */', () => `;(function(){\n${mainJsContent}\n})();`);
      assembledXML = assembledXML.replace('/* [SERIES_JS_INJECT] */', () => `;(function(){\n${seriesJsContent}\n})();`);
      assembledXML = assembledXML.replace('/* [HOMEPAGE_JS_INJECT] */', () => `;(function(){\n${homepageJsContent}\n})();`);

      // Validate Blogger XML
      console.log('Validating XML structure...');
      const validation = XMLValidator.validate(assembledXML, {
        allowBooleanAttributes: true
      });
      if (validation !== true) {
        const err = (validation as any).err;
        console.error('XML Structure is invalid! Details:');
        console.error(`Error code: ${err.code}`);
        console.error(`Message: ${err.msg}`);
        console.error(`Line: ${err.line}, Column: ${err.col}`);
        throw new Error(`XML Validation Failed: ${err.msg} at line ${err.line}`);
      }
      console.log('XML Validation Passed!');

      // Safe XML Minification / Normalization
      // Removes trailing spaces on each line and reduces consecutive empty lines
      let cleanedXML = assembledXML
        .split('\n')
        .map(line => line.trimEnd())
        .filter((line, index, arr) => {
          // Remove empty lines if the next one is also empty (reduce consecutive spacing)
          if (line.trim() === '' && index > 0 && arr[index - 1].trim() === '') {
            return false;
          }
          return true;
        })
        .join('\n');

      const outPath = path.resolve(options.output);
      const outDir = path.dirname(outPath);
      if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
      }

      fs.writeFileSync(outPath, cleanedXML, 'utf8');
      console.log(`Blogger theme successfully compiled to: ${outPath}`);

      // Clean up temporary bundle directory
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.warn(`Could not clean up temporary directory ${tempDir}:`, err);
      }
    }
  };
}
