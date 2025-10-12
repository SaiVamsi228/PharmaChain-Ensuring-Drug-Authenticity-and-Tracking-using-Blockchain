interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // Add other environment variables here
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
