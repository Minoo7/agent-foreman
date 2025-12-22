# Agent Foreman Session Plugin

**Automatic "Getting Up to Speed" for OpenCode**

This is a **separate, optional plugin** that implements Anthropic's session-start pattern.

## What It Does

When you start a new OpenCode session, it automatically:
1. Reads recent git history (`git log --oneline -10`)
2. Reads progress log (`ai/progress.log`)
3. Gets current status (`agent-foreman status`)

This gives the AI context about what happened in previous sessions.

## Installation

Copy this file to your project's `.opencode/plugin/` directory:

```bash
# From the agent-foreman repo:
cp plugins/agent-foreman/opencode-session-plugin.js /path/to/your/project/.opencode/plugin/
```

## Uninstall / Disable

Just delete the file:

```bash
rm .opencode/plugin/opencode-session-plugin.js
```

## Based On

[Anthropic: Effective harnesses for long-running agents](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents)

> "Every coding agent is prompted to run through a series of steps to get its bearings:
> 1. Run pwd to see the directory
> 2. Read the git logs and progress files
> 3. Read the features list and choose the highest-priority feature"
