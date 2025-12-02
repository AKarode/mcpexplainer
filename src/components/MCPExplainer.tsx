// @ts-nocheck
import { useState, useEffect, useRef } from 'react';
import { Brain, Calendar, Mail, FolderOpen, Lock, Unlock, ChevronDown, ChevronRight, AlertTriangle, Zap, Users, Globe, Clock, Shield, Box, ArrowRight, Quote, ExternalLink, Play, CheckCircle, Send, FileText } from 'lucide-react';

const useInView = (threshold = 0.2) => {
  const [inView, setInView] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView];
};

const Section = ({ children, className = "", dark = false }) => {
  const [ref, inView] = useInView(0.1);
  return (
    <section
      ref={ref}
      className={`min-h-screen py-16 px-6 md:px-12 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } ${dark ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'} ${className}`}
    >
      <div className="max-w-4xl mx-auto">{children}</div>
    </section>
  );
};

const QuoteCard = ({ quote, speaker, context }) => (
  <div className="bg-slate-800 border-l-4 border-amber-500 p-4 rounded-r-lg my-4">
    <div className="flex gap-2 items-start">
      <Quote className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
      <div>
        <p className="text-slate-200 italic">"{quote}"</p>
        <p className="text-amber-500 text-sm mt-2 font-medium">{speaker}</p>
        {context && <p className="text-slate-400 text-xs mt-1">{context}</p>}
      </div>
    </div>
  </div>
);

const QuoteCardLight = ({ quote, speaker, context }) => (
  <div className="bg-white border-l-4 border-amber-500 p-4 rounded-r-lg my-4 shadow-sm">
    <div className="flex gap-2 items-start">
      <Quote className="w-5 h-5 text-amber-500 flex-shrink-0 mt-1" />
      <div>
        <p className="text-slate-700 italic">"{quote}"</p>
        <p className="text-amber-600 text-sm mt-2 font-medium">{speaker}</p>
        {context && <p className="text-slate-500 text-xs mt-1">{context}</p>}
      </div>
    </div>
  </div>
);

