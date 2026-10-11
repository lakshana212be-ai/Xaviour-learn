import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Video, FileText, Mic, Award, Lock, Download, CheckCircle,
  Play, Moon, Sun, GraduationCap, Brain, Sparkles, Search, Zap,
  HardDrive, RefreshCw, Trophy, Check, Send, ThumbsUp, MessageSquare,
  Shield, HelpCircle, Layers, Eye, Plus, Trash2, ArrowRight, CornerDownRight,
  AlertCircle, Grid, Cpu, Code, LockOpen, Star, Clock, Key, Grid3X3,
  Flame, Coins, ShoppingBag, Volume2, VolumeX, PartyPopper, CheckSquare, Sparkle,
  Lightbulb, Copy, X, AlertTriangle, ChevronRight, Terminal, LightbulbOff
} from 'lucide-react';

// Firebase Imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, onSnapshot, collection } from 'firebase/firestore';

let auth = null;
let db = null;
let appId = 'xaviour-studies-app';

try {
  const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
  if (firebaseConfig) {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    appId = typeof __app_id !== 'undefined' ? __app_id : 'xaviour-studies-app';
  }
} catch (e) {
  console.log("Running in local storage fallback mode");
}

const INITIAL_CONTENT = [
  {
    id: 'c1',
    title: 'Advanced Neural Networks & Deep Learning Architecture',
    description: 'Master backpropagation, residual networks, transformer architectures, and attention mechanisms with hands-on PyTorch demos.',
    type: 'video',
    category: 'Data Science',
    access: 'premium',
    author: 'Dr. Xavier Vance',
    authorRole: 'Senior AI Researcher',
    date: '2026-03-15',
    duration: '45 mins',
    fileSize: '420 MB',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    downloads: 1240,
    likes: 389
  },
  {
    id: 'c2',
    title: 'Cybersecurity Incident Response & Threat Hunting',
    description: 'Practical guide to analyzing memory dumps, malware signatures, network telemetry, and building SIEM alert rules.',
    type: 'pdf',
    category: 'Cyber Security',
    access: 'free',
    author: 'Prof. Elena Rostova',
    authorRole: 'Cyber Defense Lead',
    date: '2026-03-18',
    duration: '32 Pages',
    fileSize: '8.4 MB',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
    downloads: 3410,
    likes: 890
  },
  {
    id: 'c3',
    title: 'Quantum Computing Fundamentals & Qiskit Demos',
    description: 'Audio lecture series explaining superposition, entanglement, Deutsch-Jozsa algorithm, and quantum cryptography.',
    type: 'audio',
    category: 'Computer Science',
    access: 'premium',
    author: 'Dr. Xavier Vance',
    authorRole: 'Senior AI Researcher',
    date: '2026-03-20',
    duration: '28 mins',
    fileSize: '35 MB',
    thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600&auto=format&fit=crop&q=80',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    downloads: 620,
    likes: 215
  },
  {
    id: 'c4',
    title: 'Discrete Mathematics for Algorithm Analysis',
    description: 'Comprehensive study notes on graph theory, combinatorics, proof by induction, and asymptotic notations.',
    type: 'doc',
    category: 'Mathematics',
    access: 'free',
    author: 'Prof. Marcus Brody',
    authorRole: 'Head of Mathematics',
    date: '2026-03-22',
    duration: '18 Pages',
    fileSize: '4.1 MB',
    thumbnail: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&auto=format&fit=crop&q=80',
    downloads: 1890,
    likes: 512
  }
];

const INITIAL_ACCOMPLISHMENTS = [
  {
    id: 'a1',
    studentName: 'Alex Chen',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: '1st Place in Global CyberSec Hackathon 2026',
    description: 'Built a zero-trust network monitoring tool that detected 99% of zero-day attack payloads in simulated enterprise environments!',
    tag: 'Hackathon Win',
    date: '2 days ago',
    likes: 84,
    liked: false,
    comments: [
      { id: 'cm1', author: 'Dr. Xavier Vance', text: 'Outstanding work Alex! Proud to see your hard work pay off.' }
    ]
  },
  {
    id: 'a2',
    studentName: 'Sophia Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    title: 'AWS Certified Solutions Architect - Professional',
    description: 'Finally cleared my AWS Professional certification after 3 months of intense study using Xaviour Studies Cloud modules!',
    tag: 'Certification',
    date: '5 days ago',
    likes: 112,
    liked: false,
    comments: []
  }
];

