import React, { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, useReducedMotion } from 'framer-motion';
import { useMutation } from '@tanstack/react-query';
import { FiAlertCircle, FiCheckCircle, FiLock, FiMail, FiUser } from 'react-icons/fi';
import cn from '../../utils/cn';
import { authService, RegisterCredentials, RegisterResponse } from '../../config/authService';
import { useAuthAnalytics } from '../../hooks/useAuthAnalytics';

const registerSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must contain at least 3 characters')
      .max(40, 'Username is too long')
      .regex(/^[a-zA-Z0-9._-]+$/, 'Use letters, numbers, dots or dashes'),
    email: z.string().trim().email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Password must contain at least 8 characters')
      .max(100, 'Password is too long')
      .regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/, 'Use upper, lower, and a number'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    agreeToTerms: z.boolean().refine((value) => value, 'You must agree to the terms to continue'),
  })
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        path: ['confirmPassword'],
        code: z.ZodIssueCode.custom,
        message: 'Passwords must match',
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterSuccessPayload {
  username: string;
  email: string;
  message: string;
}

interface ProRegisterFormProps {
  onSuccess: (payload: RegisterSuccessPayload) => void;
  onSwitchToLogin: () => void;
  className?: string;
  defaultValues?: Partial<RegisterFormValues>;
}

const motionVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const formToCredentials = (values: RegisterFormValues): RegisterCredentials => ({
  username: values.username.trim(),
  email: values.email.trim().toLowerCase(),
  password: values.password,
});

