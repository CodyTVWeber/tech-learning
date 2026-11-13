window.APP_DATA = {
  title: "Tech Learning",
  tagline: "Short drills for high-leverage engineering with agentic coding tools.",
  intro: "You already know the AI basics. These modules are a practice loop: one short lesson, then a concrete drill with a done-when. Today's drill is the next incomplete item in priority order. Checkboxes and notes stay in this browser until you export them.",
  modules: [
    {
      id: "verification",
      title: "Verification habit",
      rank: 1,
      lesson: "Agents ship work that looks complete. Your edge is refusing to merge on vibe. Before you accept a change, walk a checklist: read the diff, run the tests (or record that none were run), match every claim to evidence, scan for secrets and private references, and remember that research is not authorization. A confident summary is not a passing test.\n\nThe first drill uses a sample generalization of a payments skill. Score it against five gates: no private references; estimated, agreed, and receipted amounts stay distinct; a closing rule requires recipient, amount, and purpose to match; a research-is-not-authorization line is present; the index or README is updated. Record pass or fail, and the fix for each miss. Do not merge on trust.",
      drills: [
        {
          id: "payments-checklist",
          title: "Verify an agent-written payments skill",
          prompt: "Open examples/payments-skill-draft/SKILL.md. Treat it as an agent-written generalization of a private skill. Score it against this five-item checklist: (1) no private references; (2) estimated, agreed, and receipted amounts stay distinct; (3) the closing rule requires recipient, amount, and purpose to match; (4) a research-is-not-authorization line is present; (5) the index or README is updated. Write pass or fail for each item, and a fix for every fail. Compare with examples/payments-skill-draft/REVIEW-KEY.md only after you have scored it yourself.",
          done_when: [
            "Each of the five checklist items is marked pass or fail in your notes",
            "Every failing item has a specific fix",
            "You did not look at REVIEW-KEY.md until after you scored the draft"
          ]
        }
      ]
    },
    {
      id: "practice-loop",
      title: "Hands-on practice loop",
      rank: 2,
      lesson: "Skill grows in a short daily loop, not in occasional marathon sessions. Block 15 to 30 minutes. Pick one drill. Use an agentic CLI as the implementer: Claude Code, Cursor CLI (`agent`, sometimes called cursor-agent), or Grok CLI. Treat Codex CLI and Gemini CLI as comparison tools until you install them. Do not pretend they are part of your daily kit.\n\nWork a tight plan, implement, review cycle. You write the plan and the done-when. The agent implements. You review the diff and the tests. Keep AGENTS.md as the canonical instructions file. CLAUDE.md, GEMINI.md, and any other tool-specific file should only point at AGENTS.md. Do not edit those files as a second source of truth.",
      drills: [
        {
          id: "daily-pir",
          title: "One plan-implement-review cycle",
          prompt: "Block 15 to 30 minutes. Pick a small, throwaway change in a repo you can afford to revert. Write a short plan and a done-when first. Have Claude Code, Cursor CLI, or Grok CLI implement it. Then review the diff and any tests yourself. In your notes, record the CLI you used, what the plan was, what you accepted, and what you rejected or rewrote. Codex CLI and Gemini CLI are comparison tools only unless you already have them installed.",
          done_when: [
            "The plan and done-when were written before the agent edited code",
            "You read the diff and recorded what you accepted or rejected",
            "The session stayed inside a 15 to 30 minute window, or you noted why it ran long"
          ]
        },
        {
          id: "canonical-agents-md",
          title: "Keep AGENTS.md canonical",
          prompt: "In this repo, or another repo you maintain, confirm AGENTS.md is the only source of agent rules. CLAUDE.md, GEMINI.md, and any other tool-specific instruction file should only point at AGENTS.md. If a pointer file has grown its own rules, restore the pointer and record the drift in your notes. Do not invent new rule files.",
          done_when: [
            "You inspected AGENTS.md and every tool-specific instruction file in the repo",
            "Tool-specific files only point at AGENTS.md, or you recorded and fixed the drift"
          ]
        }
      ]
    },
    {
      id: "generalization",
      title: "Private-to-public generalization",
      rank: 3,
      lesson: "Private skills are useful because they know your shop. Public skills are useful because a stranger can run them without your context. The work is generalization: strip names, internal paths, client-specific exceptions, and leftover \"as we do it here\" phrasing, then restate the rule so it holds for any repo.\n\nA good public skill keeps the decision rules that made the private one valuable. For a payments skill, that means distinct amount kinds, a strict closing rule, and an explicit ban on treating research as authorization. After the rewrite, update the public index or README so the skill can be found. The reviewer's job is to catch leaks and missing rules, not to polish tone.",
      drills: [
        {
          id: "rewrite-public-skill",
          title: "Rewrite one skill for a public repo",
          prompt: "Take one private agent skill (a SKILL.md you already use). Do not paste private text into this app's notes or into this public repo. Rewrite a generic public version that keeps the decision rules and drops shop-specific names, paths, and exceptions. Walk the same five gates as the verification drill, including an index or README entry so the skill can be found.",
          done_when: [
            "A public draft exists that a stranger could follow without your internal context",
            "You scored the draft on the five-item checklist and recorded any remaining leaks"
          ]
        },
        {
          id: "review-generalized-pr",
          title: "Review a generalized skill change",
          prompt: "Review a pull request or a local diff that generalizes a skill for public use. You may use the payments draft as a stand-in if you do not have a live PR. Comment only on private leaks, missing decision rules, and whether the index or README was updated. Do not merge, or treat the review as done, until the checklist is green.",
          done_when: [
            "The review names leaks, missing rules, or confirms the checklist is green",
            "Tone or style comments, if any, are clearly secondary to the checklist"
          ]
        }
      ]
    },
    {
      id: "stack-depth",
      title: "Stack depth with agents",
      rank: 4,
      lesson: "Agents get more leverage when they can reach your real stack: MCP servers, a Kotlin or Spring service on the JVM, a Rails app, and containers. Depth here means the agent can use a tool, run the test command, and you can still explain the change.\n\nStart by using or building a small MCP server so the agent has a structured tool, not a pile of shell one-offs. Then pick one service, Spring or Rails, and have the agent make a thin, tested change you review. Finish with Docker: generate or edit a Dockerfile or Compose file, then read the image layers and the run command yourself. The lesson is not \"prompt until it boots.\" It is \"the agent operates in your stack, and you verify.\" ",
      drills: [
        {
          id: "mcp-tool",
          title: "Use or build a small MCP server",
          prompt: "Give an agent a structured tool instead of a pile of shell one-offs. Use an existing MCP server, or build a tiny one with a single tool (for example, repo metadata or a wrapped test command). Connect it to Claude Code, Cursor CLI, or Grok CLI. Confirm the agent invokes the tool and that the result is correct.",
          done_when: [
            "The agent called the MCP tool in a real session",
            "You checked the tool result against the underlying command or data"
          ]
        },
        {
          id: "jvm-or-rails",
          title: "A thin, tested change in Spring or Rails",
          prompt: "In a Kotlin/Spring, other JVM, or Rails app, have an agent make a thin change with tests. You choose the done-when and the test command. After the agent works, run that command yourself and read the diff before you accept the change. Record any claim the agent made that the tests or the diff did not support.",
          done_when: [
            "You ran the project's test command (or a focused subset) yourself",
            "You accepted or rejected the diff based on evidence, and noted any unsupported claims"
          ]
        },
        {
          id: "container-review",
          title: "Review an agent-written container change",
          prompt: "Have an agent add or revise a Dockerfile or Compose file. Then walk the layers, the base image, exposed ports, and the run command yourself. Record one thing the agent got wrong, one risk you caught, or a clear note that you found no issue and how you checked.",
          done_when: [
            "You read the Docker or Compose change in full, not just the agent's summary",
            "Your notes include a concrete risk, a correction, or the check that found no issue"
          ]
        }
      ]
    },
    {
      id: "estimation-pricing",
      title: "AI-era estimation and pricing",
      rank: 5,
      lesson: "In the AI era, counting hours underprices judgment and overprices motion. Agents compress implementation time, but they do not own scope, risk, or the decision to ship. Prefer a fixed fee when the outcome is clear. Use time and materials when discovery is the work. Either way, price the value of the result and the quality of the judgment around it, not the raw hours an agent saved.\n\nA useful estimate names the outcome, the assumptions, the risks, and what happens if an assumption breaks. If you only quote hours, a faster agent just shrinks your invoice. If you quote the outcome, speed becomes the client's gain and your reputation.",
      drills: [
        {
          id: "fixed-fee-recast",
          title: "Recast an hourly estimate as a fixed fee",
          prompt: "Take a hypothetical hourly estimate for a well-scoped outcome (invent the numbers; do not use a real client or employer). Recast it as a fixed-fee range. Name the outcome, the assumptions, the risks, and what happens if an assumption fails. Keep the write-up free of identifying details.",
          done_when: [
            "The note states an outcome, a fee range, and explicit assumptions",
            "It says what changes if a named assumption breaks"
          ]
        },
        {
          id: "value-vs-hours",
          title: "Price judgment, not hours saved",
          prompt: "Write a short value-based quote justification for the same hypothetical outcome. Price the judgment and the result, not the hours an agent might save. Contrast it with a pure time-and-materials alternative, and say when T&M is still the right contract (for example, when discovery is the work).",
          done_when: [
            "The justification is framed around outcome and judgment, not hours saved",
            "It states a clear case for choosing fixed fee or time and materials"
          ]
        }
      ]
    }
  ],
  tools: {
    intro: "Only well-known, documented facts are listed here. No version numbers or prices. Claude Code, Cursor CLI, and Grok CLI are the daily-kit tools in these drills. Codex CLI and Gemini CLI are included for comparison until you install them.",
    rows: [
      {
        tool: "Claude Code",
        maker: "Anthropic",
        command: "claude",
        interfaces: "Interactive session; non-interactive print mode with -p",
        notes: "Documented as a terminal coding agent with session resume and MCP configuration.",
        docs: "https://code.claude.com/docs/en/cli-reference",
        kit: "daily"
      },
      {
        tool: "Cursor CLI",
        maker: "Cursor (Anysphere)",
        command: "agent",
        interfaces: "Interactive session; print mode with -p for scripts and CI; Plan and Ask modes",
        notes: "Official docs start an interactive session with the agent command. Some setups also expose cursor-agent.",
        docs: "https://cursor.com/docs/cli/overview",
        kit: "daily"
      },
      {
        tool: "Grok CLI",
        maker: "xAI",
        command: "grok",
        interfaces: "Interactive TUI by default; subcommands for config, sessions, and MCP",
        notes: "Documented commands include grok mcp for MCP servers and an import path for Claude Code sessions.",
        docs: "https://docs.x.ai/build/cli/reference",
        kit: "daily"
      },
      {
        tool: "Codex CLI",
        maker: "OpenAI",
        command: "codex",
        interfaces: "Interactive terminal agent; also used from a project directory after sign-in",
        notes: "Official CLI for inspecting, editing, and running code in the terminal, with MCP support via codex mcp. Comparison tool in this app until you install it.",
        docs: "https://github.com/openai/codex",
        kit: "comparison"
      },
      {
        tool: "Gemini CLI",
        maker: "Google",
        command: "gemini",
        interfaces: "Interactive terminal agent; headless and scripting mode is documented",
        notes: "Installable as @google/gemini-cli. Project context can live in GEMINI.md, which in this practice should only point at AGENTS.md. Comparison tool until you install it.",
        docs: "https://geminicli.com/docs/",
        kit: "comparison"
      }
    ]
  }
};