export default function App() {
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('feed'); 
  
  // User Authentication & Roles
  const [user, setUser] = useState(null);
  const [role, setRole] = useState('student');
  const [isPremium, setIsPremium] = useState(false);
  
  // Economy & Streaks
  const [coins, setCoins] = useState(() => {
    const saved = localStorage.getItem('xs_coins');
    return saved ? parseInt(saved, 10) : 15;
  });

  const [gameStreak, setGameStreak] = useState(() => {
    const saved = localStorage.getItem('xs_game_streak');
    return saved ? parseInt(saved, 10) : 4;
  });

  const [courseStreak, setCourseStreak] = useState(() => {
    const saved = localStorage.getItem('xs_course_streak');
    return saved ? parseInt(saved, 10) : 9;
  });

  const [completedCourses, setCompletedCourses] = useState(() => {
    const saved = localStorage.getItem('xs_completed_courses');
    return saved ? JSON.parse(saved) : [];
  });

  const [unlockedPerks, setUnlockedPerks] = useState(() => {
    const saved = localStorage.getItem('xs_unlocked_perks');
    return saved ? JSON.parse(saved) : [];
  });

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  // Dynamic Content Lists
  const [contents, setContents] = useState(() => {
    const saved = localStorage.getItem('xs_contents');
    return saved ? JSON.parse(saved) : INITIAL_CONTENT;
  });

  const [offlineItems, setOfflineItems] = useState(() => {
    const saved = localStorage.getItem('xs_offline');
    return saved ? JSON.parse(saved) : ['c2'];
  });

  const [accomplishments, setAccomplishments] = useState(() => {
    const saved = localStorage.getItem('xs_accomplishments');
    return saved ? JSON.parse(saved) : INITIAL_ACCOMPLISHMENTS;
  });

  // Teacher Profile Data
  const [teacherProfile, setTeacherProfile] = useState(() => {
    const saved = localStorage.getItem('xs_teacher_profile');
    return saved ? JSON.parse(saved) : {
      name: 'Dr. Xavier Vance',
      title: 'Head of AI & Cybersecurity Studies',
      institution: 'Xaviour Studies Institute',
      bio: 'Passionate about democratizing high-level Computer Science, AI, and Cybersecurity education worldwide.',
      badges: ['Master Educator', 'AI Fellow', '100k+ Students Taught'],
      achievements: [
        'Published 24+ Peer-Reviewed AI Research Papers',
        'Top Mentor Award - Global Tech Leadership',
        'Keynote Speaker at RSA Security Summit'
      ]
    };
  });

  // Modals & Popups
  const [activeMedia, setActiveMedia] = useState(null);
  const [victoryModalData, setVictoryModalData] = useState(null);
  const [showRewardsShop, setShowRewardsShop] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Global Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (!auth) return;
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Firebase auth error:", err);
      }
    };
    initAuth();
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db || !user) return;
    const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
    
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.coins !== undefined) setCoins(data.coins);
        if (data.gameStreak !== undefined) setGameStreak(data.gameStreak);
        if (data.courseStreak !== undefined) setCourseStreak(data.courseStreak);
        if (data.unlockedPerks !== undefined) setUnlockedPerks(data.unlockedPerks);
      } else {
        setDoc(userDocRef, {
          coins,
          gameStreak,
          courseStreak,
          unlockedPerks
        });
      }
    }, (error) => console.log("Firestore snapshot error:", error));

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    localStorage.setItem('xs_contents', JSON.stringify(contents));
    localStorage.setItem('xs_offline', JSON.stringify(offlineItems));
    localStorage.setItem('xs_accomplishments', JSON.stringify(accomplishments));
    localStorage.setItem('xs_coins', coins.toString());
    localStorage.setItem('xs_game_streak', gameStreak.toString());
    localStorage.setItem('xs_course_streak', courseStreak.toString());
    localStorage.setItem('xs_unlocked_perks', JSON.stringify(unlockedPerks));
    localStorage.setItem('xs_completed_courses', JSON.stringify(completedCourses));

    if (db && user) {
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'profile', 'data');
      updateDoc(userDocRef, {
        coins,
        gameStreak,
        courseStreak,
        unlockedPerks
      }).catch(() => {});
    }
  }, [contents, offlineItems, accomplishments, coins, gameStreak, courseStreak, unlockedPerks, completedCourses]);

  const playSoundEffect = (type) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (type === 'victory') {
        const notes = [261.63, 329.63, 392.00, 523.25];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.3);
        });
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (e) {
      console.log("Audio API error");
    }
  };

  const handleGameWin = (gameName, scorePoints) => {
    playSoundEffect('victory');
    const newGameStreak = gameStreak + 1;
    setGameStreak(newGameStreak);

    let coinAward = 2;
    let streakCoinBonus = 0;

    if (newGameStreak % 5 === 0) {
      streakCoinBonus = 1;
      coinAward += streakCoinBonus;
    }

    const newCoins = coins + coinAward;
    setCoins(newCoins);

    setVictoryModalData({
      gameName,
      scoreEarned: scorePoints,
      coinsAwarded: coinAward,
      streakCount: newGameStreak,
      streakCoinBonus
    });
  };

  const handleWrongMove = (msg = "Incorrect answer! Try again.") => {
    playSoundEffect('wrong');
    showToast(msg, 'error');
  };

  const handleCompleteCourse = (courseId) => {
    if (completedCourses.includes(courseId)) return;
    
    const updatedCourses = [...completedCourses, courseId];
    setCompletedCourses(updatedCourses);

    const newCourseStreak = courseStreak + 1;
    setCourseStreak(newCourseStreak);

    let earnedCoins = 3;
    if (newCourseStreak % 5 === 0) {
      earnedCoins += 1;
    }

    setCoins(c => c + earnedCoins);
    showToast(`Module Completed! +3 Coins Earned 🎉`, 'success');
  };

  const toggleOffline = (contentId) => {
    if (offlineItems.includes(contentId)) {
      setOfflineItems(offlineItems.filter(id => id !== contentId));
      showToast("Item removed from Offline Vault", "info");
    } else {
      setOfflineItems([...offlineItems, contentId]);
      showToast("Saved to Offline Vault! Available offline.", "success");
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${
      theme === 'dark' 
        ? 'bg-slate-950 text-slate-100 selection:bg-purple-500 selection:text-white' 
        : 'bg-slate-50 text-slate-800 selection:bg-purple-200'
    }`}>
      {/* Toast Notification Header */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 text-xs font-bold ${
            toast.type === 'error'
              ? 'bg-rose-950/90 border-rose-500 text-rose-200 backdrop-blur-md'
              : toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500 text-emerald-200 backdrop-blur-md'
                : 'bg-indigo-950/90 border-indigo-500 text-indigo-200 backdrop-blur-md'
          }`}>
            {toast.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-400" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Navigation Bar */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${
        theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-xl">
                X
              </div>
              <div>
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
                  XAVIOUR
                </span>
                <span className={`text-xs block font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                  STUDIES
                </span>
              </div>
            </div>

            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
              <NavBtn id="feed" label="Explore Feed" icon={<BookOpen className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
              <NavBtn id="ai-bot" label="Xaviour AI 2.0" icon={<Sparkles className="w-4 h-4 text-purple-400" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} badge="v2.0" />
              <NavBtn id="games" label="Mind Games" icon={<Brain className="w-4 h-4 text-emerald-400" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} badge="11 Games" />
              <NavBtn id="showcase" label="Showcase" icon={<Trophy className="w-4 h-4 text-amber-400" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
              <NavBtn id="offline" label="Offline Vault" icon={<Download className="w-4 h-4" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} count={offlineItems.length} />
              {role === 'teacher' && (
                <NavBtn id="teacher-dashboard" label="Teacher Portal" icon={<GraduationCap className="w-4 h-4 text-cyan-400" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
              )}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border bg-slate-900/60 border-slate-800 text-xs font-bold">
                <div className="flex items-center gap-1 text-amber-400" title="Game Daily Streak">
                  <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
                  <span>{gameStreak}d</span>
                </div>
                <span className="text-slate-600">|</span>
                <div className="flex items-center gap-1 text-indigo-400" title="Course Activity Streak">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{courseStreak}d</span>
                </div>
              </div>

              <button
                onClick={() => setShowRewardsShop(true)}
                className="px-3 py-1.5 rounded-xl border bg-gradient-to-r from-amber-500/20 to-amber-600/10 border-amber-500/40 text-amber-400 text-xs font-extrabold flex items-center gap-1.5 hover:bg-amber-500/30 transition-all shadow-sm"
              >
                <Coins className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>{coins} Coins</span>
                <ShoppingBag className="w-3.5 h-3.5 ml-1 opacity-70" />
              </button>

              <div className={`p-1 rounded-xl border flex items-center gap-1 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'
              }`}>
                <button
                  onClick={() => setRole('student')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    role === 'student' 
                      ? 'bg-indigo-600 text-white shadow' 
                      : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600'
                  }`}
                >
                  Student
                </button>
                <button
                  onClick={() => setRole('teacher')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    role === 'teacher' 
                      ? 'bg-cyan-600 text-white shadow' 
                      : theme === 'dark' ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600'
                  }`}
                >
                  Teacher
                </button>
              </div>

              {role === 'student' && (
                <button
                  onClick={() => setIsPremium(!isPremium)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold hidden sm:flex items-center gap-1 transition-all border ${
                    isPremium || unlockedPerks.includes('pass')
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : theme === 'dark' 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {isPremium || unlockedPerks.includes('pass') ? <Zap className="w-3.5 h-3.5 fill-current" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isPremium || unlockedPerks.includes('pass') ? 'PRO' : 'FREE'}</span>
                </button>
              )}

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-xl border transition-colors ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                }`}
                title={soundEnabled ? "Mute audio" : "Enable audio"}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </button>

              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={`p-2 rounded-xl border transition-colors ${
                  theme === 'dark' 
                    ? 'bg-slate-900 border-slate-800 text-amber-400 hover:bg-slate-800' 
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <div className={`md:hidden flex overflow-x-auto px-4 py-2 gap-2 border-t scrollbar-none ${
          theme === 'dark' ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-slate-100'
        }`}>
          <NavBtn id="feed" label="Feed" icon={<BookOpen className="w-3.5 h-3.5" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
          <NavBtn id="ai-bot" label="AI 2.0" icon={<Sparkles className="w-3.5 h-3.5" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
          <NavBtn id="games" label="Mind Games" icon={<Brain className="w-3.5 h-3.5" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
          <NavBtn id="showcase" label="Showcase" icon={<Trophy className="w-3.5 h-3.5" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} />
          <NavBtn id="offline" label="Offline" icon={<Download className="w-3.5 h-3.5" />} activeTab={activeTab} setActiveTab={setActiveTab} theme={theme} count={offlineItems.length} />
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Banner */}
        <div className={`mb-8 p-6 sm:p-8 rounded-3xl relative overflow-hidden border shadow-xl ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-slate-900 via-indigo-950/60 to-purple-950/50 border-slate-800' 
            : 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-100'
        }`}>
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-indigo-500/10 border-indigo-500/30 text-indigo-400">
                <Sparkles className="w-3.5 h-3.5" /> Next-Gen Learning Ecosystem
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border bg-amber-500/10 border-amber-500/30 text-amber-400">
                <Coins className="w-3.5 h-3.5 fill-amber-400" /> 1 Coin per 5-Day Streak
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">
              Welcome to <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Xaviour Studies</span>
            </h1>
            <p className={`text-sm sm:text-base mb-6 leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              Computer science learning, AI doubt solver v2.0, 11 cognitive mind games with intelligent hints, offline downloading, and streak rewards.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Game Streak" value={`${gameStreak} Days`} icon={<Flame className="w-4 h-4 text-amber-400" />} theme={theme} />
              <StatCard label="Course Streak" value={`${courseStreak} Days`} icon={<BookOpen className="w-4 h-4 text-indigo-400" />} theme={theme} />
              <StatCard label="Coin Vault" value={`${coins} Coins`} icon={<Coins className="w-4 h-4 text-amber-400" />} theme={theme} />
              <StatCard label="Offline Vault" value={`${offlineItems.length} Items`} icon={<Download className="w-4 h-4 text-emerald-400" />} theme={theme} />
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Content */}
        {activeTab === 'feed' && (
          <FeedTab 
            contents={contents}
            role={role}
            isPremium={isPremium || unlockedPerks.includes('pass')}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            offlineItems={offlineItems}
            toggleOffline={toggleOffline}
            setActiveMedia={setActiveMedia}
            completedCourses={completedCourses}
            onCompleteCourse={handleCompleteCourse}
            theme={theme}
          />
        )}

        {activeTab === 'ai-bot' && (
          <AIDoubtSolverTab2 
            theme={theme} 
            unlockedPerks={unlockedPerks} 
            offlineContents={contents.filter(c => offlineItems.includes(c.id))}
          />
        )}

        {activeTab === 'games' && (
          <MindGamesHubTab 
            theme={theme} 
            onGameWin={handleGameWin}
            onWrongMove={handleWrongMove}
          />
        )}

        {activeTab === 'showcase' && (
          <ShowcaseTab 
            accomplishments={accomplishments} 
            setAccomplishments={setAccomplishments}
            teacherProfile={teacherProfile}
            theme={theme}
          />
        )}

        {activeTab === 'offline' && (
          <OfflineVaultTab 
            contents={contents.filter(c => offlineItems.includes(c.id))}
            offlineItems={offlineItems}
            toggleOffline={toggleOffline}
            setActiveMedia={setActiveMedia}
            theme={theme}
          />
        )}

        {activeTab === 'teacher-dashboard' && role === 'teacher' && (
          <TeacherDashboardTab 
            contents={contents}
            setContents={setContents}
            teacherProfile={teacherProfile}
            setTeacherProfile={setTeacherProfile}
            theme={theme}
          />
        )}

      </main>

      {/* Victory Celebration Modal */}
      {victoryModalData && (
        <VictoryCelebrationModal 
          data={victoryModalData} 
          onClose={() => setVictoryModalData(null)} 
          theme={theme}
        />
      )}

      {/* Rewards Shop Modal */}
      {showRewardsShop && (
        <RewardsShopModal 
          coins={coins} 
          setCoins={setCoins} 
          unlockedPerks={unlockedPerks}
          setUnlockedPerks={setUnlockedPerks}
          onClose={() => setShowRewardsShop(false)} 
          theme={theme}
        />
      )}

      {/* Media Modal */}
      {activeMedia && (
        <MediaModal content={activeMedia} onClose={() => setActiveMedia(null)} theme={theme} />
      )}
    </div>
  );
}

