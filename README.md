# OmniAuthor Platform

AI-Powered Novel Writing platform using Vertex AI Gemini Pro.

## Architecture

- **Modes**:
  - *Copilot*: Real-time, low-latency text completion as you type
  - *Solo*: Agentic workflow for autonomous chapter generation with human-in-the-loop editing

- **Agents**: 13 specialized personas orchestrated via system prompts:
  - `orchestrator_agent`: Workflow coordination
  - `character_agent`: Character arcs and relationships
  - `dialogue_voice_agent`: Natural speech patterns
  - `plot_conflict_agent`: Story structure
  - `outline_structure_agent`: Chapter planning
  - `style_tone_agent`: Writing style consistency
  - `editing_agent`: Revision and polish
  - `quality_control_agent`: Readability scoring
  - `consistency_continuity_agent`: Timeline/plot tracking
  - `world_building_agent`: Setting/lore
  - `research_accuracy_agent`: Fact checking
  - `emotional_impact_agent`: Pacing and emotion
  - `critic_agent`: Feedback and improvement

- **RAG**: Pinecone vector DB stores narrative context for long-term consistency

## Tech Stack

- **Frontend**: React + TypeScript with Tiptap collaborative editor
- **Backend**: Node.js microservices on Google Cloud Run
- **AI**: Vertex AI Gemini 3 Pro (temp=1.0, max_tokens=65535)
- **Database**: PostgreSQL + Pinecone vector DB
- **Deploy**: Cloud Build with Buildpacks (no local Docker required)

## Project Structure

```
omniauthor/
├── cloudbuild.yaml          # CI/CD Configuration
├── Dockerfile.api           # Backend Dockerfile
├── packages/
│   └── shared-types/        # Shared TypeScript interfaces
├── apps/
│   ├── api/                 # Node.js Microservices
│   │   ├── src/
│   │   │   ├── config/      # Vertex AI & DB Config
│   │   │   ├── services/
│   │   │   │   ├── gemini.service.ts
│   │   │   │   ├── vector.service.ts
│   │   │   │   ├── orchestrator.service.ts
│   │   │   │   ├── agents/
│   │   │   │   │   ├── registry.ts       # 13 Agent Prompts
│   │   │   │   │   └── base.agent.ts
│   │   │   │   └── modes/
│   │   │   │       ├── copilot.ts        # Real-time logic
│   │   │   │       └── solo.ts           # Autonomous loop
│   │   │   ├── controllers/
│   │   │   └── app.ts
│   │   └── package.json
│   └── web/                 # React Frontend
│       ├── src/
│       │   ├── components/
│       │   │   ├── editor/              # Tiptap Editor
│       │   │   │   ├── OmniEditor.tsx
│       │   │   │   └── CopilotExtension.tsx
│       │   │   ├── dashboard/
│       │   │   └── solo/
│       │   ├── hooks/                   # API Hooks
│       │   └── store/                   # State Management
│       └── package.json
└── README.md
```

## Prerequisites

1. Google Cloud Project with Vertex AI API enabled
2. PostgreSQL Database (Cloud SQL)
3. Pinecone Account

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create `.env` in `apps/api`:

```env
GOOGLE_CLOUD_PROJECT=your-project-id
DATABASE_URL=postgres://...
PINECONE_API_KEY=...
```

### 3. Run Development Server

```bash
npm run dev
```

## Deployment

### Submit build to Cloud Build:

```bash
gcloud builds submit --config cloudbuild.yaml
```

The service will be deployed to Cloud Run automatically.

## Key Features

### 1. Orchestrator Pattern
Instead of 13 rigid microservices, we use a flexible `registry.ts`. The Orchestrator constructs a "Meta-Prompt" combining multiple agent personas for specific tasks (e.g., `ACT AS: Plot Agent AND Character Agent`). This reduces API latency and cost compared to chaining 13 separate HTTP requests.

### 2. Streaming Copilot
The `CopilotService` uses `generateContentStream` for real-time token streaming. The Frontend (Tiptap) handles this stream to give that "typing effect."

### 3. Long-Context Window
We explicitly set `maxOutputTokens: 65535` and pass in previous chapter summaries to utilize Gemini's massive context window, solving the "AI forgets what happened in Chapter 1" problem.

### 4. Solo Mode Loop
This is a backend heavy-lifter. It drafts, then asks the model to "critique itself" (Critic Agent), then rewrites based on the critique (Editing Agent) before sending the final result to the user.

## Pipeline Phases

**Phase 1: Ideation & Planning (10-15% of tokens)**
- Input: User premise/genre sliders
- Orchestrator delegates to: idea_generation → world_building → character → plot_conflict
- Outputs: Detailed outline, story bible, canon tracker
- Validated by critic_agent for feasibility

**Phase 2: Chapter Generation (50-60% of tokens)**
- Per-chapter loop with dynamic chapter_agent spawned
- Agents: outline_structure → research_accuracy → dialogue_voice + plot_conflict + emotional_impact → style_tone
- Outputs: Raw 2-5k word chapters with embedded continuity checks

**Phase 3: Iterative Refinement (20-25% of tokens)**
- consistency_continuity_agent scans sliding windows across chapters
- critic_agent flags plot holes/emotional flatness
- pace_rhythm_agent optimizes flow
- editing_agent + final_polish_agent rewrite
- quality_control_agent scores (readability, engagement)
- 2-3 critique-rewrite loops per chapter

**Phase 4: Finalization & Publishing (5-10% of tokens)**
- theme_symbol_agent ensures cohesion
- marketing_publishing_agent generates blurbs/cover ideas/formats (EPUB/PDF)
- Full canon reconciliation + metrics (coherence score >95%, emotional arc peaks)

## License

MIT License - see LICENSE file for details

## Contributing

Contributions welcome! Please open an issue or pull request.

---

**Built with Gemini 3 Pro on Vertex AI**
