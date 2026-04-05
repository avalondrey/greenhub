/**
 * GreenHub Plugins Entry Point
 * Initializes the plugin system and wires it to the React app.
 */

import { pluginAPI } from './PluginAPI.js';
import { pluginRegistry } from './PluginRegistry.js';
import { pluginLoader } from './PluginLoader.js';

// Expose global API
window.GreenHubAPI = pluginAPI;
window.GreenHubPlugins = pluginRegistry;
window.GreenHubMods = {
  load: (urls) => pluginLoader.loadAll(urls),
  unload: (id) => pluginLoader.unloadPlugin(id),
  list: () => pluginRegistry.getAllPlugins(),
};

// Declare mods to load (this is the "mod list" — users edit this file to add mods)
window.GREENHUB_MODS = [
  '/mods/example-mod/manifest.json',
  '/mods/bonsai-mod/manifest.json',
  '/mods/maraicher-mod/manifest.json',
];

// Auto-load on import
if (typeof window !== 'undefined') {
  // Small delay to ensure DOM is ready
  setTimeout(() => {
    pluginLoader.loadAll().catch(console.error);
  }, 100);
}

export { pluginAPI, pluginRegistry, pluginLoader };
