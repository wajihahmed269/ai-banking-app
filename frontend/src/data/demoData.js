const profileImage = '/assets/profile/wajih-profile.png';

const techStack = [
  { name: 'Spring Boot', icon: 'leaf' },
  { name: 'React', icon: 'atom' },
  { name: 'MySQL', icon: 'database' },
  { name: 'JWT', icon: 'shield' },
  { name: 'Docker', icon: 'box' },
  { name: 'Kubernetes', icon: 'wheel' },
  { name: 'AWS', icon: 'cloud' },
  { name: 'Terraform', icon: 'blocks' },
];

const transactions = [
  { name: 'Salary', amount: 2450, date: 'Yesterday', type: 'income' },
  { name: 'Amazon', amount: -128.5, date: 'Today', type: 'spending' },
  { name: 'Netflix', amount: -15.99, date: 'May 7', type: 'spending' },
  { name: 'Spotify', amount: -9.99, date: 'May 6', type: 'spending' },
  { name: 'Transfer to Alex', amount: -200, date: 'May 5', type: 'transfers' },
  { name: 'Deposit', amount: 500, date: 'May 4', type: 'income' },
  { name: 'AWS Cloud Bill', amount: -42.18, date: 'May 3', type: 'spending' },
  { name: 'Azure Cloud Bill', amount: -31.4, date: 'May 3', type: 'spending' },
  { name: 'Coinbase Transfer', amount: -150, date: 'May 2', type: 'transfers' },
  { name: 'Dividend Credit', amount: 18.22, date: 'May 1', type: 'income' },
];

const fundingSources = [
  ['Bank Account', 'Standard ACH transfer', 'database'],
  ['Debit Card', 'Instant card top-up', 'bill'],
  ['PayPal', 'Add from PayPal balance', 'plus'],
  ['Cash App', 'Link Cash App transfer', 'send'],
  ['Venmo', 'Social wallet transfer', 'more'],
  ['Zelle', 'Bank-to-bank transfer', 'history'],
];

const billers = [
  ['Spotify', 'Subscriptions', '$9.99', 'bill'],
  ['Netflix', 'Subscriptions', '$15.99', 'bill'],
  ['Apple', 'Subscriptions', '$6.99', 'bill'],
  ['Amazon', 'Shopping', '$128.50', 'box'],
  ['AWS', 'Cloud', '$42.18', 'cloud'],
  ['Azure', 'Cloud', '$31.40', 'cloud'],
  ['Google Cloud', 'Cloud', '$22.75', 'cloud'],
  ['Coinbase', 'Crypto', 'Crypto transfer', 'shield'],
  ['Binance', 'Crypto', 'Crypto transfer', 'shield'],
  ['Crypto Wallet', 'Crypto', 'Wallet transfer', 'shield'],
  ['Electricity', 'Utilities', '$86.20', 'bill'],
  ['Internet', 'Utilities', '$49.99', 'cloud'],
  ['Mobile', 'Utilities', '$18.00', 'send'],
];

const watchlist = [
  ['AAPL', '+1.2%'],
  ['TSLA', '-0.8%'],
  ['NVDA', '+3.4%'],
  ['BTC', '+2.1%'],
  ['ETH', '+1.6%'],
];

const dashboardNav = [
  { label: 'Home', view: 'dashboard' },
  { label: 'Transfer', view: 'transfer' },
  { label: 'Cards', view: 'dashboard' },
  { label: 'Analytics', view: 'analytics' },
  { label: 'More', view: 'profile' },
];

const toolGroups = [
  {
    category: 'Frontend',
    description: 'The local UI sandbox and premium landing experience.',
    tools: ['React', 'Vite', 'CSS', 'React Bits'],
  },
  {
    category: 'Backend',
    description: 'Core banking services, data, and authentication contracts.',
    tools: ['Spring Boot', 'Java', 'MySQL', 'JWT'],
  },
  {
    category: 'DevOps / Platform',
    description: 'Deployment, automation, and GitOps operating model.',
    tools: ['Docker', 'Kubernetes', 'K3s', 'Argo CD', 'Terraform', 'Ansible', 'GitHub Actions'],
  },
  {
    category: 'Observability',
    description: 'Signals for health, logs, alerting, and remediation triggers.',
    tools: ['Prometheus', 'Grafana', 'Loki', 'Alertmanager'],
  },
  {
    category: 'AI / Automation',
    description: 'Prototype intelligence layer and self-healing workflows.',
    tools: ['Ollama', 'Remediation Webhook', 'Bash Automation', 'Self-Healing Scripts'],
  },
  {
    category: 'Cloud / Security',
    description: 'Cloud infrastructure, secrets, scanning, and code quality.',
    tools: ['AWS', 'Vault', 'Trivy', 'Checkstyle'],
  },
  {
    category: 'Design System',
    description: 'The visual system shaping the Zephyr interface.',
    tools: ['Prism', 'Grid Scan', 'Glassmorphism', 'Premium Dark UI'],
  },
];

