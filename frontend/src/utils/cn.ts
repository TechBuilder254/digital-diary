import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: (string | false | null | undefined)[]) => twMerge(clsx(inputs));

export default cn;