const ActionCard = ({ type, content, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = { calendar: Calendar, email: Send, file: FileText };
  const colors = { calendar: 'emerald', email: 'blue', file: 'purple' };
  const Icon = icons[type];
  const color = colors[type];

  return (
    <div className={`bg-${color}-500/20 border border-${color}-500/50 rounded-lg p-4 flex items-center gap-3 animate-pulse`}>
      <div className={`w-10 h-10 rounded-full bg-${color}-500/30 flex items-center justify-center`}>
        <Icon className={`w-5 h-5 text-${color}-400`} />
      </div>
      <div className="flex-1">
        <p className={`text-${color}-300 text-sm font-medium`}>Action Completed</p>
        <p className="text-slate-300 text-xs mt-1">{content}</p>
      </div>
      <CheckCircle className={`w-5 h-5 text-${color}-400`} />
    </div>
  );
};

const ExpandableCard = ({ title, icon: Icon, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden mb-4 shadow-sm">
      <button
        onClick={() => setOpen(!open)}
        className="w-full p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Icon className="w-5 h-5 text-amber-500" />
          <span className="font-medium text-slate-800">{title}</span>
        </div>
        {open ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
      </button>
      {open && <div className="px-4 pb-4 text-slate-600 text-sm border-t border-slate-100 pt-4">{children}</div>}
    </div>
  );
};

export default function MCPExplainer() {
  const [openPrimitives, setOpenPrimitives] = useState({ tools: false, resources: false, sampling: false });
  const [connectedTools, setConnectedTools] = useState({ calendar: false, email: false, files: false });
  const [writePermissions, setWritePermissions] = useState({ calendar: false, email: false, files: false });
  const [userQuery, setUserQuery] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [permissionLevel, setPermissionLevel] = useState(1);
  const [actionCards, setActionCards] = useState([]);
  const [openTradeoffs, setOpenTradeoffs] = useState({ control: false, toolOverload: false, security: false });
  const [toolCount, setToolCount] = useState(3);

  const mockData = {
    calendar: "Today: 10am Team Standup, 2pm Client Call with Acme Corp, 4pm Code Review. Tomorrow: 9am Dentist, 1pm Lunch with Sarah, 3pm Sprint Planning.",
    email: "Recent emails: (1) From: boss@company.com - Subject: Q4 Planning - needs response by EOD. (2) From: sarah@gmail.com - Subject: Dinner Friday? (3) From: notifications@github.com - PR #234 approved.",
    files: "Recent files: quarterly-report-draft.docx (modified yesterday), project-roadmap.pdf, meeting-notes-nov.md, budget-2025.xlsx."
  };

  const toggleTool = (tool) => {
    setConnectedTools(prev => ({ ...prev, [tool]: !prev[tool] }));
    if (connectedTools[tool]) {
      setWritePermissions(prev => ({ ...prev, [tool]: false }));
    }
    setAiResponse(null);
    setActionCards([]);
  };

  const toggleWrite = (tool) => {
    if (connectedTools[tool]) {
      setWritePermissions(prev => ({ ...prev, [tool]: !prev[tool] }));
      setAiResponse(null);
      setActionCards([]);
    }
  };

  const addActionCard = (type, content) => {
    const id = Date.now();
    setActionCards(prev => [...prev, { id, type, content }]);
  };

  const removeActionCard = (id) => {
    setActionCards(prev => prev.filter(card => card.id !== id));
  };

  const handleQuery = async () => {
    if (!userQuery.trim()) return;
    setIsLoading(true);
    setActionCards([]);

    let systemPrompt = "You are a helpful AI assistant demonstrating MCP capabilities. ";
    const queryLower = userQuery.toLowerCase();

    if (connectedTools.calendar) {
      systemPrompt += `You have READ access to the user's calendar. Here is their schedule: ${mockData.calendar} `;
      if (writePermissions.calendar) {
        systemPrompt += `You also have WRITE access to create, modify, or delete calendar events. If the user asks you to schedule something, confirm you've done it and describe what you created. `;
      }
    }
    if (connectedTools.email) {
      systemPrompt += `You have READ access to the user's email. Here are recent messages: ${mockData.email} `;
      if (writePermissions.email) {
        systemPrompt += `You also have WRITE access to send emails on behalf of the user. If the user asks you to send something, confirm you've done it and describe what you sent. `;
      }
    }
    if (connectedTools.files) {
      systemPrompt += `You have READ access to the user's files. Here are recent documents: ${mockData.files} `;
      if (writePermissions.files) {
        systemPrompt += `You also have WRITE access to create or modify files. If the user asks you to create a document, confirm you've done it. `;
      }
    }

    if (!connectedTools.calendar && !connectedTools.email && !connectedTools.files) {
      systemPrompt += "You do NOT have access to any external tools, calendars, emails, or files. If the user asks about their schedule, emails, or documents, politely explain you don't have access to that information and suggest they connect those tools.";
    }

    systemPrompt += " Keep responses concise (2-3 sentences max). Be specific about what actions you took if write access was used.";

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: systemPrompt,
          messages: [{ role: "user", content: userQuery }]
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const responseText = data.content?.[0]?.text || "Error getting response";
      setAiResponse(responseText);

      // Check for write actions and show action cards
      if (writePermissions.calendar && (queryLower.includes('schedule') || queryLower.includes('meeting') || queryLower.includes('add to calendar') || queryLower.includes('create event'))) {
        addActionCard('calendar', 'Calendar event created successfully');
      }
      if (writePermissions.email && (queryLower.includes('send') || queryLower.includes('email') || queryLower.includes('reply') || queryLower.includes('respond'))) {
        addActionCard('email', 'Email sent successfully');
      }
      if (writePermissions.files && (queryLower.includes('create') || queryLower.includes('file') || queryLower.includes('document') || queryLower.includes('save'))) {
        addActionCard('file', 'File created successfully');
      }
    } catch (error) {
      console.error(error);
      setAiResponse(error.message || "Error connecting to AI. Please ensure your API key is set in .env.local and you are running with 'vercel dev'.");
    }
    setIsLoading(false);
  };

  const runAnimation = () => {
    setIsAnimating(true);
    setAnimationStep(0);
    const steps = [1, 2, 3, 4];
    steps.forEach((step, i) => {
      setTimeout(() => {
        setAnimationStep(step);
        if (step === 4) {
          setTimeout(() => setIsAnimating(false), 2000);
        }
      }, i * 1500);
    });
  };

  const primitives = [
    { id: 'tools', label: 'Tools', icon: Zap, color: 'amber', desc: 'Actions the AI can perform — scheduling meetings, sending messages, creating files, modifying data. Tools enable the AI to affect the external world.' },
    { id: 'resources', label: 'Resources', icon: FolderOpen, color: 'emerald', desc: 'Read-only data access — documents, databases, knowledge bases, APIs. Resources provide context without granting modification rights.' },
    { id: 'sampling', label: 'Sampling', icon: Brain, color: 'purple', desc: 'Servers can request LLM completions from the client. This enables nested agent calls, where one AI can invoke another to handle subtasks without consuming the main context window.' }
  ];

  const permissionLevels = [
    {
      level: 1,
      label: 'No Access',
      description: 'AI operates solely from training data',
      pros: ['Maximum security — no external exposure', 'Predictable behavior', 'No integration overhead', 'Suitable for general Q&A'],
      cons: ['Cannot access current information', 'No personalization possible', 'Limited utility for task automation', 'User must manually transfer context'],
      useCase: 'General knowledge queries, creative writing, code explanation'
    },
    {
      level: 2,
      label: 'Read Only',
      description: 'AI can view but not modify external data',
      pros: ['Personalized responses using real data', 'Safe exploration — no accidental changes', 'Good for analysis and summarization', 'Lower risk profile for sensitive systems'],
      cons: ['Cannot complete actions autonomously', 'User must still execute tasks manually', 'Data exposure if server compromised', 'May surface sensitive information in responses'],
      useCase: 'Document analysis, email triage, calendar awareness, research assistance'
    },
    {
      level: 3,
      label: 'Read + Write',
      description: 'AI can view and modify external data',
      pros: ['Full task automation possible', 'Significant productivity gains', 'Can complete multi-step workflows', 'Reduces manual intervention'],
      cons: ['Prompt injection attacks become higher risk', 'Unintended modifications possible', 'Requires robust permission scoping', 'Audit logging essential'],
      useCase: 'Scheduling, email drafting and sending, document creation, data entry'
    },
    {
      level: 4,
      label: 'Full Autonomous',
      description: 'AI can act independently across systems',
      pros: ['Maximum automation potential', 'Can handle complex multi-system workflows', 'Enables true agent behavior', 'Scales human capability significantly'],
      cons: ['Cascading failures possible', 'Lookalike tool attacks become viable', 'Difficult to audit and control', 'Requires mature security infrastructure'],
      useCase: 'Enterprise automation, agentic workflows, cross-system orchestration'
    }
  ];

  const currentLevel = permissionLevels[permissionLevel - 1];

  return (
    <div className="bg-slate-900 text-white min-h-screen">
      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center items-center px-6 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
        <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-white via-amber-200 to-amber-500 bg-clip-text text-transparent">
          When AI Learns to Act
        </h1>
        <p className="text-xl text-slate-300 text-center max-w-2xl mb-8">
          Understanding the Model Context Protocol — the standard that defines how AI systems interact with the world.
        </p>
        <div className="flex items-center gap-2 text-amber-500 animate-bounce">
          <span className="text-sm">Scroll to explore</span>
          <ChevronDown className="w-5 h-5" />
        </div>
      </section>

      {/* Section 1: The Isolation Problem */}
      <Section dark>
        <h2 className="text-3xl font-bold mb-4">The Isolation Problem</h2>
        <p className="text-slate-300 mb-6">
          AI systems can process information, reason through problems, and generate sophisticated responses. But they have been fundamentally isolated — unable to see your calendar, read your emails, or access your files. Every request for real action hits the same wall.
        </p>

        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <div className="flex justify-start mb-4">
            <button
              onClick={runAnimation}
              disabled={isAnimating}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              {isAnimating ? 'Playing...' : 'Play'}
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 py-4">
            {/* User */}
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500/50 flex items-center justify-center mb-2 transition-all duration-500 ${animationStep >= 1 ? 'scale-110 border-blue-400' : ''}`}>
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <span className="text-slate-300 text-sm font-medium">User</span>
            </div>

            {/* Message */}
            <div className={`flex-1 max-w-xs transition-all duration-500 ${animationStep >= 1 ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
              <div className="bg-blue-500/20 border border-blue-500/50 px-4 py-3 rounded-xl">
                <p className="text-blue-200 text-sm">"Send a message to the team about tomorrow's meeting"</p>
              </div>
            </div>

            {/* AI */}
            <div className="flex flex-col items-center">
              <div className={`w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-500/50 flex items-center justify-center mb-2 transition-all duration-500 ${animationStep >= 2 ? 'scale-110 border-purple-400' : ''}`}>
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
              <span className="text-slate-300 text-sm font-medium">AI</span>
            </div>

            {/* Barrier - only visible after step 2 */}
            <div className={`flex flex-col items-center transition-all duration-500 ${animationStep >= 2 ? 'opacity-100' : 'opacity-0'}`}>
              <div className="w-1 h-16 md:w-16 md:h-1 bg-red-500 rounded-full" />
              <span className="text-red-400 text-xs mt-2">Blocked</span>
            </div>

            {/* Slack - only visible after step 2 */}
            <div className={`flex flex-col items-center transition-all duration-500 ${animationStep >= 2 ? 'opacity-50' : 'opacity-0'}`}>
              <div className="w-16 h-16 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center mb-2">
                <Mail className="w-8 h-8 text-slate-500" />
              </div>
              <span className="text-slate-500 text-sm font-medium">Slack</span>
            </div>
          </div>

          {/* Response */}
          <div className={`transition-all duration-500 mt-4 ${animationStep >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
              <p className="text-red-300">"I don't have access to Slack. You'll need to send that message yourself."</p>
            </div>
          </div>

          <div className={`transition-all duration-500 ${animationStep >= 4 ? 'opacity-100' : 'opacity-0'}`}>
            <p className="text-slate-400 text-sm text-center mt-4">
              Every integration required custom code. Every new data source meant another bespoke connector.
            </p>
          </div>
        </div>

        {/* N×M Integration Problem Diagram */}
        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-white mb-6 text-center">The Integration Problem MCP Solves</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Before MCP */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-red-400 text-sm font-semibold mb-3 text-center">Before MCP</p>
              <svg viewBox="0 0 280 180" className="w-full h-auto">
                {/* Lines from each model to each tool - the spaghetti */}
                {/* Claude to all tools */}
                <line x1="70" y1="35" x2="210" y2="25" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                <line x1="70" y1="35" x2="210" y2="65" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                <line x1="70" y1="35" x2="210" y2="105" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                <line x1="70" y1="35" x2="210" y2="145" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                {/* GPT to all tools */}
                <line x1="70" y1="90" x2="210" y2="25" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                <line x1="70" y1="90" x2="210" y2="65" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                <line x1="70" y1="90" x2="210" y2="105" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                <line x1="70" y1="90" x2="210" y2="145" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                {/* Gemini to all tools */}
                <line x1="70" y1="145" x2="210" y2="25" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                <line x1="70" y1="145" x2="210" y2="65" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                <line x1="70" y1="145" x2="210" y2="105" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />
                <line x1="70" y1="145" x2="210" y2="145" stroke="#ef4444" strokeWidth="1.5" opacity="0.6" />

                {/* AI Model nodes */}
                <rect x="5" y="20" width="65" height="30" rx="6" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1.5" />
                <text x="37" y="40" textAnchor="middle" fill="#c4b5fd" fontSize="11">Claude</text>

                <rect x="5" y="75" width="65" height="30" rx="6" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1.5" />
                <text x="37" y="95" textAnchor="middle" fill="#c4b5fd" fontSize="11">GPT</text>

                <rect x="5" y="130" width="65" height="30" rx="6" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1.5" />
                <text x="37" y="150" textAnchor="middle" fill="#c4b5fd" fontSize="11">Gemini</text>

                {/* Tool nodes */}
                <rect x="210" y="10" width="65" height="30" rx="6" fill="rgba(100,116,139,0.5)" stroke="#64748b" strokeWidth="1.5" />
                <text x="242" y="30" textAnchor="middle" fill="#cbd5e1" fontSize="11">GitHub</text>

                <rect x="210" y="50" width="65" height="30" rx="6" fill="rgba(100,116,139,0.5)" stroke="#64748b" strokeWidth="1.5" />
                <text x="242" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="11">Slack</text>

                <rect x="210" y="90" width="65" height="30" rx="6" fill="rgba(100,116,139,0.5)" stroke="#64748b" strokeWidth="1.5" />
                <text x="242" y="110" textAnchor="middle" fill="#cbd5e1" fontSize="11">Drive</text>

                <rect x="210" y="130" width="65" height="30" rx="6" fill="rgba(100,116,139,0.5)" stroke="#64748b" strokeWidth="1.5" />
                <text x="242" y="150" textAnchor="middle" fill="#cbd5e1" fontSize="11">Postgres</text>
              </svg>
              <p className="text-red-400 text-xs text-center mt-2">N × M = <strong>12 custom integrations</strong></p>
            </div>

            {/* After MCP */}
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-emerald-400 text-sm font-semibold mb-3 text-center">After MCP</p>
              <svg viewBox="0 0 280 180" className="w-full h-auto">
                {/* Lines from models to MCP */}
                <line x1="70" y1="35" x2="120" y2="90" stroke="#10b981" strokeWidth="2" opacity="0.8" />
                <line x1="70" y1="90" x2="120" y2="90" stroke="#10b981" strokeWidth="2" opacity="0.8" />
                <line x1="70" y1="145" x2="120" y2="90" stroke="#10b981" strokeWidth="2" opacity="0.8" />

                {/* Lines from MCP to tools */}
                <line x1="160" y1="90" x2="210" y2="25" stroke="#10b981" strokeWidth="2" opacity="0.8" />
                <line x1="160" y1="90" x2="210" y2="65" stroke="#10b981" strokeWidth="2" opacity="0.8" />
                <line x1="160" y1="90" x2="210" y2="105" stroke="#10b981" strokeWidth="2" opacity="0.8" />
                <line x1="160" y1="90" x2="210" y2="145" stroke="#10b981" strokeWidth="2" opacity="0.8" />

                {/* AI Model nodes */}
                <rect x="5" y="20" width="65" height="30" rx="6" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1.5" />
                <text x="37" y="40" textAnchor="middle" fill="#c4b5fd" fontSize="11">Claude</text>

                <rect x="5" y="75" width="65" height="30" rx="6" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1.5" />
                <text x="37" y="95" textAnchor="middle" fill="#c4b5fd" fontSize="11">GPT</text>

                <rect x="5" y="130" width="65" height="30" rx="6" fill="rgba(168,85,247,0.2)" stroke="#a855f7" strokeWidth="1.5" />
                <text x="37" y="150" textAnchor="middle" fill="#c4b5fd" fontSize="11">Gemini</text>

                {/* MCP Hub */}
                <rect x="120" y="65" width="40" height="50" rx="8" fill="#f59e0b" stroke="#fbbf24" strokeWidth="2" />
                <text x="140" y="95" textAnchor="middle" fill="#1e293b" fontSize="11" fontWeight="bold">MCP</text>

                {/* Tool nodes */}
                <rect x="210" y="10" width="65" height="30" rx="6" fill="rgba(100,116,139,0.5)" stroke="#64748b" strokeWidth="1.5" />
                <text x="242" y="30" textAnchor="middle" fill="#cbd5e1" fontSize="11">GitHub</text>

                <rect x="210" y="50" width="65" height="30" rx="6" fill="rgba(100,116,139,0.5)" stroke="#64748b" strokeWidth="1.5" />
                <text x="242" y="70" textAnchor="middle" fill="#cbd5e1" fontSize="11">Slack</text>

                <rect x="210" y="90" width="65" height="30" rx="6" fill="rgba(100,116,139,0.5)" stroke="#64748b" strokeWidth="1.5" />
                <text x="242" y="110" textAnchor="middle" fill="#cbd5e1" fontSize="11">Drive</text>

                <rect x="210" y="130" width="65" height="30" rx="6" fill="rgba(100,116,139,0.5)" stroke="#64748b" strokeWidth="1.5" />
                <text x="242" y="150" textAnchor="middle" fill="#cbd5e1" fontSize="11">Postgres</text>
              </svg>
              <p className="text-emerald-400 text-xs text-center mt-2">N + M = <strong>7 standard connections</strong></p>
            </div>
          </div>

          <p className="text-slate-400 text-sm text-center mt-5">
            Without a universal protocol, connecting N models to M tools requires N×M custom integrations. MCP reduces this to N+M — each new model or tool needs only one implementation to access the entire ecosystem.
          </p>
        </div>
      </Section>

      {/* Section 2: What MCP Actually Is */}
      <Section>
        <h2 className="text-3xl font-bold mb-4 text-slate-900">What MCP Actually Is</h2>
        <p className="text-slate-600 mb-4">
          The Model Context Protocol is a universal standard for connecting AI systems to external tools and data. Anthropic released it in November 2024, and it has since been adopted by OpenAI, Google DeepMind, and dozens of enterprise platforms.
        </p>

        <QuoteCardLight
          quote="MCP is just JSON streams — how you pipe these streams around infra is a small implementation detail."
          speaker="John Welsh, Anthropic"
          context="AI Engineer World's Fair 2025"
        />

        <p className="text-slate-600 mb-6">
          The protocol itself is straightforward. Its implications are profound. MCP defines three core primitives — click each to learn more:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {primitives.map(p => {
            const isOpen = openPrimitives[p.id];
            return (
              <button
                key={p.id}
                onClick={() => setOpenPrimitives(prev => ({ ...prev, [p.id]: !prev[p.id] }))}
                className={`p-6 rounded-xl transition-all duration-300 text-left border-2 group ${isOpen
                  ? `bg-${p.color}-50 border-${p.color}-500 shadow-lg scale-[1.02]`
                  : `bg-white border-slate-200 hover:border-${p.color}-400 shadow-md hover:shadow-xl hover:-translate-y-1`
                  }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${isOpen ? `bg-${p.color}-500` : `bg-slate-100 group-hover:bg-${p.color}-100`
                    }`}>
                    <p.icon className={`w-6 h-6 transition-colors duration-300 ${isOpen ? 'text-white' : `text-slate-600 group-hover:text-${p.color}-600`}`} />
                  </div>
                  <span className={`text-lg font-semibold transition-colors duration-300 ${isOpen ? `text-${p.color}-700` : `text-slate-800 group-hover:text-${p.color}-700`}`}>
                    {p.label}
                  </span>
                </div>
                {isOpen && (
                  <p className="text-slate-600 text-sm leading-relaxed animate-fadeIn">{p.desc}</p>
                )}
              </button>
            );
          })}
        </div>

        {openPrimitives.sampling && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
            <p className="text-amber-800 text-sm mb-4">
              <strong>Sampling is the primitive that enables Agent-to-Agent communication.</strong> It allows MCP servers to request LLM completions from the client, creating a powerful architecture for distributed AI reasoning.
            </p>

            {/* Sampling Flow Diagram */}
            <div className="bg-white rounded-lg p-4 mb-4">
              <p className="text-slate-600 text-xs font-semibold mb-3 text-center">How Sampling Enables Nested Agent Calls</p>
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl bg-blue-100 border-2 border-blue-400 flex items-center justify-center mb-1">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-slate-600 font-medium">User</span>
                </div>

                <div className="flex flex-col items-center">
                  <ArrowRight className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-slate-400 text-xs">query</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl bg-purple-100 border-2 border-purple-400 flex items-center justify-center mb-1">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-slate-600 font-medium">Main Agent</span>
                  <span className="text-slate-400 text-xs">(Context: 100k)</span>
                </div>

                <div className="flex flex-col items-center">
                  <ArrowRight className="w-4 h-4 text-slate-400 mb-1" />
                  <span className="text-slate-400 text-xs">calls</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl bg-amber-100 border-2 border-amber-400 flex items-center justify-center mb-1">
                    <Box className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-slate-600 font-medium">MCP Server</span>
                  <span className="text-slate-400 text-xs">(Research)</span>
                </div>

                <div className="flex flex-col items-center">
                  <ArrowRight className="w-4 h-4 text-emerald-500 mb-1" />
                  <span className="text-emerald-600 text-xs font-semibold">sampling</span>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 rounded-xl bg-emerald-100 border-2 border-emerald-400 flex items-center justify-center mb-1">
                    <Brain className="w-6 h-6 text-emerald-600" />
                  </div>
                  <span className="text-slate-600 font-medium">Sub-Agent</span>
                  <span className="text-slate-400 text-xs">(Fresh context)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-sm text-amber-900">
              <div>
                <strong className="text-amber-800">Context Window Management:</strong>
                <span className="text-amber-700"> The main agent has limited context (say, 100k tokens). Without sampling, every sub-task consumes that shared context. With sampling, the MCP server spawns a fresh agent with its own context window. The main agent only receives the final result, not the intermediate reasoning. This prevents context exhaustion on complex tasks.</span>
              </div>

              <div>
                <strong className="text-amber-800">Agent-to-Agent Architecture:</strong>
                <span className="text-amber-700"> Sampling transforms MCP from a tool-calling protocol into an agent orchestration layer. A "research server" can internally spawn multiple specialist agents — one for web search, one for summarization, one for fact-checking — coordinate their outputs, and return a unified result. The client never sees this complexity.</span>
              </div>

              <div>
                <strong className="text-amber-800">Cost and Latency Distribution:</strong>
                <span className="text-amber-700"> Inference happens where it makes sense. Quick tasks stay local; complex reasoning gets delegated. Servers can use cheaper models for routine work and escalate to powerful models only when needed. The user's tokens pay for results, not intermediate steps.</span>
              </div>

              <div>
                <strong className="text-amber-800">Recursive Capability:</strong>
                <span className="text-amber-700"> Sub-agents spawned via sampling can themselves call MCP servers, which can request their own sampling. This creates the foundation for deeply nested agent hierarchies — though with significant implications for control and auditability.</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                <Globe className="w-6 h-6 text-slate-600" />
              </div>
              <span className="text-sm text-slate-600 font-medium">Any Client</span>
            </div>
            <ArrowRight className="w-6 h-6 text-amber-500" />
            <div className="bg-amber-500 px-6 py-3 rounded-xl">
              <span className="text-white font-bold">MCP</span>
            </div>
            <ArrowRight className="w-6 h-6 text-amber-500" />
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2">
                <Box className="w-6 h-6 text-slate-600" />
              </div>
              <span className="text-sm text-slate-600 font-medium">Any Server</span>
            </div>
          </div>
          <p className="text-center text-slate-500 text-sm mt-4">
            One protocol. Universal compatibility. No custom connectors required.
          </p>
        </div>
      </Section>

      {/* Section 3: Experience It */}
      <Section dark>
        <h2 className="text-3xl font-bold mb-4">Experience It</h2>
        <p className="text-slate-300 mb-6">
          The core principle of MCP is straightforward: <strong className="text-white">context determines capability</strong>. Connect tools below, configure permissions, and ask a question. Observe how the AI's ability to help changes based on what it can access and what it can modify.
        </p>

        <div className="bg-slate-800 rounded-2xl p-6 mb-6">
          <p className="text-slate-400 text-sm mb-4">Configure tool connections and permissions:</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Calendar */}
            <div className={`p-4 rounded-xl border-2 transition-all ${connectedTools.calendar ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-700/50 border-slate-600'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className={`w-5 h-5 ${connectedTools.calendar ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className={`font-medium ${connectedTools.calendar ? 'text-emerald-300' : 'text-slate-300'}`}>Calendar</span>
                </div>
                <button
                  onClick={() => toggleTool('calendar')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${connectedTools.calendar ? 'bg-emerald-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                >
                  {connectedTools.calendar ? 'Connected' : 'Connect'}
                </button>
              </div>
              {connectedTools.calendar && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                  <span className="text-slate-400 text-xs">Write access</span>
                  <button
                    onClick={() => toggleWrite('calendar')}
                    className={`px-2 py-1 rounded text-xs transition-colors ${writePermissions.calendar ? 'bg-amber-500 text-white' : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                      }`}
                  >
                    {writePermissions.calendar ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              )}
            </div>

            {/* Email */}
            <div className={`p-4 rounded-xl border-2 transition-all ${connectedTools.email ? 'bg-blue-500/10 border-blue-500/50' : 'bg-slate-700/50 border-slate-600'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail className={`w-5 h-5 ${connectedTools.email ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className={`font-medium ${connectedTools.email ? 'text-blue-300' : 'text-slate-300'}`}>Email</span>
                </div>
                <button
                  onClick={() => toggleTool('email')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${connectedTools.email ? 'bg-blue-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                >
                  {connectedTools.email ? 'Connected' : 'Connect'}
                </button>
              </div>
              {connectedTools.email && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                  <span className="text-slate-400 text-xs">Write access</span>
                  <button
                    onClick={() => toggleWrite('email')}
                    className={`px-2 py-1 rounded text-xs transition-colors ${writePermissions.email ? 'bg-amber-500 text-white' : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                      }`}
                  >
                    {writePermissions.email ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              )}
            </div>

            {/* Files */}
            <div className={`p-4 rounded-xl border-2 transition-all ${connectedTools.files ? 'bg-purple-500/10 border-purple-500/50' : 'bg-slate-700/50 border-slate-600'
              }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FolderOpen className={`w-5 h-5 ${connectedTools.files ? 'text-purple-400' : 'text-slate-400'}`} />
                  <span className={`font-medium ${connectedTools.files ? 'text-purple-300' : 'text-slate-300'}`}>Files</span>
                </div>
                <button
                  onClick={() => toggleTool('files')}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${connectedTools.files ? 'bg-purple-500 text-white' : 'bg-slate-600 text-slate-300 hover:bg-slate-500'
                    }`}
                >
                  {connectedTools.files ? 'Connected' : 'Connect'}
                </button>
              </div>
              {connectedTools.files && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                  <span className="text-slate-400 text-xs">Write access</span>
                  <button
                    onClick={() => toggleWrite('files')}
                    className={`px-2 py-1 rounded text-xs transition-colors ${writePermissions.files ? 'bg-amber-500 text-white' : 'bg-slate-600 text-slate-400 hover:bg-slate-500'
                      }`}
                  >
                    {writePermissions.files ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3 mb-4 text-xs text-slate-400">
            <strong className="text-slate-300">Try these queries:</strong>
            <span className="ml-2">
              {!connectedTools.calendar && !connectedTools.email && !connectedTools.files && "What's on my calendar? (without connections)"}
              {connectedTools.calendar && !writePermissions.calendar && "What meetings do I have today? (read only)"}
              {connectedTools.calendar && writePermissions.calendar && "Schedule a meeting with Sarah tomorrow at 3pm (write enabled)"}
              {connectedTools.email && writePermissions.email && "Send a reply to my boss about Q4 planning (write enabled)"}
            </span>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuery()}
              placeholder="Ask about your calendar, emails, or files..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
            />
            <button
              onClick={handleQuery}
              disabled={isLoading}
              className="bg-amber-500 hover:bg-amber-600 disabled:bg-slate-600 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? '...' : 'Ask'}
            </button>
          </div>

          {/* Action Cards */}
          {actionCards.length > 0 && (
            <div className="space-y-2 mb-4">
              {actionCards.map(card => (
                <div key={card.id} className={`rounded-lg p-4 flex items-center gap-3 ${card.type === 'calendar' ? 'bg-emerald-500/20 border border-emerald-500/50' :
                  card.type === 'email' ? 'bg-blue-500/20 border border-blue-500/50' :
                    'bg-purple-500/20 border border-purple-500/50'
                  }`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.type === 'calendar' ? 'bg-emerald-500/30' :
                    card.type === 'email' ? 'bg-blue-500/30' : 'bg-purple-500/30'
                    }`}>
                    {card.type === 'calendar' && <Calendar className="w-5 h-5 text-emerald-400" />}
                    {card.type === 'email' && <Send className="w-5 h-5 text-blue-400" />}
                    {card.type === 'file' && <FileText className="w-5 h-5 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${card.type === 'calendar' ? 'text-emerald-300' :
                      card.type === 'email' ? 'text-blue-300' : 'text-purple-300'
                      }`}>Write Action Executed</p>
                    <p className="text-slate-400 text-xs mt-1">{card.content}</p>
                  </div>
                  <CheckCircle className={`w-5 h-5 ${card.type === 'calendar' ? 'text-emerald-400' :
                    card.type === 'email' ? 'text-blue-400' : 'text-purple-400'
                    }`} />
                </div>
              ))}
            </div>
          )}

          {aiResponse && (
            <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
              <p className="text-slate-200">{aiResponse}</p>
            </div>
          )}
        </div>

        <p className="text-slate-400 text-sm">
          This demonstration modifies the system prompt based on your tool connections and permission settings — the same mechanism MCP formalizes at the protocol level. The AI's capabilities change based on the context it receives.
        </p>
      </Section>

      {/* Section 4: Why It Became the Standard */}
      <Section>
        <h2 className="text-3xl font-bold mb-4 text-slate-900">Why It Became the Standard</h2>

        <QuoteCardLight
          quote="Open Source because to build integration client needs partnerships... with open source u can just take and build, allowing Models agency and letting everyone have it."
          speaker="Theodora Chu, Anthropic"
          context="AI Engineer World's Fair 2025 — on Anthropic's strategic decision"
        />

        <p className="text-slate-600 mb-4">
          Anthropic made a calculated bet: if MCP becomes the industry standard, they benefit even when competitors adopt it. The network effects of an open protocol outweigh the short-term advantages of proprietary lock-in. This strategy proved effective when competitors publicly endorsed the protocol.
        </p>

        <QuoteCardLight
          quote="People love MCP and we are excited to add support across our products."
          speaker="Sam Altman, CEO of OpenAI"
          context="March 2025 — announcing MCP support in ChatGPT desktop and Agents SDK"
        />

        <QuoteCardLight
          quote="MCP is a good protocol and it's rapidly becoming an open standard for the AI agentic era. We're excited to announce that we'll be supporting it for our Gemini models and SDK."
          speaker="Demis Hassabis, CEO of Google DeepMind"
          context="April 2025"
        />

        <p className="text-slate-600 mb-4">
          Enterprise adoption followed the AI labs. Dhanji R. Prasanna, CTO of Block (Square), offered a practitioner's perspective:
        </p>

        <QuoteCardLight
          quote="Open technologies like the Model Context Protocol are the bridges that connect AI to real-world applications, ensuring innovation is accessible, transparent, and rooted in collaboration."
          speaker="Dhanji R. Prasanna, CTO of Block"
          context="Block has deployed 60+ MCP servers in production"
        />

        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8 shadow-sm">
          <h3 className="font-semibold text-slate-900 mb-6 text-lg">Adoption Timeline</h3>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100" />
                <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
              </div>
              <div className="pb-6">
                <span className="text-amber-600 text-sm font-semibold">November 2024</span>
                <h4 className="text-lg font-semibold text-slate-900 mt-1">MCP Announced</h4>
                <p className="text-slate-600 text-sm mt-1">Anthropic releases Model Context Protocol as an open standard with SDKs for Python and TypeScript. Launch partners include Block, Zed, Replit, Codeium, and Sourcegraph. Reference server implementations provided for GitHub, Slack, Google Drive, and Postgres.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100" />
                <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
              </div>
              <div className="pb-6">
                <span className="text-amber-600 text-sm font-semibold">March 2025</span>
                <h4 className="text-lg font-semibold text-slate-900 mt-1">OpenAI Adopts MCP</h4>
                <p className="text-slate-600 text-sm mt-1">Sam Altman announces integration across ChatGPT desktop application, Agents SDK, and Responses API. First major validation that MCP is becoming an industry standard rather than an Anthropic-specific solution.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100" />
                <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
              </div>
              <div className="pb-6">
                <span className="text-amber-600 text-sm font-semibold">April 2025</span>
                <h4 className="text-lg font-semibold text-slate-900 mt-1">Google DeepMind Confirms Support; Security Research Published</h4>
                <p className="text-slate-600 text-sm mt-1">Demis Hassabis announces MCP support for Gemini models. The same month, security researchers (Simon Willison, Trail of Bits, Invariant Labs) publish analyses identifying prompt injection vulnerabilities and tool permission exploits, catalyzing security improvements.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100" />
                <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
              </div>
              <div className="pb-6">
                <span className="text-amber-600 text-sm font-semibold">June 2025</span>
                <h4 className="text-lg font-semibold text-slate-900 mt-1">Security & Authorization Overhaul</h4>
                <p className="text-slate-600 text-sm mt-1">Major specification release responding to April security research. Adds OAuth-based authorization, mandatory resource indicators for token protection, structured tool outputs, elicitation for server-initiated user interactions, and comprehensive security best practices documentation.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100" />
                <div className="w-0.5 flex-1 bg-slate-200 mt-2" />
              </div>
              <div className="pb-6">
                <span className="text-amber-600 text-sm font-semibold">September 2025</span>
                <h4 className="text-lg font-semibold text-slate-900 mt-1">MCP Registry and Governance Launch</h4>
                <p className="text-slate-600 text-sm mt-1">Centralized catalog and API for discovering MCP servers enters preview. Formal governance model established with working groups and Specification Enhancement Proposal (SEP) process. SDK tiering system introduced to help developers assess implementation quality.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 border-4 border-amber-100" />
              </div>
              <div>
                <span className="text-amber-600 text-sm font-semibold">November 2025</span>
                <h4 className="text-lg font-semibold text-slate-900 mt-1">One Year Anniversary Release</h4>
                <p className="text-slate-600 text-sm mt-1">Major specification update adding async support for long-running operations, formalized agentic loops (servers running their own agent processes), MCP Apps proposal for interactive UIs, and improved credential handling. Block reports 60+ MCP servers in production.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <p className="text-emerald-800">
            <strong>The protocol is now infrastructure.</strong> Development platforms including Replit, Zed, Codeium, and Sourcegraph have integrated MCP for AI coding assistants. What started as an Anthropic experiment is now industry-wide foundation.
          </p>
        </div>
      </Section>

      {/* Section 5: The Tradeoffs */}
      <Section dark>
        <h2 className="text-3xl font-bold mb-4">The Tradeoffs</h2>
        <p className="text-slate-300 mb-8">
          MCP solves real problems and creates new considerations. The following reflects what practitioners are actively debating in the field.
        </p>

        {/* Control - Collapsible */}
        <div className="mb-4 bg-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenTradeoffs(prev => ({ ...prev, control: !prev.control }))}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-white">The Control Question</span>
            </div>
            {openTradeoffs.control ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>
          {openTradeoffs.control && (
            <div className="px-4 pb-4">
              <QuoteCard
                quote="You have no control... you don't control the consumer or the model. You are providing context to an agent you don't know."
                speaker="Speaker at AI Engineer World's Fair"
                context="On the challenge of building MCP servers"
              />
              <p className="text-slate-300 text-sm mt-3">
                When you expose capabilities via MCP, you are handing context to an unknown agent. Your server might be called by Claude, GPT, Gemini, or a custom model with different behaviors and risk profiles. The protocol standardizes the connection — not the judgment of what uses it. This is both MCP's strength (interoperability) and its challenge (unpredictability).
              </p>
            </div>
          )}
        </div>

        {/* Tool Overload - Collapsible */}
        <div className="mb-4 bg-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenTradeoffs(prev => ({ ...prev, toolOverload: !prev.toolOverload }))}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-white">Tool Overload</span>
            </div>
            {openTradeoffs.toolOverload ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>
          {openTradeoffs.toolOverload && (
            <div className="px-4 pb-4">
              <QuoteCard
                quote="More Tools not equal to better agents — Tool overload, Domain Confusion, Trajectory Breakdown."
                speaker="AI Engineer World's Fair 2025"
                context="On why connecting everything isn't the answer"
              />
              <p className="text-slate-300 text-sm mt-3 mb-4">
                The instinct is to connect as many tools as possible. In practice, this degrades agent performance through several distinct mechanisms — and the problem is more subtle than simply running out of context space.
              </p>

              {/* Interactive Tool Count Selector */}
              <div className="bg-slate-700/50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm font-medium">Connected Tools</span>
                  <span className="text-amber-500 font-bold text-lg">{toolCount}</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={toolCount}
                  onChange={(e) => setToolCount(parseInt(e.target.value))}
                  className="w-full accent-amber-500 mb-1"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Minimal</span>
                  <span>Moderate</span>
                  <span>Excessive</span>
                </div>
              </div>

              {/* Degradation Mechanisms */}
              <div className="space-y-4">

                {/* 1. Context Window Consumption */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs text-blue-400 font-bold">1</div>
                    <span className="text-slate-200 text-sm font-medium">Context Window Competition</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    Tool definitions don't exist in isolation. They compete with your actual content — codebases in Cursor, PDFs in Claude, conversation history, and the user's query itself. A typical tool consumes 1,000–2,000 tokens; complex tools like Playwright can exceed 11,000 tokens.
                  </p>
                  <div className="bg-slate-800 rounded p-3">
                    <div className="text-xs text-slate-400 mb-2">Realistic context breakdown (200k window):</div>

                    {/* Stacked bar showing context competition */}
                    <div className="h-8 bg-slate-700 rounded-full overflow-hidden flex w-full">
                      <div
                        className="bg-purple-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0"
                        style={{ width: '15%' }}
                      >
                        System
                      </div>
                      <div
                        className="bg-blue-500 transition-all duration-300 flex items-center justify-center text-xs text-white font-medium flex-shrink-0"
                        style={{ width: `${Math.min(50, toolCount * 3)}%` }}
                      >
                        Tools ({toolCount})
                      </div>
                      <div
                        className="bg-emerald-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0"
                        style={{ width: '25%' }}
                      >
                        Resources
                      </div>
                      <div
                        className="bg-amber-500 flex items-center justify-center text-xs text-white font-medium flex-shrink-0"
                        style={{ width: '10%' }}
                      >
                        History
                      </div>
                      <div
                        className={`flex-1 flex items-center justify-center text-xs font-medium ${toolCount > 12 ? 'bg-red-500 text-white' : 'bg-slate-600 text-slate-300'
                          }`}
                      >
                        {toolCount > 16 ? '!' : 'Free'}
                      </div>
                    </div>

                    {/* Overflow warning */}
                    {toolCount > 16 && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Context overflow — tools + fixed content exceed 200k. Resources will be truncated.</span>
                      </div>
                    )}

                    {/* Legend */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span className="text-slate-400">System (~30k)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-slate-400">Tools (~{(toolCount * 1500).toLocaleString()})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-400">Your files (~50k)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                        <span className="text-slate-400">History (~20k)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${toolCount > 12 ? 'bg-red-500' : 'bg-slate-600'}`} />
                        <span className={toolCount > 12 ? 'text-red-400' : 'text-slate-400'}>Reasoning space</span>
                      </div>
                    </div>

                    <p className="text-slate-500 text-xs mt-3">
                      {toolCount <= 6
                        ? "Tool definitions are a manageable fraction of total context. Room remains for your resources and model reasoning."
                        : toolCount <= 12
                          ? "Tool overhead is significant. If you're also loading a codebase or multiple PDFs, context pressure increases. Consider which tools are actually needed for this task."
                          : "Tool definitions now dominate context allocation. In resource-heavy workflows (Cursor with large codebases, Claude with multiple documents), this forces hard tradeoffs — either fewer tools or truncated resources."
                      }
                    </p>
                  </div>
                </div>

                {/* 2. Lost in the Middle */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-xs text-purple-400 font-bold">2</div>
                    <span className="text-slate-200 text-sm font-medium">"Lost in the Middle" Problem</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    Research shows LLMs struggle to retrieve information placed in the middle of long prompts, even with large context windows. More tools mean more definitions to scan, and relevant tools get "buried."
                  </p>
                  <div className="bg-slate-800 rounded p-3">
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(Math.min(toolCount, 20))].map((_, i) => {
                        const isStart = i < 2;
                        const isEnd = i >= Math.min(toolCount, 20) - 2;
                        const isMiddle = !isStart && !isEnd;
                        return (
                          <div
                            key={i}
                            className={`flex-1 h-8 rounded transition-all duration-300 flex items-center justify-center text-xs ${isStart ? 'bg-emerald-500/40 text-emerald-300' :
                              isEnd ? 'bg-emerald-500/40 text-emerald-300' :
                                'bg-red-500/20 text-red-300/60'
                              }`}
                            title={isMiddle ? 'Lower attention' : 'Higher attention'}
                          >
                            {toolCount <= 10 && `T${i + 1}`}
                          </div>
                        );
                      })}
                      {toolCount > 20 && (
                        <div className="h-8 px-2 rounded bg-slate-700 flex items-center justify-center text-xs text-slate-400">
                          +{toolCount - 20}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="text-emerald-400">↑ High attention</span>
                      <span className="text-red-400/60">↓ Low attention (middle)</span>
                      <span className="text-emerald-400">↑ High attention</span>
                    </div>
                    <p className="text-slate-500 text-xs mt-2">
                      {toolCount <= 5
                        ? "With few tools, the model can attend to all definitions effectively."
                        : toolCount <= 12
                          ? "Tools in the middle of the list receive less attention. The model may overlook the right tool even when it's available."
                          : "Significant attention degradation. Tools in positions 3–" + (toolCount - 2) + " are at high risk of being overlooked, causing incorrect tool selection."
                      }
                    </p>
                  </div>
                </div>

                {/* 3. Selection Complexity / Paralysis */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center text-xs text-amber-400 font-bold">3</div>
                    <span className="text-slate-200 text-sm font-medium">Selection Complexity & Context Rot</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    More options create cognitive overhead. The model may struggle to distinguish similar tools, hesitate between options, or confidently select the wrong tool. This compounds with "context rot" — degraded focus as context grows.
                  </p>
                  <div className="bg-slate-800 rounded p-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Hallucination Risk</div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${toolCount <= 5 ? 'bg-emerald-500' : toolCount <= 12 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${Math.min(95, 15 + toolCount * 3.5)}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {toolCount <= 5 ? 'Low' : toolCount <= 12 ? 'Moderate' : 'High'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-400 mb-1">Decision Latency</div>
                        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${toolCount <= 5 ? 'bg-emerald-500' : toolCount <= 12 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                            style={{ width: `${Math.min(95, 20 + toolCount * 3)}%` }}
                          />
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          {toolCount <= 5 ? 'Fast' : toolCount <= 12 ? 'Slower' : 'Significant delay'}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-500 text-xs mt-3">
                      {toolCount <= 5
                        ? "Clear distinctions between tools. Model can select confidently with low error rate."
                        : toolCount <= 12
                          ? "Increased chance of misinterpretation. Model may call similar-sounding tools incorrectly or hesitate."
                          : "High risk of 'paralysis by analysis.' Model may invent answers rather than correctly navigate tool options."
                      }
                    </p>
                  </div>
                </div>

                {/* 4. Compounding Errors in Multi-Step Tasks */}
                <div className="bg-slate-900 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 font-bold">4</div>
                    <span className="text-slate-200 text-sm font-medium">Multi-Step Task Breakdown</span>
                  </div>
                  <p className="text-slate-400 text-xs mb-3">
                    Complex tasks require multiple tool calls in sequence. Selection errors compound — even 90% per-step accuracy yields only 59% success over 5 steps.
                  </p>
                  <div className="bg-slate-800 rounded p-3">
                    <div className="text-xs text-slate-400 mb-2">Cumulative success rate across 5 steps:</div>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((step) => {
                        const perStepAccuracy = Math.max(65, 98 - (toolCount - 2) * 1.5) / 100;
                        const cumulativeSuccess = Math.pow(perStepAccuracy, step) * 100;
                        return (
                          <div key={step} className="flex-1 flex flex-col items-center">
                            <div className="w-full h-16 bg-slate-700/50 rounded flex items-end justify-center p-1">
                              <div
                                className={`w-full rounded transition-all duration-300 ${cumulativeSuccess > 80 ? 'bg-emerald-500' :
                                  cumulativeSuccess > 50 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                style={{ height: `${cumulativeSuccess}%` }}
                              />
                            </div>
                            <span className="text-xs text-slate-500 mt-1">Step {step}</span>
                            <span className={`text-xs font-mono ${cumulativeSuccess > 80 ? 'text-emerald-400' :
                              cumulativeSuccess > 50 ? 'text-amber-400' : 'text-red-400'
                              }`}>
                              {Math.round(cumulativeSuccess)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Solutions */}
              <div className="bg-slate-700/30 rounded-lg p-4 mt-4">
                <p className="text-slate-300 text-sm font-medium mb-2">Mitigation Strategies</p>
                <div className="text-slate-400 text-sm space-y-1">
                  <p><strong className="text-slate-300">Dynamic Tool Selection (Tool RAG):</strong> Retrieve only relevant tools per query rather than loading all.</p>
                  <p><strong className="text-slate-300">Multi-Agent Architecture:</strong> Use specialized sub-agents with narrow tool sets instead of one "super agent."</p>
                  <p><strong className="text-slate-300">Context Curation:</strong> Be ruthless — expose only essential tools for each specific task domain.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Evolution - Collapsible */}
        <div className="mb-8 bg-slate-800 rounded-xl overflow-hidden">
          <button
            onClick={() => setOpenTradeoffs(prev => ({ ...prev, security: !prev.security }))}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-700/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-500" />
              <span className="font-semibold text-white">Security: An Evolving Landscape</span>
            </div>
            {openTradeoffs.security ? <ChevronDown className="w-5 h-5 text-slate-400" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </button>
          {openTradeoffs.security && (
            <div className="px-4 pb-4">
              <QuoteCard
                quote="Don't worry about the security as much, there are more important things."
                speaker="Speaker at AI Engineer World's Fair"
                context="June 2025"
              />
              <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 mt-4">
                <p className="text-slate-300 text-sm mb-3">
                  <strong>Six months later, independent security researchers responded:</strong>
                </p>

                <QuoteCard
                  quote="Pay special attention to this part of the MCP specification: 'there SHOULD always be a human in the loop with the ability to deny tool invocations.' I suggest treating those SHOULDs as if they were MUSTs."
                  speaker="Simon Willison, Django co-creator and independent researcher"
                  context="April 2025 security analysis"
                />

                <p className="text-slate-400 text-sm my-3">
                  Security firm Trail of Bits identified "line jumping" attacks where MCP servers can manipulate model behavior without ever being invoked, comparing it to "a security system that activates only after intruders have gained access."
                </p>

                <p className="text-slate-400 text-sm mb-3">
                  Alessio Dalla Piazza, CTO of Equixly and former discoverer of zero-days in Skype and VMware, conducted systematic scanning and found <strong className="text-amber-400">43% of MCP server implementations contained command injection vulnerabilities</strong>.
                </p>

                <p className="text-slate-400 text-sm">
                  In response, the June 2025 spec update added comprehensive OAuth-based authorization, mandatory resource indicators for token protection, and dedicated security best practices documentation. The November 2025 release continued this focus with improved credential handling and audit capabilities. Security is now a first-class concern in the protocol's evolution.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Permission Level Comparison */}
        <div className="bg-slate-800 rounded-xl p-6">
          <h4 className="font-semibold mb-2 text-white">Permission Level Comparison</h4>
          <p className="text-slate-400 text-sm mb-4">Use the slider to explore the tradeoffs at each permission level.</p>

          <div className="flex items-center gap-4 mb-6">
            <span className="text-slate-400 text-sm">Restricted</span>
            <input
              type="range"
              min="1"
              max="4"
              value={permissionLevel}
              onChange={(e) => setPermissionLevel(parseInt(e.target.value))}
              className="flex-1 accent-amber-500"
            />
            <span className="text-slate-400 text-sm">Autonomous</span>
          </div>

          <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-amber-500 font-semibold text-lg">{currentLevel.label}</span>
              <span className="text-slate-400 text-sm">Level {currentLevel.level} of 4</span>
            </div>
            <p className="text-slate-300 text-sm">{currentLevel.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4">
              <p className="text-emerald-400 text-sm font-semibold mb-2">Advantages</p>
              <ul className="space-y-1">
                {currentLevel.pros.map((pro, i) => (
                  <li key={i} className="text-emerald-200 text-sm flex items-start gap-2">
                    <span className="text-emerald-400 mt-1">•</span>
                    {pro}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <p className="text-amber-400 text-sm font-semibold mb-2">Considerations</p>
              <ul className="space-y-1">
                {currentLevel.cons.map((con, i) => (
                  <li key={i} className="text-amber-200 text-sm flex items-start gap-2">
                    <span className="text-amber-400 mt-1">•</span>
                    {con}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-700/50 rounded-lg p-3">
            <p className="text-slate-400 text-xs">
              <strong className="text-slate-300">Typical use case:</strong> {currentLevel.useCase}
            </p>
          </div>
        </div>
      </Section>

      {/* Section 6: Where This Goes */}
      <Section>
        <h2 className="text-3xl font-bold mb-4 text-slate-900">Where This Goes</h2>
        <p className="text-slate-600 mb-8">
          MCP is one year old and already being used in ways its designers did not fully anticipate. The following capabilities are emerging from the latest specification updates and community development.
        </p>

        <ExpandableCard title="Agentic Loops" icon={Brain} defaultOpen>
          <QuoteCardLight
            quote="Doing the inference inside the tool, so you don't limit context window of main agent."
            speaker="AI Engineer World's Fair 2025"
            context="On why sampling enables new architectures"
          />
          <p className="mt-3 text-slate-600">
            The November 2025 specification formalized what practitioners were already building: servers can run their own agent loops using the client's tokens (under user control). A research server can spawn multiple agents internally, coordinate their work, and deliver a coherent result using standard MCP primitives — no custom orchestration required.
          </p>
        </ExpandableCard>

        <ExpandableCard title="Async Operations" icon={Clock}>
          <p className="text-slate-600">
            MCP was originally built around synchronous operations — call a tool, wait for the result. The latest specification adds async support: servers can initiate long-running tasks while clients check back for results. This enables workflows that take minutes or hours rather than seconds, opening possibilities for complex research, data processing, and multi-step automation.
          </p>
        </ExpandableCard>

        <ExpandableCard title="MCP Apps (Interactive UIs)" icon={Globe}>
          <p className="text-slate-600">
            The newest proposal (SEP-1865) standardizes support for interactive user interfaces delivered by MCP servers. This enables secure credential collection (API keys and passwords never transit through the client), external OAuth flows without token passthrough, and PCI-compliant payment processing. The server sends a URL; the client provides the interface; credentials flow directly to the server.
          </p>
        </ExpandableCard>

        <ExpandableCard title="Enterprise Infrastructure" icon={Box}>
          <p className="text-slate-600">
            The MCP Registry provides a centralized catalog for server discovery, supporting both public and private sub-registries for enterprise customization. Formal governance structures have emerged, with working groups driving specification improvements. SDK tiering helps developers assess implementation quality. This is no longer an experiment — organizations are building production infrastructure on MCP.
          </p>
        </ExpandableCard>

        <ExpandableCard title="Open Questions" icon={AlertTriangle}>
          <p className="text-slate-600 mb-3">
            Not everyone is convinced MCP has crossed the finish line. Victor Dibia, Microsoft researcher and AutoGen contributor, offers a measured assessment:
          </p>
          <QuoteCardLight
            quote="The protocol shows promise, but requires significant improvement in developer experience, security, and usability before it can become the standardized 'USB-C for AI' that it aspires to be."
            speaker="Victor Dibia, Microsoft Research"
            context="'No, MCP's have NOT won (Yet)'"
          />
          <p className="text-slate-600 mt-3">
            Questions remain about governance (Anthropic-driven rather than standards-body-backed), scalability of stateful connections, and whether the security model can mature fast enough to match adoption. The protocol is evolving rapidly, but so are the demands placed on it.
          </p>
        </ExpandableCard>
      </Section>

      {/* Section 7: Closing */}
      <Section dark className="min-h-0 py-24">
        <div className="text-center">
          <p className="text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
            The question is no longer whether AI will gain agency over external tools — that transition is underway. The question is who architects the boundaries, and how those boundaries evolve as capabilities expand.
          </p>

          <QuoteCard
            quote="Build Something — You, too, can have opinions."
            speaker="AI Engineer World's Fair 2025"
            context="Closing advice to developers entering the space"
          />

          <div className="mt-8">
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-medium px-6 py-3 rounded-lg transition-colors"
            >
              Explore MCP Documentation
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          <p className="text-slate-500 text-sm mt-12">
            Built for Northeastern University · Sources: AI Engineer World's Fair 2025, MCP Official Documentation, OpenAI, Google DeepMind, Block, Simon Willison, Trail of Bits, Equixly, Victor Dibia (Microsoft Research)
          </p>
        </div>
      </Section>
    </div>
  );
}
