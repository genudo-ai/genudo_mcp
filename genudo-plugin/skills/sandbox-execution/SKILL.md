---
name: sandbox-execution
description: Execute bash commands, run synthetic test engine suites, and inspect files inside an isolated, secure cloud microVM with live TerminalCard feedback.
---

# Sandbox Execution & Isolated MicroVM CLI

Run command-line tasks, execute test suites, run Python scripts, and perform filesystem operations inside an ephemeral microVM sandbox powered by E2B.

## Architecture & Core Benefits

- **Complete Server Isolation**: MicroVM execution runs entirely off-host on secure ephemeral infrastructure with zero CPU, RAM, or disk consumption on the main platform servers.
- **Live TerminalCard Output**: Commands stream an interactive terminal card displaying the command, runtime language, status, execution duration, exit code, and live stdout/stderr.
- **Autonomous Agent Verification**: Allows Super Agent to run local-style test commands like `run-agent-tests --pipeline <id>` directly rather than declining execution.

## Workflow

1. **Bash Command Execution (`sandbox_run_bash`)**:
   - Run commands by passing `command="<cmd>"` and optional `timeout_seconds` (default 60).
   - Safe inspection and testing commands (`run-agent-tests`, `pytest`, `python`, `ls`, `cat`, `git status`) execute immediately.
   - Destructive operations automatically trigger workspace-owner approval gating.

2. **Python Script Execution (`sandbox_run_python`)**:
   - Execute standalone Python scripts or automation logic with `code="<python_source>"`.
   - Results, print outputs, and exceptions are captured and streamed via `TerminalCard`.

3. **Filesystem Operations**:
   - `sandbox_list_files(path="/home/user")`: Inspect directory structures and check generated artifacts.
   - `sandbox_read_file(path="/path/to/file")`: Read test results, logs, or generated configs.
   - `sandbox_write_file(path="/path/to/file", content="...")`: Create scripts or configuration files inside the sandbox.

