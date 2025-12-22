/**
 * Agent Foreman Session Start Plugin for OpenCode
 *
 * This is a SEPARATE plugin that adds automatic "getting up to speed" behavior.
 * When a new session starts, it automatically:
 * 1. Reads recent git history
 * 2. Reads progress log
 * 3. Gets current status from agent-foreman
 *
 * To disable: simply delete this file from .opencode/plugin/
 *
 * Based on Anthropic's "Effective harnesses for long-running agents"
 * https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
 */

export const AgentForemanSessionPlugin = async ({ $, directory, worktree, client }) => {
    const cwd = worktree || directory;

    /**
     * Gather session context from harness files
     * Runs automatically at session start
     */
    const gatherSessionContext = async () => {
        const parts = [];

        // 1. Check if harness exists
        const harnessCheck = await $`test -f ai/feature_list.json`.cwd(cwd).nothrow();
        if (harnessCheck.exitCode !== 0) {
            // No harness - return empty (don't pollute session with errors)
            return null;
        }

        // 2. Get recent git history
        try {
            const gitLog = await $`git log --oneline -10`.cwd(cwd).nothrow();
            if (gitLog.exitCode === 0 && gitLog.stdout.toString().trim()) {
                parts.push(`## Recent Git History\n\`\`\`\n${gitLog.stdout.toString().trim()}\n\`\`\``);
            }
        } catch {
            // Ignore git errors
        }

        // 3. Get progress log (last 15 lines)
        try {
            const progressLog = await $`tail -15 ai/progress.log`.cwd(cwd).nothrow();
            if (progressLog.exitCode === 0 && progressLog.stdout.toString().trim()) {
                parts.push(`## Recent Progress (ai/progress.log)\n\`\`\`\n${progressLog.stdout.toString().trim()}\n\`\`\``);
            }
        } catch {
            // Ignore if file doesn't exist
        }

        // 4. Get current status from agent-foreman
        try {
            const status = await $`agent-foreman status --quiet`.cwd(cwd).nothrow();
            if (status.exitCode === 0 && status.stdout.toString().trim()) {
                parts.push(`## Current Status\n\`\`\`\n${status.stdout.toString().trim()}\n\`\`\``);
            }
        } catch {
            // agent-foreman might not be installed
        }

        return parts.length > 0 ? parts.join("\n\n") : null;
    };

    return {
        /**
         * Event hook: Runs when a new session is created
         * Automatically injects harness context into the session
         */
        event: async ({ event }) => {
            if (event.type === "session.created") {
                const context = await gatherSessionContext();
                if (context) {
                    // Show context as a system message
                    console.log("\n📋 [Agent Foreman] Session context loaded\n");
                }
            }
        },

        /**
         * Compaction hook: Preserves harness state when context window is compacted
         * Ensures the AI doesn't lose track of what it was working on
         */
        "experimental.session.compacting": async (input, output) => {
            const context = await gatherSessionContext();
            if (context) {
                output.context.push(`## Agent Foreman State (from harness files)\n\n${context}`);
            }
        },
    };
};
