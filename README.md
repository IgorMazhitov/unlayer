# Unlayer Svelte Email Editor

A lightweight, native Svelte 5 wrapper for the [Unlayer Email Editor](https://unlayer.com/) - the most powerful drag-and-drop email builder.

## Features

- Native Svelte 5 component with full TypeScript support
- Reactive props and event handling
- Automatic cleanup on component destruction
- Built-in error handling and loading states
- Responsive design that fills parent container
- Export designs as HTML or JSON
- Full access to Unlayer editor API methods
- Optimized bundle size with proper tree-shaking

## Installation

```bash
npm install @unlayer/svelte-email-editor
```

Or using yarn:

```bash
yarn add @unlayer/svelte-email-editor
```

## Quick Start

```svelte
<script lang="ts">
  import UnlayerEditor from '@unlayer/svelte-email-editor';
  import type { Design, ExportHtmlResult } from '@unlayer/svelte-email-editor';

  let design = $state({
    // Your initial design JSON (optional)
  });

  function handleExportHtml(event: CustomEvent<ExportHtmlResult>) {
    const { html, design } = event.detail;
    console.log('Exported HTML:', html);
    console.log('Design JSON:', design);
  }

  function handleLoaded() {
    console.log('Editor loaded successfully!');
  }
</script>

<UnlayerEditor
  bind:design
  height="500px"
  on:loaded={handleLoaded}
  on:export-html={handleExportHtml}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `design` | `Design` | `undefined` | Initial design JSON to load |
| `options` | `EditorOptions` | `{}` | Unlayer editor configuration options |
| `tools` | `object` | `{}` | Tool configuration (whitelist/blacklist) |
| `appearance` | `object` | `undefined` | Editor appearance configuration |
| `locale` | `string` | `'en'` | Editor locale/language |
| `projectId` | `number` | `undefined` | Unlayer project ID |
| `height` | `string` | `'100%'` | Editor height |
| `width` | `string` | `'100%'` | Editor width |
| `minHeight` | `number \| string` | `500` | Minimum editor height |
| `style` | `string` | `''` | Additional inline styles |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `loaded` | `void` | Fired when editor is fully loaded |
| `design-updated` | `Design` | Fired when design is modified |
| `design-loaded` | `Design` | Fired when a design is loaded |
| `export-html` | `ExportHtmlResult` | Fired when HTML is exported |
| `error` | `Error` | Fired when an error occurs |

## Methods

The component exposes several methods that can be accessed via binding:

```svelte
<script lang="ts">
  let editorRef: any;

  async function exportDesign() {
    const result = await editorRef.exportHtml();
    console.log(result.html);
  }
</script>

<UnlayerEditor bind:this={editorRef} />
```

### Available Methods

- `loadDesign(design: Design)` - Load a design JSON
- `saveDesign(): Promise<Design>` - Get current design JSON
- `exportHtml(options?: any): Promise<ExportHtmlResult>` - Export as HTML
- `loadBlank(options?: any)` - Load blank design
- `setMergeTags(mergeTags: any[])` - Set merge tags
- `setDisplayMode(mode: 'email' | 'web' | 'popup')` - Change display mode
- `registerTool(tool: any)` - Register custom tool
- `unregisterTool(name: string)` - Unregister tool

## Advanced Configuration

```svelte
<script lang="ts">
  import UnlayerEditor from '@unlayer/svelte-email-editor';

  const editorOptions = {
    displayMode: 'email',
    projectId: 1234,
    appearance: {
      theme: 'dark',
      panels: {
        tools: {
          dock: 'left'
        }
      }
    },
    features: {
      userUploads: true,
      stockImages: true,
      textEditor: {
        spellChecker: true,
        tables: true,
        cleanPaste: true,
        emojis: true
      },
      undoRedo: true,
      preview: true
    },
    tools: {
      form: false,  // Disable form tool
      image: {
        enabled: true,
        properties: {
          // Custom properties
        }
      }
    },
    fonts: {
      showDefaultFonts: true,
      customFonts: [
        {
          label: 'Comic Sans',
          value: 'Comic Sans MS',
          url: 'https://fonts.googleapis.com/css?family=Comic+Sans'
        }
      ]
    },
    mergeTags: [
      {
        name: 'First Name',
        value: '{{first_name}}',
        sample: 'John'
      },
      {
        name: 'Last Name', 
        value: '{{last_name}}',
        sample: 'Doe'
      }
    ]
  };
</script>

<UnlayerEditor options={editorOptions} />
```

## TypeScript Support

The package includes full TypeScript definitions. Import types as needed:

```typescript
import type {
  Design,
  EditorOptions,
  ExportHtmlResult,
  UnlayerEditorInstance,
  Tool,
  Features
} from '@unlayer/svelte-email-editor';
```

## Development

### Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build library
npm run build:lib

# Build demo
npm run build

# Run tests
npm run test
```

### Project Structure

```
unlayer-svelte/
├── src/
│   ├── lib/
│   │   ├── UnlayerEditor.svelte  # Main component
│   │   ├── types.ts               # TypeScript definitions
│   │   └── index.ts               # Library entry point
│   ├── App.svelte                 # Demo application
│   ├── main.ts                    # Demo entry point
│   └── welcome.json               # Sample design
├── dist/                          # Built library files
├── dist-demo/                     # Built demo files
└── package.json
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Architecture Decisions

### Component Design
- **Svelte 5 Runes**: Utilizes new Svelte 5 features like `$state`, `$bindable`, and `$effect` for optimal reactivity
- **TypeScript First**: Full type safety with comprehensive type definitions
- **Lifecycle Management**: Proper cleanup in `onDestroy` to prevent memory leaks
- **Error Boundaries**: Built-in error handling with fallback UI

### Event System
- **Native Svelte Events**: Uses `createEventDispatcher` for idiomatic Svelte event handling
- **Dual Event Support**: Supports both Svelte events (`on:event`) and callback props (`onEvent`)
- **Async Method Returns**: Methods return Promises for better async/await support

### Build Configuration
- **Dual Build Modes**: Separate builds for library distribution and demo app
- **Tree Shaking**: Optimized bundle with proper external dependencies
- **Source Maps**: Included for better debugging experience

## Challenges & Solutions

### Script Loading
**Challenge**: Unlayer's embed script must be loaded dynamically and only once.
**Solution**: Implemented smart script loading with deduplication and proper error handling.

### Memory Management
**Challenge**: Editor iframe must be properly cleaned up to prevent leaks.
**Solution**: Comprehensive cleanup in `onDestroy` lifecycle hook with iframe removal.

### Type Safety
**Challenge**: Unlayer's API isn't typed by default.
**Solution**: Created comprehensive TypeScript definitions for all editor options and methods.

## Production Hardening

For production deployment, consider:

1. **Content Security Policy**: Configure CSP to allow Unlayer's domain
2. **API Keys**: Use environment variables for project IDs
3. **Error Monitoring**: Integrate with error tracking service
4. **Performance**: Lazy load the editor component when needed
5. **Validation**: Validate designs before saving to backend

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Links

- [Demo Application](https://unlayer-svelte.netlify.app) - Live demo on Netlify
- [NPM Package](https://www.npmjs.com/package/@unlayer/svelte-email-editor)
- [Unlayer Documentation](https://docs.unlayer.com/)
- [GitHub Repository](https://github.com/IgorMazhitov/unlayer)

## Support

For issues and questions:
- Create an issue on [GitHub](https://github.com/IgorMazhitov/unlayer/issues)
- Check [Unlayer's official docs](https://docs.unlayer.com/)
- Contact: ivo@unlayer.com & hariss@unlayer.com