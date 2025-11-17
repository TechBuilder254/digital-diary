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

const staggerParent = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

type Feature = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
};

type Spotlight = {
  name: string;
  major: string;
  story: string;
  stats: string;
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

  const spotlights = useMemo<Spotlight[]>(
    () => [
      {
        name: 'Sarah',
        major: 'Daily user',
        story: 'Uses Digital Diary to track moods, organize tasks, and reflect on daily experiences.',
        stats: 'Active user',
      },
      {
        name: 'Mike',
        major: 'Productivity focused',
        story: 'Manages tasks and to-dos efficiently, keeping everything organized in one place.',
        stats: 'Task master',
      },
      {
        name: 'Emma',
        major: 'Creative writer',
        story: 'Captures thoughts in diary entries and audio notes, organizing with tags and categories.',
        stats: 'Creative mind',
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
    <div className="relative min-h-screen overflow-hidden bg-surface text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-surface focus:px-4 focus:py-2 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-accent"
      >
        Skip to main content
      </a>
      <div className="pointer-events-none absolute inset-0 -z-20 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-gradient-to-br from-accent/25 via-foreground/5 to-transparent blur-[160px]" />
        <div className="absolute bottom-0 right-[-12%] h-[26rem] w-[26rem] rounded-full bg-gradient-to-br from-[#ff7aa8]/20 via-[#4de1ff]/30 to-transparent blur-[120px]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-foreground/5 bg-surface/70 backdrop-blur-xl">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-5 md:px-10">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="group flex items-center gap-4 rounded-full border border-foreground/5 bg-surface/80 px-4 py-2 text-left shadow-card transition hover:border-accent/40 focus-outline"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/20 bg-surface/95 text-lg font-semibold text-accent shadow-soft transition group-hover:scale-105">
              DD
            </span>
            <span>
              <p className="text-xs uppercase tracking-[0.35em] text-foreground/70">Digital Diary</p>
              <p className="text-sm font-semibold text-foreground/90">Your personal journal companion</p>
            </span>
          </button>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-foreground/70 transition hover:text-accent focus-outline">
              Features
            </a>
            <a href="#timeline" className="text-sm font-medium text-foreground/70 transition hover:text-accent focus-outline">
              Daily flow
            </a>
            <a href="#testimonials" className="text-sm font-medium text-foreground/70 transition hover:text-accent focus-outline">
              Voices
            </a>
            <button
              type="button"
              onClick={handleNavigateLogin}
              className="group inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent px-5 py-2 text-sm font-semibold text-foreground-invert shadow-card transition hover:-translate-y-0.5 hover:border-accent focus-outline"
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
          <div id="mobile-menu" className="border-t border-foreground/10 bg-surface/95 px-5 pb-5 pt-4 md:hidden">
            <div className="flex flex-col gap-3">
              <a
                href="#features"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-foreground/80 transition hover:border-accent/40 focus-outline"
              >
                Features
              </a>
              <a
                href="#timeline"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-foreground/80 transition hover:border-accent/40 focus-outline"
              >
                Daily flow
              </a>
              <a
                href="#testimonials"
                onClick={() => setIsMenuOpen(false)}
                className="rounded-xl border border-transparent px-4 py-3 text-sm font-semibold text-foreground/80 transition hover:border-accent/40 focus-outline"
              >
                Voices
              </a>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  handleNavigateLogin();
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-accent/30 bg-accent px-4 py-3 text-sm font-semibold text-foreground-invert shadow-card transition hover:-translate-y-0.5 focus-outline"
              >
                Start journaling
                <FiArrowRight />
              </button>
            </div>
          </div>
        )}
      </header>

      <main id="main" className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-24 px-5 pb-24 pt-16 md:px-10 md:pb-32 md:pt-20">
        <HeroMotion
          className="grid gap-16 md:grid-cols-[1fr_minmax(0,420px)] md:items-center"
          {...(prefersReducedMotion
            ? {}
            : {
                initial: 'hidden',
                animate: 'visible',
                variants: fadeUp,
                transition: { duration: 0.65 },
              })}
        >
          <section className="flex flex-col gap-8">
            <div className="space-y-6">
              <h1 className="font-heading text-[clamp(2.8rem,2.1rem+2.2vw,4.6rem)] leading-[1.05] text-foreground">
                Organize Your Life, One Entry at a Time
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-foreground/70">
                Digital Diary helps you capture thoughts, track moods, manage tasks, and stay organized. All in one secure, private space.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={handleNavigateLogin}
                className="group inline-flex items-center justify-center gap-3 rounded-full border border-accent/40 bg-gradient-to-r from-[#5b5bff] via-[#7b7cff] to-[#4de1ff] px-7 py-3 text-base font-semibold text-foreground-invert shadow-elevated transition hover:-translate-y-0.5 focus-outline"
              >
                Start journaling
                <FiArrowRight className="transition-transform group-hover:translate-x-1.5" />
              </button>
              <button
                type="button"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="inline-flex items-center justify-center rounded-full border border-foreground/15 bg-surface px-6 py-3 text-base font-semibold text-foreground/80 shadow-soft transition hover:border-accent/40 focus-outline"
              >
                Explore features
              </button>
            </div>
          </section>
          <section
            className={cn(
              'relative flex flex-col gap-5 rounded-3xl border border-accent/10 bg-surface/70 p-6 shadow-glass backdrop-blur-[36px]',
              'before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-gradient-to-br before:from-[#5b5bff]/15 before:to-transparent',
            )}
          >
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-foreground/60">Why Digital Diary?</p>
              <div className="space-y-4">
                <div className="rounded-2xl border border-foreground/10 bg-surface/80 p-4 shadow-soft transition hover:border-accent/30">
                  <p className="text-sm font-semibold text-foreground mb-2">All-in-One Platform</p>
                  <p className="text-sm leading-relaxed text-foreground/70">Diary entries, notes, tasks, todos, and mood tracking in one place.</p>
                </div>
                <div className="rounded-2xl border border-foreground/10 bg-surface/80 p-4 shadow-soft transition hover:border-accent/30">
                  <p className="text-sm font-semibold text-foreground mb-2">AI-Powered Insights</p>
                  <p className="text-sm leading-relaxed text-foreground/70">Get personalized wellness insights from Samiya, your AI assistant.</p>
                </div>
                <div className="rounded-2xl border border-foreground/10 bg-surface/80 p-4 shadow-soft transition hover:border-accent/30">
                  <p className="text-sm font-semibold text-foreground mb-2">Secure & Private</p>
                  <p className="text-sm leading-relaxed text-foreground/70">Your data is encrypted and secure. Your privacy is our priority.</p>
                </div>
              </div>
            </div>
          </section>
        </HeroMotion>

        <section id="features" className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <h2 className="font-heading text-[clamp(2.2rem,1.9rem+1vw,3.2rem)] leading-[1.1] text-foreground">
              Everything You Need
            </h2>
            <p className="text-lg text-foreground/70">
              Powerful features to help you stay organized and mindful.
            </p>
          </div>
          <motion.div
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={prefersReducedMotion ? undefined : staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature) => (
              <motion.article
                key={feature.id}
                variants={prefersReducedMotion ? undefined : fadeUp}
                className="group h-full rounded-3xl border border-foreground/10 bg-surface/80 p-6 shadow-soft transition hover:-translate-y-1 hover:border-accent/30 hover:shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent shadow-inner">
                  {feature.icon}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-foreground/70">{feature.description}</p>
              </motion.article>
            ))}
          </motion.div>
        </section>

        <section
          id="timeline"
          className="rounded-3xl border border-foreground/10 bg-surface/80 p-8 shadow-glass backdrop-blur-[40px]"
        >
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl space-y-4">
              <h2 className="font-heading text-[clamp(2rem,1.7rem+1vw,2.8rem)] text-foreground">A day with Digital Diary</h2>
              <p className="text-base text-foreground/70">
                See how Digital Diary helps you organize your thoughts, track your mood, and manage your tasks throughout the day.
              </p>
            </div>
            <button
              type="button"
              onClick={handleNavigateLogin}
              className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent px-5 py-2 text-sm font-semibold text-foreground-invert shadow-card transition hover:-translate-y-0.5 focus-outline"
            >
              Try the flow
              <FiArrowRight />
            </button>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {journey.map((event) => (
              <div
                key={event.title}
                className="relative flex h-full flex-col gap-3 rounded-2xl border border-foreground/10 bg-surface/70 p-5 shadow-soft"
              >
                <span className="text-xs font-medium uppercase tracking-[0.35em] text-foreground/50">{event.time}</span>
                <h3 className="text-lg font-semibold text-foreground">{event.title}</h3>
                <p className="text-sm leading-relaxed text-foreground/70">{event.description}</p>
                <span className="pointer-events-none absolute -right-4 top-4 h-10 w-10 rounded-full border border-accent/20 bg-accent/10 blur-lg" />
              </div>
            ))}
          </div>
        </section>

        <section id="testimonials" className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <h2 className="font-heading text-[clamp(2.2rem,1.9rem+1vw,3.2rem)] leading-[1.1] text-foreground">
              What Users Say
            </h2>
            <p className="text-lg text-foreground/70">
              See how Digital Diary helps people organize their lives and stay mindful.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <motion.blockquote
                key={testimonial.name}
                variants={prefersReducedMotion ? undefined : fadeUp}
                initial={prefersReducedMotion ? undefined : "hidden"}
                whileInView={prefersReducedMotion ? undefined : "visible"}
                viewport={{ once: true, amount: 0.1 }}
                className="relative h-full rounded-3xl border border-foreground/10 bg-surface/90 p-6 text-sm leading-relaxed shadow-soft transition hover:-translate-y-1 hover:border-accent/30 hover:shadow-card"
              >
                <FaQuoteLeft className="text-3xl text-accent/60" aria-hidden />
                <p className="mt-4 text-base text-foreground">"{testimonial.quote}"</p>
                <footer className="mt-6">
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-foreground/70">{testimonial.role}</p>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-accent/20 bg-gradient-to-r from-[#5b5bff]/35 via-[#4de1ff]/20 to-[#ff7aa8]/30 p-10 text-center shadow-card">
          <h2 className="font-heading text-[clamp(2.1rem,1.8rem+0.9vw,3rem)] leading-[1.1] text-foreground">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-base text-foreground/70">
            Sign in or create an account to begin using Digital Diary and start organizing your life.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleNavigateLogin}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/10 bg-foreground px-7 py-3 text-base font-semibold text-foreground-invert shadow-elevated transition hover:-translate-y-0.5 focus-outline"
            >
              Sign in now
            </button>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/15 bg-surface px-6 py-3 text-base font-semibold text-foreground/80 shadow-soft transition hover:border-accent/30 focus-outline"
            >
              Rewatch intro
            </button>
          </div>
        </section>
      </main>

      <footer className="border-t border-foreground/10 bg-surface/80 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 text-sm text-foreground/60 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="text-sm font-semibold text-foreground/80">Digital Diary</p>
            <p className="text-xs">© {new Date().getFullYear()} Digital Diary. All rights reserved.</p>
          </div>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:hello@digitaldiary.app" className="transition hover:text-accent focus-outline">
              Contact
            </a>
            <a href="/privacy" className="transition hover:text-accent focus-outline">
              Privacy
            </a>
            <a href="/terms" className="transition hover:text-accent focus-outline">
              Terms
            </a>
          </div>
        </div>
      </footer>

      <AIChatWidget />
    </div>
  );
};

export default LandingPage;


