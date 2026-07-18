# Claude CLI Proxy Research — Using Claude Code's Workflow Harness with opencode

**Date:** July 18, 2026

## Summary

There is **no official `claude-code-proxy` tool** from Anthropic. However, there are **multiple community projects** that bridge Claude Code's harness/workflows to other backends. Additionally, opencode can be pointed at a proxy via the standard `ANTHROPIC_BASE_URL` environment variable.

## How opencode Uses Proxies

opencode supports the `ANTHROPIC_BASE_URL` and `ANTHROPIC_API_KEY` environment variables, meaning **any Anthropic-compatible proxy** can sit between opencode and the model backend:

```bash
ANTHROPIC_API_KEY=x ANTHROPIC_BASE_URL=http://127.0.0.1:3456 opencode
```

(This is the standard mechanism used by all tools in the ecosystem.)

## Community Proxy Projects

### 1. raine/claude-code-proxy (Rust, 356★)

**GitHub:** https://github.com/raine/claude-code-proxy

A Rust-based local proxy that lets Claude Code use **OpenAI (Codex/ChatGPT), Kimi, Grok, or Cursor** subscriptions instead of Anthropic. It translates the Anthropic API format to each provider's native format.

**Supported providers:**
- **Codex** — ChatGPT Plus/Pro subscription via `chatgpt.com/backend-api/codex/responses`
- **Kimi** — kimi.com Kimi Code via OpenAI-style chat-completions
- **Grok** — grok.com via Responses API
- **Cursor Agent** — cursor.sh via Connect protocol

**Usage:**
```bash
claude-code-proxy codex auth login    # OAuth login
claude-code-proxy serve               # starts on :18765

ANTHROPIC_BASE_URL=http://localhost:18765 \
ANTHROPIC_AUTH_TOKEN=unused \
ANTHROPIC_MODEL=gpt-5.6-sol \
opencode
```

### 2. UltraCode-Shim / ultra-code-shim (Python, MIT)

**GitHub:** https://github.com/BunsDev/ultra-code-shim

A stdlib-only Python proxy that gives **Claude Code's UltraCode mode** (xhigh effort + Workflow/deep-reasoning harness) to **any model** — including GPT-5.5, DeepSeek V4, MiniMax, MiMo, Ollama, OpenRouter, local models, etc. It works by injecting the UltraCode envelope (`effort=xhigh` + adaptive thinking + `max_tokens` + system reminder) into requests.

- Ships with config for 10+ model providers
- Accessible via Claude Code's `/model` menu (points at loopback proxy)
- Does not modify the original Claude Code install

### 3. Meridian / opencode-claude-max-proxy (TypeScript)

**GitHub:** https://github.com/xpolb01/opencode-claude-max-proxy

Bridges a **Claude Max subscription** via the official Claude Code SDK and exposes it as a local Anthropic API. Any Anthropic-compatible tool (opencode, Crush, Cline, Continue, Aider) can connect.

```bash
npm install -g opencode-claude-max-proxy
claude login                         # one-time
meridian                             # starts on :3456
ANTHROPIC_API_KEY=x ANTHROPIC_BASE_URL=http://127.0.0.1:3456 opencode
```

### 4. 1rgs/claude-code-proxy (TypeScript)

**GitHub:** https://github.com/1rgs/claude-code-proxy

Translates Anthropic API to **OpenAI / Gemini** via LiteLLM. Supports streaming, custom model mapping, and Vertex AI.

### 5. opencode-base-url (Cloudflare Worker)

**GitHub:** https://github.com/hdworker/opencode-base-url

A Cloudflare Worker that translates Anthropic `/v1/messages` → OpenAI `/v1/chat/completions`, routing to **OpenCode Go** or **OpenCode Zen** upstreams. Lets Claude send requests to opencode-hosted models via a proxy.

## How Claude Code's Workflow/Harness Feature Works

Claude Code has a **dynamic workflow** / "UltraCode" feature (announced July 2026) that allows it to:
- Create custom multi-agent harnesses for complex tasks
- Use patterns like classify-and-act, fan-out-and-synthesize, adversarial verification
- Trigger with the keyword "ultracode"
- Spawn subagents with their own context windows

This is **not** available as a standalone library or API. It's built into the Claude Code CLI. However, proxy tools like **UltraCode-Shim** replicate the UltraCode behavior by injecting the right request envelope for any backend.

## opencode-Specific Notes

opencode has its own **agent/subagent system** (configured via `opencode.json` — see `AGENTS.md`) which is analogous to Claude Code's workflows. opencode does not need Claude Code's workflow/harness to run subagents — it has its own built-in capability.

To use opencode **with a proxy** (e.g., to use a different model provider):

1. Pick a proxy from the list above
2. Start the proxy server
3. Set `ANTHROPIC_BASE_URL` to the proxy's address when launching opencode

The proxy handles all Anthropic↔provider translation transparently.

## Key Takeaway

There is no single "Claude CLI proxy" standard. The ecosystem is fragmented across several community projects, each supporting different backends. The common integration point is `ANTHROPIC_BASE_URL`. For opencode specifically, the **agent/subagent system is already built in** — the proxy use case is primarily about **model provider choice**, not about gaining workflow/capabilities that opencode lacks.
