<script lang="ts">
  import UnlayerEditor from './lib/UnlayerEditor.svelte';
  import type { Design, ExportHtmlResult } from './lib/types';
  import welcomeDesign from './welcome.json';

  let editorRef: any;
  let currentDesign: Design = $state(welcomeDesign as Design);
  let exportedHtml: string = $state('');
  let showPreview: boolean = $state(false);
  let isExporting: boolean = $state(false);
  let lastSavedDesign: Design | null = $state(null);

  const editorOptions = {
    displayMode: 'email' as const,
    projectId: 1,
    appearance: {
      theme: 'light' as const,
      panels: {
        tools: {
          dock: 'left' as const
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
      form: false
    },
    fonts: {
      showDefaultFonts: true,
      customFonts: [
        {
          label: 'Montserrat',
          value: 'Montserrat',
          url: 'https://fonts.googleapis.com/css?family=Montserrat:400,700'
        },
        {
          label: 'Open Sans',
          value: 'Open Sans',
          url: 'https://fonts.googleapis.com/css?family=Open+Sans:400,700'
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
      },
      {
        name: 'Company',
        value: '{{company}}',
        sample: 'Acme Inc.'
      }
    ]
  };

  function handleEditorLoaded() {
    console.log('Editor loaded successfully');
  }

  function handleDesignUpdated(design: Design) {
    currentDesign = design;
    console.log('Design updated:', design);
  }

  async function loadSampleDesign() {
    if (editorRef) {
      editorRef.loadDesign(welcomeDesign as Design);
      currentDesign = welcomeDesign as Design;
    }
  }

  async function loadBlankDesign() {
    if (editorRef) {
      editorRef.loadBlank();
    }
  }

  async function saveDesign() {
    if (editorRef) {
      try {
        const design = await editorRef.saveDesign();
        lastSavedDesign = design;
        console.log('Design saved:', design);
        alert('Design saved successfully! Check console for JSON.');
      } catch (error) {
        console.error('Failed to save design:', error);
        alert('Failed to save design');
      }
    }
  }

  async function exportHtml() {
    if (editorRef) {
      isExporting = true;
      try {
        const result = await editorRef.exportHtml();
        exportedHtml = result.html;
        currentDesign = result.design;
        console.log('Exported HTML:', result);
        alert('HTML exported successfully! Click "Preview HTML" to see the result.');
      } catch (error) {
        console.error('Failed to export HTML:', error);
        alert('Failed to export HTML');
      } finally {
        isExporting = false;
      }
    }
  }

  function previewHtml() {
    if (exportedHtml) {
      showPreview = true;
    } else {
      alert('Please export HTML first');
    }
  }

  function closePreview() {
    showPreview = false;
  }

  function downloadHtml() {
    if (!exportedHtml) {
      alert('Please export HTML first');
      return;
    }

    const blob = new Blob([exportedHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-template.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadJson() {
    const json = JSON.stringify(currentDesign, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'email-design.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div class="app">
  <header class="header">
    <h1>Unlayer Svelte Email Editor Demo</h1>
    <div class="actions">
      <button onclick={loadSampleDesign} class="btn btn-secondary">
        Load Sample Design
      </button>
      <button onclick={loadBlankDesign} class="btn btn-secondary">
        New Blank Design
      </button>
      <button onclick={saveDesign} class="btn btn-primary">
        Save Design
      </button>
      <button onclick={exportHtml} class="btn btn-primary" disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export HTML'}
      </button>
      <button onclick={previewHtml} class="btn btn-success" disabled={!exportedHtml}>
        Preview HTML
      </button>
      <button onclick={downloadHtml} class="btn btn-info" disabled={!exportedHtml}>
        Download HTML
      </button>
      <button onclick={downloadJson} class="btn btn-info">
        Download JSON
      </button>
    </div>
  </header>

  <main class="editor-container">
    <UnlayerEditor
      bind:this={editorRef}
      bind:design={currentDesign}
      options={editorOptions}
      height="calc(100vh - 80px)"
      onloaded={handleEditorLoaded}
      ondesignUpdated={handleDesignUpdated}
    />
  </main>

  {#if showPreview}
    <div class="preview-modal">
      <div class="preview-content">
        <div class="preview-header">
          <h2>HTML Preview</h2>
          <button onclick={closePreview} class="btn-close">×</button>
        </div>
        <div class="preview-body">
          <iframe srcdoc={exportedHtml} title="HTML Preview"></iframe>
        </div>
      </div>
    </div>
  {/if}
</div>

<style>
  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .app {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
  }

  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .header h1 {
    margin: 0 0 1rem 0;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
  }

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    white-space: nowrap;
  }

  .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-secondary {
    background: #6b7280;
    color: white;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #4b5563;
  }

  .btn-success {
    background: #10b981;
    color: white;
  }

  .btn-success:hover:not(:disabled) {
    background: #059669;
  }

  .btn-info {
    background: #8b5cf6;
    color: white;
  }

  .btn-info:hover:not(:disabled) {
    background: #7c3aed;
  }

  .editor-container {
    flex: 1;
    overflow: hidden;
    background: #f9fafb;
  }

  .preview-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .preview-content {
    background: white;
    width: 90%;
    max-width: 1200px;
    height: 85vh;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
  }

  .preview-header h2 {
    margin: 0;
    font-size: 1.25rem;
    color: #111827;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: #6b7280;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    transition: all 0.2s ease;
  }

  .btn-close:hover {
    background: #e5e7eb;
    color: #111827;
  }

  .preview-body {
    flex: 1;
    padding: 1rem;
    background: #fff;
    overflow: hidden;
  }

  .preview-body iframe {
    width: 100%;
    height: 100%;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: white;
  }
</style>