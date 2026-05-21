# DataAI

Upload CSV files and ask questions in plain English. Get insights, charts, and analysis instantly.

## What is DataAI?

DataAI is an AI-powered data analysis tool that lets you:
- **Upload CSV files** - Drag and drop or click to upload your data
- **Ask questions in plain English** - No SQL or Python required
- **Get instant insights** - AI analyzes your data and provides answers
- **Generate charts** - Visualize your data with matplotlib
- **Export results** - Download your analysis and cleaned data

## Features

### MVP (Current)
- [x] CSV file upload with drag-and-drop
- [x] Data preview with pagination (10 rows per page)
- [x] Natural language data analysis
- [x] Multi-model AI support (Mistral, Moonshot, DeepSeek, OpenAI, xAI)
- [x] In-browser Python execution (Pyodide)
- [x] Chart generation with matplotlib
- [x] Spreadsheet artifact creation
- [x] Chat history and persistence

### Phase 2 (Coming Soon)
- [ ] Dataset library (save and manage multiple datasets)
- [ ] Analysis history (save conversations per dataset)
- [ ] Share insights via public links
- [ ] Export results to CSV/Excel
- [ ] Team workspaces
- [ ] Advanced chart types

### Phase 3 (Future)
- [ ] SQL database connections
- [ ] API for programmatic access
- [ ] Scheduled analyses (cron jobs)
- [ ] Integration marketplace (Slack, Teams, etc.)
- [ ] Enterprise features (SSO, audit logs)

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **AI**: AI SDK v6 with Vercel AI Gateway (multi-provider)
- **Database**: Neon Postgres via Drizzle ORM
- **Storage**: Vercel Blob (file uploads)
- **UI**: shadcn/ui with Tailwind CSS
- **Auth**: Auth.js 5.0
- **Charts**: matplotlib via Pyodide (browser-based)

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Vercel account (for AI Gateway)

### Environment Setup

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Set up required environment variables:
- `DATABASE_URL` - Neon Postgres connection string
- `AI_GATEWAY_API_KEY` - Vercel AI Gateway API key
- `AUTH_SECRET` - Auth.js secret key
- `BLOB_READ_WRITE_TOKEN` - Vercel Blob token

### Installation

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm db:migrate

# Start development server
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000).

## Usage

1. **Upload Data**: Drag and drop a CSV file or click to browse
2. **Preview**: Review your data in the preview table
3. **Ask Questions**: Type questions like:
   - "What's the average revenue by month?"
   - "Show me a chart of sales trends"
   - "Find correlations between price and quantity"
   - "What are the top 10 products by sales?"
4. **Get Insights**: AI analyzes your data and provides answers with charts

## Business Model

### Pricing

| Tier | Price | Datasets | Analyses | Features |
|------|-------|----------|----------|----------|
| Free | $0 | 1 | 10/month | Basic analysis |
| Pro | $29/mo | 20 | Unlimited | All models, charts, sharing |
| Team | $79/user/mo | Unlimited | Unlimited | Workspaces, API, SSO |
| Enterprise | Custom | Unlimited | Unlimited | On-premise, SLA |

### Competitive Advantage
- **Browser-based execution**: Zero server compute costs (Pyodide)
- **Multi-model routing**: Cost optimization across AI providers
- **All-in-one**: Upload, analyze, visualize, export in one tool
- **Familiar UX**: Spreadsheet-like interface for business users

## Deployment

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/dataai)

## License

MIT

## Roadmap

See [PROFITABILITY_PLAN.md](PROFITABILITY_PLAN.md) for detailed business strategy and implementation roadmap.

---

Built with ❤️ using Next.js and the AI SDK.
