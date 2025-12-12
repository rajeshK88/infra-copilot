# Infra Copilot

> A proof-of-concept demonstrating AI-powered infrastructure code generation using CopilotKit, featuring real-time streaming, human-in-the-loop workflows, and interactive code editing.

## Overview

Infra Copilot is an experimental application that showcases the integration of [CopilotKit](https://www.copilotkit.ai/) with infrastructure-as-code workflows. The application enables users to generate Terraform configurations and GitHub Actions workflows through natural language interactions with an AI agent, while maintaining full visibility and control over the code generation process.

### Key Features

- **🤖 AI-Powered Code Generation**: Leverages CopilotKit 1.50 with OpenAI to generate production-ready Terraform modules and CI/CD workflows
- **💬 Interactive Chat Interface**: Real-time conversational interface for step-by-step infrastructure planning and execution
- **✅ Human-in-the-Loop Workflows**: Per-step approval mechanism ensuring users maintain control over infrastructure changes
- **📁 Live File Tree**: Real-time visualization of generated infrastructure files with hierarchical organization
- **✏️ Streaming Code Editor**: Monaco Editor integration with live code streaming as the AI generates content
- **📋 Blueprint System**: Pre-configured infrastructure patterns for common cloud architectures (AWS, GCP)
- **🎨 Modern UI**: Built with Tailwind CSS and shadcn/ui components for a polished user experience

## Technology Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **AI Integration** | CopilotKit 1.50.0 |
| **State Management** | Zustand |
| **Code Editor** | Monaco Editor |
| **Styling** | Tailwind CSS + shadcn/ui |
| **UI Components** | Framer Motion, Lucide React |
| **Layout** | react-resizable-panels |

## Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Architecture                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Chat UI    │───▶│  CopilotKit  │───▶│   OpenAI     │
│  (React)     │    │  Integration │    │     API      │
└──────────────┘    └──────────────┘    └──────────────┘
       │                    │
       │                    ▼
       │            ┌──────────────┐
       │            │   Tools &    │
       │            │  Actions     │
       │            └──────────────┘
       │                    │
       ▼                    ▼
┌──────────────┐    ┌──────────────┐
│  Zustand     │    │   File       │
│   Store      │◀───│  Streaming   │
└──────────────┘    └──────────────┘
       │
       ▼
┌──────────────┐    ┌──────────────┐
│  File Tree   │    │   Monaco     │
│   (React)    │    │   Editor     │
└──────────────┘    └──────────────┘
```

### Workflow

1. **Blueprint Selection**: User selects a pre-configured infrastructure blueprint
2. **AI Agent Initialization**: CopilotKit agent displays all steps and requests approval for the first step
3. **Step-by-Step Execution**:
   - User reviews and approves/rejects each step
   - AI retrieves templates and generates code
   - Files are created and streamed one at a time
   - Real-time updates in file tree and editor
   - Completion confirmation before proceeding
4. **Live Code Generation**: Content streams into Monaco Editor as it's generated

## Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **OpenAI API Key** ([Get one here](https://platform.openai.com/api-keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd infra-copilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
infra-copilot/
├── app/                          # Next.js App Router
│   ├── api/
│   │   └── copilotkit/          # CopilotKit runtime API endpoint
│   ├── blueprints/[slug]/       # Blueprint detail pages
│   ├── chat/[id]/               # Chat interface pages
│   └── page.tsx                 # Home page
├── components/                   # React components
│   ├── chat/                    # Chat-related components
│   │   ├── cards/               # UI cards for chat messages
│   │   ├── chat-panel.tsx       # Main chat interface
│   │   └── tools.tsx            # CopilotKit tool definitions
│   ├── editor/                  # Code editor components
│   │   ├── file-tree.tsx        # File tree visualization
│   │   └── monaco-editor.tsx    # Monaco editor integration
│   ├── layout/                  # Layout components
│   │   └── main-layout.tsx      # Main application layout
│   └── ui/                      # Reusable UI components
├── lib/                         # Core libraries
│   ├── store.ts                 # Zustand state management
│   ├── blueprints.ts            # Blueprint data and utilities
│   ├── agent-instructions.ts    # AI agent instructions
│   └── terraform-templates.ts   # Terraform code templates
└── __tests__/                   # Unit tests
```

## Available Blueprints

The application includes pre-configured blueprints for common infrastructure patterns:

### 1. GCP Cloud Run Containerized App
- **Components**: Artifact Registry, Cloud Run Service, CI/CD Pipeline
- **Technologies**: Cloud Run, Artifact Registry, GitHub Actions, Docker, Terraform
- **Estimated Cost**: $10-30/month
- **Setup Time**: 2-3 minutes

### 2. AWS S3 Static Website with CloudFront
- **Components**: S3 Bucket, CloudFront Distribution, Route 53
- **Technologies**: S3, CloudFront, Route 53, GitHub Actions, Terraform
- **Estimated Cost**: $1-10/month
- **Setup Time**: 2-3 minutes

### 3. AWS Lambda Serverless API
- **Components**: DynamoDB Table, Lambda Functions, API Gateway
- **Technologies**: Lambda, API Gateway, DynamoDB, GitHub Actions, Terraform
- **Estimated Cost**: $5-25/month
- **Setup Time**: 3-4 minutes

## Usage

### Starting a New Infrastructure Project

1. **Select a Blueprint**
   - Browse available blueprints on the home page
   - Click on a blueprint to view details and steps

2. **Review Blueprint Details**
   - Examine the infrastructure components
   - Review estimated costs and setup time
   - Customize steps if needed

3. **Start Chat Session**
   - Click "Start Chat with Blueprint"
   - The AI agent will display all steps

4. **Approve and Execute**
   - Review each step's details
   - Approve or reject individual steps
   - Watch as files are generated in real-time
   - Code streams into the editor as it's created

5. **Review Generated Code**
   - Browse the file tree to see all generated files
   - Click on files to view their content
   - Code is ready for deployment or further customization

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |

### State Management

The application uses Zustand for state management with the following store structure:

```typescript
interface InfraStore {
  files: FileItem[]              // Generated files
  selectedFile: string | null    // Currently selected file
  expandedFolders: Set<string>   // Expanded folder paths
  
  // Actions
  createFile(path: string): void
  streamContent(path: string, content: string): void
  completeFile(path: string): void
  selectFile(path: string): void
  toggleFolder(folderPath: string): void
  getFileTree(): FileTreeNode[]
}
```

### CopilotKit Integration

The application leverages CopilotKit's tool system for AI agent interactions:

- **`displayStepsList`**: Displays all blueprint steps
- **`retrieveTemplates`**: Fetches Terraform templates for steps
- **`requestStepConfirmation`**: Human-in-the-loop approval mechanism
- **`writeToFile`**: Streams code to files one at a time
- **`markStepComplete`**: Marks steps as completed

## Testing

The project includes comprehensive unit tests with **220+ test cases** covering:

- **Store Tests**: Zustand store functionality (file management, tree building)
- **Library Tests**: Blueprint utilities, template functions, agent instructions
- **Component Tests**: React components (cards, editor, layout, UI elements)
- **Integration Tests**: Page components and workflows

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Coverage Report

After running `npm run test:coverage`, view the HTML report:

```bash
open coverage/lcov-report/index.html
```

**Current Coverage**: ~58% statements, ~50% branches, ~64% functions

## Screenshots

> **Note**: Add screenshots of your application here to showcase the UI and workflow.

### Home Page
![Home Page](./docs/screenshots/home.png)
*Browse available infrastructure blueprints*

### Chat Interface
![Chat Interface](./docs/screenshots/chat.png)
*Interactive chat with AI agent for step-by-step infrastructure building*

### Code Generation
![Code Generation](./docs/screenshots/code-generation.png)
*Real-time code streaming in Monaco Editor*

### File Tree
![File Tree](./docs/screenshots/file-tree.png)
*Visual file tree showing generated infrastructure files*

## Contributing

This is a proof-of-concept project. Contributions, suggestions, and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

See [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with [CopilotKit](https://www.copilotkit.ai/) for AI integration
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Code editor powered by [Monaco Editor](https://microsoft.github.io/monaco-editor/)

## Disclaimer

This is a **proof-of-concept** application demonstrating CopilotKit integration with infrastructure-as-code workflows. The generated code should be reviewed and tested before deployment to production environments.