const chromaToolItems = toolGroups.map((group) => {
  const accents = {
    Frontend: ['FE', 'blue / cyan', 'rgba(34, 211, 238, 0.34)', 'linear-gradient(145deg, rgba(37, 99, 235, 0.18), rgba(6, 182, 212, 0.08), rgba(2, 2, 3, 0.82))'],
    Backend: ['BE', 'green / blue', 'rgba(34, 197, 94, 0.32)', 'linear-gradient(145deg, rgba(34, 197, 94, 0.15), rgba(37, 99, 235, 0.08), rgba(2, 2, 3, 0.84))'],
    'DevOps / Platform': ['OPS', 'purple / blue', 'rgba(139, 92, 246, 0.34)', 'linear-gradient(145deg, rgba(139, 92, 246, 0.17), rgba(37, 99, 235, 0.08), rgba(2, 2, 3, 0.84))'],
    Observability: ['OBS', 'orange / purple', 'rgba(251, 146, 60, 0.32)', 'linear-gradient(145deg, rgba(251, 146, 60, 0.15), rgba(139, 92, 246, 0.08), rgba(2, 2, 3, 0.84))'],
    'AI / Automation': ['AI', 'violet / cyan', 'rgba(168, 85, 247, 0.34)', 'linear-gradient(145deg, rgba(168, 85, 247, 0.16), rgba(34, 211, 238, 0.08), rgba(2, 2, 3, 0.84))'],
    'Cloud / Security': ['SEC', 'amber / blue', 'rgba(245, 158, 11, 0.32)', 'linear-gradient(145deg, rgba(245, 158, 11, 0.14), rgba(59, 130, 246, 0.08), rgba(2, 2, 3, 0.84))'],
    'Design System': ['DS', 'pink / violet', 'rgba(236, 72, 153, 0.3)', 'linear-gradient(145deg, rgba(236, 72, 153, 0.14), rgba(139, 92, 246, 0.1), rgba(2, 2, 3, 0.84))'],
  };
  const [marker, accent, borderColor, gradient] = accents[group.category];
  return { title: group.category, description: group.description, tools: group.tools, marker, accent, borderColor, gradient };
});

const profileSettings = [
  { label: 'Access', title: 'Security', description: 'MFA, JWT sessions, and secure banking flows.', icon: 'S' },
  { label: 'Signals', title: 'Notifications', description: 'Alerts for transactions, remediation, and account activity.', icon: 'N' },
  { label: 'Display', title: 'Theme', description: 'Premium dark interface with future light mode support.', icon: 'T' },
  { label: 'Platform', title: 'Connected Cloud', description: 'AWS, Kubernetes, and GitOps infrastructure.', icon: 'C' },
  { label: 'Assistant', title: 'AI Assistant', description: 'Zephyr assistant for account and platform intelligence.', icon: 'AI' },
  { label: 'Prototype', title: 'Developer Mode', description: 'Prototype controls for testing dashboard flows.', icon: 'D' },
];

const notifications = [
  { title: 'Banking app is healthy', description: 'Self-healing checks passed 2 min ago', status: 'success' },
  { title: 'Balance card interaction', description: 'Prototype reveal state is ready', status: 'info' },
  { title: 'Alertmanager connected', description: 'Remediation webhook is listening', status: 'warning' },
  { title: 'AWS/K3s environment', description: 'Cluster telemetry is being monitored', status: 'info' },
];

const initialBalance = 24580.9;
const TOAST_TIMEOUT = 3600;
const PERFORMANCE_MODE_KEY = 'zephyrPerformanceMode';
const LITE_SUGGESTION_KEY = 'zephyrLiteSuggestionDismissed';
const PERFORMANCE_MODES = ['auto', 'full', 'lite'];
const defaultAiMessages = [{ role: 'assistant', text: 'Sign in to ask Zephyr about your live account activity.' }];
const welcomeAiMessages = [{ role: 'assistant', text: 'Welcome back. I can now review your live Zephyr account activity.' }];
const initialNotificationItems = notifications.map((notification, index) => ({
  ...notification,
  id: `notification-${index + 1}`,
  read: index > 0,
}));

export {
  profileImage,
  techStack,
  transactions,
  fundingSources,
  billers,
  watchlist,
  dashboardNav,
  toolGroups,
  chromaToolItems,
  profileSettings,
  notifications,
  initialBalance,
  defaultAiMessages,
  welcomeAiMessages,
  initialNotificationItems,
  TOAST_TIMEOUT,
  PERFORMANCE_MODE_KEY,
  LITE_SUGGESTION_KEY,
  PERFORMANCE_MODES,
};
