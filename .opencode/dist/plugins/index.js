/**
 * SCS Plugins for OpenCode
 *
 * This module exports all SCS plugins for OpenCode integration.
 * Plugins provide hook-based automation that mirrors Claude Code's hook system
 * while taking advantage of OpenCode's more sophisticated 20+ event types.
 */
export { SCSHooksPlugin, default } from "./scs-hooks.js";
// Re-export for named imports
export * from "./scs-hooks.js";
//# sourceMappingURL=index.js.map