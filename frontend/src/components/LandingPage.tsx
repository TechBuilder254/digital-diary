import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiHeart,
  FiShield,
  FiTrendingUp,
  FiUsers,
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
        id: 'mood',
        title: 'Mood radar',
        description: 'Track emotional patterns and receive AI nudges when stress spikes before exams.',
        icon: <FiHeart className="h-6 w-6" />,
      },
      {
        id: 'planner',
        title: 'Adaptive planner',
        description: 'Sync class timetables with personal tasks to build a balanced study routine.',
        icon: <FiCalendar className="h-6 w-6" />,
      },
      {
        id: 'focus',
        title: 'Focus timer',
        description: 'Layered Pomodoro sessions tied to your diary entries for better accountability.',
        icon: <FiClock className="h-6 w-6" />,
      },
      {
        id: 'insights',
        title: 'Insight engine',
        description: 'AI-generated reflections connecting moods, study habits, and wellness goals.',
        icon: <FiTrendingUp className="h-6 w-6" />,
      },
      {
        id: 'community',
        title: 'Mentor snippets',
        description: 'Anonymous campus mentors share weekly prompts to keep you inspired.',
        icon: <FiUsers className="h-6 w-6" />,
      },
      {
        id: 'privacy',
        title: 'Private vault',
        description: 'Multi-layer encryption and passphrase lock so your stories stay yours.',
        icon: <FiShield className="h-6 w-6" />,
      },
    ],
    [],
  );

  const spotlights = useMemo<Spotlight[]>(
    () => [
      {
        name: 'Zuri',
        major: 'Psychology senior',
        story: 'Uses Digital Diary to log moods between therapy sessions and schedule group study.',
        stats: '+18% weekly focus',
      },
      {
        name: 'Amaan',
        major: 'Computer science sophomore',
        story: 'Builds sprint retros in minutes and syncs tasks with lab partners after lectures.',
        stats: '3x faster planning',
      },
      {
        name: 'Lina',
        major: 'Design freshman',
        story: 'Captures creative sparks on mobile, then expands reflections during studio nights.',
        stats: 'Daily streak 124',
      },
    ],
    [],
  );

  const journey = useMemo<JourneyEvent[]>(
    () => [
      {
        time: '08:00',
        title: 'Morning clarity',
        description: 'Capture overnight ideas, align priorities with your calendar.',
      },
      {
        time: '12:30',
        title: 'Campus check-in',
        description: 'Log midday energy, tag group projects, share a gratitude snapshot.',
      },
      {
        time: '17:45',
        title: 'Studio reset',
        description: 'Review tasks, attach lecture notes, track focus timer stats.',
      },
      {
        time: '22:15',
        title: 'Night reflection',
        description: 'Summarise highs & lows, get AI prompts for tomorrow’s mindset.',
      },
    ],
    [],
  );

  const testimonials = useMemo<Testimonial[]>(
    () => [
      {
        quote: 'Digital Diary feels like the wellness desk on campus—always open, always private.',
        name: 'Nura Abebe',
        role: 'Residence advisor, Addis Ababa University',
      },
      {
        quote: 'I finally track patterns between mood, sleep, and grades without another spreadsheet.',
        name: 'Ravi Desai',
        role: 'Engineering student, UBC',
      },
      {
        quote: 'Our study group syncs tasks and reflections in one feed. It keeps us accountable.',
        name: 'Camille Laurent',
        role: 'MBA candidate, ESCP',
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
              <p className="text-sm font-semibold text-foreground/90">Neuro-adaptive journaling</p>
            </span>
          </button>

          <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm font-medium text-foreground/70 transition hover:text-accent focus-outline">
              Features
            </a>
            <a href="#timeline" className="text-sm font-medium text-foreground/70 transition hover:text-accent focus-outline">
              Student day
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
                Student day
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
            <div className="inline-flex w-fit items-center gap-3 rounded-full border border-accent/20 bg-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-accent">
              <span className="flex h-2 w-2 items-center justify-center rounded-full bg-accent" />
              Campus edition
            </div>
            <div className="space-y-6">
              <h1 className="font-heading text-[clamp(2.8rem,2.1rem+2.2vw,4.6rem)] leading-[1.05] text-foreground">
                Your future memories deserve a smarter campus journal.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-foreground/70">
                Digital Diary helps students capture moods, class notes, and life milestones in one encrypted hub. Stay
                grounded, organised, and ready for every exam or adventure.
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
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Active streaks', value: '18,940+' },
                { label: 'Campuses represented', value: '220' },
                { label: 'Private entries captured', value: '2.1M' },
              ].map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-foreground/10 bg-surface/60 px-5 py-4 text-sm text-foreground/70 shadow-inner backdrop-blur-xl"
                >
                  <p className="text-xs uppercase tracking-[0.35em] text-foreground/50">{metric.label}</p>
                  <p className="mt-2 text-xl font-semibold text-foreground">{metric.value}</p>
                </div>
              ))}
            </div>
          </section>
          <section
            className={cn(
              'relative flex flex-col gap-5 rounded-3xl border border-accent/10 bg-surface/70 p-6 shadow-glass backdrop-blur-[36px]',
              'before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-gradient-to-br before:from-[#5b5bff]/15 before:to-transparent',
            )}
          >
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-foreground/60">Student spotlights</p>
              <div className="grid gap-4">
                {spotlights.map((spotlight) => (
                  <div
                    key={spotlight.name}
                    className="rounded-2xl border border-foreground/10 bg-surface/80 p-4 shadow-soft transition hover:border-accent/30"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{spotlight.name}</p>
                        <p className="text-xs text-foreground/60">{spotlight.major}</p>
                      </div>
                      <span className="rounded-full border border-accent/40 bg-accent/20 px-3 py-1 text-xs font-semibold text-accent">
                        {spotlight.stats}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-foreground/70">{spotlight.story}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-accent/30 bg-gradient-to-br from-[#4de1ff]/20 via-transparent to-[#ff7aa8]/20 p-4 text-sm text-foreground/80 shadow-card">
              <p className="text-xs uppercase tracking-[0.35em] text-foreground/60">Campus wellness</p>
              <p className="mt-2 leading-relaxed">
                Pair your diary with guided breathwork, focus timers, and AI micro-reflections tuned to your class load.
              </p>
            </div>
          </section>
        </HeroMotion>

        <section id="features" className="space-y-12">
          <div className="max-w-2xl space-y-4">
            <h2 className="font-heading text-[clamp(2.2rem,1.9rem+1vw,3.2rem)] leading-[1.1] text-foreground">
              Everything your campus brain needs in one private hub.
            </h2>
            <p className="text-lg text-foreground/70">
              Built for students balancing lectures, clubs, research, and rest. Digital Diary adapts to your schedule and
              keeps wellness front and centre.
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
                Follow a student through their campus loop. Digital Diary reinforces healthy habits and keeps academic
                goals aligned.
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
              Real voices. Real wins.
            </h2>
            <p className="text-lg text-foreground/70">
              Students, mentors, and wellbeing leads share how Digital Diary anchors their routines.
            </p>
          </div>
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={prefersReducedMotion ? undefined : staggerParent}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {testimonials.map((testimonial) => (
              <motion.blockquote
                key={testimonial.name}
                variants={prefersReducedMotion ? undefined : fadeUp}
                className="relative h-full rounded-3xl border border-foreground/10 bg-surface/90 p-6 text-sm leading-relaxed text-foreground/75 shadow-soft transition hover:-translate-y-1 hover:border-accent/30 hover:shadow-card"
              >
                <FaQuoteLeft className="text-3xl text-accent/60" aria-hidden />
                <p className="mt-4 text-base text-foreground/80">“{testimonial.quote}”</p>
                <footer className="mt-6">
                  <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-foreground/60">{testimonial.role}</p>
                </footer>
              </motion.blockquote>
            ))}
          </motion.div>
        </section>

        <section className="rounded-3xl border border-accent/20 bg-gradient-to-r from-[#5b5bff]/35 via-[#4de1ff]/20 to-[#ff7aa8]/30 p-10 text-center shadow-card">
          <p className="text-sm uppercase tracking-[0.35em] text-foreground/60">Free for students</p>
          <h2 className="mt-4 font-heading text-[clamp(2.1rem,1.8rem+0.9vw,3rem)] leading-[1.1] text-foreground">
            Ready to protect your stories and amplify your campus journey?
          </h2>
          <p className="mt-4 text-base text-foreground/70">
            Sign in with the account screen you saw earlier and unlock AI reflections, secure vaults, and adaptive
            planners.
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
            <p className="text-xs">© {new Date().getFullYear()} Digital Diary Collective. Built for campus wellbeing.</p>
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


