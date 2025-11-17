import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowRight,
  FiBook,
  FiFileText,
  FiCheckSquare,
  FiList,
  FiHeart,
  FiMessageCircle,
} from 'react-icons/fi';
import { FaQuoteLeft } from 'react-icons/fa';
import AIChatWidget from './AIChatWidget';
import cn from '../utils/cn';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const bounceIn = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.95,
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 80,
      damping: 15,
      mass: 1,
    }
  },
};

const staggerParent = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

type JourneyEvent = {
  time: string;
  title: string;
  description: string;
};

type Testimonial = {
  quote: string;
  name: string;
  role: string;
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    document.body.classList.add('landing-page-active');
    document.documentElement.classList.add('landing-page-active');

    return () => {
      document.body.classList.remove('landing-page-active');
      document.documentElement.classList.remove('landing-page-active');
    };
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const features = useMemo<Feature[]>(
    () => [
      {
        id: 'diary',
        title: 'Diary Entries',
        description: 'Write and organize your personal diary entries with a rich text editor.',
        icon: <FiBook className="h-6 w-6" />,
      },
      {
        id: 'notes',
        title: 'Notes',
        description: 'Create notes with audio recording, categories, tags, and favorites.',
        icon: <FiFileText className="h-6 w-6" />,
      },
      {
        id: 'tasks',
        title: 'Tasks',
        description: 'Manage tasks with deadlines and track completion status.',
        icon: <FiCheckSquare className="h-6 w-6" />,
      },
      {
        id: 'todos',
        title: 'To-Do List',
        description: 'Simple to-do items with expiry dates and completion tracking.',
        icon: <FiList className="h-6 w-6" />,
      },
      {
        id: 'mood',
        title: 'Mood Tracker',
        description: 'Track your daily moods and view your emotional patterns.',
        icon: <FiHeart className="h-6 w-6" />,
      },
      {
        id: 'ai',
        title: 'AI Assistant',
        description: 'Samiya - your wellness companion for insights and guidance.',
        icon: <FiMessageCircle className="h-6 w-6" />,
      },
    ],
    [],
  );


  const journey = useMemo<JourneyEvent[]>(
    () => [
      {
        time: '08:00',
        title: 'Morning Entry',
        description: 'Write your morning diary entry and set your daily mood.',
      },
      {
        time: '12:30',
        title: 'Quick Notes',
        description: 'Capture thoughts, record audio notes, and organize with tags.',
      },
      {
        time: '17:45',
        title: 'Task Management',
        description: 'Review tasks, update to-dos, and track your progress.',
      },
      {
        time: '22:15',
        title: 'Evening Reflection',
        description: 'Reflect on your day, track your mood, and get AI insights.',
      },
    ],
    [],
  );

  const testimonials = useMemo<Testimonial[]>(
    () => [
      {
        quote: 'Digital Diary helps me organize my thoughts and track my mood patterns. It\'s my go-to journal companion.',
        name: 'Alex Johnson',
        role: 'Daily user',
      },
      {
        quote: 'I love how I can manage tasks, write diary entries, and take notes with audio all in one place.',
        name: 'Maria Garcia',
        role: 'Productivity enthusiast',
      },
      {
        quote: 'The AI assistant Samiya provides great insights. Digital Diary has become essential to my daily routine.',
        name: 'David Chen',
        role: 'Wellness focused',
      },
    ],
    [],
  );

  const handleNavigateLogin = () => {
    navigate('/login');
  };

  const HeroMotion = prefersReducedMotion ? React.Fragment : motion.div;

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/40 text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent"
      >
        Skip to main content
      </a>
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-purple-400/30 via-blue-400/20 to-transparent blur-[160px]" />
        <div className="absolute bottom-0 right-[-12%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-pink-300/30 via-cyan-300/30 to-transparent blur-[120px]" />
        <div className="absolute top-1/2 left-[-10%] h-[24rem] w-[24rem] rounded-full bg-gradient-to-br from-indigo-300/25 via-purple-300/20 to-transparent blur-[140px]" />
      </div>

      <header className="sticky top-0 z-40 mx-4 mt-4 mb-0 rounded-3xl border border-purple-200/50 bg-gradient-to-r from-white/95 via-purple-50/90 to-blue-50/95 backdrop-blur-2xl shadow-2xl">
        <div className="flex h-20 w-full items-center justify-between px-6 sm:px-8 lg:px-10 xl:px-12">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-4 rounded-2xl border border-purple-200/40 bg-gradient-to-br from-white to-purple-50/50 px-4 py-2 text-left shadow-lg transition-all hover:border-purple-300/60 hover:shadow-xl hover:scale-105 focus-outline"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-300/40 bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-bold text-white shadow-md transition group-hover:scale-110 group-hover:shadow-lg">
              DD
            </span>
            <span>
              <p className="text-xs uppercase tracking-[0.35em] text-purple-600 font-semibold">Digital Diary</p>
              <p className="text-sm font-semibold text-slate-800">Your personal journal companion</p>
            </span>
          </button>

          <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm font-medium text-slate-700 transition-all hover:text-purple-600 hover:font-semibold focus-outline rounded-lg px-3 py-2 hover:bg-purple-50/50">
              Features
            </a>
            <a href="#timeline" className="text-sm font-medium text-slate-700 transition-all hover:text-purple-600 hover:font-semibold focus-outline rounded-lg px-3 py-2 hover:bg-purple-50/50">
              Daily flow
            </a>
            <a href="#testimonials" className="text-sm font-medium text-slate-700 transition-all hover:text-purple-600 hover:font-semibold focus-outline rounded-lg px-3 py-2 hover:bg-purple-50/50">
              Voices
            </a>
            <button
              type="button"
              onClick={handleNavigateLogin}
              className="group inline-flex items-center gap-2 rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl hover:scale-105 focus-outline"
            >
              Sign in
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </button>
          </nav>

          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-foreground/10 text-foreground/80 transition hover:border-accent md:hidden focus-outline"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
          >
            <span className="sr-only">Toggle navigation</span>
            <div className="flex flex-col items-center justify-center space-y-1.5">
              <span className={cn('h-0.5 w-5 rounded-full bg-current transition', isMenuOpen && 'translate-y-1.5 rotate-45')} />
              <span className={cn('h-0.5 w-5 rounded-full bg-current transition', isMenuOpen && 'opacity-0')} />
              <span className={cn('h-0.5 w-5 rounded-full bg-current transition', isMenuOpen && '-translate-y-1.5 -rotate-45')} />
            </div>
          </button>
        </div>

        {isMenuOpen && (
          <div id="mobile-menu" className="border-t border-purple-200/40 bg-gradient-to-br from-white/95 to-purple-50/90 px-5 pb-5 pt-4 md:hidden rounded-b-3xl">
            <div className="flex flex-col gap-3">
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl border border-purple-200/40 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-purple-300/60 hover:bg-purple-50/50 hover:text-purple-600 focus-outline"
              >
                Features
              </a>
              <a
                href="#timeline"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl border border-purple-200/40 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-purple-300/60 hover:bg-purple-50/50 hover:text-purple-600 focus-outline"
              >
                Daily flow
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl border border-purple-200/40 bg-white/80 px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-purple-300/60 hover:bg-purple-50/50 hover:text-purple-600 focus-outline"
              >
                Voices
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavigateLogin();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-purple-400/50 bg-gradient-to-r from-purple-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl focus-outline"
              >
                Start journaling
                <FiArrowRight />
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="main" className="relative z-10 flex w-full flex-col gap-24 px-4 pb-24 pt-8 sm:px-6 lg:px-8 xl:px-12 sm:pb-32 sm:pt-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[3rem] border border-purple-200/40 bg-gradient-to-br from-white via-purple-50/30 to-blue-50/40 p-8 sm:p-12 lg:p-16 shadow-2xl">
          {/* Decorative floating elements */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 blur-3xl animate-pulseGlow" />
            <div className="absolute top-1/2 -left-16 h-48 w-48 rounded-full bg-gradient-to-br from-pink-300/20 to-cyan-300/20 blur-2xl animate-pulseGlow" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-10 right-1/4 h-32 w-32 rounded-full bg-gradient-to-br from-indigo-300/20 to-purple-300/20 blur-xl animate-pulseGlow" style={{ animationDelay: '2s' }} />
            
            {/* Floating icons */}
            <motion.div
              className="absolute top-20 right-32 text-purple-300/30"
              animate={prefersReducedMotion ? {} : {
                y: [0, -20, 0],
                rotate: [0, 5, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <FiBook className="h-12 w-12" />
            </motion.div>
            <motion.div
              className="absolute top-40 left-20 text-blue-300/30"
              animate={prefersReducedMotion ? {} : {
                y: [0, 15, 0],
                rotate: [0, -5, 0],
              }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <FiHeart className="h-10 w-10" />
            </motion.div>
            <motion.div
              className="absolute bottom-20 right-40 text-pink-300/30"
              animate={prefersReducedMotion ? {} : {
                y: [0, -15, 0],
                rotate: [0, 8, 0],
              }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <FiCheckSquare className="h-11 w-11" />
            </motion.div>
          </div>

          <div className="relative z-10 grid gap-12 lg:grid-cols-[1.2fr_1fr] lg:items-center lg:gap-16">
            {/* Left Content */}
            <HeroMotion
              className="flex flex-col gap-8"
              {...(prefersReducedMotion
                ? {}
                : {
                    initial: 'hidden',
                    animate: 'visible',
                    variants: fadeUp,
                    transition: { duration: 0.65 },
                  })}
            >
              {/* Badge */}
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.9 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex w-fit items-center gap-2 rounded-full border border-purple-200/60 bg-gradient-to-r from-purple-100/80 to-blue-100/80 px-4 py-2 text-xs font-semibold text-purple-700 shadow-md backdrop-blur-sm"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-purple-500"></span>
                </span>
                Your Personal Journal Companion
              </motion.div>

              {/* Main Heading with Gradient */}
              <div className="space-y-6">
                <h1 className="font-heading text-[clamp(2.5rem,2rem+3vw,5.5rem)] leading-[1.05] tracking-tight">
                  <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    Organize Your Life,
                  </span>
                  <br />
                  <span className="text-slate-900">One Entry at a Time</span>
                </h1>
                <p className="max-w-2xl text-xl leading-relaxed text-slate-700 sm:text-lg">
                  Digital Diary helps you capture thoughts, track moods, manage tasks, and stay organized. 
                  <span className="font-semibold text-purple-600"> All in one secure, private space.</span>
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleNavigateLogin}
                  className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 px-8 py-4 text-base font-bold text-white shadow-2xl transition-all hover:scale-105 hover:shadow-purple-500/50 focus-outline"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-purple-700 via-blue-700 to-cyan-600 opacity-0 transition-opacity group-hover:opacity-100"></span>
                  <span className="relative flex items-center gap-3">
                    Start journaling
                    <FiArrowRight className="transition-transform group-hover:translate-x-1.5" />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-white/80 px-6 py-4 text-base font-semibold text-slate-700 shadow-lg backdrop-blur-sm transition-all hover:border-purple-400 hover:bg-white hover:shadow-xl focus-outline"
                >
                  Explore features
                  <FiArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-blue-400"></div>
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-cyan-400"></div>
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-gradient-to-br from-pink-400 to-purple-400"></div>
                  </div>
                  <span className="text-sm font-medium text-slate-600">Join 10k+ users</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <FiCheckSquare className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">100% Secure</span>
                </div>
              </div>
            </HeroMotion>

            {/* Right Side - Feature Cards */}
            <div className="relative z-10">
              <motion.div
                initial={prefersReducedMotion ? {} : { opacity: 0, x: 20 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="space-y-4"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-purple-600 font-bold mb-6">Why Digital Diary?</p>
                
                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 40, scale: 0.9 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 100, damping: 12, mass: 0.8 }}
                  className="group relative overflow-hidden rounded-2xl border border-purple-200/60 bg-gradient-to-br from-purple-100/90 via-white/90 to-purple-50/90 p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-purple-300/80 hover:shadow-2xl"
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-purple-400/20 to-blue-400/20 blur-2xl"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
                      <FiBook className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-purple-900 mb-2">All-in-One Platform</h3>
                      <p className="text-sm leading-relaxed text-purple-700/80">Diary entries, notes, tasks, todos, and mood tracking in one place.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 40, scale: 0.9 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 100, damping: 12, mass: 0.8 }}
                  className="group relative overflow-hidden rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-100/90 via-white/90 to-blue-50/90 p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-blue-300/80 hover:shadow-2xl"
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-2xl"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg">
                      <FiMessageCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 mb-2">AI-Powered Insights</h3>
                      <p className="text-sm leading-relaxed text-blue-700/80">Get personalized wellness insights from Samiya, your AI assistant.</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 40, scale: 0.9 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 12, mass: 0.8 }}
                  className="group relative overflow-hidden rounded-2xl border border-indigo-200/60 bg-gradient-to-br from-indigo-100/90 via-white/90 to-indigo-50/90 p-6 shadow-xl transition-all hover:-translate-y-1 hover:border-indigo-300/80 hover:shadow-2xl"
                >
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-400/20 to-purple-400/20 blur-2xl"></div>
                  <div className="relative flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg">
                      <FiCheckSquare className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-indigo-900 mb-2">Secure & Private</h3>
                      <p className="text-sm leading-relaxed text-indigo-700/80">Your data is encrypted and secure. Your privacy is our priority.</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        <section id="features" className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <h2 className="font-heading text-[clamp(2.2rem,1.9rem+1vw,3.2rem)] leading-[1.1] text-slate-900">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-700">
              Powerful features to help you stay organized and mindful.
            </p>
          </div>
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={prefersReducedMotion ? undefined : staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: "-100px" }}
          >
            {features.map((feature, index) => {
              const colorSchemes = [
                { bg: 'from-purple-100/90 to-purple-50/90', border: 'border-purple-200/60', icon: 'bg-purple-500/15 text-purple-600 border-purple-300/40', text: 'text-purple-900', desc: 'text-purple-700/80' },
                { bg: 'from-blue-100/90 to-blue-50/90', border: 'border-blue-200/60', icon: 'bg-blue-500/15 text-blue-600 border-blue-300/40', text: 'text-blue-900', desc: 'text-blue-700/80' },
                { bg: 'from-indigo-100/90 to-indigo-50/90', border: 'border-indigo-200/60', icon: 'bg-indigo-500/15 text-indigo-600 border-indigo-300/40', text: 'text-indigo-900', desc: 'text-indigo-700/80' },
                { bg: 'from-pink-100/90 to-pink-50/90', border: 'border-pink-200/60', icon: 'bg-pink-500/15 text-pink-600 border-pink-300/40', text: 'text-pink-900', desc: 'text-pink-700/80' },
                { bg: 'from-cyan-100/90 to-cyan-50/90', border: 'border-cyan-200/60', icon: 'bg-cyan-500/15 text-cyan-600 border-cyan-300/40', text: 'text-cyan-900', desc: 'text-cyan-700/80' },
                { bg: 'from-violet-100/90 to-violet-50/90', border: 'border-violet-200/60', icon: 'bg-violet-500/15 text-violet-600 border-violet-300/40', text: 'text-violet-900', desc: 'text-violet-700/80' },
              ];
              const colors = colorSchemes[index % colorSchemes.length];
              return (
                <motion.article
                  key={feature.id}
                  variants={prefersReducedMotion ? undefined : bounceIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.2, margin: "-50px" }}
                  className={`group h-full rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-6 shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02]`}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${colors.icon} shadow-md`}>
                    {feature.icon}
                  </div>
                  <h3 className={`mt-5 text-xl font-semibold ${colors.text}`}>{feature.title}</h3>
                  <p className={`mt-3 text-sm leading-relaxed ${colors.desc}`}>{feature.description}</p>
                </motion.article>
              );
            })}
          </motion.div>
        </section>

        <motion.section
          id="timeline"
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 30 }}
          whileInView={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15, margin: "-80px" }}
          transition={{ duration: 0.7, type: "spring", stiffness: 70, damping: 18, mass: 1 }}
          className="rounded-3xl border border-purple-200/50 bg-gradient-to-br from-white/90 via-purple-50/50 to-blue-50/70 p-8 sm:p-10 shadow-2xl backdrop-blur-[40px]"
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <motion.div 
              initial={prefersReducedMotion ? {} : { opacity: 0, x: -30 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 12 }}
              className="max-w-xl space-y-4"
            >
              <h2 className="font-heading text-[clamp(2rem,1.7rem+1vw,2.8rem)] text-slate-900">A day with Digital Diary</h2>
              <p className="text-base text-slate-700">
                See how Digital Diary helps you organize your thoughts, track your mood, and manage your tasks throughout the day.
              </p>
            </motion.div>
            <motion.button
              initial={prefersReducedMotion ? {} : { opacity: 0, x: 30 }}
              whileInView={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 12 }}
              type="button"
              onClick={handleNavigateLogin}
              className="inline-flex items-center gap-2 rounded-full border border-purple-400/50 bg-gradient-to-r from-purple-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl focus-outline"
            >
              Try the flow
              <FiArrowRight />
            </motion.button>
          </div>
          <motion.div 
            className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
            variants={prefersReducedMotion ? undefined : staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: "-100px" }}
          >
            {journey.map((event, index) => {
              const timeColors = [
                { bg: 'from-amber-100/90 to-orange-50/90', border: 'border-amber-200/60', text: 'text-amber-900', desc: 'text-amber-700/80', time: 'text-amber-600' },
                { bg: 'from-emerald-100/90 to-green-50/90', border: 'border-emerald-200/60', text: 'text-emerald-900', desc: 'text-emerald-700/80', time: 'text-emerald-600' },
                { bg: 'from-rose-100/90 to-pink-50/90', border: 'border-rose-200/60', text: 'text-rose-900', desc: 'text-rose-700/80', time: 'text-rose-600' },
                { bg: 'from-indigo-100/90 to-purple-50/90', border: 'border-indigo-200/60', text: 'text-indigo-900', desc: 'text-indigo-700/80', time: 'text-indigo-600' },
              ];
              const colors = timeColors[index % timeColors.length];
              return (
                <motion.div
                  key={event.title}
                  variants={prefersReducedMotion ? undefined : bounceIn}
                  className={`relative flex h-full flex-col gap-3 rounded-2xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-5 shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl`}
                >
                  <span className={`text-xs font-medium uppercase tracking-[0.35em] ${colors.time} font-semibold`}>{event.time}</span>
                  <h3 className={`text-lg font-semibold ${colors.text}`}>{event.title}</h3>
                  <p className={`text-sm leading-relaxed ${colors.desc}`}>{event.description}</p>
                  <span className={`pointer-events-none absolute -right-4 top-4 h-10 w-10 rounded-full border ${colors.border} bg-gradient-to-br ${colors.bg} blur-lg opacity-60`} />
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>

        <section id="testimonials" className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <h2 className="font-heading text-[clamp(2.2rem,1.9rem+1vw,3.2rem)] leading-[1.1] text-slate-900">
              What Users Say
            </h2>
            <p className="text-lg text-slate-700">
              See how Digital Diary helps people organize their lives and stay mindful.
            </p>
          </div>
          <motion.div 
            className="grid gap-6 md:grid-cols-3"
            variants={prefersReducedMotion ? undefined : staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15, margin: "-100px" }}
          >
            {testimonials.map((testimonial, index) => {
              const testimonialColors = [
                { bg: 'from-slate-50 to-white', border: 'border-slate-200/60', quote: 'text-purple-500', text: 'text-slate-900', role: 'text-slate-600' },
                { bg: 'from-blue-50 to-white', border: 'border-blue-200/60', quote: 'text-blue-500', text: 'text-slate-900', role: 'text-slate-600' },
                { bg: 'from-purple-50 to-white', border: 'border-purple-200/60', quote: 'text-indigo-500', text: 'text-slate-900', role: 'text-slate-600' },
              ];
              const colors = testimonialColors[index % testimonialColors.length];
              return (
                <motion.blockquote
                  key={testimonial.name}
                  variants={prefersReducedMotion ? undefined : bounceIn}
                  className={`relative h-full rounded-3xl border ${colors.border} bg-gradient-to-br ${colors.bg} p-6 text-sm leading-relaxed shadow-lg transition-all hover:-translate-y-2 hover:shadow-2xl`}
                >
                  <FaQuoteLeft className={`text-3xl ${colors.quote} opacity-70`} aria-hidden />
                  <p className={`mt-4 text-base ${colors.text}`}>"{testimonial.quote}"</p>
                  <footer className="mt-6">
                    <p className={`text-sm font-semibold ${colors.text}`}>{testimonial.name}</p>
                    <p className={`text-xs ${colors.role}`}>{testimonial.role}</p>
                  </footer>
                </motion.blockquote>
              );
            })}
          </motion.div>
        </section>

        <section className="rounded-3xl border border-purple-300/50 bg-gradient-to-r from-purple-500/90 via-blue-500/80 to-pink-500/70 p-10 sm:p-12 text-center shadow-2xl">
          <h2 className="font-heading text-[clamp(2.1rem,1.8rem+0.9vw,3rem)] leading-[1.1] text-white">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-base text-white/90">
            Sign in or create an account to begin using Digital Diary and start organizing your life.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleNavigateLogin}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white px-7 py-3 text-base font-semibold text-purple-600 shadow-xl transition hover:-translate-y-0.5 hover:bg-white/95 hover:shadow-2xl focus-outline"
            >
              Sign in now
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-white/20 backdrop-blur-sm px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-white/30 hover:border-white/60 focus-outline"
            >
              Rewatch intro
            </button>
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden border-t border-purple-300/50 bg-gradient-to-br from-purple-100 via-blue-50 to-pink-50 py-16">
        {/* Animated background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -top-20 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/40 to-blue-400/40 blur-3xl animate-pulseGlow" />
          <div className="absolute -bottom-20 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-pink-400/40 to-purple-400/40 blur-3xl animate-pulseGlow" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-gradient-to-br from-cyan-300/30 to-indigo-300/30 blur-3xl animate-pulseGlow" style={{ animationDelay: '0.75s' }} />
        </div>

        <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Main footer content */}
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-4">
            {/* Brand Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 text-lg font-bold text-white shadow-lg">
                  DD
                </div>
                <div>
                  <p className="text-lg font-bold text-slate-900">Digital Diary</p>
                  <p className="text-xs text-slate-600">Your personal journal</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Organize your life, one entry at a time. Capture thoughts, track moods, and stay mindful.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#features" className="text-sm text-slate-700 transition hover:text-purple-600 hover:font-semibold focus-outline">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#timeline" className="text-sm text-slate-700 transition hover:text-purple-600 hover:font-semibold focus-outline">
                    Daily Flow
                  </a>
                </li>
                <li>
                  <a href="#testimonials" className="text-sm text-slate-700 transition hover:text-purple-600 hover:font-semibold focus-outline">
                    Testimonials
                  </a>
                </li>
                <li>
                  <a href="/login" className="text-sm text-slate-700 transition hover:text-purple-600 hover:font-semibold focus-outline">
                    Sign In
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <a href="/privacy" className="text-sm text-slate-700 transition hover:text-blue-600 hover:font-semibold focus-outline">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-sm text-slate-700 transition hover:text-blue-600 hover:font-semibold focus-outline">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="mailto:hello@digitaldiary.app" className="text-sm text-slate-700 transition hover:text-blue-600 hover:font-semibold focus-outline">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* Social/Connect */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-900">Connect</h3>
              <p className="text-sm text-slate-700">
                Join thousands of users organizing their lives with Digital Diary.
              </p>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-purple-200/60 pt-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-slate-700">
                  © {new Date().getFullYear()} Digital Diary. All rights reserved.
                </p>
                <p className="text-xs text-slate-600">
                  Made with ❤️ for mindful living
                </p>
              </div>
              
              {/* Designed by Samiya Nur with neon effect */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, type: "spring", stiffness: 100, damping: 15 }}
                className="relative"
              >
                <div className="relative inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-100/80 via-pink-100/80 to-purple-100/80 backdrop-blur-sm">
                  <p className="text-sm font-medium">
                    <span className="text-slate-700">Designed by </span>
                    <span className="relative inline-block">
                      <span className="relative z-10 bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-500 bg-clip-text font-bold text-transparent drop-shadow-sm">
                        Samiya Nur
                      </span>
                      <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 blur-md opacity-60 animate-pulse">
                        Samiya Nur
                      </span>
                    </span>
                  </p>
                  {/* Neon glow effect */}
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-400 via-pink-400 to-purple-400 rounded-lg blur-sm opacity-40 animate-pulse"></div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </footer>

      <AIChatWidget />
    </div>
  );
};

export default LandingPage;


