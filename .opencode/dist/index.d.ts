/**
 * SCS Plugin for OpenCode
 *
 * This package provides the published SCS OpenCode plugin module:
 * - Plugin hooks (auto-format, TypeScript check, console.log warning, env injection, etc.)
 * - Custom tools (run-tests, check-coverage, security-audit, format-code, lint-check, git-summary)
 * - Bundled reference config/assets for the wider SCS OpenCode setup
 *
 * Usage:
 *
 * Option 1: Install via npm
 * ```bash
 * npm install stijncodesetup
 * ```
 *
 * Then add to your opencode.json:
 * ```json
 * {
 *   "plugin": ["stijncodesetup"]
 * }
 * ```
 *
 * That enables the published plugin module only. For SCS commands, agents,
 * prompts, and instructions, use this repository's `.opencode/opencode.json`
 * as a base or copy the bundled `.opencode/` assets into your project.
 *
 * Option 2: Clone and use directly
 * ```bash
 * git clone https://github.com/StijnCodeSetup/StijnCodeSetup
 * cd SCS
 * opencode
 * ```
 *
 * @packageDocumentation
 */
export { SCSHooksPlugin, default } from "./plugins/index.js";
export * from "./plugins/index.js";
export declare const VERSION = "1.6.0";
export declare const metadata: {
    name: string;
    version: string;
    description: string;
    author: string;
    features: {
        agents: number;
        commands: number;
        skills: number;
        configAssets: boolean;
        hookEvents: string[];
        customTools: string[];
    };
};
//# sourceMappingURL=index.d.ts.map