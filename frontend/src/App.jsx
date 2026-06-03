import { lazy, memo, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { clearSession, getCurrentUser } from './auth/session';
import * as bankingApi from './api/bankingApi';
import * as aiApi from './api/aiApi';
import { DEMO_MODE } from './config';
import { profileImage, techStack, transactions, fundingSources, billers, watchlist, chromaToolItems, profileSettings, initialBalance, defaultAiMessages, welcomeAiMessages, initialNotificationItems } from './data/demoData';
import { usePerformanceMode } from './hooks/usePerformanceMode';
import { useToasts } from './hooks/useToasts';
import { useAccountData } from './hooks/useAccountData';
import { MiniIcon } from './components/ui/MiniIcon';
import { SectionErrorBoundary } from './components/ui/SectionErrorBoundary';
import { LiteModeSuggestionModal, PremiumSkeleton, DashboardSkeleton, TransactionsSkeleton, ProfileSkeleton, AssistantBubbleSkeleton, PrismFallback, AboutProfileFallback, ChromaGridFallback, ProfileViewFallback } from './components/ui/Skeletons';
import { ToastViewport } from './components/ui/ToastViewport';
import { EmptyState } from './components/ui/EmptyState';
import { AuthModal } from './components/auth/AuthModal';
import { Brand, TechIcon } from './components/layout/Brand';
import { DashboardNav } from './components/layout/DashboardNav';
import { NotificationPanel } from './components/dashboard/NotificationPanel';
import { BalanceCard } from './components/dashboard/BalanceCard';
import { QuickActions } from './components/dashboard/QuickActions';
import { RecentTransactions } from './components/dashboard/RecentTransactions';
import { TransferView, TransactionsView } from './components/banking/TransferView';
import { ReceiptModal } from './components/banking/ReceiptModal';
import { formatUSD, parseMoneyValue } from './utils/money';
import { buildReceipt, createPrototypeTransaction, getSessionUsername } from './utils/transactions';
import { prefetchAboutChunks, prefetchDashboardChunks } from './utils/prefetch';

const Prism = lazy(() => import('./components/backgrounds/Prism'));
const GridScan = lazy(() => import('./components/backgrounds/GridScan').then((module) => ({ default: module.GridScan })));
const ChromaGrid = lazy(() => import('./components/cards/ChromaGrid'));
const MagicBento = lazy(() => import('./components/cards/MagicBento'));
const ProfileCard = lazy(() => import('./components/cards/ProfileCard'));
const ReflectiveCard = lazy(() => import('./components/cards/ReflectiveCard'));

export default function App() {
  const [view, setView] = useState('landing');
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [showBalance, setShowBalance] = useState(false);
  const [currentUser, setCurrentUserState] = useState(() => getCurrentUser());
  const [transactionSearch, setTransactionSearch] = useState('');
  const [debouncedTransactionSearch, setDebouncedTransactionSearch] = useState('');
  const [transactionFilter, setTransactionFilter] = useState('all');
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '', note: '' });
  const [transferError, setTransferError] = useState('');
  const [transferSuccess, setTransferSuccess] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiMessages, setAiMessages] = useState(defaultAiMessages);
  const [aiLoading, setAiLoading] = useState(false);
  const [quickPanel, setQuickPanel] = useState(null);
  const [selectedFundingSource, setSelectedFundingSource] = useState('');
  const [fundingMessage, setFundingMessage] = useState('');
  const [billCategory, setBillCategory] = useState('All');
  const [selectedBiller, setSelectedBiller] = useState('');
  const [billMessage, setBillMessage] = useState('');
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [paymentConfirmOpen, setPaymentConfirmOpen] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [notificationItems, setNotificationItems] = useState(initialNotificationItems);
  const [addMoneyStep, setAddMoneyStep] = useState('source');
  const [addMoneyAmount, setAddMoneyAmount] = useState('');
  const [addMoneyNote, setAddMoneyNote] = useState('');
  const [addMoneyError, setAddMoneyError] = useState('');
  const performance = usePerformanceMode();
  const {
    balance,
    setBalance,
    recentTransactions,
    setRecentTransactions,
    balanceLoading,
    transactionsLoading,
    balanceError,
    transactionsError,
    usingFallbackData,
    refreshAccountData,
    resetAccountData,
  } = useAccountData(currentUser);

  const { toasts, addToast, removeToast } = useToasts();

  const updatePerformanceMode = useCallback((nextMode) => {
    performance.setPerformanceMode(nextMode);
    addToast({ type: 'success', title: 'Performance mode updated' });
  }, [addToast, performance]);

  const switchToLiteMode = useCallback(() => {
    performance.setPerformanceMode('lite');
    performance.dismissLiteSuggestion();
    addToast({ type: 'success', title: 'Performance mode updated' });
  }, [addToast, performance]);

  const copyReceiptReference = useCallback(async (reference) => {
    try {
      await navigator.clipboard.writeText(reference);
      addToast({ type: 'success', title: 'Reference copied', message: reference });
    } catch {
      addToast({ type: 'error', title: 'Copy failed', message: 'Clipboard access was not available.' });
    }
  }, [addToast]);

  const openAuth = useCallback((mode = 'signin') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  }, []);
  const closeAuth = useCallback(() => setIsAuthOpen(false), []);
  const enterDashboard = useCallback((user = currentUser) => {
    closeAuth();
    if (user) {
      setCurrentUserState(user);
      setAiMessages(welcomeAiMessages);
    }
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [closeAuth, currentUser]);
  const goLanding = useCallback(() => {
    clearSession();
    setCurrentUserState(null);
    setView('landing');
    setIsAuthOpen(false);
    setNotificationOpen(false);
    resetAccountData();
    setAiMessages(defaultAiMessages);
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0);
  }, [resetAccountData]);

  const resetAddMoneyFlow = useCallback(() => {
    setSelectedFundingSource('');
    setFundingMessage('');
    setAddMoneyStep('source');
    setAddMoneyAmount('');
    setAddMoneyNote('');
    setAddMoneyError('');
  }, []);

  const openQuickPanel = useCallback((panel) => {
    if (panel === 'addMoney') resetAddMoneyFlow();
    if (panel === 'payBills') {
      setSelectedBiller('');
      setBillCategory('All');
      setBillMessage('');
      setPaymentConfirmOpen(false);
    }
    setQuickPanel(panel);
  }, [resetAddMoneyFlow]);

  const closeQuickPanel = useCallback(() => {
    setQuickPanel(null);
    setPaymentConfirmOpen(false);
    resetAddMoneyFlow();
  }, [resetAddMoneyFlow]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedTransactionSearch(transactionSearch), 300);
    return () => window.clearTimeout(timer);
  }, [transactionSearch]);

  const filteredTransactions = useMemo(() => {
    const query = debouncedTransactionSearch.trim().toLowerCase();
    return recentTransactions.filter((transaction) => {
      const matchesSearch = transaction.name.toLowerCase().includes(query);
      const matchesFilter = transactionFilter === 'all' || transaction.type === transactionFilter;
      return matchesSearch && matchesFilter;
    });
  }, [debouncedTransactionSearch, recentTransactions, transactionFilter]);

  useEffect(() => {
    if (view === 'landing' || !currentUser) return undefined;
    const timer = window.setTimeout(() => refreshAccountData(), 0);
    return () => window.clearTimeout(timer);
  }, [currentUser, refreshAccountData, view]);

  useEffect(() => {
    if (view === 'landing') return;
    prefetchDashboardChunks();
  }, [view]);

  const sendAiMessage = useCallback(async (event) => {
    event.preventDefault();
    const text = aiInput.trim();
    if (!text || aiLoading) return;

    const username = getSessionUsername(currentUser);
    if (!username) {
      setAiMessages((current) => [...current, { role: 'user', text }, { role: 'assistant', text: 'Sign in before using the live AI assistant.', error: true }]);
      setAiInput('');
      return;
    }

    setAiMessages((current) => [...current, { role: 'user', text }]);
    setAiInput('');
    setAiLoading(true);

    try {
      const response = await aiApi.chat(username, text);
      setAiMessages((current) => [...current, { role: 'assistant', text: response }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'AI service is currently unavailable. Please try again later.';
      setAiMessages((current) => [...current, { role: 'assistant', text: message, error: true }]);
      addToast({ type: 'error', title: 'AI assistant failed', message });
    } finally {
      setAiLoading(false);
    }
  }, [addToast, aiInput, aiLoading, currentUser]);

  const submitTransfer = useCallback(async (event) => {
    event.preventDefault();
    const username = getSessionUsername(currentUser);
    const amount = parseMoneyValue(transferForm.amount);
    const recipient = transferForm.recipient.trim();
    const note = transferForm.note.trim();

    if (!username) {
      setTransferError('Sign in before sending money.');
      setTransferSuccess('');
      return;
    }
    if (!recipient) {
      setTransferError('Recipient is required.');
      setTransferSuccess('');
      return;
    }
    if (amount === null || amount <= 0) {
      setTransferError('Amount must be a positive number.');
      setTransferSuccess('');
      return;
    }
    if (amount > balance) {
      setTransferError('Insufficient balance for this transfer.');
      setTransferSuccess('');
      return;
    }

    setTransferError('');
    setTransferSuccess('');
    setTransferLoading(true);
    if (!DEMO_MODE) {
      try {
        const transaction = await bankingApi.transfer(recipient, amount, note);
        const nextReceipt = buildReceipt({ transaction, type: 'Transfer', amount, recipient, note });
        setReceipt(nextReceipt);
        setTransferSuccess(`Transfer successful. Reference ${nextReceipt.reference}`);
        addToast({ type: 'success', title: 'Transfer completed', message: `${formatUSD(amount)} sent to ${recipient}.` });
        setTransferForm({ recipient: '', amount: '', note: '' });
        await refreshAccountData();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Transfer failed.';
        setTransferError(message);
        addToast({ type: 'error', title: 'Transfer failed', message });
      } finally {
        setTransferLoading(false);
      }
      return;
    }
    window.setTimeout(() => {
      const transaction = createPrototypeTransaction({
        name: `Transfer to ${recipient}`,
        amount: -amount,
        type: 'transfers',
        recipient,
        note,
      });
      setBalance((current) => current - amount);
      setRecentTransactions((current) => [transaction, ...current]);
      const nextReceipt = buildReceipt({ transaction, type: 'Transfer', amount, recipient, note });
      setReceipt(nextReceipt);
      setTransferSuccess(`Transfer successful. Reference ${nextReceipt.reference}`);
      addToast({ type: 'success', title: 'Transfer completed', message: `${formatUSD(amount)} sent to ${recipient}.` });
      setTransferForm({ recipient: '', amount: '', note: '' });
      setTransferLoading(false);
    }, 160);
  }, [addToast, balance, currentUser, refreshAccountData, setTransferForm, transferForm.amount, transferForm.note, transferForm.recipient]);

  const resetDemoView = useCallback(() => {
    setAiMessages(currentUser ? welcomeAiMessages : defaultAiMessages);
    setNotificationItems(initialNotificationItems);
    setTransactionSearch('');
    setDebouncedTransactionSearch('');
    setTransactionFilter('all');
    setReceipt(null);
    setQuickPanel(null);
    setPaymentConfirmOpen(false);
    setTransferError('');
    setTransferSuccess('');
    setBillMessage('');
    resetAddMoneyFlow();
    if (currentUser) refreshAccountData();
    addToast({ type: 'info', title: 'Demo view reset', message: 'Presentation-only UI state was restored.' });
  }, [addToast, currentUser, refreshAccountData, resetAddMoneyFlow]);

  const markAllNotificationsRead = useCallback(() => {
    setNotificationItems((current) => current.map((item) => ({ ...item, read: true })));
    addToast({ type: 'success', title: 'Notifications updated', message: 'All notifications marked as read.' });
  }, [addToast]);

  const clearReadNotifications = useCallback(() => {
    setNotificationItems((current) => current.filter((item) => !item.read));
    addToast({ type: 'info', title: 'Notifications cleared', message: 'Read notifications were removed.' });
  }, [addToast]);

  const toggleNotificationRead = useCallback((id) => {
    setNotificationItems((current) => current.map((item) => (item.id === id ? { ...item, read: !item.read } : item)));
    addToast({ type: 'info', title: 'Notification updated', message: 'Read state changed.' });
  }, [addToast]);

  useEffect(() => {
    if (!isAuthOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') closeAuth();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeAuth, isAuthOpen]);

  useEffect(() => {
    if (!quickPanel) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (paymentConfirmOpen) {
          setPaymentConfirmOpen(false);
          return;
        }
        closeQuickPanel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeQuickPanel, paymentConfirmOpen, quickPanel]);

  useEffect(() => {
    if (!notificationOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setNotificationOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [notificationOpen]);

  return <div className={`app-root ${performance.isLiteMode ? 'performance-lite' : 'performance-full'}`} data-performance-mode={performance.effectivePerformanceMode}>
    {view === 'landing' ? <LandingView openAuth={openAuth} performance={performance} updatePerformanceMode={updatePerformanceMode} /> : <DashboardView view={view} setView={setView} goLanding={goLanding} showBalance={showBalance} setShowBalance={setShowBalance} balance={balance} balanceLoading={balanceLoading} balanceError={balanceError} recentTransactions={recentTransactions} transactionsLoading={transactionsLoading} transactionsError={transactionsError} usingFallbackData={usingFallbackData} transactionSearch={transactionSearch} setTransactionSearch={setTransactionSearch} transactionFilter={transactionFilter} setTransactionFilter={setTransactionFilter} filteredTransactions={filteredTransactions} transferForm={transferForm} setTransferForm={setTransferForm} transferError={transferError} transferSuccess={transferSuccess} transferLoading={transferLoading} submitTransfer={submitTransfer} aiInput={aiInput} setAiInput={setAiInput} aiMessages={aiMessages} aiLoading={aiLoading} sendAiMessage={sendAiMessage} setQuickPanel={openQuickPanel} notificationOpen={notificationOpen} setNotificationOpen={setNotificationOpen} notificationItems={notificationItems} markAllNotificationsRead={markAllNotificationsRead} clearReadNotifications={clearReadNotifications} toggleNotificationRead={toggleNotificationRead} resetDemoView={resetDemoView} addToast={addToast} performance={performance} updatePerformanceMode={updatePerformanceMode} />}
    {isAuthOpen && <AuthModal authMode={authMode} setAuthMode={setAuthMode} closeAuth={closeAuth} enterDashboard={enterDashboard} addToast={addToast} />}
    {quickPanel && <QuickPanel type={quickPanel} closePanel={closeQuickPanel} currentUser={currentUser} balance={balance} setBalance={setBalance} setRecentTransactions={setRecentTransactions} refreshAccountData={refreshAccountData} selectedFundingSource={selectedFundingSource} setSelectedFundingSource={setSelectedFundingSource} fundingMessage={fundingMessage} setFundingMessage={setFundingMessage} addMoneyStep={addMoneyStep} setAddMoneyStep={setAddMoneyStep} addMoneyAmount={addMoneyAmount} setAddMoneyAmount={setAddMoneyAmount} addMoneyNote={addMoneyNote} setAddMoneyNote={setAddMoneyNote} addMoneyError={addMoneyError} setAddMoneyError={setAddMoneyError} billCategory={billCategory} setBillCategory={setBillCategory} selectedBiller={selectedBiller} setSelectedBiller={setSelectedBiller} billMessage={billMessage} setBillMessage={setBillMessage} paymentConfirmOpen={paymentConfirmOpen} setPaymentConfirmOpen={setPaymentConfirmOpen} addToast={addToast} setReceipt={setReceipt} />}
    <LiteModeSuggestionModal performance={performance} onSwitchLite={switchToLiteMode} enabled={view === 'landing'} />
    <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} onCopy={copyReceiptReference} />
    <ToastViewport toasts={toasts} onClose={removeToast} />
  </div>;
}

function LandingView({ openAuth, performance, updatePerformanceMode }) {
  const { isLiteMode } = performance;
  const enablePrism = performance.effectivePerformanceMode === 'full';

  useEffect(() => {
    prefetchDashboardChunks();
  }, []);

  return <div className="landing-page">
    <div className="background"><SectionErrorBoundary>{enablePrism ? <Suspense fallback={<PrismFallback />}><Prism animationType="rotate" height={3.5} baseWidth={5.5} scale={4} glow={0.95} noise={0.03} bloom={0.85} hueShift={-0.32} colorFrequency={0.92} timeScale={0.34} offset={{ x: 330, y: 12 }} transparent suspendWhenOffscreen /></Suspense> : <PrismFallback />}</SectionErrorBoundary></div>
    <div className="overlay" />
    <header className="navbar glass"><Brand /><nav className="nav-links"><a href="#intro">Intro</a><a href="#about" onFocus={() => prefetchAboutChunks(!isLiteMode)} onMouseEnter={() => prefetchAboutChunks(!isLiteMode)}>About</a><a href="#features">Features</a><LandingPerformanceControl performance={performance} updatePerformanceMode={updatePerformanceMode} /><button className="nav-sign-in" onClick={() => openAuth('signin')} type="button">Sign In</button></nav></header>
    <main className="hero"><section className="hero-content"><div className="announcement-pill"><svg className="pill-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6-5.5-1.7L10.3 9 12 3.5Z" /></svg>Autonomous banking, quietly overengineered</div><h1>Just a Normal <span className="headline-gradient">Banking App</span></h1><p>Absolutely nothing overengineered behind the scenes.</p><div className="hero-actions"><button className="btn btn-primary" onClick={() => openAuth('signin')} type="button"><span>Sign In</span><span className="cta-arrow" aria-hidden="true">&gt;</span></button><a className="btn btn-secondary" href="#intro"><span>Explore Architecture</span><span className="cta-arrow" aria-hidden="true">&gt;</span></a></div></section><TechStrip /></main>
    <LandingSections performance={performance} />
  </div>;
}

function LandingSections({ performance }) {
  const aboutRef = useRef(null);
  const [aboutActive, setAboutActive] = useState(false);
  const { isLiteMode } = performance;
  const enableGridScan = aboutActive && !isLiteMode;
  const enableAboutCards = aboutActive;

  useEffect(() => {
    const node = aboutRef.current;
    if (!node) return undefined;
    if (!('IntersectionObserver' in window)) {
      const timer = window.setTimeout(() => setAboutActive(true), 0);
      return () => window.clearTimeout(timer);
    }
    const observer = new IntersectionObserver(([entry]) => {
      setAboutActive(entry.isIntersecting);
    }, { rootMargin: '260px 0px' });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <>
    <section className="content-section" id="intro"><div className="section-heading"><p>Intro</p><h2>Banking infrastructure that feels quiet on the surface.</h2></div><div className="section-grid three"><article className="section-card"><span>01</span><h3>AI banking interface</h3><p>Zephyr brings a conversational layer to account activity, operational insight, and user workflows.</p></article><article className="section-card"><span>02</span><h3>Self-healing infrastructure</h3><p>Behind the interface, the platform is shaped around automated recovery and resilient service patterns.</p></article><article className="section-card"><span>03</span><h3>Cloud-native reliability</h3><p>Designed for modern deployment pipelines, observable systems, and durable financial experiences.</p></article></div></section>
    <section className="about-section about-grid-scan-ready" id="about" ref={aboutRef}>
      <div className="about-grid-bg" aria-hidden="true">
        <SectionErrorBoundary>{enableGridScan ? <Suspense fallback={<PremiumSkeleton className="gridscan-skeleton" />}><GridScan
          enableWebcam={false}
          showPreview={false}
          lineThickness={1}
          linesColor="#273045"
          scanColor="#b7c4ff"
          scanOpacity={0.36}
          gridScale={0.115}
          lineStyle="solid"
          lineJitter={0.055}
          enablePost={false}
          bloomIntensity={0}
          chromaticAberration={0}
          noiseIntensity={0.006}
          scanGlow={0.78}
          scanSoftness={2.1}
          scanPhaseTaper={0.86}
          scanDuration={2.8}
          scanDelay={2.2}
          scanDirection="pingpong"
          className="zephyr-grid-scan"
        /></Suspense> : <div className="static-grid-fallback" />}</SectionErrorBoundary>
      </div>
      <div className="about-section-inner">
        <div className="about-copy">
          <p className="about-eyebrow">THE BUILDER</p>
          <h2>Wajih Ahmed</h2>
          <p>DevOps Engineer building Phoenix-Ops and Zephyr — a self-healing banking platform powered by Kubernetes, observability, and AI-assisted remediation.</p>
        </div>
        <div className="about-profile-wrap">
          <SectionErrorBoundary>{enableAboutCards ? <Suspense fallback={<AboutProfileFallback />}><ProfileCard
            avatarUrl={profileImage}
            miniAvatarUrl={profileImage}
            iconUrl=""
            grainUrl=""
            name="Wajih Ahmed"
            title="DevOps Engineer"
            handle="wajihahmed269"
            status="Building Zephyr"
            contactText="GitHub"
            showUserInfo
            enableTilt={!isLiteMode}
            behindGlowEnabled={!isLiteMode}
            behindGlowColor="rgba(96, 165, 250, 0.36)"
            innerGradient="linear-gradient(145deg, rgba(99, 102, 241, 0.34) 0%, rgba(14, 165, 233, 0.18) 58%, rgba(2, 2, 3, 0.18) 100%)"
            onContactClick={() => window.open('https://github.com/wajihahmed269', '_blank', 'noopener,noreferrer')}
          /></Suspense> : <AboutProfileFallback />}</SectionErrorBoundary>
        </div>
        <div className="built-with">
          <div className="built-with-heading">
            <p>Built With</p>
            <h3>The stack behind Zephyr and Phoenix-Ops.</h3>
          </div>
          <div className="tool-grid">
            <SectionErrorBoundary>{enableAboutCards ? <Suspense fallback={<ChromaGridFallback />}><ChromaGrid items={chromaToolItems} /></Suspense> : <ChromaGridFallback />}</SectionErrorBoundary>
          </div>
        </div>
      </div>
    </section>
    <section className="content-section" id="features"><div className="section-heading"><p>Features</p><h2>Designed for secure, observable, automated banking workflows.</h2></div><div className="section-grid four"><article className="section-card"><span>AI</span><h3>AI Assistant</h3><p>Context-aware support for financial actions, summaries, and operational questions.</p></article><article className="section-card"><span>SEC</span><h3>Secure Transactions</h3><p>Authentication-first flows prepared for policy controls and protected banking actions.</p></article><article className="section-card"><span>OBS</span><h3>Observability</h3><p>Interfaces and infrastructure planned around service health, logs, metrics, and traceability.</p></article><article className="section-card"><span>AUTO</span><h3>Automated Remediation</h3><p>Operational patterns for detecting issues and initiating recovery without noisy manual intervention.</p></article></div></section>
  </>;
}

function TechStrip() {
  return <section className="tech-strip glass" aria-label="Technology stack">{techStack.map((tech) => <span className="tech-item" key={tech.name}><span className="tech-icon"><TechIcon type={tech.icon} /></span>{tech.name}</span>)}</section>;
}

function DashboardView(props) {
  const { setNotificationOpen } = props;
  const closeNotifications = useCallback(() => setNotificationOpen(false), [setNotificationOpen]);
  return <div className="dashboard-page"><DashboardNav view={props.view} setView={props.setView} goLanding={props.goLanding} notificationOpen={props.notificationOpen} setNotificationOpen={props.setNotificationOpen} notificationItems={props.notificationItems} />{props.notificationOpen && <><button className="notification-scrim" onClick={closeNotifications} type="button" aria-label="Close notifications" /><div className="dashboard-notification-row"><NotificationPanel items={props.notificationItems} setView={props.setView} closePanel={closeNotifications} markAllRead={props.markAllNotificationsRead} clearRead={props.clearReadNotifications} toggleRead={props.toggleNotificationRead} /></div></>}{props.view === 'dashboard' && <DashboardHome {...props} />}{props.view === 'transactions' && <TransactionsView {...props} />}{props.view === 'transfer' && <TransferView {...props} />}{props.view === 'analytics' && <AnalyticsView />}{props.view === 'profile' && <ProfileView resetDemoView={props.resetDemoView} performance={props.performance} updatePerformanceMode={props.updatePerformanceMode} />}</div>;
}

function DashboardHome({ setView, showBalance, setShowBalance, balance, balanceLoading, balanceError, recentTransactions, transactionsLoading, transactionsError, usingFallbackData, aiInput, setAiInput, aiMessages, aiLoading, sendAiMessage, setQuickPanel }) {
  const openTransfer = useCallback(() => setView('transfer'), [setView]);
  const openTransactions = useCallback(() => setView('transactions'), [setView]);
  const openProfile = useCallback(() => setView('profile'), [setView]);
  const openAddMoney = useCallback(() => setQuickPanel('addMoney'), [setQuickPanel]);
  const openPayBills = useCallback(() => setQuickPanel('payBills'), [setQuickPanel]);
  const openInvestment = useCallback(() => setQuickPanel('investment'), [setQuickPanel]);
  const quickActions = useMemo(() => [{ label: 'Transfer', icon: 'send', onClick: openTransfer }, { label: 'Add Money', icon: 'plus', onClick: openAddMoney }, { label: 'Pay Bills', icon: 'bill', onClick: openPayBills }, { label: 'History', icon: 'history', onClick: openTransactions }, { label: 'More', icon: 'more', onClick: openProfile }], [openAddMoney, openPayBills, openProfile, openTransactions, openTransfer]);
  return <main className="dashboard-shell"><section className="dash-main"><SectionErrorBoundary><BalanceCard showBalance={showBalance} setShowBalance={setShowBalance} balance={balance} loading={balanceLoading} error={balanceError} usingFallbackData={usingFallbackData} /></SectionErrorBoundary><SectionErrorBoundary><QuickActions actions={quickActions} /></SectionErrorBoundary><SectionErrorBoundary><AiAssistant aiInput={aiInput} setAiInput={setAiInput} aiMessages={aiMessages} aiLoading={aiLoading} sendAiMessage={sendAiMessage} /></SectionErrorBoundary></section><aside className="dash-side"><SectionErrorBoundary><RecentTransactions transactions={recentTransactions} loading={transactionsLoading} error={transactionsError} usingFallbackData={usingFallbackData} onViewAll={openTransactions} /></SectionErrorBoundary><SectionErrorBoundary><InvestmentsCard openPanel={openInvestment} /></SectionErrorBoundary></aside><DashboardTechStrip /></main>;
}

const AiAssistant = memo(function AiAssistant({ aiInput, setAiInput, aiMessages, aiLoading, sendAiMessage }) {
  const setBalancePrompt = useCallback(() => setAiInput('Why did my balance change?'), [setAiInput]);
  const setSpendingPrompt = useCallback(() => setAiInput('Summarize recent spending'), [setAiInput]);
  const setActivityPrompt = useCallback(() => setAiInput('Any unusual activity?'), [setAiInput]);
  return <section className="ai-panel glass"><div className="panel-heading"><h2>AI Assistant</h2><p>Ask Zephyr about your account activity.</p></div><div className="suggestions"><button type="button" onClick={setBalancePrompt}>Why did my balance change?</button><button type="button" onClick={setSpendingPrompt}>Summarize recent spending</button><button type="button" onClick={setActivityPrompt}>Any unusual activity?</button></div><div className="chat-window">{aiMessages.length === 0 && !aiLoading ? <EmptyState title="No AI messages" message="Ask Zephyr for account summaries or activity insight." /> : aiMessages.map((message, index) => <p className={message.role === 'user' ? 'chat-bubble user' : message.error ? 'chat-bubble error' : 'chat-bubble'} key={`${message.role}-${index}`}>{message.text}</p>)}{aiLoading && <AssistantBubbleSkeleton />}</div><form className="ai-form" onSubmit={sendAiMessage}><input value={aiInput} onChange={(event) => setAiInput(event.target.value)} placeholder="Ask Zephyr anything..." disabled={aiLoading} /><button className="btn btn-primary" type="submit" disabled={aiLoading}>{aiLoading ? 'Sending' : 'Send'}</button></form></section>;
});

const InvestmentsCard = memo(function InvestmentsCard({ openPanel }) {
  return <section className="investment-card glass"><div className="panel-heading row"><div><h2>Investments</h2><p>Track market ideas in prototype mode.</p></div><button onClick={openPanel} type="button">View Markets</button></div><div className="portfolio-line"><strong>$12,840.22</strong><span>+2.4%</span></div><MiniChart /><div className="watchlist-mini">{watchlist.map(([symbol, change]) => <span key={symbol}>{symbol} <b className={change.startsWith('+') ? 'positive' : 'negative'}>{change}</b></span>)}</div></section>;
});

function MiniChart({ large = false }) {
  return <svg className={large ? 'market-chart large' : 'market-chart'} viewBox="0 0 320 120" fill="none" aria-hidden="true"><path d="M8 92 C48 72 64 88 96 54 C124 24 142 60 170 42 C202 20 218 78 250 50 C276 28 292 35 312 18" /><path d="M8 92 C48 72 64 88 96 54 C124 24 142 60 170 42 C202 20 218 78 250 50 C276 28 292 35 312 18 L312 116 L8 116 Z" /></svg>;
}

function QuickPanel({ type, closePanel, currentUser, balance, setBalance, setRecentTransactions, refreshAccountData, selectedFundingSource, setSelectedFundingSource, fundingMessage, setFundingMessage, addMoneyStep, setAddMoneyStep, addMoneyAmount, setAddMoneyAmount, addMoneyNote, setAddMoneyNote, addMoneyError, setAddMoneyError, billCategory, setBillCategory, selectedBiller, setSelectedBiller, billMessage, setBillMessage, paymentConfirmOpen, setPaymentConfirmOpen, addToast, setReceipt }) {
  const visibleBillers = useMemo(() => billers.filter((biller) => billCategory === 'All' || biller[1] === billCategory), [billCategory]);
  const selectedBill = useMemo(() => billers.find(([name]) => name === selectedBiller), [selectedBiller]);
  const selectedBillAmount = selectedBill ? parseMoneyValue(selectedBill[2]) : null;
  const title = type === 'addMoney' ? 'Add Money' : type === 'payBills' ? 'Pay Bills' : 'Investments';
  const subtitle = type === 'addMoney' ? 'Choose how you want to fund your Zephyr balance.' : type === 'payBills' ? 'Choose a biller or service to pay from your Zephyr account.' : 'Market data is mocked in this UI sandbox.';
  const [panelLoading, setPanelLoading] = useState(false);

  const continueAddMoney = useCallback(() => {
    if (!selectedFundingSource) return;
    setFundingMessage('');
    setAddMoneyError('');
    setAddMoneyStep('details');
  }, [selectedFundingSource, setAddMoneyError, setAddMoneyStep, setFundingMessage]);

  const confirmAddMoney = useCallback(async () => {
    const username = getSessionUsername(currentUser);
    const amount = parseMoneyValue(addMoneyAmount);
    const note = addMoneyNote.trim();
    if (!username) {
      setAddMoneyError('Sign in before adding money.');
      setFundingMessage('');
      return;
    }
    if (amount === null || amount <= 0) {
      setAddMoneyError('Amount must be a positive number.');
      setFundingMessage('');
      return;
    }
    setAddMoneyError('');
    setFundingMessage('');
    setPanelLoading(true);
    if (!DEMO_MODE) {
      try {
        const transaction = await bankingApi.deposit(amount, selectedFundingSource, note);
        const nextReceipt = buildReceipt({ transaction, type: 'Deposit', amount, note, category: selectedFundingSource });
        setReceipt(nextReceipt);
        setFundingMessage(`Deposit successful from ${selectedFundingSource}.`);
        setAddMoneyAmount('');
        setAddMoneyNote('');
        addToast({ type: 'success', title: 'Deposit successful', message: `${formatUSD(amount)} added to your balance. Ref ${nextReceipt.reference}.` });
        await refreshAccountData();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Deposit failed.';
        setAddMoneyError(message);
        addToast({ type: 'error', title: 'Deposit failed', message });
      } finally {
        setPanelLoading(false);
      }
      return;
    }
    window.setTimeout(() => {
      const transaction = createPrototypeTransaction({
        name: `Deposit from ${selectedFundingSource}`,
        amount,
        type: 'income',
        category: selectedFundingSource,
        note,
      });
      setBalance((current) => current + amount);
      setRecentTransactions((current) => [transaction, ...current]);
      setFundingMessage(`Deposit successful from ${selectedFundingSource}.`);
      setAddMoneyAmount('');
      setAddMoneyNote('');
      addToast({ type: 'success', title: 'Deposit successful', message: `${formatUSD(amount)} added to your balance. Ref ${transaction.reference}.` });
      setPanelLoading(false);
    }, 160);
  }, [addMoneyAmount, addMoneyNote, addToast, currentUser, refreshAccountData, selectedFundingSource, setAddMoneyAmount, setAddMoneyError, setAddMoneyNote, setBalance, setFundingMessage, setReceipt, setRecentTransactions]);

  const openPaymentConfirmation = useCallback(() => {
    if (!selectedBill) {
      setBillMessage('Select a biller before continuing.');
      return;
    }
    if (selectedBillAmount === null) {
      setBillMessage('This prototype biller needs a dollar amount before payment.');
      return;
    }
    setBillMessage('');
    setPaymentConfirmOpen(true);
  }, [selectedBill, selectedBillAmount, setBillMessage, setPaymentConfirmOpen]);

  const confirmPayment = useCallback(async () => {
    const username = getSessionUsername(currentUser);
    if (!selectedBill || selectedBillAmount === null) return;
    if (!username) {
      setBillMessage('Sign in before paying bills.');
      return;
    }
    if (selectedBillAmount <= 0) {
      setBillMessage('This bill amount is not valid.');
      return;
    }
    if (selectedBillAmount > balance) {
      setBillMessage('Insufficient balance for this payment.');
      setPaymentConfirmOpen(false);
      return;
    }

    setPanelLoading(true);
    setBillMessage('');
    if (!DEMO_MODE) {
      try {
        const transaction = await bankingApi.payBill({
          biller: selectedBill[0],
          amount: selectedBillAmount,
          category: selectedBill[1],
          paymentMethod: 'Bank Balance',
          note: `${selectedBill[0]} bill payment`,
        });
        const nextReceipt = buildReceipt({ transaction, type: 'Payment', amount: selectedBillAmount, biller: selectedBill[0], category: selectedBill[1], paymentMethod: 'Bank Balance', note: `${selectedBill[0]} bill payment` });
        setReceipt(nextReceipt);
        setBillMessage(`${selectedBill[0]} paid successfully.`);
        addToast({ type: 'success', title: 'Payment completed', message: `${selectedBill[0]} paid successfully.` });
        setPaymentConfirmOpen(false);
        await refreshAccountData();
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Payment failed.';
        setBillMessage(message);
        addToast({ type: 'error', title: 'Payment failed', message });
        setPaymentConfirmOpen(false);
      } finally {
        setPanelLoading(false);
      }
      return;
    }
    window.setTimeout(() => {
      const transaction = createPrototypeTransaction({
        name: `${selectedBill[0]} bill payment`,
        amount: -selectedBillAmount,
        type: 'spending',
        biller: selectedBill[0],
        category: selectedBill[1],
        paymentMethod: 'Bank Balance',
        note: `${selectedBill[0]} bill payment`,
      });
      setBalance((current) => current - selectedBillAmount);
      setRecentTransactions((current) => [transaction, ...current]);
      const nextReceipt = buildReceipt({ transaction, type: 'Payment', amount: selectedBillAmount, biller: selectedBill[0], category: selectedBill[1], paymentMethod: 'Bank Balance', note: `${selectedBill[0]} bill payment` });
      setReceipt(nextReceipt);
      setBillMessage(`${selectedBill[0]} paid successfully.`);
      addToast({ type: 'success', title: 'Payment completed', message: `${selectedBill[0]} paid successfully.` });
      setPaymentConfirmOpen(false);
      setPanelLoading(false);
    }, 160);
  }, [addToast, balance, currentUser, refreshAccountData, selectedBill, selectedBillAmount, setBalance, setBillMessage, setPaymentConfirmOpen, setReceipt, setRecentTransactions]);

  return <div className="quick-panel-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget && !panelLoading) closePanel(); }}><section className="quick-panel glass"><button className="auth-close" onClick={closePanel} disabled={panelLoading} type="button" aria-label="Close panel">x</button><div className="panel-hero"><p>Prototype panel</p><h2>{title}</h2><span>{subtitle}</span></div>{type === 'addMoney' && <><div className="step-indicator"><span className={addMoneyStep === 'source' ? 'active' : ''}>1 Source</span><span className={addMoneyStep === 'details' ? 'active' : ''}>2 Amount</span></div>{addMoneyStep === 'source' ? <><div className="option-grid">{fundingSources.map(([name, description, icon]) => <button className={selectedFundingSource === name ? 'option-card selected' : 'option-card'} key={name} onClick={() => { setSelectedFundingSource(name); setFundingMessage(''); setAddMoneyError(''); }} type="button"><span><MiniIcon type={icon} /></span><strong>{name}</strong><small>{description}</small></button>)}</div><button className="btn btn-primary full-width panel-action" disabled={!selectedFundingSource} onClick={continueAddMoney} type="button">Continue</button></> : <><div className="add-money-details"><h3>Add from {selectedFundingSource}</h3><p>Enter the amount you want to add to your Zephyr balance.</p><label>Amount<input value={addMoneyAmount} onChange={(event) => { setAddMoneyAmount(event.target.value); setAddMoneyError(''); }} inputMode="decimal" placeholder="0.00" disabled={panelLoading} /></label><label>Optional note/reference<textarea value={addMoneyNote} onChange={(event) => setAddMoneyNote(event.target.value)} placeholder="Reference note" disabled={panelLoading} /></label></div>{addMoneyError && <p className="panel-message error">{addMoneyError}</p>}{fundingMessage && <p className="panel-message">{fundingMessage}</p>}<div className="panel-actions split"><button className="btn btn-secondary" disabled={panelLoading} onClick={() => { setAddMoneyStep('source'); setAddMoneyError(''); setFundingMessage(''); }} type="button">Back</button><button className="btn btn-primary" disabled={panelLoading} onClick={confirmAddMoney} type="button">{panelLoading ? 'Depositing...' : 'Confirm Add Money'}</button></div></>}</>}{type === 'payBills' && <><div className="filter-tabs panel-filters">{['All', 'Subscriptions', 'Shopping', 'Cloud', 'Crypto', 'Utilities'].map((category) => <button className={billCategory === category ? 'active' : ''} key={category} onClick={() => { setBillCategory(category); setSelectedBiller(''); setBillMessage(''); setPaymentConfirmOpen(false); }} type="button">{category}</button>)}</div><div className="biller-grid">{visibleBillers.map(([name, category, amount, icon]) => <button className={selectedBiller === name ? 'biller-card selected' : 'biller-card'} key={name} onClick={() => { setSelectedBiller(name); setBillMessage(''); }} type="button"><span><MiniIcon type={icon} /></span><strong>{name}</strong><small>{category}</small><b>{amount}</b></button>)}</div>{billMessage && <p className={billMessage.includes('successfully') ? 'panel-message' : 'panel-message error'}>{billMessage}</p>}<button className="btn btn-primary full-width panel-action" disabled={panelLoading} onClick={openPaymentConfirmation} type="button">{panelLoading ? 'Paying...' : 'Pay Selected'}</button>{paymentConfirmOpen && selectedBill && <PaymentConfirmModal billerName={selectedBill[0]} amount={selectedBillAmount} loading={panelLoading} onCancel={() => setPaymentConfirmOpen(false)} onConfirm={confirmPayment} />}</>}{type === 'investment' && <><div className="investment-panel-summary"><strong>$12,840.22</strong><span>+2.4% today</span></div><MiniChart large /><div className="watchlist-rows">{watchlist.map(([symbol, change]) => <div key={symbol}><span>{symbol}</span><b className={change.startsWith('+') ? 'positive' : 'negative'}>{change}</b><button disabled type="button">Prototype</button></div>)}</div><p className="panel-message">Market data is mocked in this UI sandbox.</p></>}</section></div>;
}

function PaymentConfirmModal({ billerName, amount, loading, onCancel, onConfirm }) {
  return <div className="payment-confirm-layer" role="presentation"><section className="payment-confirm-modal glass" role="dialog" aria-modal="true" aria-labelledby="payment-confirm-title"><h2 id="payment-confirm-title">Confirm payment</h2><p>You are about to pay {billerName}.</p><strong>{formatUSD(amount)}</strong><span>This prototype payment updates local dashboard state.</span><div className="panel-actions"><button className="btn btn-secondary" disabled={loading} onClick={onCancel} type="button">Cancel</button><button className="btn btn-primary" disabled={loading} onClick={onConfirm} type="button">{loading ? 'Confirming...' : 'Confirm Payment'}</button></div></section></div>;
}

function AnalyticsView() {
  const stats = [['Monthly Income', '$2,950'], ['Monthly Spending', '$654'], ['Savings Rate', '72%'], ['Risk Score', 'Low'], ['Portfolio Growth', '+2.4%']];
  const bars = [['Shopping', 58], ['Subscriptions', 32], ['Transfer', 44], ['Food', 26]];
  return <main className="dashboard-shell single"><PageHeader title="Analytics" />{stats.length === 0 && bars.length === 0 ? <section className="chart-card glass"><EmptyState title="No analytics yet" message="Spending insights will appear after transactions are available." /></section> : <><div className="analytics-grid">{stats.map(([label, value]) => <section className="stat-card glass" key={label}><span>{label}</span><strong>{value}</strong></section>)}</div><section className="chart-card glass"><h2>Spending Categories</h2>{bars.length === 0 ? <EmptyState title="No spending data" message="Category breakdowns will appear after payments or transfers post." /> : bars.map(([label, width]) => <div className="bar-row" key={label}><span>{label}</span><div><b style={{ width: `${width}%` }} /></div></div>)}</section></>}</main>;
}

function LandingPerformanceControl({ performance, updatePerformanceMode }) {
  const [open, setOpen] = useState(false);
  const options = [
    ['auto', 'Auto', 'Zephyr chooses based on device performance.'],
    ['full', 'Full Visuals', 'Enables premium animated backgrounds and effects.'],
    ['lite', 'Lite Mode', 'Reduces heavy animations for smoother performance.'],
  ];
  const selectMode = useCallback((mode) => {
    updatePerformanceMode(mode);
    setOpen(false);
  }, [updatePerformanceMode]);

  return <div className="landing-performance-control"><button className={open ? 'landing-performance-button active' : 'landing-performance-button'} onClick={() => setOpen((current) => !current)} type="button" aria-label="Visual performance settings" aria-expanded={open} aria-haspopup="dialog"><MiniIcon type="settings" /></button>{open && <section className="landing-performance-popover glass" role="dialog" aria-modal="false" aria-labelledby="landing-performance-title"><div className="landing-performance-head"><p>Settings</p><h2 id="landing-performance-title">Visual Performance</h2></div><div className="landing-performance-options">{options.map(([mode, label, description]) => <button className={performance.performanceMode === mode ? 'active' : ''} key={mode} onClick={() => selectMode(mode)} type="button" aria-pressed={performance.performanceMode === mode}><span>{label}</span><small>{description}</small></button>)}</div>{performance.devicePerformanceReason && <p className="landing-performance-note">{performance.devicePerformanceReason}</p>}</section>}</div>;
}

function PerformanceModeControl({ performance, updatePerformanceMode }) {
  const options = [
    ['auto', 'Auto', 'Adapts visuals to your device.'],
    ['full', 'Full Visuals', 'Enables Prism, GridScan, and motion effects.'],
    ['lite', 'Lite Mode', 'Uses static premium visuals for smoother performance.'],
  ];
  return <section className="performance-settings glass"><div className="performance-settings-copy"><h2>Performance Mode</h2><p>{options.find(([mode]) => mode === performance.performanceMode)?.[2]}</p>{performance.devicePerformanceReason && <span>{performance.devicePerformanceReason}</span>}</div><div className="performance-segments" role="group" aria-label="Performance Mode">{options.map(([mode, label]) => <button className={performance.performanceMode === mode ? 'active' : ''} key={mode} onClick={() => updatePerformanceMode(mode)} type="button">{label}</button>)}</div></section>;
}

function ProfileView({ resetDemoView, performance, updatePerformanceMode }) {
  return <main className="dashboard-shell single profile-shell"><PageHeader title="Profile & Settings" /><PerformanceModeControl performance={performance} updatePerformanceMode={updatePerformanceMode} /><section className="profile-actions glass"><div><h2>Demo controls</h2><p>Reset local presentation state without changing prototype account data.</p></div><button className="btn btn-secondary" onClick={resetDemoView} type="button">Reset demo view</button></section><SectionErrorBoundary><Suspense fallback={<ProfileSkeleton />}><section className="profile-layout"><ReflectiveCard image={profileImage} name="Wajih Ahmed" role="DevOps Engineer" handle="@wajihahmed269" status="Building Zephyr" project="Phoenix-Ops / Zephyr" github="https://github.com/wajihahmed269" /><MagicBento items={profileSettings} className="profile-bento" /></section></Suspense></SectionErrorBoundary></main>;
}

function PageHeader({ title }) {
  return <div className="page-header"><h1>{title}</h1></div>;
}

function DashboardTechStrip() {
  return <section className="dash-tech-strip glass" aria-label="Dashboard technology stack">{techStack.map((tech) => <span key={tech.name}>{tech.name}</span>)}</section>;
}
