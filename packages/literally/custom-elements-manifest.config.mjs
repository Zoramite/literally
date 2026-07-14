const cssClassesMap = new Map();

export default {
  globs: ['src/**/*.ts'],
  exclude: ['src/**/*.test.ts', 'src/**/*.stories.ts'],
  plugins: [
    {
      name: 'css-classes-plugin',
      analyzePhase({ ts, node, moduleDoc, context }) {
        if (node.kind === ts.SyntaxKind.ClassDeclaration) {
          const className = node.name?.getText();
          if (!className) return;

          // Get full text of class declaration, including comments
          const fullText = node.getFullText();
          // Find JSDoc comment at the start of the node text
          const jsDocMatch = fullText.match(/^\s*\/\*\*([\s\S]*?)\*\//);
          if (jsDocMatch) {
            const jsDocText = jsDocMatch[0];
            const cssClasses = [];
            const regex = /@cssclass\s+(\S+)(?:\s+-\s+([^\r\n]*))?/g;
            let match;
            while ((match = regex.exec(jsDocText)) !== null) {
              cssClasses.push({
                name: match[1],
                description: match[2] ? match[2].trim() : ''
              });
            }

            if (cssClasses.length > 0) {
              cssClassesMap.set(className, cssClasses);
            }
          }
        }
      },
      moduleLinkPhase({ ts, moduleDoc, context }) {
        for (const declaration of moduleDoc.declarations || []) {
          if (cssClassesMap.has(declaration.name)) {
            declaration.cssClasses = cssClassesMap.get(declaration.name);
          }
        }
      }
    }
  ]
};