const ProRegisterForm: React.FC<ProRegisterFormProps> = ({
  onSuccess,
  onSwitchToLogin,
  className,
  defaultValues,
}) => {
  const prefersReducedMotion = useReducedMotion();
  const { trackRegisterError, trackRegisterSuccess } = useAuthAnalytics();
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
      ...defaultValues,
    },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  const mutation = useMutation({
    mutationFn: async (values: RegisterFormValues) => {
      const payload = formToCredentials(values);
      return authService.register(payload);
    },
    onSuccess: (data: RegisterResponse, variables) => {
      const successMessage = data.message || 'Registration successful!';
      setFormError(null);
      setFormSuccess(successMessage);
      trackRegisterSuccess({ email: variables.email });
      onSuccess({ username: variables.username, email: variables.email, message: successMessage });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to create account. Please try again.';
      setFormSuccess(null);
      setFormError(message);
      trackRegisterError({ errorMessage: message, context: 'registration_form' });
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    mutation.mutate(values);
  });

  const buttonLabel = useMemo(
    () => (mutation.isPending ? 'Creating your space…' : 'Create your account'),
    [mutation.isPending],
  );

  return (
    <motion.form
      onSubmit={handleSubmit}
      className={cn(
        'relative z-10 flex w-full flex-col gap-6 rounded-3xl border border-accent/10 bg-surface/90 p-10 shadow-glass backdrop-blur-xl md:max-w-[420px]',
        'before:absolute before:inset-0 before:-z-10 before:rounded-3xl before:bg-gradient-to-br before:from-accent/10 before:via-transparent before:to-accent/5',
        className,
      )}
      variants={prefersReducedMotion ? undefined : motionVariants}
      initial="initial"
      animate="animate"
      transition={{ duration: 0.55, ease: [0.6, 0.2, 0.1, 1] }}
      noValidate
    >
      <header className="space-y-2">
        <p className="text-sm font-medium uppercase tracking-[0.35em] text-accent/80">Digital Diary</p>
        <h1 className="font-heading text-[clamp(2rem,1.7rem+1.2vw,2.8rem)] leading-tight text-foreground">
          Craft your presence<span className="text-accent">.</span>
        </h1>
        <p className="text-base leading-relaxed text-foreground/70">
          Create your secure account and unlock adaptive journaling, mood intelligence, and seamless organization.
        </p>
      </header>

      <div className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="username" className="text-sm font-semibold text-foreground/80">
            Username
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-surface px-4 py-3 shadow-inner transition duration-300 focus-within:border-accent focus-within:shadow-card">
            <FiUser aria-hidden className="h-5 w-5 text-accent/70" />
            <input
              id="username"
              type="text"
              autoComplete="username"
              className="w-full bg-transparent text-base text-foreground placeholder:text-foreground/50 focus:outline-none"
              placeholder="lucid-architect"
              {...form.register('username')}
            />
          </div>
          {form.formState.errors.username && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error">
              <FiAlertCircle aria-hidden className="h-4 w-4" />
              {form.formState.errors.username.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-semibold text-foreground/80">
            Email
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-surface px-4 py-3 shadow-inner transition duration-300 focus-within:border-accent focus-within:shadow-card">
            <FiMail aria-hidden className="h-5 w-5 text-accent/70" />
            <input
              id="email"
              type="email"
              autoComplete="email"
              className="w-full bg-transparent text-base text-foreground placeholder:text-foreground/50 focus:outline-none"
              placeholder="you@digital-diary.app"
              {...form.register('email')}
            />
          </div>
          {form.formState.errors.email && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error">
              <FiAlertCircle aria-hidden className="h-4 w-4" />
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-semibold text-foreground/80">
            Password
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-surface px-4 py-3 shadow-inner transition duration-300 focus-within:border-accent focus-within:shadow-card">
            <FiLock aria-hidden className="h-5 w-5 text-accent/70" />
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className="w-full bg-transparent text-base text-foreground placeholder:text-foreground/50 focus:outline-none"
              placeholder="••••••••"
              {...form.register('password')}
            />
          </div>
          {form.formState.errors.password && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error">
              <FiAlertCircle aria-hidden className="h-4 w-4" />
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground/80">
            Confirm password
          </label>
          <div className="flex items-center gap-3 rounded-2xl border border-accent/20 bg-surface px-4 py-3 shadow-inner transition duration-300 focus-within:border-accent focus-within:shadow-card">
            <FiLock aria-hidden className="h-5 w-5 text-accent/70" />
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className="w-full bg-transparent text-base text-foreground placeholder:text-foreground/50 focus:outline-none"
              placeholder="Repeat your password"
              {...form.register('confirmPassword')}
            />
          </div>
          {form.formState.errors.confirmPassword && (
            <p role="alert" className="flex items-center gap-2 text-sm text-error">
              <FiAlertCircle aria-hidden className="h-4 w-4" />
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <label className="inline-flex items-start gap-3 text-sm text-foreground/70">
        <input
          type="checkbox"
          className="mt-1 h-5 w-5 rounded-lg border border-accent/40 bg-surface transition-all duration-300 checked:border-transparent checked:bg-accent focus-outline"
          {...form.register('agreeToTerms')}
        />
        <span>
          I agree to the
          {' '}
          <a href="https://digital-diary.app/terms" className="font-semibold text-accent focus-outline">
            terms of service
          </a>
          {' '}and{' '}
          <a href="https://digital-diary.app/privacy" className="font-semibold text-accent focus-outline">
            privacy commitments
          </a>
          .
        </span>
      </label>
      {form.formState.errors.agreeToTerms && (
        <p role="alert" className="flex items-center gap-2 text-sm text-error">
          <FiAlertCircle aria-hidden className="h-4 w-4" />
          {form.formState.errors.agreeToTerms.message}
        </p>
      )}

      <motion.button
        type="submit"
        disabled={mutation.isPending}
        className={cn(
          'relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-full bg-gradient-to-r from-accent via-accent-soft to-accent text-base font-semibold text-foreground-invert shadow-lg transition duration-500 focus-outline',
          'hover:shadow-card disabled:cursor-not-allowed disabled:opacity-70',
        )}
        whileHover={prefersReducedMotion ? undefined : { scale: mutation.isPending ? 1 : 1.01 }}
        whileTap={prefersReducedMotion ? undefined : { scale: mutation.isPending ? 1 : 0.98 }}
        aria-live="polite"
      >
        <span className="relative z-10 px-10 py-3">{buttonLabel}</span>
        {!prefersReducedMotion && (
          <motion.span
            className="absolute inset-0 z-0 bg-gradient-to-r from-white/10 via-accent-soft/30 to-transparent"
            animate={{ x: ['-120%', '120%'] }}
            transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
            aria-hidden
          />
        )}
      </motion.button>

      <div className="space-y-4">
        {formSuccess && (
          <motion.div
            role="status"
            className="flex items-start gap-3 rounded-2xl border border-success/20 bg-success/10 px-4 py-3 text-sm text-success shadow-inner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FiCheckCircle aria-hidden className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Account created</p>
              <p>{formSuccess}</p>
            </div>
          </motion.div>
        )}

        {formError && (
          <motion.div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-error shadow-inner"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <FiAlertCircle aria-hidden className="mt-0.5 h-5 w-5" />
            <div>
              <p className="font-semibold">Registration failed</p>
              <p>{formError}</p>
            </div>
          </motion.div>
        )}
      </div>

      <motion.div
        className="rounded-2xl border border-accent/10 bg-surface-muted/60 px-4 py-3 text-xs text-foreground/60"
        initial={prefersReducedMotion ? undefined : { opacity: 0, y: 16 }}
        animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.45 }}
      >
        Already part of Digital Diary?
        {' '}
        <button type="button" className="font-semibold text-accent focus-outline" onClick={onSwitchToLogin}>
          Sign in here
        </button>
        .
      </motion.div>
    </motion.form>
  );
};

export default ProRegisterForm;

