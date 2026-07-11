# Blogger Theme Framework Agent Charter: Operational Guide (AGENTS.md)

You are an AI assistant developing this modular Blogger theme. Always adhere to these rules when working.

## 1. Project Goal
Develop Blogger templates using a modern front-end workflow. The source of truth is `src/`. The final output is `dist/theme.xml` which is compiled automatically. Never edit `dist/theme.xml` directly.

## 2. Tech Stack
- Runtime: Node.js, Package Manager: pnpm, Build Tool: Vite
- CSS: Tailwind CSS, PostCSS, Autoprefixer
- Language: TypeScript (strict compilation)
- XML assembly: Custom Vite compiler plugin `plugins/vite-plugin-blogger.ts`

## 3. Project Directory Structure
Respect this layout. Never create arbitrary files/folders:
- `src/layouts/`: Core layout wrappers
- `src/components/`: Reusable page chunks (e.g. headers, footers, ad blocks)
- `src/includes/`: Inner includables, schemas, metadata definitions
- `src/sections/`: Layout container zones with `<b:section>` and `<b:widget>`
- `src/css/`: Tailwind styles and custom component classes
- `src/js/`: TypeScript/JavaScript modules
- `src/config/`: Layout/Theme config TS files
- `plugins/`: Custom Vite compiler plugins
- `dist/`: Auto-compiled destination containing `theme.xml`

## 4. Key Directives
- **Blogger First**: Use native Blogger features whenever possible (e.g., `<b:section>`, `<b:widget>`, `<b:includable>`). Do not use JavaScript if Blogger has a native tag (like `<b:if>`, `<b:loop>`).
- **Layout Editable**: Sections must remain drag-and-drop editable in the Blogger dashboard. Never hardcode widgets/sidebars. Always use `<b:section>`.
- **Reusable Includables**: Follow DRY. Split repetitive markup into `<b:includable>` and use `<b:include>` to reference them.
- **Compiler Inclusions**: Use `<src:include src="relative/path.xml" />` to load modular templates in development. The build tool will recursively replace these.
- **Tailwind & CSS**: Write custom variables in `:root`. Standardize repeating classes with `@apply`. Compiles to plain CSS; never load the Tailwind CDN.
- **JavaScript**: Modular TS. Bundle using Vite's library build mode and inject inline. Keep JS minimized and deferred.

## 5. Prohibited Actions
- DO NOT use React, Vue, Angular, or jQuery.
- DO NOT load Tailwind CDN.
- DO NOT write inline CSS (unless dynamic or required by Blogger parameters).
- DO NOT modify `dist/theme.xml` manually.

## 6. Pre-flight Quality Checklist
Before finishing any task, verify:
1. No duplicate XML component IDs or section/widget IDs.
2. Build passes successfully by running `pnpm build`.
3. Output XML file `dist/theme.xml` exists and passes XML structure validation.
4. Layout configuration works, and widget areas remain drag-and-drop functional.
