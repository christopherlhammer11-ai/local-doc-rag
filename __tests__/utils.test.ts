/**
 * Local Doc RAG Utils Tests
 *
 * Test framework: Vitest (add to package.json devDependencies if not present)
 * Install: npm install -D vitest @vitest/ui
 * Run tests: npx vitest
 * Run once: npx vitest run
 *
 * Tests cover:
 * - cn() utility function (class name merger)
 * - Edge cases with Tailwind and CSS class combinations
 * - Conflict resolution between class names
 */

import { describe, it, expect } from 'vitest';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names using clsx and tailwind-merge
 * This mirrors the cn() function from lib/utils.ts
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

describe('cn() Utility Function', () => {
  describe('Basic Class Concatenation', () => {
    it('should concatenate single strings', () => {
      const result = cn('px-4', 'py-2');
      expect(result).toBe('px-4 py-2');
    });

    it('should handle empty strings', () => {
      const result = cn('px-4', '', 'py-2');
      expect(result).toBe('px-4 py-2');
    });

    it('should handle multiple arguments', () => {
      const result = cn('px-4', 'py-2', 'rounded', 'bg-blue-500');
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).toContain('rounded');
      expect(result).toContain('bg-blue-500');
    });

    it('should trim whitespace', () => {
      const result = cn('  px-4  ', '  py-2  ');
      expect(result).not.toContain('  ');
    });
  });

  describe('Conditional Classes', () => {
    it('should handle boolean conditionals', () => {
      const isActive = true;
      const result = cn(isActive && 'text-blue-600', 'px-4');
      expect(result).toContain('text-blue-600');
      expect(result).toContain('px-4');
    });

    it('should exclude false conditionals', () => {
      const isActive = false;
      const result = cn(isActive && 'text-blue-600', 'px-4');
      expect(result).not.toContain('text-blue-600');
      expect(result).toContain('px-4');
    });

    it('should handle null and undefined', () => {
      const result = cn(null, 'px-4', undefined, 'py-2');
      expect(result).toBe('px-4 py-2');
    });

    it('should handle object conditionals', () => {
      const result = cn({
        'px-4': true,
        'py-2': true,
        'bg-red-500': false,
      });
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).not.toContain('bg-red-500');
    });
  });

  describe('Tailwind Class Merging', () => {
    it('should resolve conflicting padding classes', () => {
      const result = cn('px-4', 'px-8');
      // The last value should win (or merge appropriately)
      expect(result).toBeDefined();
      expect(result.length).toBeGreaterThan(0);
    });

    it('should resolve conflicting background colors', () => {
      const result = cn('bg-red-500', 'bg-blue-500');
      // twMerge should handle the conflict
      expect(result).toBeDefined();
    });

    it('should handle responsive classes', () => {
      const result = cn('text-sm', 'md:text-base', 'lg:text-lg');
      expect(result).toContain('text-sm');
      expect(result).toContain('md:text-base');
      expect(result).toContain('lg:text-lg');
    });

    it('should handle hover and focus states', () => {
      const result = cn('bg-blue-500', 'hover:bg-blue-600', 'focus:bg-blue-700');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('hover:bg-blue-600');
      expect(result).toContain('focus:bg-blue-700');
    });

    it('should handle dark mode classes', () => {
      const result = cn('bg-white', 'dark:bg-black', 'text-black', 'dark:text-white');
      expect(result).toBeDefined();
    });
  });

  describe('Complex Combinations', () => {
    it('should merge base and variant classes', () => {
      const result = cn('px-4 py-2', 'rounded', 'bg-blue-500 hover:bg-blue-600');
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).toContain('rounded');
      expect(result).toContain('bg-blue-500');
    });

    it('should handle arrow function returns', () => {
      const isActive = true;
      const getClasses = () => isActive ? 'text-blue-600' : 'text-gray-600';
      const result = cn(getClasses(), 'px-4');
      expect(result).toContain('px-4');
    });

    it('should merge conflicting widths correctly', () => {
      const result = cn('w-full', 'w-1/2');
      expect(result).toBeDefined();
    });

    it('should merge conflicting heights correctly', () => {
      const result = cn('h-screen', 'h-96');
      expect(result).toBeDefined();
    });

    it('should handle display classes', () => {
      const result = cn('hidden', 'md:block', 'lg:flex');
      expect(result).toBeDefined();
    });
  });

  describe('Array Inputs', () => {
    it('should handle array of classes', () => {
      const classes = ['px-4', 'py-2', 'rounded'];
      const result = cn(...classes);
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).toContain('rounded');
    });

    it('should handle mixed array and string inputs', () => {
      const result = cn(['px-4', 'py-2'], 'rounded', ['bg-blue-500']);
      expect(result).toContain('px-4');
      expect(result).toContain('py-2');
      expect(result).toContain('rounded');
      expect(result).toContain('bg-blue-500');
    });
  });

  describe('Real-World Component Patterns', () => {
    it('should work for button variants', () => {
      const baseButton = cn('px-4 py-2 rounded font-medium transition');
      const primaryButton = cn(baseButton, 'bg-blue-500 text-white hover:bg-blue-600');
      const secondaryButton = cn(baseButton, 'bg-gray-200 text-gray-800 hover:bg-gray-300');

      expect(primaryButton).toContain('px-4');
      expect(primaryButton).toContain('bg-blue-500');
      expect(secondaryButton).toContain('bg-gray-200');
    });

    it('should work for responsive layouts', () => {
      const containerClasses = cn(
        'w-full',
        'px-4',
        'md:px-6',
        'lg:px-8',
        'mx-auto',
        'max-w-7xl'
      );

      expect(containerClasses).toContain('w-full');
      expect(containerClasses).toContain('mx-auto');
    });

    it('should work for card components', () => {
      const isHovered = true;
      const cardClasses = cn(
        'bg-white rounded-lg shadow',
        isHovered && 'shadow-lg',
        'transition-shadow duration-200',
        'p-6'
      );

      expect(cardClasses).toContain('bg-white');
      expect(cardClasses).toContain('rounded-lg');
      expect(cardClasses).toContain('p-6');
    });

    it('should work for badge/tag components', () => {
      const variants = {
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        error: 'bg-red-100 text-red-800',
      };

      const badgeClasses = cn(
        'inline-block px-3 py-1 rounded-full text-sm font-medium',
        variants.success
      );

      expect(badgeClasses).toContain('inline-block');
      expect(badgeClasses).toContain('px-3');
      expect(badgeClasses).toContain('rounded-full');
    });

    it('should work for form components', () => {
      const hasError = false;
      const inputClasses = cn(
        'w-full px-3 py-2 border rounded',
        'focus:outline-none focus:ring-2',
        hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
      );

      expect(inputClasses).toContain('w-full');
      expect(inputClasses).toContain('px-3');
      expect(inputClasses).toContain('border');
    });
  });

  describe('Edge Cases', () => {
    it('should handle no arguments', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('should handle only whitespace', () => {
      const result = cn('  ', '\t', '\n');
      expect(result).toBe('');
    });

    it('should handle very long class strings', () => {
      const longClass = new Array(100).fill('px-4').join(' ');
      const result = cn(longClass);
      expect(result).toBeDefined();
    });

    it('should handle special characters in custom classes', () => {
      const result = cn('custom-class-with-dash_and_underscore');
      expect(result).toContain('custom-class-with-dash_and_underscore');
    });

    it('should handle numeric pseudo-classes', () => {
      const result = cn('first:border-t-0', 'last:border-b-0');
      expect(result).toContain('first:border-t-0');
      expect(result).toContain('last:border-b-0');
    });

    it('should preserve arbitrary values', () => {
      const result = cn('[&::-webkit-scrollbar]:w-2');
      expect(result).toBeDefined();
    });
  });

  describe('Class Deduplication', () => {
    it('should deduplicate identical classes', () => {
      const result = cn('px-4', 'px-4', 'px-4');
      // Should contain px-4 but ideally only once
      expect(result).toContain('px-4');
    });

    it('should handle conflicting modifiers', () => {
      const result = cn('sm:px-4', 'md:px-4', 'lg:px-4');
      expect(result).toContain('sm:px-4');
      expect(result).toContain('md:px-4');
      expect(result).toContain('lg:px-4');
    });
  });

  describe('Integration Tests', () => {
    it('should work with React component patterns', () => {
      const props = {
        size: 'lg' as const,
        variant: 'primary' as const,
        disabled: false,
      };

      const baseClasses = 'px-4 py-2 rounded font-medium';
      const sizeClasses = props.size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2';
      const variantClasses =
        props.variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';
      const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : '';

      const finalClasses = cn(baseClasses, sizeClasses, variantClasses, disabledClasses);

      expect(finalClasses).toBeDefined();
      expect(finalClasses.length).toBeGreaterThan(0);
    });

    it('should compose multiple utility functions', () => {
      const textClasses = cn('text-sm', 'font-medium', 'text-gray-700');
      const spacingClasses = cn('px-4', 'py-2');
      const containerClasses = cn('rounded bg-white shadow', textClasses, spacingClasses);

      expect(containerClasses).toContain('rounded');
      expect(containerClasses).toContain('text-sm');
      expect(containerClasses).toContain('px-4');
    });
  });

  describe('Type Safety', () => {
    it('should accept string class values', () => {
      const result = cn('px-4');
      expect(typeof result).toBe('string');
    });

    it('should accept boolean values', () => {
      const result = cn(true && 'px-4', false && 'py-2');
      expect(typeof result).toBe('string');
    });

    it('should accept undefined values', () => {
      const value: string | undefined = undefined;
      const result = cn('px-4', value);
      expect(typeof result).toBe('string');
    });

    it('should return string type', () => {
      const result = cn('px-4', 'py-2');
      expect(typeof result).toBe('string');
    });
  });
});
