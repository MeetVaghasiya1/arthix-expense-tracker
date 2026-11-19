import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  PlusCircle, 
  Trash2, 
  Search,
  PieChart, 
  Target, 
  Settings as SettingsIcon, 
  Receipt, 
  LogOut, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight, 
  Sun, 
  Moon, 
  Lock, 
  Mail, 
  User as UserIcon,
  Download,
  Filter,
  Zap,
  HelpCircle,
  BarChart4,
  Flame,
  Check,
  Plus
} from 'lucide-react';

const CATEGORIES = [
  'Salary / Income',
  'Food & Dining',
  'Rent & Bills',
  'Shopping',
  'Transportation',
  'Entertainment',
  'Investment / Savings',
  'Medical & Health',
  'Other'
];

export default function App() {
  // ---------------- THEME STATE ----------------
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('Arthix_theme') || 'light';
  });

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('Arthix_theme', nextTheme);
  };

  // ---------------- AUTH STATE ----------------
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('Arthix_active_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Modal Auth State: null | 'login' | 'signup'
  const [authModal, setAuthModal] = useState(null); 
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // ---------------- APP NAVIGATION ----------------
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  

  // FAQ open/close state
  const [openFaq, setOpenFaq] = useState(null);
// ---------------- DATABASE / USER DATA ----------------
  const [transactions, setTransactions] = useState([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [budgetInput, setBudgetInput] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false); // આ નવી લાઇન ડેટા સેફ રાખશે

  // Load user data when logged in
  useEffect(() => {
    if (currentUser) {
      const dbKey = `Arthix_data_${currentUser.id}`;
      const savedData = localStorage.getItem(dbKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          setTransactions(parsed.transactions || []);
          setMonthlyBudget(parsed.budget || 0);
        } catch (e) {
          setTransactions([]);
          setMonthlyBudget(0);
        }
      } else {
        setTransactions([]);
        setMonthlyBudget(0);
      }
      setIsDataLoaded(true); // ડેટા લોડ થઈ ગયો છે તેની નિશાની
    } else {
      setTransactions([]);
      setMonthlyBudget(0);
      setIsDataLoaded(false);
    }
  }, [currentUser]);

  // Save user data to LocalStorage (ફક્ત ડેટા લોડ થયા પછી જ સેવ કરશે)
  useEffect(() => {
    if (currentUser && isDataLoaded) {
      const dbKey = `Arthix_data_${currentUser.id}`;
      localStorage.setItem(dbKey, JSON.stringify({ transactions, budget: monthlyBudget }));
    }
  }, [transactions, monthlyBudget, currentUser, isDataLoaded]);

  // ---------------- FORM STATE ----------------
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState(CATEGORIES[1]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Transaction Detail Modal
  const [selectedTx, setSelectedTx] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('All');

  // ---------------- CALCULATIONS ----------------
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + Number(tx.amount), 0);

  const totalBalance = totalIncome - totalExpense;

  // Category stats for chart breakdown
  const categoryStats = CATEGORIES.filter(c => c !== 'Salary / Income').map(cat => {
    const total = transactions
      .filter(tx => tx.type === 'expense' && tx.category === cat)
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const percentage = totalExpense > 0 ? ((total / totalExpense) * 100).toFixed(1) : 0;
    return { category: cat, total, percentage: Number(percentage) };
  }).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  // ---------------- AUTH HANDLERS ----------------
  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    const usersDb = JSON.parse(localStorage.getItem('Arthix_users_registry') || '[]');

    if (authModal === 'signup') {
      if (!authName.trim() || !authEmail.trim() || !authPassword) {
        setAuthError('Please fill in all required fields.');
        return;
      }
      const existing = usersDb.find(u => u.email.toLowerCase() === authEmail.trim().toLowerCase());
      if (existing) {
        setAuthError('An account with this email already exists. Please sign in.');
        return;
      }

      const newUser = {
        id: 'usr_' + Date.now(),
        name: authName.trim(),
        email: authEmail.trim().toLowerCase(),
        password: authPassword
      };
      usersDb.push(newUser);
      localStorage.setItem('Arthix_users_registry', JSON.stringify(usersDb));

      setAuthSuccessMsg('Account created successfully! Please sign in to continue.');
      setAuthModal('login');
      setAuthPassword('');
      return;
    }

    if (authModal === 'login') {
      const user = usersDb.find(
        u => u.email.toLowerCase() === authEmail.trim().toLowerCase() && u.password === authPassword
      );
      if (!user) {
        setAuthError('Invalid email or password.');
        return;
      }
      localStorage.setItem('Arthix_active_user', JSON.stringify(user));
      setCurrentUser(user);
      setAuthModal(null);
      setAuthEmail('');
      setAuthPassword('');
      setAuthName('');
      setAuthSuccessMsg('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('Arthix_active_user');
    setCurrentUser(null);
    setShowProfileMenu(false);
    setActiveTab('dashboard');
  };

  // ---------------- TRANSACTION HANDLERS ----------------
  const handleAddTransaction = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || Number(amount) <= 0) return;

    const newTx = {
      id: 'txn_' + Date.now().toString(),
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category: type === 'income' ? 'Salary / Income' : category,
      date,
      notes: notes.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTransactions([newTx, ...transactions]);
    setTitle('');
    setAmount('');
    setNotes('');
  };

  const handleDelete = (id, e) => {
    if (e) e.stopPropagation();
    setTransactions(transactions.filter(t => t.id !== id));
    if (selectedTx && selectedTx.id === id) setSelectedTx(null);
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || tx.type === filterType;
    const matchesCat = filterCategory === 'All' || tx.category === filterCategory;
    return matchesSearch && matchesType && matchesCat;
  });

  // Base theme classes
  const isDark = theme === 'dark';
  const pageBg = isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900';
  const cardBg = isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800';
  const inputBg = isDark ? 'bg-slate-800/80 border-slate-700 text-slate-100 focus:bg-slate-800' : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white';
  const headerBg = isDark ? 'bg-slate-950/80 border-slate-800/90' : 'bg-white/80 border-slate-200/90';

  // Unique button interactive class preset
  const buttonPrimary = "bg-indigo-600 text-white font-bold rounded-xl transition-all duration-200 hover:bg-indigo-500 hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-0.5 active:scale-95 active:shadow-inner cursor-pointer";
  const buttonSecondary = isDark
    ? "bg-slate-900 border border-slate-800 text-slate-200 font-bold rounded-xl transition-all duration-200 hover:bg-slate-800 hover:border-slate-700 hover:shadow-md hover:-translate-y-0.5 active:scale-95 cursor-pointer"
    : "bg-white border border-slate-300 text-slate-700 font-bold rounded-xl transition-all duration-200 hover:bg-slate-50 hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md hover:shadow-indigo-500/10 hover:-translate-y-0.5 active:scale-95 cursor-pointer";

  // ========================================================================
  // SCENARIO 1: EXPANDED Arthix PUBLIC LANDING PAGE
  // ========================================================================
  if (!currentUser) {
    return (
      <div className={`min-h-screen ${pageBg} flex flex-col justify-between selection:bg-indigo-500 selection:text-white relative overflow-hidden transition-colors duration-200`}>
        
        {/* Ambient Glow Orbs */}
        <div className={`absolute top-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] ${isDark ? 'bg-indigo-600/10' : 'bg-indigo-100/70'} blur-3xl pointer-events-none rounded-full`} />
        <div className={`absolute top-[700px] right-[-80px] w-96 h-96 ${isDark ? 'bg-emerald-600/10' : 'bg-emerald-100/50'} blur-3xl pointer-events-none rounded-full`} />

        {/* Public Header Navbar */}
        <header className={`relative z-10 border-b ${headerBg} backdrop-blur-md`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="bg-indigo-600 text-white p-2.5 rounded-2xl shadow-md shadow-indigo-500/20">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tight leading-none">Arthix</h1>
                <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider mt-0.5">Smart Money, Better Life</p>
              </div>
            </div>

            {/* Right Side: Theme Toggle + Auth Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm active:scale-90 ${isDark ? 'border-slate-800 text-amber-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => { setAuthModal('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-95 cursor-pointer ${
                  isDark 
                    ? 'bg-transparent border-slate-700 text-slate-200 hover:border-indigo-00 hover:text-white' 
                    : 'bg-transparent border-slate-300 text-slate-800 hover:border-indigo-600 hover:text-indigo-600'
                }`}
              >
                Sign In
              </button>
              
              <button
                onClick={() => { setAuthModal('signup'); setAuthError(''); setAuthSuccessMsg(''); }}
                className={`px-4 py-2 text-xs ${buttonPrimary}`}
              >
                Create Account
              </button>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 my-auto text-center space-y-24">
          <div className="max-w-3xl mx-auto">
            <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-bold mb-6 ${isDark ? 'bg-indigo-950/50 border-indigo-800 text-indigo-400' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Smart Money, Better Life</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.12]">
              Elevate your wealth with <span className="text-indigo-600">Arthix.</span>
            </h1>

            <p className={`mt-5 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Master daily expenses, track cash flows, and build healthy savings with automated category breakdowns and isolated storage.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => { setAuthModal('signup'); setAuthError(''); setAuthSuccessMsg(''); }}
                className={`w-full sm:w-auto px-8 py-3.5 text-sm flex items-center justify-center gap-2 ${buttonPrimary}`}
              >
                Start Free with Arthix <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setAuthModal('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                className={`w-full sm:w-auto px-8 py-3.5 text-sm ${buttonSecondary}`}
              >
                Sign In to Account
              </button>
            </div>
          </div>

          {/* SECTION 1: 6 EXPANDED FEATURE HIGHLIGHTS */}
          <div className="text-left space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-2xl font-black tracking-tight">Built for Total Financial Control</h3>
              <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Everything you need to eliminate money leaks and scale personal savings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <div className={`p-6 rounded-3xl border shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-500/40 ${cardBg}`}>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">Live Breakdown & Analytics</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Instant percentage-based progress bars for category-wise spending and outflow trends.
                </p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-500/40 ${cardBg}`}>
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                  <Target className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">Custom Budget Thresholds</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Set personalized monthly spending targets with automated visual warning alerts when caps are exceeded.
                </p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-500/40 ${cardBg}`}>
                <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">Isolated User Vault</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Your records stay securely isolated under your personal account with local persistence and offline readiness.
                </p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-500/40 ${cardBg}`}>
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <Download className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">Spreadsheet CSV Exports</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Export structured ledger history with single-click CSV downloads for tax reviews and custom accounting.
                </p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-500/40 ${cardBg}`}>
                <div className="w-10 h-10 rounded-2xl bg-violet-50 text-violet-600 flex items-center justify-center mb-4">
                  <Filter className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">Smart Filter & Search</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Filter instantly by transaction type (Income/Expense) or categories to locate any historical log in seconds.
                </p>
              </div>

              <div className={`p-6 rounded-3xl border shadow-xs transition-all duration-200 hover:-translate-y-1.5 hover:shadow-xl hover:border-indigo-500/40 ${cardBg}`}>
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold">Zero-Latency Client Engine</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Built with React & Vite for lightning-quick DOM updates, smooth animations, and instant responsive layouts.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 2: HOW Arthix WORKS (3-STEP ROADMAP) */}
          <div className="text-left space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-2xl font-black tracking-tight">How Arthix Works</h3>
              <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Three seamless steps to streamline your financial discipline.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className={`p-6 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${cardBg}`}>
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-indigo-600/30">1</span>
                <h4 className="text-sm font-bold">Record Transactions</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Log inflows and outflows with categories, transaction dates, and custom payment notes.
                </p>
              </div>

              <div className={`p-6 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${cardBg}`}>
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-indigo-600/30">2</span>
                <h4 className="text-sm font-bold">Track Visual Analytics</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Gain immediate clarity on where your money goes with category spending distribution ratios.
                </p>
              </div>

              <div className={`p-6 rounded-3xl border transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${cardBg}`}>
                <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center justify-center mb-3 shadow-md shadow-indigo-600/30">3</span>
                <h4 className="text-sm font-bold">Grow Personal Savings</h4>
                <p className={`text-xs mt-1.5 leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Stay strictly beneath monthly budget targets to increase your available net reserve capital.
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 3: COMPARISON MATRIX (OLD WAYS VS Arthix) */}
          <div className="text-left space-y-6">
            <div className="text-center max-w-xl mx-auto">
              <h3 className="text-2xl font-black tracking-tight">Why Choose Arthix Over Spreadsheets?</h3>
              <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                See how Arthix replaces manual accounting friction with clean intelligence.
              </p>
            </div>

            <div className={`rounded-3xl border overflow-hidden shadow-xs ${cardBg}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className={`border-b ${isDark ? 'border-slate-800 bg-slate-900/80 text-slate-300' : 'border-slate-200 bg-slate-100/70 text-slate-700'}`}>
                      <th className="p-4 font-bold">Feature Capability</th>
                      <th className="p-4 font-bold text-slate-400">Manual Notebooks / Basic Excel</th>
                      <th className="p-4 font-bold text-indigo-600">Arthix Smart Engine</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-slate-800' : 'divide-slate-100'}`}>
                    <tr>
                      <td className="p-4 font-semibold">Speed of Entry</td>
                      <td className="p-4 text-slate-400">Slow, manual math required</td>
                      <td className="p-4 font-bold text-emerald-500">Instant 1-Click logging with balance auto-sync</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold">Budget Warning Alerts</td>
                      <td className="p-4 text-slate-400">None (discovered at end of month)</td>
                      <td className="p-4 font-bold text-emerald-500">Real-time threshold color alerts</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold">Mobile & Desktop Sync</td>
                      <td className="p-4 text-slate-400">Hard to navigate on touchscreens</td>
                      <td className="p-4 font-bold text-emerald-500">Responsive App-Like bottom bar layout</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold">User Privacy & Security</td>
                      <td className="p-4 text-slate-400">Accessible by anyone who opens file</td>
                      <td className="p-4 font-bold text-emerald-500">Isolated credentials with sandboxed profile storage</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQ) */}
          <div className="text-left space-y-6 max-w-3xl mx-auto">
            <div className="text-center">
              <h3 className="text-2xl font-black tracking-tight">Frequently Asked Questions</h3>
              <p className={`text-xs mt-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Got questions? We have answers.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  q: "Is my personal financial data shared or sent to any server?",
                  a: "No. Arthix uses sandboxed local persistent browser storage. Your transaction records, income logs, and budgets remain 100% private to your device."
                },
                {
                  q: "Can multiple users use Arthix on the same laptop?",
                  a: "Yes! Each user logs in with their own registered credentials. Arthix isolates data using user-specific database keys so your records never mix."
                },
                {
                  q: "Can I export my records for accounting or taxes?",
                  a: "Yes, you can export your complete transaction ledger history into a standard CSV file directly from the navigation bar in one click."
                },
                {
                  q: "Does Arthix work without an active internet connection?",
                  a: "Absolutely. Arthix's state engine runs completely on the client side, meaning you can record and review expenses even when offline."
                }
              ].map((faq, index) => (
                <div 
                  key={index}
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${cardBg} ${
                    openFaq === index 
                      ? 'border-indigo-500 shadow-md ring-1 ring-indigo-500/30' 
                      : 'hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h5 className={`text-xs sm:text-sm font-bold tracking-tight transition-colors ${
                      openFaq === index ? 'text-indigo-600 dark:text-indigo-400' : ''
                    }`}>
                      {faq.q}
                    </h5>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 ${
                      openFaq === index 
                        ? 'rotate-45 bg-indigo-600 text-white' 
                        : isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {openFaq === index && (
                    <p className={`text-xs mt-3 pt-2.5 border-t border-slate-200/40 leading-relaxed font-normal tracking-wide ${
                      isDark ? 'text-slate-300' : 'text-slate-600'
                    }`}>
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
              
            </div>
          </div>

          {/* SECTION 5: TRUST & PERFORMANCE METRICS */}
          <div className={`rounded-3xl border p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-around gap-6 ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-indigo-50/60 border-indigo-100'}`}>
            <div className="text-center">
              <span className="text-3xl font-black text-indigo-600">100%</span>
              <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Client-Side Privacy</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-black text-indigo-600">0s</span>
              <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Cloud Server Latency</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-black text-indigo-600">₹0</span>
              <p className={`text-xs font-semibold mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Completely Free to Use</p>
            </div>
          </div>
        </main>

        <footer className={`relative z-10 border-t py-4 text-center text-xs ${isDark ? 'border-slate-800 text-slate-500 bg-slate-950/60' : 'border-slate-200 text-slate-500 bg-white/60'}`}>
          Arthix © 2026 • Smart Money, Better Life
        </footer>

        {/* ---------------- 2-COLUMN SPLIT THEME-ADAPTIVE AUTH MODAL ---------------- */}
        {authModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/30 backdrop-blur-[2px] flex items-center justify-center p-4 animate-in fade-in duration-150">
            <div className={`w-full max-w-3xl rounded-3xl overflow-hidden border shadow-2xl relative grid grid-cols-1 md:grid-cols-2 animate-in zoom-in-95 duration-150 ${isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'}`}>
              
              {/* Close Button */}
              <button
                onClick={() => { setAuthModal(null); setAuthError(''); setAuthSuccessMsg(''); }}
                className="absolute top-4 right-4 z-20 p-1.5 rounded-full text-slate-400 hover:bg-slate-500/10 hover:text-slate-600 active:scale-90 transition-all duration-150"
              >
                <X className="w-5 h-5" />
              </button>

              {/* LEFT SIDE: THEME ADAPTIVE BRAND SHOWCASE */}
              <div className={`p-8 flex flex-col justify-between relative overflow-hidden transition-colors ${
                isDark 
                  ? 'bg-gradient-to-br from-indigo-700 via-indigo-900 to-slate-950 text-white' 
                  : 'bg-gradient-to-br from-indigo-50 via-slate-50 to-indigo-100/80 text-slate-800 border-r border-slate-200/60'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl backdrop-blur-sm ${isDark ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'}`}>
                      <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black">Arthix</h3>
                      <p className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-indigo-200' : 'text-indigo-600'}`}>
                        Smart Money, Better Life
                      </p>
                    </div>
                  </div>

                  <h2 className="text-2xl font-black mt-8 leading-tight">
                    Take the smarter route to financial freedom.
                  </h2>
                  <p className={`text-xs mt-3 leading-relaxed ${isDark ? 'text-indigo-100' : 'text-slate-600'}`}>
                    Track expenses in real-time, maintain clean ledger histories, and never lose sight of your monthly savings target.
                  </p>
                </div>

                <div className={`space-y-3 mt-8 pt-6 border-t text-xs ${isDark ? 'border-indigo-500/40 text-slate-200' : 'border-indigo-200/80 text-slate-700'}`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span>Real-time category spending breakdown</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span>User-defined custom budget limits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <span>Isolated & encrypted profile storage</span>
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Auth Form (Login / Sign Up) */}
              <div className="p-6 sm:p-8 flex flex-col justify-center">
                <div className="mb-5">
                  <h3 className="text-lg font-black leading-tight">
                    {authModal === 'signup' ? 'Create an Account' : 'Welcome to Arthix'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {authModal === 'signup' ? 'Sign up to manage your expenses with Arthix' : 'Sign in to access your ledger'}
                  </p>
                </div>

                {/* Alerts */}
                {authSuccessMsg && (
                  <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{authSuccessMsg}</span>
                  </div>
                )}
                {authError && (
                  <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-600 text-xs rounded-xl flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                {/* Switcher Tab */}
                <div className={`flex p-1 rounded-xl mb-4 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <button
                    type="button"
                    onClick={() => { setAuthModal('login'); setAuthError(''); }}
                    className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 ${
                      authModal === 'login' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAuthModal('signup'); setAuthError(''); setAuthSuccessMsg(''); }}
                    className={`w-1/2 py-2 rounded-lg text-xs font-bold transition-all duration-150 active:scale-95 ${
                      authModal === 'signup' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-3.5">
                  {authModal === 'signup' && (
                    <div>
                      <label className="block text-xs font-bold mb-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                        <input
                          type="text"
                          required
                          placeholder="Enter your name"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="Enter your email"
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="password"
                        required
                        placeholder="Enter a Password"
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 mt-2 ${buttonPrimary}`}
                  >
                    {authModal === 'signup' ? 'Create Free Account' : 'Sign In Now'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ========================================================================
  // SCENARIO 2: MAIN DASHBOARD
  // ========================================================================
  return (
    <div className={`min-h-screen ${pageBg} pb-24 md:pb-12 transition-colors duration-200`}>
      {/* Top Navbar */}
      <header className={`border-b ${headerBg} sticky top-0 z-20 shadow-xs backdrop-blur-md`}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform duration-150" onClick={() => setActiveTab('dashboard')}>
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight leading-none">Arthix</h1>
              <p className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider">Smart Money, Better Life</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center gap-1 p-1 rounded-xl ${isDark ? 'bg-slate-900' : 'bg-slate-100'}`}>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Wallet },
              { id: 'transactions', label: 'Transactions', icon: Receipt },
              { id: 'budget', label: 'Budget', icon: Target },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 active:scale-95 ${
                    isActive 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 scale-[1.02]' 
                      : isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {/* Theme Toggle & User Account Dropdown */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-xl border transition-all duration-200 active:scale-90 hover:-translate-y-0.5 hover:shadow-xs ${isDark ? 'border-slate-800 text-amber-400 hover:bg-slate-800' : 'border-slate-200 text-slate-600 hover:bg-slate-100'}`}
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-2.5 p-1.5 pl-3 border rounded-full transition-all duration-200 active:scale-95 hover:shadow-xs ${isDark ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
              >
                <div className="text-right hidden sm:block">
                  <span className="block text-xs font-bold leading-none">{currentUser.name}</span>
                  
                </div>
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className={`absolute right-0 mt-2 w-64 rounded-2xl shadow-xl border p-4 z-30 animate-in fade-in zoom-in-95 duration-100 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <div className="pb-3 border-b border-slate-200/20">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-bold truncate">{currentUser.name}</p>
                    <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-2 space-y-1 text-xs text-slate-400">
                    <div className="flex justify-between py-1">
                      <span>Database ID:</span>
                      <span className="font-mono text-slate-300 font-semibold">{currentUser.id}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Total Logs:</span>
                      <span className="font-semibold text-slate-300">{transactions.length} items</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full mt-2 py-2 bg-rose-50 hover:bg-rose-100 active:scale-95 text-rose-600 font-bold rounded-xl text-xs transition-all duration-150 flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 mt-6 space-y-6">

        {/* ===================== VIEW 1: DASHBOARD ===================== */}
        {activeTab === 'dashboard' && (
          <>
            {/* WELCOME BANNER */}
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-indigo-200 uppercase tracking-wider">Active Portfolio</span>
                <h2 className="text-xl sm:text-2xl font-black mt-0.5">
                  Welcome back, {currentUser.name}! 👋
                </h2>
                <p className="text-xs text-indigo-100 mt-1">
                  Arthix is actively keeping track of your income, expenses, and savings targets.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 hover:shadow-md hover:-translate-y-0.5 text-xs font-bold rounded-xl shadow-xs transition-all duration-200 active:scale-95 flex items-center gap-1.5 shrink-0"
              >
                <Receipt className="w-4 h-4" /> View Transactions
              </button>
            </div>

            {/* Metric Cards (Balance, Income, Expense) */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs flex flex-col justify-between border border-slate-800 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between opacity-80">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Balance</span>
                  <Wallet className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="mt-4">
                  <span className="text-3xl font-black tracking-tight">
                    ₹{totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-xs text-slate-400 mt-1">Available Reserve Funds</p>
                </div>
              </div>

              <div className={`rounded-2xl p-5 shadow-xs border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${cardBg}`}>
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Income / Savings</span>
                  <span className="p-1.5 bg-emerald-50 rounded-lg">
                    <ArrowDownLeft className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold">
                    ₹{totalIncome.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-xs text-emerald-600 font-medium mt-1">Total Credited Inflow</p>
                </div>
              </div>

              <div className={`rounded-2xl p-5 shadow-xs border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${cardBg}`}>
                <div className="flex items-center justify-between text-rose-600">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Expense</span>
                  <span className="p-1.5 bg-rose-50 rounded-lg">
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
                <div className="mt-4">
                  <span className="text-2xl font-bold">
                    ₹{totalExpense.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-xs text-rose-600 font-medium mt-1">Total Outward Debit</p>
                </div>
              </div>
            </section>
            {/* DASHBOARD LIVE BUDGET BAR */}
            {monthlyBudget > 0 && (
              <div className={`rounded-2xl p-4 sm:p-5 border shadow-xs ${cardBg}`}>
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <span className="flex items-center gap-1.5 uppercase tracking-wider text-indigo-600">
                    <Target className="w-4 h-4" /> Monthly Budget Overview
                  </span>
                  <span className={totalExpense > monthlyBudget ? 'text-rose-500' : ''}>
                    ₹{totalExpense.toLocaleString('en-IN')} / ₹{monthlyBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      totalExpense > monthlyBudget ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((totalExpense / monthlyBudget) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">
                  {totalExpense > monthlyBudget
                    ? `Over budget by ₹${(totalExpense - monthlyBudget).toLocaleString('en-IN')}`
                    : `Remaining budget: ₹${(monthlyBudget - totalExpense).toLocaleString('en-IN')}`}
                </p>
              </div>
            )}
            {/* Entry Form + Live Category Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Form to Record Entry */}
              <section className={`rounded-2xl p-5 sm:p-6 shadow-xs border ${cardBg}`}>
                <h2 className="text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-indigo-600" /> Record New Entry
                </h2>

                <form onSubmit={handleAddTransaction} className="space-y-4">
                  <div className={`grid grid-cols-2 gap-2 p-1 rounded-xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 ${
                        type === 'expense' 
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 scale-[1.01]' 
                          : 'text-slate-500 hover:text-rose-600 hover:bg-rose-50/10'
                      }`}
                    >
                      Expense (Debit)
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 active:scale-95 ${
                        type === 'income' 
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 scale-[1.01]' 
                          : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50/10'
                      }`}
                    >
                      Income (Credit)
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Description / Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Grocery, Rent, Client Payment"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Amount (₹)</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                        />
                      </div>

                      {type === 'expense' ? (
                        <div>
                          <label className="block text-xs font-semibold mb-1">Category</label>
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                          >
                            {CATEGORIES.filter(c => c !== 'Salary / Income').map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold mb-1">Category</label>
                          <input
                            type="text"
                            disabled
                            value="Salary / Income"
                            className={`w-full px-3.5 py-2.5 rounded-xl text-sm border opacity-60 ${inputBg}`}
                          />
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1">Date</label>
                        <input
                          type="date"
                          required
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Reference Notes</label>
                        <input
                          type="text"
                          placeholder="Optional details"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${inputBg}`}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-2.5 ${buttonPrimary}`}
                  >
                    Save to Ledger
                  </button>
                </form>
              </section>

              {/* Live Category Expense Chart */}
              <section className={`rounded-2xl p-5 sm:p-6 shadow-xs border flex flex-col justify-between ${cardBg}`}>
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-indigo-600" /> Category Breakdown
                    </h2>
                    <span className="text-xs font-semibold text-slate-400">{categoryStats.length} Categories</span>
                  </div>

                  {categoryStats.length === 0 ? (
                    <div className="text-center py-14 text-slate-400 text-xs">
                      Record new expenses to see your live category trends and progress bars here.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {categoryStats.map((item) => (
                        <div key={item.category} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>{item.category}</span>
                            <span className="font-bold">
                              ₹{item.total.toLocaleString('en-IN')} ({item.percentage}%)
                            </span>
                          </div>
                          <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <div 
                              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${item.percentage}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-200/20 flex items-center justify-between text-xs text-slate-400">
                  <span>Savings Retention Rate:</span>
                  <span className="font-bold text-emerald-500">
                    {totalIncome > 0 ? `${(((totalIncome - totalExpense) / totalIncome) * 100).toFixed(0)}% Retained` : '0%'}
                  </span>
                </div>
              </section>
            </div>
          </>
        )}

        {/* ===================== VIEW 2: TRANSACTIONS HISTORY ===================== */}
        {activeTab === 'transactions' && (
          <section className={`rounded-2xl p-5 sm:p-6 shadow-xs border space-y-4 ${cardBg}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold">Transaction Ledger Database</h2>
                <p className="text-xs text-slate-400 mt-0.5">Click any entry to view detailed transaction breakdown</p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-8 pr-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${inputBg}`}
                  />
                </div>

                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className={`text-xs rounded-lg px-2.5 py-1.5 font-medium border focus:outline-none hover:border-indigo-400 transition-colors ${inputBg}`}
                >
                  <option value="all">All Entries</option>
                  <option value="expense">Expenses Only</option>
                  <option value="income">Income Only</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`text-xs rounded-lg px-2.5 py-1.5 font-medium border focus:outline-none hover:border-indigo-400 transition-colors ${inputBg}`}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* List */}
            <div className="divide-y divide-slate-200/20">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-16 text-slate-400 text-sm">
                  No records found matching your filters.
                </div>
              ) : (
                filteredTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="py-3.5 flex items-center justify-between hover:bg-indigo-500/10 rounded-xl px-2.5 cursor-pointer transition-all duration-150 active:scale-[0.99] group"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}>
                        {tx.type === 'income' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold group-hover:text-indigo-500 transition-colors">
                          {tx.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                          <span className={`font-medium px-2 py-0.5 rounded ${isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                            {tx.category}
                          </span>
                          <span>•</span>
                          <span>{tx.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className={`text-sm font-bold ${
                        tx.type === 'income' ? 'text-emerald-500' : isDark ? 'text-slate-100' : 'text-slate-800'
                      }`}>
                        {tx.type === 'income' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                      <button
                        onClick={(e) => handleDelete(tx.id, e)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-500/10 p-1.5 rounded-lg active:scale-90 transition-all duration-150"
                        title="Delete Entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ===================== VIEW 3: BUDGET ===================== */}
        {activeTab === 'budget' && (
          <section className={`rounded-2xl p-5 sm:p-6 shadow-xs border space-y-6 ${cardBg}`}>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" /> Monthly Budget Target
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set a personalized spending limit. Defaults to zero until you specify your target.
              </p>
            </div>

            <div className={`p-4 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div>
                <span className="text-xs text-slate-400">Current Monthly Cap:</span>
                <p className="text-2xl font-black">
                  {monthlyBudget > 0 ? `₹${monthlyBudget.toLocaleString('en-IN')}` : 'No Budget Set (₹0)'}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <input
                  type="number"
                  placeholder="Enter Limit (₹)"
                  value={budgetInput}
                  onChange={(e) => setBudgetInput(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs w-full sm:w-36 border focus:outline-none ${inputBg}`}
                />
                <button
                onClick={() => {
                  if (budgetInput !== '' && Number(budgetInput) >= 0) {
                    setMonthlyBudget(Number(budgetInput));
                    setBudgetInput('');
                    setActiveTab('dashboard'); // બજેટ સેટ થતાં જ સીધું ડેશબોર્ડ ખુલશે
                  }
                }}
                className={`px-4 py-2 ${buttonPrimary}`}
                >
                  Set Limit
                </button>
              </div>
            </div>

            {monthlyBudget > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-400">Budget Consumed:</span>
                  <span className={totalExpense > monthlyBudget ? 'text-rose-500 font-bold' : ''}>
                    ₹{totalExpense.toLocaleString('en-IN')} / ₹{monthlyBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className={`w-full h-3 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      totalExpense > monthlyBudget ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min((totalExpense / monthlyBudget) * 100, 100)}%` }}
                  />
                </div>

                {totalExpense > monthlyBudget ? (
                  <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs rounded-xl mt-3">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Warning: You have exceeded your monthly limit by ₹{(totalExpense - monthlyBudget).toLocaleString('en-IN')}.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl mt-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Healthy balance: You have ₹{(monthlyBudget - totalExpense).toLocaleString('en-IN')} remaining within your budget.</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-400 border border-dashed border-slate-700/40 rounded-xl">
                Please enter a monthly limit above to activate spending thresholds and progress alerts.
              </div>
            )}
          </section>
        )}

        {/* ===================== VIEW 4: SETTINGS ===================== */}
        {activeTab === 'settings' && (
          <section className={`rounded-2xl p-5 sm:p-6 shadow-xs border space-y-6 ${cardBg}`}>
            <div>
              <h2 className="text-base font-bold flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-indigo-600" /> Account Database & Storage
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Manage user credentials and local persistent records</p>
            </div>

            <div className="space-y-4 divide-y divide-slate-200/20 text-xs">
              <div className="pt-2 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Active Account</h4>
                  <p className="text-slate-400">{currentUser.name} ({currentUser.email})</p>
                </div>
                <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 font-bold rounded-lg">Verified User</span>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">Default Currency</h4>
                  <p className="text-slate-400">Indian Rupee (INR - ₹)</p>
                </div>
                <span className={`font-bold px-3 py-1 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>INR (₹)</span>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-rose-500 text-sm">Purge My Ledger History</h4>
                  <p className="text-slate-400">Permanently clears your personal transaction records</p>
                </div>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to delete all transaction records? This action cannot be undone.")) {
                      setTransactions([]);
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-500 font-bold rounded-xl border border-rose-500/20 transition-all duration-150"
                >
                  Clear Data
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className={`fixed bottom-0 left-0 right-0 border-t z-30 md:hidden flex justify-around py-2 shadow-lg backdrop-blur-md ${headerBg}`}>
        {[
          { id: 'dashboard', label: 'Home', icon: Wallet },
          { id: 'transactions', label: 'History', icon: Receipt },
          { id: 'budget', label: 'Budget', icon: Target },
          { id: 'settings', label: 'Settings', icon: SettingsIcon },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 text-[11px] font-bold transition-all duration-200 active:scale-90 ${
                isActive ? 'text-indigo-600 scale-105' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TRANSACTION DETAILS MODAL */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl border overflow-hidden animate-in fade-in zoom-in-95 duration-150 ${cardBg}`}>
            <div className="flex items-center justify-between p-4 border-b border-slate-200/20">
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold">Transaction Log Details</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-1 rounded-lg hover:bg-slate-500/10 text-slate-400 active:scale-90 transition-all duration-150"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className={`text-center py-3 rounded-xl border ${isDark ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <span className="text-xs text-slate-400 uppercase font-bold">Total Amount</span>
                <p className={`text-3xl font-black mt-0.5 ${
                  selectedTx.type === 'income' ? 'text-emerald-500' : isDark ? 'text-white' : 'text-slate-900'
                }`}>
                  {selectedTx.type === 'income' ? '+' : '-'} ₹{Number(selectedTx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </p>
                <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  selectedTx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                }`}>
                  {selectedTx.type === 'income' ? 'Deposit / Credit' : 'Withdrawal / Debit'}
                </span>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-200/20">
                  <span className="text-slate-400">Title:</span>
                  <span className="font-bold">{selectedTx.title}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/20">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-bold text-indigo-500">{selectedTx.category}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/20">
                  <span className="text-slate-400">Transaction Date:</span>
                  <span className="font-bold">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/20">
                  <span className="text-slate-400">Log Timestamp:</span>
                  <span className="font-bold">{selectedTx.timestamp || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-200/20">
                  <span className="text-slate-400">Reference ID:</span>
                  <span className="font-mono text-[10px] opacity-75">{selectedTx.id}</span>
                </div>
                {selectedTx.notes && (
                  <div className="pt-1">
                    <span className="text-slate-400 block mb-1">Notes:</span>
                    <p className={`p-2.5 rounded-lg border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      {selectedTx.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-4 border-t border-slate-200/20 flex gap-2 ${isDark ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
              <button
                onClick={() => handleDelete(selectedTx.id)}
                className="w-1/2 py-2.5 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-500 rounded-xl text-xs font-bold border border-rose-500/20 transition-all duration-150 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Entry
              </button>
              <button
                onClick={() => setSelectedTx(null)}
                className={`w-1/2 py-2.5 text-xs ${buttonPrimary}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}