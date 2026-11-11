import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            'font-size': [
                {
                    text: [
                        'display',
                        'h1',
                        'h2',
                        'h3',
                        'body',
                        'small',
                        'caption',
                        'eyebrow',
                    ],
                },
            ],
        },
    },
});

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
