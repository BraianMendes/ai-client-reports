# AI Client Reports - Frontend

A modern, minimalist web application for generating AI-powered business reports and interactive analysis. This frontend application provides an elegant interface for users to create intelligent reports, browse analysis history, and chat directly with AI for insights and brainstorming.

## 🚀 What is this project?

The AI Client Reports Frontend is a Next.js-based web application that serves as the user interface for an AI-powered business reporting system. It connects to a WhatsApp bot backend that generates comprehensive business reports using generative AI technology.

### Key Features

- **🤖 AI Report Generation**: Create intelligent analyses and complete reports using advanced AI models
- **📚 Report History**: Browse, search, and export previously generated reports
- **💬 AI Chat Interface**: Interactive chat with AI for quick insights and brainstorming
- **📄 PDF Export**: Export reports to PDF format for sharing and archiving
- **🌐 Multi-language Support**: Generate reports in English and Portuguese
- **📊 Pre-built Templates**: SWOT analysis, financial analysis, and market analysis templates
- **🎨 Modern UI**: Clean, minimalist design with dark theme
- **📱 Responsive Design**: Optimized for desktop and mobile devices

## 🛠️ Technologies Used

### Core Framework
- **Next.js 15.3.4**: React framework with App Router for modern web development
  - *Why?* Provides excellent developer experience, built-in optimization, and server-side rendering capabilities

### UI & Styling
- **React 19**: Latest React version for building user interfaces
- **TypeScript 5**: Type-safe development experience
- **Tailwind CSS 4**: Utility-first CSS framework for rapid UI development
  - *Why?* Enables consistent, maintainable styling with minimal custom CSS
- **HeroUI**: Modern React component library for consistent UI elements
  - *Why?* Provides beautiful, accessible components out of the box
- **Framer Motion**: Smooth animations and micro-interactions
  - *Why?* Enhances user experience with fluid animations

### Icons & Assets
- **Lucide React**: Beautiful, customizable icon library
- **Heroicons**: Additional icon set for comprehensive UI coverage

### Functionality
- **Axios**: HTTP client for API communication
- **jsPDF**: Client-side PDF generation
  - *Why?* Enables users to export reports directly from the browser
- **Custom Hooks**: Reusable logic for report management

### Development Tools
- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization

## 📦 Installation and Setup

### Prerequisites
- Node.js 18+ installed on your machine
- npm, yarn, pnpm, or bun package manager

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-client-reports/ai-whatsapp-reports-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   # or
   bun install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Add your environment variables here
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `npm run dev` - Start the development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality checks

## 🎯 How to Use

1. **Generate Reports**: Navigate to the Reports page and select from pre-built templates (SWOT, Financial, Market Analysis) or create custom prompts
2. **View History**: Access previously generated reports in the History section
3. **AI Chat**: Use the chat interface for quick questions and brainstorming sessions
4. **Export**: Download reports as PDF files for sharing and archiving

## 🔮 Future Updates

### Planned Features
- **🔐 User Authentication**: Secure user accounts and personalized report history
- **🎨 Theme Customization**: Light/dark theme toggle and custom color schemes
- **📊 Advanced Analytics**: Report performance metrics and usage statistics
- **🔗 Integration Expansions**: Connect with more messaging platforms beyond WhatsApp
- **🌍 Internationalization**: Support for additional languages
- **📱 Progressive Web App**: Offline capabilities and mobile app experience
- **🤝 Collaboration**: Share reports and collaborate with team members
- **🔄 Real-time Updates**: Live report generation progress and notifications
- **📈 Advanced Visualizations**: Interactive charts and data visualizations
- **🎯 Custom Templates**: User-created report templates and sharing

### Technical Improvements
- **Performance Optimization**: Enhanced loading speeds and caching strategies
- **Accessibility**: Full WCAG compliance for inclusive design
- **Testing**: Comprehensive unit and integration test coverage
- **CI/CD Pipeline**: Automated testing and deployment workflows
- **Monitoring**: Application performance monitoring and error tracking

## 🤝 Contributing

We welcome contributions! Please feel free to submit issues, feature requests, or pull requests to help improve the application.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

Built with ❤️ using Next.js and modern web technologies.
