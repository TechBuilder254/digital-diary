import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import cn from '../../utils/cn';

interface AuthHeroProps {
  className?: string;
}

const AuthHero: React.FC<AuthHeroProps> = ({ className }) => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        'relative flex h-full flex-1 items-center justify-center rounded-3xl border border-accent/10 bg-gradient-to-br from-accent/15 via-transparent to-surface-muted/60 p-10',
        'shadow-glass backdrop-blur-[60px]',
        className,
      )}
    >
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        {!prefersReducedMotion && (
          <>
            <motion.div
              className="absolute -top-20 right-6 h-52 w-52 rounded-full bg-accent/30 blur-3xl"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-accent-soft/25 blur-3xl"
              animate={{ opacity: [0.35, 0.7, 0.35] }}
              transition={{ repeat: Infinity, duration: 12, ease: 'easeInOut', delay: 1.1 }}
            />
          </>
        )}
      </div>

      <div className="relative z-10 grid w-full max-w-md gap-6 text-foreground-invert sm:max-w-lg">
        <header className="space-y-4">
          <span className="inline-flex items-center rounded-full border border-foreground-invert/20 bg-foreground-invert/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-foreground-invert/70 backdrop-blur-xs">
            Insight engine
          </span>
          <h2 className="font-heading text-[clamp(2.2rem,1.8rem+1.3vw,3rem)] leading-tight text-foreground-invert">
            Your memories, moods, and notes synchronized in one neuro-adaptive hub.
          </h2>
          <p className="text-base leading-relaxed text-foreground-invert/80">
            Digital Diary uses layered encryption, biometric checkpoints, and AI-driven insights to keep your routines aligned.
            Rejoin to continue where you left off.
          </p>
        </header>

        <div className="grid gap-4">
          <motion.article
            className="flex items-center justify-between rounded-2xl border border-foreground-invert/10 bg-foreground-invert/10 px-5 py-4 text-foreground-invert shadow-xl backdrop-blur-xs"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.6, 0.2, 0.1, 1] }}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-foreground-invert/70">Streak</p>
              <p className="font-heading text-3xl font-semibold">128 days</p>
            </div>
            <div className="rounded-xl bg-foreground-invert/20 px-3 py-2 text-xs font-medium uppercase tracking-[0.3em] text-foreground-invert/80">
              Consistency • +
            </div>
          </motion.article>

          <motion.div
            className="grid gap-3 rounded-2xl border border-foreground-invert/10 bg-foreground-invert/10 p-5 text-foreground-invert shadow-xl backdrop-blur-xs md:grid-cols-2"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 24 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35, ease: [0.6, 0.2, 0.1, 1] }}
          >
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-foreground-invert/70">Latest reflection</p>
              <p className="mt-2 text-sm text-foreground-invert/90">
                “Productive sprint, energy high. Tomorrow focus on mindfulness and hydration.”
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-foreground-invert/70">Mood trend</p>
              <p className="mt-2 font-heading text-[clamp(1.6rem,1.4rem+0.5vw,2rem)] text-foreground-invert">Elevated ↑</p>
              <p className="text-xs text-foreground-invert/70">+12% week-over-week</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthHero;