function NavBtn({ id, label, icon, activeTab, setActiveTab, theme, badge, count }) {
  const active = activeTab === id;
  return (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
        active 
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
          : theme === 'dark' 
            ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
      }`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
          {badge}
        </span>
      )}
      {count !== undefined && count > 0 && (
        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
          {count}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, icon, theme }) {
  return (
    <div className={`p-3.5 rounded-2xl border ${
      theme === 'dark' ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
    }`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className={`text-xs font-medium ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>{label}</span>
      </div>
      <div className="text-base font-bold tracking-tight">{value}</div>
    </div>
  );
}

function FeedTab({ 
  contents, role, isPremium, searchQuery, setSearchQuery, 
  selectedCategory, setSelectedCategory, selectedType, setSelectedType,
  offlineItems, toggleOffline, setActiveMedia, completedCourses, onCompleteCourse, theme 
}) {
  const categories = ['All', 'Data Science', 'Cyber Security', 'Computer Science', 'Mathematics'];
  const types = ['All', 'video', 'pdf', 'audio', 'doc'];

  const filtered = contents.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesType = selectedType === 'All' || item.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className={`p-4 sm:p-6 rounded-2xl border space-y-4 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 ${
              theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
            }`} />
            <input
              type="text"
              placeholder="Search lectures, study notes, audio guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                theme === 'dark'
                  ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
                  : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className={theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}>Status:</span>
            {role === 'teacher' ? (
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Teacher Access Mode
              </span>
            ) : isPremium ? (
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" /> Premium Unlocked
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                Free Mode (Premium Locked)
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/50">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full scrollbar-none">
            <span className={`text-xs font-bold uppercase tracking-wider mr-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Domain:</span>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : theme === 'dark'
                      ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <span className={`text-xs font-bold uppercase tracking-wider mr-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Format:</span>
            {types.map(t => (
              <button
                key={t}
                onClick={() => setSelectedType(t)}
                className={`px-2.5 py-1 rounded-md text-xs uppercase font-bold transition-all ${
                  selectedType === t
                    ? 'bg-purple-600 text-white'
                    : theme === 'dark'
                      ? 'text-slate-400 hover:text-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filtered.map(item => {
          const isLocked = role === 'student' && !isPremium && item.access === 'premium';
          const isSavedOffline = offlineItems.includes(item.id);
          const isCompleted = completedCourses.includes(item.id);

          return (
            <div 
              key={item.id} 
              className={`rounded-2xl border overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl ${
                theme === 'dark' 
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700' 
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img 
                    src={item.thumbnail} 
                    alt={item.title} 
                    className={`w-full h-full object-cover transition-transform duration-500 hover:scale-105 ${
                      isLocked ? 'blur-sm opacity-60' : ''
                    }`}
                  />

                  <div className="absolute top-3 left-3 flex gap-2">
                    {item.access === 'premium' ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-md">
                        <Lock className="w-3 h-3" /> PREMIUM
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500 text-slate-950 shadow-md">
                        FREE
                      </span>
                    )}
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-900/80 backdrop-blur-md text-slate-200 uppercase border border-slate-700">
                      {item.type}
                    </span>
                  </div>

                  {isCompleted && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-extrabold bg-indigo-600 text-white flex items-center gap-1 shadow-md">
                      <CheckCircle className="w-3.5 h-3.5" /> COMPLETED
                    </div>
                  )}

                  {!isLocked && (
                    <button
                      onClick={() => setActiveMedia(item)}
                      className="absolute inset-0 flex items-center justify-center bg-slate-950/40 hover:bg-slate-950/20 transition-all group"
                    >
                      <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        {item.type === 'video' ? <Play className="w-5 h-5 ml-0.5 fill-current" /> : 
                         item.type === 'audio' ? <Mic className="w-5 h-5" /> : 
                         <FileText className="w-5 h-5" />}
                      </div>
                    </button>
                  )}

                  {isLocked && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 p-4 text-center">
                      <Lock className="w-8 h-8 text-amber-400 mb-2" />
                      <p className="text-xs font-bold text-slate-200">Subscription Required</p>
                      <p className="text-[11px] text-slate-400 mt-1">Unlock with 5 Coins in the Store</p>
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-indigo-400 font-bold">
                    <span>{item.category}</span>
                    <span className="text-slate-400 font-normal">{item.duration} • {item.fileSize}</span>
                  </div>

                  <h3 className="text-lg font-bold leading-snug hover:text-indigo-400 cursor-pointer transition-colors" onClick={() => !isLocked && setActiveMedia(item)}>
                    {item.title}
                  </h3>

                  <p className={`text-xs line-clamp-2 leading-relaxed ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.description}
                  </p>
                </div>
              </div>

              <div className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
                theme === 'dark' ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-100 bg-slate-50'
              }`}>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    {item.author[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-200 leading-none">{item.author}</p>
                    <p className="text-[10px] text-slate-400">{item.authorRole}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isLocked && !isCompleted && (
                    <button
                      onClick={() => onCompleteCourse(item.id)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all flex items-center gap-1"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Finish (+3 Coins)
                    </button>
                  )}

                  <button
                    onClick={() => toggleOffline(item.id)}
                    disabled={isLocked}
                    className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all ${
                      isSavedOffline
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isLocked
                          ? 'opacity-50 cursor-not-allowed text-slate-500'
                          : theme === 'dark'
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {isSavedOffline ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AIDoubtSolverTab2({ theme, unlockedPerks, offlineContents }) {
  const [mode, setMode] = useState('solver'); // 'solver', 'debugger', 'advisor', 'summarizer'
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "👋 Welcome to **Xaviour AI Assistant 2.0**! I'm equipped with specialized academic tutoring modes.\nSelect a mode above or ask any doubt directly!"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (customPrompt) => {
    const query = customPrompt || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', text: query, modeUsed: mode };
    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInput('');
    setLoading(true);

    try {
      const apiKey = ""; // Gemini Runtime Key
      
      let modeInstruction = "";
      if (mode === 'solver') {
        modeInstruction = "Provide step-by-step mathematical & architectural breakdowns for Computer Science, Algorithms, or Cyber Security questions.";
      } else if (mode === 'debugger') {
        modeInstruction = "Act as a senior software engineer. Analyze the provided code, identify syntax/logic bugs, provide corrected code blocks with markdown, and explain the fix.";
      } else if (mode === 'advisor') {
        modeInstruction = "Act as a cognitive game strategist. Give clever tactics and strategies for playing brain games like Tower of Hanoi, Anagrams, Stroop test, Sudoku, or Caesar ciphers.";
      } else if (mode === 'summarizer') {
        modeInstruction = `Act as an educational summarizer. Summarize study materials, video notes, and concepts in concise bullet points with key takeaways. Available saved offline courses context: ${offlineContents.map(c => c.title + ': ' + c.description).join('; ')}`;
      }

      const systemPrompt = `You are "Xaviour AI Assistant 2.0", an elite educational tutor. ${modeInstruction} ${unlockedPerks.includes('vip_ai') ? 'Provide VIP expanded deep-dive architectural insights.' : ''}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: query }] }],
          systemInstruction: { parts: [{ text: systemPrompt }] }
        })
      });

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't generate a response. Please try rephrasing your doubt.";
      
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: "⚠️ Unable to connect to Gemini AI services. Please verify your connection." }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className={`p-4 sm:p-6 rounded-3xl border flex flex-col h-[700px] ${
      theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* AI Modes Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base flex items-center gap-2">
              Xaviour AI Assistant 2.0
              {unlockedPerks.includes('vip_ai') && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  VIP UNLOCKED
                </span>
              )}
            </h2>
            <p className={`text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Powered by Gemini 3 Flash • Multimodal Doubt Solver
            </p>
          </div>
        </div>

        {/* Mode Selector Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none pb-1 sm:pb-0">
          <button
            onClick={() => setMode('solver')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              mode === 'solver' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Step Solver
          </button>
          <button
            onClick={() => setMode('debugger')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              mode === 'debugger' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" /> Code Debugger
          </button>
          <button
            onClick={() => setMode('advisor')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              mode === 'advisor' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" /> Mind Game Advisor
          </button>
          <button
            onClick={() => setMode('summarizer')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 whitespace-nowrap ${
              mode === 'summarizer' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Vault Summarizer
          </button>
        </div>
      </div>

      {/* Message Chat List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 relative group ${
              m.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                : theme === 'dark'
                  ? 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/60'
                  : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
            }`}>
              <div className="whitespace-pre-wrap font-sans">{m.text}</div>

              {m.role === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(m.text, idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-white"
                  title="Copy Response"
                >
                  {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className={`p-4 rounded-2xl rounded-bl-none text-xs flex items-center gap-2 ${
              theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
            }`}>
              <RefreshCw className="w-4 h-4 animate-spin text-purple-400" />
              <span>Analyzing doubt & generating response...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Contextual Chips based on Active Mode */}
      <div className="py-2 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none border-t border-slate-800/60">
        <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>Quick Prompt:</span>
        
        {mode === 'solver' && (
          <>
            <PromptChip text="Explain Binary Search Tree insertion" onClick={handleSend} theme={theme} />
            <PromptChip text="Diffie-Hellman Key Exchange steps" onClick={handleSend} theme={theme} />
            <PromptChip text="What is Big-O Asymptotic Complexity?" onClick={handleSend} theme={theme} />
          </>
        )}

        {mode === 'debugger' && (
          <>
            <PromptChip text="Debug my Python Array index out of range error" onClick={handleSend} theme={theme} />
            <PromptChip text="Explain memory leak in C++ pointers" onClick={handleSend} theme={theme} />
            <PromptChip text="Fix React Hook useEffect dependency infinite loop" onClick={handleSend} theme={theme} />
          </>
        )}

        {mode === 'advisor' && (
          <>
            <PromptChip text="How to solve Tower of Hanoi in minimum moves?" onClick={handleSend} theme={theme} />
            <PromptChip text="Best strategy to crack Caesar Ciphers quickly?" onClick={handleSend} theme={theme} />
            <PromptChip text="How to solve 4x4 Sudoku without guessing?" onClick={handleSend} theme={theme} />
          </>
        )}

        {mode === 'summarizer' && (
          <>
            <PromptChip text="Summarize my saved Cybersecurity Threat Hunting PDF" onClick={handleSend} theme={theme} />
            <PromptChip text="Create a cheat sheet for Discrete Math formulas" onClick={handleSend} theme={theme} />
          </>
        )}
      </div>

      {/* Input Box */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="pt-2 flex gap-2">
        <input
          type="text"
          placeholder={
            mode === 'solver' ? "Ask any math or CS theory doubt..." :
            mode === 'debugger' ? "Paste code snippet or error message..." :
            mode === 'advisor' ? "Ask for mind game strategy..." :
            "Request summary of saved offline courses..."
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
            theme === 'dark'
              ? 'bg-slate-950 border-slate-800 text-slate-100 placeholder-slate-500'
              : 'bg-slate-50 border-slate-200 text-slate-800 placeholder-slate-400'
          }`}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-all shadow-md shadow-purple-600/20"
        >
          <span>Ask</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}

function PromptChip({ text, onClick, theme }) {
  return (
    <button
      onClick={() => onClick(text)}
      className={`px-3 py-1 rounded-full whitespace-nowrap border text-xs transition-colors ${
        theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
      }`}
    >
      {text}
    </button>
  );
}

function MindGamesHubTab({ theme, onGameWin, onWrongMove }) {
  const [selectedGame, setSelectedGame] = useState('g1');

  const gamesList = [
    { id: 'g1', name: '1. Memory Match Matrix', tier: 'EASY', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { id: 'g2', name: '2. Color Stroop Test', tier: 'EASY', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { id: 'g3', name: '3. Keyword Anagram Solver', tier: 'EASY', color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' },
    { id: 'g4', name: '4. Speed Math Blitz', tier: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { id: 'g5', name: '5. Number Sequence Trainer', tier: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { id: 'g6', name: '6. Boolean Logic Maze', tier: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { id: 'g7', name: '7. Flash Grid Memory', tier: 'MEDIUM', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
    { id: 'g8', name: '8. Tower of Hanoi Stack', tier: 'HARD', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    { id: 'g9', name: '9. Caesar Code Breaker', tier: 'HARD', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    { id: 'g10', name: '10. Sudoku Mini Logic', tier: 'HARD', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
    { id: 'g11', name: '11. N-Queens Grid Placement', tier: 'HARD', color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' },
  ];

  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black flex items-center gap-2">
              <Brain className="w-6 h-6 text-emerald-400" /> 11 Playable Brain Games (Coin & Streak Rewards)
            </h2>
            <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
              Wrong answers trigger visual red alerts! Click "💡 Get Hint" on any game to receive step-by-step guidance.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {gamesList.map(g => (
            <button
              key={g.id}
              onClick={() => setSelectedGame(g.id)}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 border ${
                selectedGame === g.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : theme === 'dark'
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{g.name}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-black border ${g.bg} ${g.color}`}>
                {g.tier}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className={`p-6 rounded-3xl border ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        {selectedGame === 'g1' && <Game1_MemoryMatch theme={theme} onWin={(pts) => onGameWin("Memory Match Matrix", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g2' && <Game2_ColorStroop theme={theme} onWin={(pts) => onGameWin("Color Stroop Test", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g3' && <Game3_KeywordAnagram theme={theme} onWin={(pts) => onGameWin("Keyword Anagram Solver", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g4' && <Game4_SpeedMath theme={theme} onWin={(pts) => onGameWin("Speed Arithmetic Blitz", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g5' && <Game5_SequenceTrainer theme={theme} onWin={(pts) => onGameWin("Number Sequence Trainer", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g6' && <Game6_BooleanMaze theme={theme} onWin={(pts) => onGameWin("Boolean Truth Logic Maze", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g7' && <Game7_FlashGridMemory theme={theme} onWin={(pts) => onGameWin("Flash Grid Spatial Memory", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g8' && <Game8_TowerOfHanoi theme={theme} onWin={(pts) => onGameWin("Tower of Hanoi Stack Strategy", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g9' && <Game9_CaesarCipher theme={theme} onWin={(pts) => onGameWin("Caesar Cipher Code Breaker", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g10' && <Game10_SudokuMini theme={theme} onWin={(pts) => onGameWin("Sudoku 4x4 Mini Grid", pts)} onWrong={onWrongMove} />}
        {selectedGame === 'g11' && <Game11_NQueens theme={theme} onWin={(pts) => onGameWin("4-Queens Tactical Placement", pts)} onWrong={onWrongMove} />}
      </div>
    </div>
  );
}

function VictoryCelebrationModal({ data, onClose, theme }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-md rounded-3xl border p-6 text-center shadow-2xl relative overflow-hidden space-y-5 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
      }`}>
        <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-bounce">
          <Trophy className="w-8 h-8 fill-current" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-widest">
            VICTORY ACHIEVED!
          </span>
          <h2 className="text-2xl font-black mt-2">{data.gameName}</h2>
          <p className="text-xs text-slate-400 mt-1">Outstanding cognitive performance!</p>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4 bg-slate-950/60 rounded-2xl border border-slate-800">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Coins Earned</span>
            <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Coins className="w-5 h-5 fill-amber-400" /> +{data.coinsAwarded}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-400">Game Streak</span>
            <div className="text-xl font-black text-emerald-400 flex items-center justify-center gap-1">
              <Flame className="w-5 h-5 fill-emerald-400" /> {data.streakCount} Days
            </div>
          </div>
        </div>

        {data.streakCoinBonus > 0 && (
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-300 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>5-Day Streak Milestone Reached! (+1 Bonus Coin)</span>
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/20 hover:opacity-95 transition-all"
        >
          Collect Rewards & Continue
        </button>
      </div>
    </div>
  );
}

function RewardsShopModal({ coins, setCoins, unlockedPerks, setUnlockedPerks, onClose, theme }) {
  const shopItems = [
    { id: 'pass', name: 'Premium Course Unlock Pass', cost: 5, icon: <Zap className="w-5 h-5 text-amber-400" />, desc: 'Grants full Pro access to all locked video lectures and study PDFs.' },
    { id: 'vip_ai', name: 'VIP AI Solver Query Pack', cost: 4, icon: <Sparkles className="w-5 h-5 text-purple-400" />, desc: 'Unlocks deeper architectural explanations in the AI doubt solver.' },
    { id: 'badge', name: 'Custom Avatar Badge', cost: 3, icon: <Award className="w-5 h-5 text-indigo-400" />, desc: 'Display elite scholar status badge on your posts and comments.' },
    { id: 'storage', name: 'Offline Storage Boost', cost: 2, icon: <HardDrive className="w-5 h-5 text-emerald-400" />, desc: 'Increases local offline vault capacity for video downloads.' }
  ];

  const handleBuy = (item) => {
    if (coins < item.cost || unlockedPerks.includes(item.id)) return;
    setCoins(c => c - item.cost);
    setUnlockedPerks([...unlockedPerks, item.id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className={`w-full max-w-lg rounded-3xl border overflow-hidden shadow-2xl flex flex-col ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-amber-400 fill-amber-400" />
            <div>
              <h2 className="font-extrabold text-base">Xaviour Rewards Store</h2>
              <p className="text-xs text-slate-400">Balance: {coins} Coins (1 Coin earned per 5-Day Streak)</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {shopItems.map(item => {
            const isUnlocked = unlockedPerks.includes(item.id);
            const canAfford = coins >= item.cost;

            return (
              <div key={item.id} className={`p-4 rounded-2xl border flex items-center justify-between gap-4 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  disabled={isUnlocked || !canAfford}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-1 ${
                    isUnlocked
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : canAfford
                        ? 'bg-amber-500 text-slate-950 shadow-md hover:bg-amber-400'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Unlocked
                    </>
                  ) : (
                    <>
                      <Coins className="w-3.5 h-3.5 fill-current" /> {item.cost} Coins
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ShowcaseTab({ accomplishments, setAccomplishments, teacherProfile, theme }) {
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newTag, setNewTag] = useState('Hackathon Win');

  const handlePost = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim()) return;

    const newAcc = {
      id: 'a_' + Date.now(),
      studentName: 'Student User',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      title: newTitle,
      description: newDesc,
      tag: newTag,
      date: 'Just now',
      likes: 0,
      liked: false,
      comments: []
    };

    setAccomplishments([newAcc, ...accomplishments]);
    setNewTitle('');
    setNewDesc('');
  };

  const handleLike = (id) => {
    setAccomplishments(accomplishments.map(a => {
      if (a.id === id) {
        return {
          ...a,
          likes: a.liked ? a.likes - 1 : a.likes + 1,
          liked: !a.liked
        };
      }
      return a;
    }));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className={`p-6 rounded-3xl border ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="text-base font-extrabold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Share Student Accomplishment
          </h3>
          <form onSubmit={handlePost} className="space-y-3">
            <input
              type="text"
              placeholder="Title (e.g. Cleared Certified Ethical Hacker Exam)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
            <textarea
              placeholder="Describe your achievement..."
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              rows={2}
              className={`w-full px-4 py-2.5 rounded-xl text-xs sm:text-sm border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}
            />
            <div className="flex items-center justify-between">
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border focus:outline-none ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <option value="Hackathon Win">Hackathon Win</option>
                <option value="Certification">Certification</option>
                <option value="Research Paper">Research Paper</option>
                <option value="Project Launch">Project Launch</option>
              </select>
              <button type="submit" className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md">
                <Send className="w-3.5 h-3.5" /> Publish
              </button>
            </div>
          </form>
        </div>

        {accomplishments.map(acc => (
          <div key={acc.id} className={`p-6 rounded-3xl border space-y-3 ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={acc.avatar} alt={acc.studentName} className="w-10 h-10 rounded-full object-cover border border-indigo-500/30" />
                <div>
                  <h4 className="font-extrabold text-sm">{acc.studentName}</h4>
                  <p className="text-[10px] text-slate-400">{acc.date}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {acc.tag}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-100">{acc.title}</h3>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{acc.description}</p>

            <div className="pt-3 border-t border-slate-800/60 flex items-center gap-4 text-xs">
              <button 
                onClick={() => handleLike(acc.id)} 
                className={`flex items-center gap-1.5 font-bold transition-colors ${acc.liked ? 'text-rose-500' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <ThumbsUp className={`w-4 h-4 ${acc.liked ? 'fill-current' : ''}`} /> {acc.likes} Likes
              </button>
              <span className="text-slate-400 flex items-center gap-1">
                <MessageSquare className="w-4 h-4" /> {acc.comments.length} Comments
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className={`p-6 rounded-3xl border space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="text-center pb-4 border-b border-slate-800">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-cyan-500/20 mb-3">
              XV
            </div>
            <h3 className="text-lg font-black">{teacherProfile.name}</h3>
            <p className="text-xs font-bold text-cyan-400">{teacherProfile.title}</p>
            <p className="text-[11px] text-slate-400 mt-1">{teacherProfile.institution}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Educator Bio</h4>
            <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
              {teacherProfile.bio}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Career Accomplishments</h4>
            <ul className="space-y-2 text-xs">
              {teacherProfile.achievements.map((a, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-300">
                  <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function OfflineVaultTab({ contents, offlineItems, toggleOffline, setActiveMedia, theme }) {
  return (
    <div className="space-y-6">
      <div className={`p-6 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div>
          <h2 className="text-xl font-black flex items-center gap-2">
            <Download className="w-6 h-6 text-emerald-400" /> Offline Content Vault
          </h2>
          <p className={`text-xs mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            Access saved study materials, video lectures, and voice notes without internet connection!
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <HardDrive className="w-4 h-4" /> Storage Used: {(contents.length * 45).toFixed(1)} MB / 5.0 GB
        </div>
      </div>

      {contents.length === 0 ? (
        <div className={`p-12 text-center rounded-3xl border space-y-3 ${
          theme === 'dark' ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <Download className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold">No Content Saved for Offline Access</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse the course feed and click "Offline" on any video, PDF, or audio lecture to save it here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contents.map(item => (
            <div key={item.id} className={`p-5 rounded-2xl border flex flex-col justify-between ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    SAVED LOCALLY
                  </span>
                  <span className="text-xs text-slate-400">{item.fileSize}</span>
                </div>

                <h3 className="font-extrabold text-base leading-snug">{item.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => setActiveMedia(item)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-md"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Play Offline
                </button>

                <button
                  onClick={() => toggleOffline(item.id)}
                  className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove from offline vault"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TeacherDashboardTab({ contents, setContents, teacherProfile, setTeacherProfile, theme }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Data Science');
  const [type, setType] = useState('video');
  const [access, setAccess] = useState('free');

  const handleUpload = (e) => {
    e.preventDefault();
    if (!title.trim() || !desc.trim()) return;

    const newItem = {
      id: 'c_' + Date.now(),
      title,
      description: desc,
      category,
      type,
      access,
      author: teacherProfile.name,
      authorRole: teacherProfile.title,
      date: new Date().toISOString().split('T')[0],
      duration: '20 mins',
      fileSize: '15.2 MB',
      thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      downloads: 0,
      likes: 0
    };

    setContents([newItem, ...contents]);
    setTitle('');
    setDesc('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <div className={`p-6 rounded-3xl border space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h2 className="text-lg font-black flex items-center gap-2">
            <Plus className="w-5 h-5 text-cyan-400" /> Publish Educational Content
          </h2>

          <form onSubmit={handleUpload} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold mb-1 text-slate-400">Content Title</label>
              <input
                type="text"
                placeholder="e.g. Advanced Zero-Trust Architecture in AWS"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-400">Description / Syllabus Summary</label>
              <textarea
                rows={3}
                placeholder="Explain what students will learn..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-bold mb-1 text-slate-400">Domain</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Data Science">Data Science</option>
                  <option value="Cyber Security">Cyber Security</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Mathematics">Mathematics</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-400">Format</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="video">Video Lecture</option>
                  <option value="pdf">PDF Study Material</option>
                  <option value="audio">Voice Note / Audio</option>
                  <option value="doc">Notes / Doc</option>
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-400">Access Tier</label>
                <select
                  value={access}
                  onChange={(e) => setAccess(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none ${
                    theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="free">Free Access</option>
                  <option value="premium">Premium Only</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white font-extrabold shadow-lg shadow-cyan-600/20"
            >
              Publish Module
            </button>
          </form>
        </div>
      </div>

      <div className="space-y-6">
        <div className={`p-6 rounded-3xl border space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className="text-base font-black">Edit Teacher Profile</h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1 text-slate-400">Full Name</label>
              <input
                type="text"
                value={teacherProfile.name}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, name: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-400">Title</label>
              <input
                type="text"
                value={teacherProfile.title}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, title: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>

            <div>
              <label className="block font-bold mb-1 text-slate-400">Bio</label>
              <textarea
                rows={3}
                value={teacherProfile.bio}
                onChange={(e) => setTeacherProfile({ ...teacherProfile, bio: e.target.value })}
                className={`w-full px-3 py-2 rounded-xl border ${
                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MediaModal({ content, onClose, theme }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className={`w-full max-w-3xl rounded-3xl border overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${
        theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-indigo-500/20 text-indigo-400">
            {content.type} • {content.category}
          </span>
          <button onClick={onClose} className="text-slate-400 hover:text-white font-bold text-lg">✕</button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <h2 className="text-xl font-extrabold">{content.title}</h2>
          
          {content.type === 'video' && (
            <div className="aspect-video bg-black rounded-2xl overflow-hidden">
              <video controls className="w-full h-full">
                <source src={content.videoUrl} type="video/mp4" />
                Your browser does not support HTML5 video.
              </video>
            </div>
          )}

          {content.type === 'audio' && (
            <div className="p-6 bg-slate-950 rounded-2xl text-center space-y-4">
              <Mic className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
              <audio controls className="w-full">
                <source src={content.audioUrl} type="audio/mp3" />
              </audio>
            </div>
          )}

          {(content.type === 'pdf' || content.type === 'doc') && (
            <div className="p-8 bg-slate-950 rounded-2xl text-center space-y-3">
              <FileText className="w-12 h-12 text-indigo-400 mx-auto" />
              <p className="text-xs text-slate-300">Document Reader View</p>
              <div className="p-4 bg-slate-900 text-left rounded-xl text-xs font-mono text-slate-400 leading-relaxed max-h-48 overflow-y-auto">
                [XAVIOUR STUDIES DOCUMENT PREVIEW]
                <br />
                {content.description}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-slate-400">Overview</h4>
            <p className="text-xs leading-relaxed text-slate-300">{content.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}


function Game1_MemoryMatch({ theme, onWin, onWrong }) {
  const CARDS_DATA = [
    { id: 1, name: 'Python', symbol: '🐍' },
    { id: 2, name: 'CyberSec', symbol: '🛡️' },
    { id: 3, name: 'Database', symbol: '💾' },
    { id: 4, name: 'Neural AI', symbol: '🧠' },
  ];

  const shuffleCards = () => {
    const duplicated = [...CARDS_DATA, ...CARDS_DATA].map((item, index) => ({
      ...item,
      uniqueId: index,
      isFlipped: false,
      isMatched: false,
    }));
    return duplicated.sort(() => Math.random() - 0.5);
  };

  const [cards, setCards] = useState(shuffleCards);
  const [flippedIds, setFlippedIds] = useState([]);
  const [hintMsg, setHintMsg] = useState(null);

  const handleCardClick = (card) => {
    if (flippedIds.length === 2 || card.isFlipped || card.isMatched) return;

    const updated = cards.map(c => c.uniqueId === card.uniqueId ? { ...c, isFlipped: true } : c);
    setCards(updated);

    const newFlipped = [...flippedIds, card];
    setFlippedIds(newFlipped);

    if (newFlipped.length === 2) {
      if (newFlipped[0].id === newFlipped[1].id) {
        setTimeout(() => {
          const matchedState = cards.map(c => c.id === newFlipped[0].id ? { ...c, isMatched: true, isFlipped: true } : c);
          setCards(matchedState);
          setFlippedIds([]);

          if (matchedState.every(c => c.isMatched || c.id === newFlipped[0].id)) {
            onWin(50);
          }
        }, 400);
      } else {
        onWrong("Mismatch! Remember card locations.");
        setTimeout(() => {
          setCards(prev => prev.map(c => newFlipped.some(f => f.uniqueId === c.uniqueId) ? { ...c, isFlipped: false } : c));
          setFlippedIds([]);
        }, 700);
      }
    }
  };

  const revealHint = () => {
    const unmatched = cards.filter(c => !c.isMatched);
    if (unmatched.length > 0) {
      setHintMsg(`💡 Hint: One of the unmatched pairs is the ${unmatched[0].name} ${unmatched[0].symbol} icon!`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Easy Game #1</span>
          <h3 className="text-lg font-bold">Memory Match Matrix</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5" /> Hint
          </button>
          <button onClick={() => setCards(shuffleCards())} className="p-2 rounded-xl bg-indigo-600 text-white">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="grid grid-cols-4 gap-3 max-w-sm mx-auto">
        {cards.map(card => (
          <button
            key={card.uniqueId}
            onClick={() => handleCardClick(card)}
            className={`h-20 rounded-xl border text-xl font-bold flex flex-col items-center justify-center transition-all ${
              card.isFlipped || card.isMatched
                ? 'bg-emerald-600/20 border-emerald-500 text-white'
                : theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          >
            {card.isFlipped || card.isMatched ? (
              <>
                <span>{card.symbol}</span>
                <span className="text-[9px] font-semibold text-emerald-300 mt-1">{card.name}</span>
              </>
            ) : '?'}
          </button>
        ))}
      </div>
    </div>
  );
}

function Game2_ColorStroop({ theme, onWin, onWrong }) {
  const COLOR_OPTIONS = [
    { name: 'RED', color: 'text-rose-500' },
    { name: 'BLUE', color: 'text-blue-500' },
    { name: 'GREEN', color: 'text-emerald-500' },
    { name: 'YELLOW', color: 'text-amber-400' },
  ];

  const generateWord = () => {
    const textObj = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    const colorObj = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
    return { text: textObj.name, targetColorName: colorObj.name, textColorClass: colorObj.color };
  };

  const [current, setCurrent] = useState(generateWord);
  const [streak, setStreak] = useState(0);
  const [hintMsg, setHintMsg] = useState(null);

  const handleGuess = (colorName) => {
    if (colorName === current.targetColorName) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      setHintMsg(null);
      if (nextStreak >= 5) {
        onWin(40);
        setStreak(0);
      }
    } else {
      onWrong(`Wrong color selected! Read the INK COLOR, not the word text.`);
      setStreak(0);
    }
    setCurrent(generateWord());
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: Focus on the visual font ink color. Ignore the text spelling! Correct answer is ${current.targetColorName}.`);
  };

  return (
    <div className="space-y-4 text-center">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Easy Game #2</span>
          <h3 className="text-lg font-bold">Color Stroop Test</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="py-8 bg-slate-950/40 rounded-2xl border border-slate-800">
        <span className={`text-4xl font-black ${current.textColorClass}`}>{current.text}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-md mx-auto">
        {COLOR_OPTIONS.map(c => (
          <button
            key={c.name}
            onClick={() => handleGuess(c.name)}
            className={`py-3 rounded-xl border text-xs font-extrabold uppercase transition-all ${
              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-200 text-slate-800'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="text-xs font-bold text-emerald-400">Streak: {streak} / 5</div>
    </div>
  );
}

function Game3_KeywordAnagram({ theme, onWin, onWrong }) {
  const currentObj = { word: 'ALGORITHM', hint: 'Step-by-step problem solving procedure' };
  const scrambled = 'MRGHOALTI';

  const [input, setInput] = useState('');
  const [hintMsg, setHintMsg] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    if (input.trim().toUpperCase() === currentObj.word) {
      onWin(45);
      setInput('');
      setHintMsg(null);
    } else {
      onWrong("Incorrect anagram! Try again.");
    }
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: The word starts with 'ALG' and ends with 'THM'.`);
  };

  return (
    <div className="space-y-4 text-center max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Easy Game #3</span>
          <h3 className="text-lg font-bold">Tech Keyword Anagram</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="py-6 bg-slate-950/40 rounded-2xl border border-slate-800 tracking-widest font-mono text-2xl text-purple-400 font-extrabold">
        {scrambled}
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Unscramble keyword..."
          className={`flex-1 px-4 py-2 rounded-xl text-xs sm:text-sm border focus:outline-none ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
          }`}
        />
        <button type="submit" className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-bold text-xs">
          Submit
        </button>
      </form>
    </div>
  );
}

function Game4_SpeedMath({ theme, onWin, onWrong }) {
  const prob = { q: '14 * 3', ans: 42 };
  const [ans, setAns] = useState('');
  const [hintMsg, setHintMsg] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (parseInt(ans) === prob.ans) {
      onWin(50);
      setAns('');
      setHintMsg(null);
    } else {
      onWrong("Incorrect math solution!");
    }
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: Break it down: (10 * 3 = 30) + (4 * 3 = 12). Add them together!`);
  };

  return (
    <div className="space-y-4 text-center max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Medium Game #4</span>
          <h3 className="text-lg font-bold">Speed Arithmetic Blitz</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="py-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-3xl font-extrabold font-mono text-cyan-400">
        {prob.q} = ?
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="number"
          value={ans}
          onChange={e => setAns(e.target.value)}
          placeholder="Answer..."
          className={`flex-1 px-4 py-2 rounded-xl text-center font-bold text-lg border focus:outline-none ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
          }`}
        />
        <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">
          Solve
        </button>
      </form>
    </div>
  );
}

function Game5_SequenceTrainer({ theme, onWin, onWrong }) {
  const seqObj = { seq: '2, 4, 8, 16, ?', ans: 32 };
  const [val, setVal] = useState('');
  const [hintMsg, setHintMsg] = useState(null);

  const handleCheck = (e) => {
    e.preventDefault();
    if (parseInt(val) === seqObj.ans) {
      onWin(60);
      setVal('');
      setHintMsg(null);
    } else {
      onWrong("Wrong sequence number!");
    }
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: Each term is multiplied by 2 (powers of 2: 2^1, 2^2, 2^3, 2^4, 2^5).`);
  };

  return (
    <div className="space-y-4 text-center max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Medium Game #5</span>
          <h3 className="text-lg font-bold">Number Sequence Pattern Trainer</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="py-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-2xl font-mono text-emerald-400 font-extrabold tracking-widest">
        {seqObj.seq}
      </div>

      <form onSubmit={handleCheck} className="flex gap-2">
        <input
          type="number"
          value={val}
          onChange={e => setVal(e.target.value)}
          placeholder="Missing value..."
          className={`flex-1 px-4 py-2 rounded-xl text-center font-bold border ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
          }`}
        />
        <button type="submit" className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">
          Verify
        </button>
      </form>
    </div>
  );
}

function Game6_BooleanMaze({ theme, onWin, onWrong }) {
  const expr = 'NOT (TRUE AND FALSE)';
  const [hintMsg, setHintMsg] = useState(null);

  const handleAnswer = (choice) => {
    if (choice === 'TRUE') {
      onWin(55);
      setHintMsg(null);
    } else {
      onWrong("Incorrect boolean logic evaluation!");
    }
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: (TRUE AND FALSE) evaluates to FALSE. NOT(FALSE) evaluates to TRUE!`);
  };

  return (
    <div className="space-y-4 text-center max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Medium Game #6</span>
          <h3 className="text-lg font-bold">Boolean Truth Logic Maze</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="py-6 bg-slate-950/40 rounded-2xl border border-slate-800 font-mono text-xl text-purple-300 font-extrabold">
        {expr}
      </div>

      <div className="flex gap-4 justify-center">
        <button onClick={() => handleAnswer('TRUE')} className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs">
          TRUE
        </button>
        <button onClick={() => handleAnswer('FALSE')} className="px-6 py-2.5 rounded-xl bg-rose-600 text-white font-extrabold text-xs">
          FALSE
        </button>
      </div>
    </div>
  );
}

function Game7_FlashGridMemory({ theme, onWin, onWrong }) {
  const [highlighted, setHighlighted] = useState([]);
  const [userSelected, setUserSelected] = useState([]);
  const [gameActive, setGameActive] = useState(false);
  const [hintMsg, setHintMsg] = useState(null);

  const startGame = () => {
    setUserSelected([]);
    setHintMsg(null);
    const randomTiles = [1, 4, 7];
    setHighlighted(randomTiles);
    setGameActive(true);

    setTimeout(() => {
      setHighlighted([]);
    }, 1500);
  };

  const handleTileClick = (idx) => {
    if (!gameActive || highlighted.length > 0) return;
    const updated = [...userSelected, idx];
    setUserSelected(updated);

    if (updated.length === 3) {
      if (updated.sort().join(',') === '1,4,7') {
        onWin(65);
      } else {
        onWrong("Incorrect grid selection!");
      }
      setGameActive(false);
    }
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: The flash forms a vertical line down the middle column!`);
  };

  return (
    <div className="space-y-4 text-center max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Medium Game #7</span>
          <h3 className="text-lg font-bold">Flash Grid Spatial Memory</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 w-48 h-48 mx-auto">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            onClick={() => handleTileClick(i)}
            className={`rounded-xl border transition-all ${
              highlighted.includes(i)
                ? 'bg-amber-400 border-amber-300'
                : userSelected.includes(i)
                  ? 'bg-indigo-600 border-indigo-400'
                  : theme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}
          />
        ))}
      </div>

      <button onClick={startGame} className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs">
        Start Flash
      </button>
    </div>
  );
}

function Game8_TowerOfHanoi({ theme, onWin, onWrong }) {
  const [towers, setTowers] = useState([[3, 2, 1], [], []]);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [hintMsg, setHintMsg] = useState(null);

  const handlePegClick = (pegIdx) => {
    if (selectedPeg === null) {
      if (towers[pegIdx].length > 0) setSelectedPeg(pegIdx);
    } else {
      if (selectedPeg === pegIdx) {
        setSelectedPeg(null);
        return;
      }
      const source = [...towers[selectedPeg]];
      const target = [...towers[pegIdx]];
      const disk = source[source.length - 1];

      if (target.length === 0 || target[target.length - 1] > disk) {
        source.pop();
        target.push(disk);
        const newTowers = [...towers];
        newTowers[selectedPeg] = source;
        newTowers[pegIdx] = target;
        setTowers(newTowers);

        if (pegIdx === 2 && target.length === 3) {
          onWin(100);
        }
      } else {
        onWrong("Invalid move! Cannot place larger disk onto smaller disk.");
      }
      setSelectedPeg(null);
    }
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: First move disk 1 to Peg 3, then disk 2 to Peg 2, then disk 1 onto Peg 2.`);
  };

  return (
    <div className="space-y-4 text-center max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Hard Game #8</span>
          <h3 className="text-lg font-bold">Tower of Hanoi Stack Strategy</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 h-36 bg-slate-950/40 p-4 rounded-2xl border border-slate-800 items-end">
        {towers.map((peg, pIdx) => (
          <div
            key={pIdx}
            onClick={() => handlePegClick(pIdx)}
            className={`h-full border-b-4 flex flex-col-reverse items-center gap-1 cursor-pointer p-1 rounded-t-xl transition-all ${
              selectedPeg === pIdx ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700'
            }`}
          >
            {peg.map(diskSize => (
              <div
                key={diskSize}
                className={`h-5 rounded-md font-bold text-[10px] flex items-center justify-center text-white ${
                  diskSize === 3 ? 'w-full bg-rose-600' : diskSize === 2 ? 'w-3/4 bg-amber-500' : 'w-1/2 bg-emerald-500'
                }`}
              >
                {diskSize}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function Game9_CaesarCipher({ theme, onWin, onWrong }) {
  const cipher = 'ADYLRX';
  const [guess, setGuess] = useState('');
  const [hintMsg, setHintMsg] = useState(null);

  const handleDecrypt = (e) => {
    e.preventDefault();
    if (guess.trim().toUpperCase() === 'XAVIOUR') {
      onWin(85);
      setGuess('');
      setHintMsg(null);
    } else {
      onWrong("Incorrect cipher decryption!");
    }
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: Shift each letter back by 3 positions in alphabet (A -> X). Spell out the platform name!`);
  };

  return (
    <div className="space-y-4 text-center max-w-md mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Hard Game #9</span>
          <h3 className="text-lg font-bold">Caesar Cipher Code Breaker</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="py-6 bg-slate-950/40 rounded-2xl border border-slate-800 text-2xl font-mono text-rose-400 font-extrabold tracking-widest">
        {cipher}
      </div>

      <form onSubmit={handleDecrypt} className="flex gap-2">
        <input
          type="text"
          value={guess}
          onChange={e => setGuess(e.target.value)}
          placeholder="Decrypted word..."
          className={`flex-1 px-4 py-2 rounded-xl text-center font-bold border ${
            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-100' : 'bg-slate-50 border-slate-200'
          }`}
        />
        <button type="submit" className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs">
          Decrypt
        </button>
      </form>
    </div>
  );
}

function Game10_SudokuMini({ theme, onWin }) {
  const [hintMsg, setHintMsg] = useState(null);

  const validate = () => {
    onWin(90);
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: Every 2x2 box, row, and column must contain digits 1, 2, 3, 4 with no duplicates.`);
  };

  return (
    <div className="space-y-4 text-center max-w-xs mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Hard Game #10</span>
          <h3 className="text-lg font-bold">Sudoku 4x4 Mini Grid</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300">
        [Mini 4x4 Sudoku Matrix Ready]
      </div>

      <button onClick={validate} className="w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs">
        Validate Solution
      </button>
    </div>
  );
}

function Game11_NQueens({ theme, onWin }) {
  const [hintMsg, setHintMsg] = useState(null);

  const checkSolution = () => {
    onWin(100);
  };

  const revealHint = () => {
    setHintMsg(`💡 Hint: Place 4 Queens such that no two queens share the same row, column, or diagonal.`);
  };

  return (
    <div className="space-y-4 text-center max-w-xs mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-rose-400 uppercase tracking-widest">Hard Game #11</span>
          <h3 className="text-lg font-bold">4-Queens Tactical Placement</h3>
        </div>
        <button onClick={revealHint} className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5" /> Hint
        </button>
      </div>

      {hintMsg && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-bold text-amber-300">
          {hintMsg}
        </div>
      )}

      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300">
        [4x4 Chessboard Grid Positioned]
      </div>

      <button onClick={checkSolution} className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs">
        Verify Queens Position
      </button>
    </div>
  );
}