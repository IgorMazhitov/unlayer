export interface Design {
  body?: {
    rows?: any[];
    values?: Record<string, any>;
  };
  counters?: Record<string, number>;
  schemaVersion?: number;
}

export interface ExportHtmlResult {
  design: Design;
  html: string;
}

export interface Tool {
  name: string;
  enabled?: boolean;
}

export interface DisplayMode {
  displayMode?: 'email' | 'web' | 'popup';
}

export interface Features {
  userUploads?: boolean;
  stockImages?: boolean;
  textEditor?: {
    spellChecker?: boolean;
    tables?: boolean;
    cleanPaste?: boolean;
    emojis?: boolean;
  };
  undoRedo?: boolean;
  preview?: boolean;
}

export interface EditorOptions extends DisplayMode {
  projectId?: number;
  templateId?: number;
  locale?: string;
  appearance?: {
    theme?: 'light' | 'dark';
    panels?: {
      tools?: {
        dock?: 'left' | 'right';
      };
    };
  };
  features?: Features;
  tools?: Record<string, Tool | boolean>;
  blocks?: any[];
  editor?: {
    minRows?: number;
    maxRows?: number;
  };
  fonts?: {
    showDefaultFonts?: boolean;
    customFonts?: Array<{
      label: string;
      value: string;
      url: string;
    }>;
  };
  mergeTags?: Array<{
    name: string;
    value: string;
    sample?: string;
  }>;
  designTags?: Record<string, any>;
  customCSS?: string[];
  customJS?: string[];
  source?: {
    name?: string;
    version?: string;
  };
}

export interface UnlayerEditorInstance {
  loadDesign: (design: Design) => void;
  saveDesign: (callback: (design: Design) => void) => void;
  exportHtml: (callback: (data: ExportHtmlResult) => void, options?: any) => void;
  loadBlank: (options?: any) => void;
  addEventListener: (type: string, callback: (data: any) => void) => void;
  removeEventListener: (type: string, callback: (data: any) => void) => void;
  setMergeTags: (mergeTags: any[]) => void;
  setDisplayMode: (mode: 'email' | 'web' | 'popup') => void;
  registerTool: (tool: any) => void;
  unregisterTool: (name: string) => void;
}

export interface UnlayerEditorProps {
  design?: Design;
  options?: EditorOptions;
  tools?: Record<string, Tool | boolean>;
  appearance?: EditorOptions['appearance'];
  locale?: string;
  projectId?: number;
  height?: string;
  width?: string;
  style?: string;
  minHeight?: number | string;
}

export interface UnlayerEditorEvents {
  loaded?: () => void;
  'design-updated'?: (design: Design) => void;
  'design-loaded'?: (design: Design) => void;
  'export-html'?: (data: ExportHtmlResult) => void;
}