<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import type { 
    UnlayerEditorInstance, 
    UnlayerEditorProps, 
    Design, 
    ExportHtmlResult,
    EditorOptions 
  } from './types';

  interface Props extends UnlayerEditorProps {
    onloaded?: () => void;
    ondesignUpdated?: (design: Design) => void;
    ondesignLoaded?: (design: Design) => void;
    onexportHtml?: (data: ExportHtmlResult) => void;
  }

  let {
    design = $bindable(),
    options = {},
    tools = {},
    appearance,
    locale = 'en',
    projectId,
    height = '100%',
    width = '100%',
    style = '',
    minHeight = 500,
    onloaded,
    ondesignUpdated,
    ondesignLoaded,
    onexportHtml
  }: Props = $props();

  const dispatch = createEventDispatcher<{
    'loaded': void;
    'design-updated': Design;
    'design-loaded': Design;
    'export-html': ExportHtmlResult;
    'error': Error;
  }>();

  let container: HTMLDivElement;
  let editor: UnlayerEditorInstance | null = null;
  let scriptLoaded = $state(false);
  let editorLoaded = $state(false);
  let loadError: Error | null = $state(null);

  const SCRIPT_URL = 'https://editor.unlayer.com/embed.js';
  const EDITOR_ID = `unlayer-editor-${Math.random().toString(36).substring(7)}`;

  function loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.unlayer) {
        scriptLoaded = true;
        resolve();
        return;
      }

      const existingScript = document.querySelector(`script[src="${SCRIPT_URL}"]`);
      if (existingScript) {
        if (existingScript.hasAttribute('data-loaded')) {
          scriptLoaded = true;
          resolve();
          return;
        }
        existingScript.addEventListener('load', () => {
          existingScript.setAttribute('data-loaded', 'true');
          scriptLoaded = true;
          resolve();
        });
        existingScript.addEventListener('error', reject);
        return;
      }

      const script = document.createElement('script');
      script.src = SCRIPT_URL;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        script.setAttribute('data-loaded', 'true');
        scriptLoaded = true;
        resolve();
      };
      script.onerror = () => {
        const error = new Error('Failed to load Unlayer script');
        loadError = error;
        reject(error);
      };
      document.head.appendChild(script);
    });
  }

  function mergeOptions(): EditorOptions {
    const mergedOptions: EditorOptions = {
      ...options,
      displayMode: options.displayMode || 'email',
      locale: locale || options.locale,
      projectId: projectId || options.projectId,
      appearance: appearance || options.appearance,
      tools: { ...tools, ...options.tools }
    };

    if (minHeight) {
      mergedOptions.editor = {
        ...mergedOptions.editor,
        minRows: typeof minHeight === 'number' ? Math.floor(minHeight / 100) : 5
      };
    }

    return mergedOptions;
  }

  function initializeEditor() {
    if (!window.unlayer || !container) {
      console.error('Unlayer script not loaded or container not found');
      return;
    }

    try {
      const finalOptions = mergeOptions();
      
      // Use requestAnimationFrame for smoother initialization
      requestAnimationFrame(() => {
        window.unlayer.init({
          id: EDITOR_ID,
          ...finalOptions
        });

        editor = window.unlayer;
        
        setupEventListeners();
        
        if (design) {
          // Delay design loading slightly for better performance
          setTimeout(() => {
            editor?.loadDesign(design);
          }, 100);
        }

        editorLoaded = true;
        dispatch('loaded');
        onloaded?.();
      });
    } catch (error) {
      loadError = error as Error;
      dispatch('error', error as Error);
      console.error('Failed to initialize Unlayer editor:', error);
    }
  }

  function setupEventListeners() {
    if (!editor) return;

    editor.addEventListener('design:updated', (data: any) => {
      editor?.saveDesign((updatedDesign: Design) => {
        design = updatedDesign;
        dispatch('design-updated', updatedDesign);
        ondesignUpdated?.(updatedDesign);
      });
    });

    editor.addEventListener('design:loaded', (data: any) => {
      dispatch('design-loaded', data);
      ondesignLoaded?.(data);
    });
  }

  export function loadDesign(newDesign: Design) {
    if (editor) {
      editor.loadDesign(newDesign);
      design = newDesign;
    }
  }

  export function saveDesign(): Promise<Design> {
    return new Promise((resolve, reject) => {
      if (!editor) {
        reject(new Error('Editor not initialized'));
        return;
      }
      editor.saveDesign((savedDesign: Design) => {
        design = savedDesign;
        resolve(savedDesign);
      });
    });
  }

  export function exportHtml(options?: any): Promise<ExportHtmlResult> {
    return new Promise((resolve, reject) => {
      if (!editor) {
        reject(new Error('Editor not initialized'));
        return;
      }
      editor.exportHtml((data: ExportHtmlResult) => {
        dispatch('export-html', data);
        onexportHtml?.(data);
        resolve(data);
      }, options);
    });
  }

  export function loadBlank(blankOptions?: any) {
    if (editor) {
      editor.loadBlank(blankOptions);
    }
  }

  export function setMergeTags(mergeTags: any[]) {
    if (editor) {
      editor.setMergeTags(mergeTags);
    }
  }

  export function setDisplayMode(mode: 'email' | 'web' | 'popup') {
    if (editor) {
      editor.setDisplayMode(mode);
    }
  }

  export function registerTool(tool: any) {
    if (editor) {
      editor.registerTool(tool);
    }
  }

  export function unregisterTool(name: string) {
    if (editor) {
      editor.unregisterTool(name);
    }
  }

  onMount(async () => {
    try {
      // Start loading immediately
      await loadScript();
      // Small delay to ensure DOM is ready
      requestAnimationFrame(() => {
        initializeEditor();
      });
    } catch (error) {
      console.error('Failed to mount Unlayer editor:', error);
      dispatch('error', error as Error);
    }
  });

  onDestroy(() => {
    if (editor && window.unlayer) {
      try {
        const iframe = document.getElementById(EDITOR_ID);
        if (iframe) {
          iframe.remove();
        }
      } catch (error) {
        console.error('Error cleaning up editor:', error);
      }
    }
    editor = null;
  });

  $effect(() => {
    if (editor && design) {
      editor.loadDesign(design);
    }
  });

  $effect(() => {
    if (editor && options) {
      const mergedOptions = mergeOptions();
      if (mergedOptions.displayMode) {
        editor.setDisplayMode(mergedOptions.displayMode);
      }
      if (mergedOptions.mergeTags) {
        editor.setMergeTags(mergedOptions.mergeTags);
      }
    }
  });

  declare global {
    interface Window {
      unlayer: UnlayerEditorInstance;
    }
  }
</script>

<div 
  bind:this={container}
  class="unlayer-editor-container"
  style="width: {width}; height: {height}; min-height: {typeof minHeight === 'number' ? `${minHeight}px` : minHeight}; {style}"
>
  {#if !scriptLoaded}
    <div class="unlayer-loading">
      <div class="unlayer-spinner"></div>
      <p>Loading Unlayer Editor...</p>
    </div>
  {/if}
  
  {#if loadError}
    <div class="unlayer-error">
      <p>Failed to load editor: {loadError.message}</p>
      <button onclick={() => location.reload()}>Retry</button>
    </div>
  {/if}
  
  <div id={EDITOR_ID} style="display: {editorLoaded ? 'block' : 'none'}; height: 100%;"></div>
</div>

<style>
  .unlayer-editor-container {
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .unlayer-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  .unlayer-spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .unlayer-error {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    min-height: 200px;
    padding: 20px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    color: #721c24;
    background-color: #f8d7da;
    border: 1px solid #f5c6cb;
    border-radius: 4px;
  }

  .unlayer-error button {
    margin-top: 10px;
    padding: 8px 16px;
    background-color: #dc3545;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .unlayer-error button:hover {
    background-color: #c82333;
  }
</style>