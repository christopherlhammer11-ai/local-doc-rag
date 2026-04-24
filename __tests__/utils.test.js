/**
 * Local Doc RAG Utils Tests
 *
 * Test framework: Node.js built-in test module
 * Run tests: node --test __tests__/utils.test.js
 *
 * Tests cover:
 * - cn() utility function (simplified class name merger)
 * - Edge cases with class combinations
 * - Basic class concatenation (clsx and tailwind-merge not available in Node.js)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';

/**
 * Simplified cn() function that mimics clsx behavior
 * (without tailwind-merge since it's an npm dependency)
 * This version focuses on basic class concatenation and deduplication
 */
function cn(...inputs) {
  const classes = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === 'string') {
      classes.push(...input.split(/\s+/).filter(Boolean));
    } else if (typeof input === 'object' && input !== null && !Array.isArray(input)) {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    } else if (Array.isArray(input)) {
      const nested = cn(...input);
      if (nested) classes.push(...nested.split(/\s+/).filter(Boolean));
    }
  }

  // Remove duplicates while preserving order (keep first occurrence)
  const seen = new Set();
  return classes.filter((cls) => {
    if (seen.has(cls)) return false;
    seen.add(cls);
    return true;
  }).join(' ');
}

describe('cn() Utility Function', () => {
  describe('Basic Class Concatenation', () => {
    it('should concatenate single strings', () => {
      const result = cn('px-4', 'py-2');
      assert(result.includes('px-4'));
      assert(result.includes('py-2'));
    });

    it('should handle empty strings', () => {
      const result = cn('px-4', '', 'py-2');
      assert(result.includes('px-4'));
      assert(result.includes('py-2'));
      assert(!result.startsWith(' '));
      assert(!result.endsWith(' '));
    });

    it('should handle multiple arguments', () => {
      const result = cn('px-4', 'py-2', 'rounded', 'bg-blue-500');
      assert(result.includes('px-4'));
      assert(result.includes('py-2'));
      assert(result.includes('rounded'));
      assert(result.includes('bg-blue-500'));
    });

    it('should trim whitespace', () => {
      const result = cn('  px-4  ', '  py-2  ');
      assert(!result.includes('  '));
    });
  });

  describe('Conditional Classes', () => {
    it('should handle boolean conditionals', () => {
      const isActive = true;
      const result = cn(isActive && 'text-blue-600', 'px-4');
      assert(result.includes('text-blue-600'));
      assert(result.includes('px-4'));
    });

    it('should exclude false conditionals', () => {
      const isActive = false;
      const result = cn(isActive && 'text-blue-600', 'px-4');
      assert(!result.includes('text-blue-600'));
      assert(result.includes('px-4'));
    });

    it('should handle null and undefined', () => {
      const result = cn(null, 'px-4', undefined, 'py-2');
      assert.strictEqual(result, 'px-4 py-2');
    });

    it('should handle object conditionals', () => {
      const result = cn({
        'px-4': true,
        'py-2': true,
        'bg-red-500': false,
      });
      assert(result.includes('px-4'));
      assert(result.includes('py-2'));
      assert(!result.includes('bg-red-500'));
    });
  });

  describe('Responsive Classes', () => {
    it('should handle responsive classes', () => {
      const result = cn('text-sm', 'md:text-base', 'lg:text-lg');
      assert(result.includes('text-sm'));
      assert(result.includes('md:text-base'));
      assert(result.includes('lg:text-lg'));
    });

    it('should handle hover and focus states', () => {
      const result = cn('bg-blue-500', 'hover:bg-blue-600', 'focus:bg-blue-700');
      assert(result.includes('bg-blue-500'));
      assert(result.includes('hover:bg-blue-600'));
      assert(result.includes('focus:bg-blue-700'));
    });

    it('should handle dark mode classes', () => {
      const result = cn('bg-white', 'dark:bg-black', 'text-black', 'dark:text-white');
      assert(result !== undefined);
      assert(result.length > 0);
    });
  });

  describe('Complex Combinations', () => {
    it('should merge base and variant classes', () => {
      const result = cn('px-4 py-2', 'rounded', 'bg-blue-500 hover:bg-blue-600');
      assert(result.includes('px-4'));
      assert(result.includes('py-2'));
      assert(result.includes('rounded'));
      assert(result.includes('bg-blue-500'));
    });

    it('should handle arrow function returns', () => {
      const isActive = true;
      const getClasses = () => isActive ? 'text-blue-600' : 'text-gray-600';
      const result = cn(getClasses(), 'px-4');
      assert(result.includes('px-4'));
    });

    it('should deduplicate identical widths', () => {
      const result = cn('w-full', 'w-full');
      const widthCount = (result.match(/w-full/g) || []).length;
      assert.strictEqual(widthCount, 1);
    });

    it('should deduplicate identical heights', () => {
      const result = cn('h-screen', 'h-screen');
      const heightCount = (result.match(/h-screen/g) || []).length;
      assert.strictEqual(heightCount, 1);
    });

    it('should handle display classes', () => {
      const result = cn('hidden', 'md:block', 'lg:flex');
      assert(result.includes('hidden'));
      assert(result.includes('md:block'));
      assert(result.includes('lg:flex'));
    });
  });

  describe('Array Inputs', () => {
    it('should handle array of classes', () => {
      const classes = ['px-4', 'py-2', 'rounded'];
      const result = cn(...classes);
      assert(result.includes('px-4'));
      assert(result.includes('py-2'));
      assert(result.includes('rounded'));
    });

    it('should handle mixed array and string inputs', () => {
      const result = cn(['px-4', 'py-2'], 'rounded', ['bg-blue-500']);
      assert(result.includes('px-4'));
      assert(result.includes('py-2'));
      assert(result.includes('rounded'));
      assert(result.includes('bg-blue-500'));
    });
  });

  describe('Real-World Component Patterns', () => {
    it('should work for button variants', () => {
      const baseButton = cn('px-4 py-2 rounded font-medium transition');
      const primaryButton = cn(baseButton, 'bg-blue-500 text-white hover:bg-blue-600');
      const secondaryButton = cn(baseButton, 'bg-gray-200 text-gray-800 hover:bg-gray-300');

      assert(primaryButton.includes('px-4'));
      assert(primaryButton.includes('bg-blue-500'));
      assert(secondaryButton.includes('bg-gray-200'));
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

      assert(containerClasses.includes('w-full'));
      assert(containerClasses.includes('mx-auto'));
    });

    it('should work for card components', () => {
      const isHovered = true;
      const cardClasses = cn(
        'bg-white rounded-lg shadow',
        isHovered && 'shadow-lg',
        'transition-shadow duration-200',
        'p-6'
      );

      assert(cardClasses.includes('bg-white'));
      assert(cardClasses.includes('rounded-lg'));
      assert(cardClasses.includes('p-6'));
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

      assert(badgeClasses.includes('inline-block'));
      assert(badgeClasses.includes('px-3'));
      assert(badgeClasses.includes('rounded-full'));
    });

    it('should work for form components', () => {
      const hasError = false;
      const inputClasses = cn(
        'w-full px-3 py-2 border rounded',
        'focus:outline-none focus:ring-2',
        hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'
      );

      assert(inputClasses.includes('w-full'));
      assert(inputClasses.includes('px-3'));
      assert(inputClasses.includes('border'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle no arguments', () => {
      const result = cn();
      assert.strictEqual(result, '');
    });

    it('should handle only whitespace', () => {
      const result = cn('  ', '\t', '\n');
      assert.strictEqual(result, '');
    });

    it('should handle very long class strings', () => {
      const longClass = new Array(100).fill('px-4').join(' ');
      const result = cn(longClass);
      assert(result !== undefined);
    });

    it('should handle special characters in custom classes', () => {
      const result = cn('custom-class-with-dash_and_underscore');
      assert(result.includes('custom-class-with-dash_and_underscore'));
    });

    it('should handle numeric pseudo-classes', () => {
      const result = cn('first:border-t-0', 'last:border-b-0');
      assert(result.includes('first:border-t-0'));
      assert(result.includes('last:border-b-0'));
    });

    it('should handle arbitrary values', () => {
      const result = cn('[&::-webkit-scrollbar]:w-2');
      assert(result !== undefined);
      assert(result.length > 0);
    });
  });

  describe('Class Deduplication', () => {
    it('should deduplicate identical classes', () => {
      const result = cn('px-4', 'px-4', 'px-4');
      const count = (result.match(/px-4/g) || []).length;
      assert.strictEqual(count, 1);
    });

    it('should handle conflicting modifiers', () => {
      const result = cn('sm:px-4', 'md:px-4', 'lg:px-4');
      assert(result.includes('sm:px-4'));
      assert(result.includes('md:px-4'));
      assert(result.includes('lg:px-4'));
    });
  });

  describe('Integration Tests', () => {
    it('should work with React component patterns', () => {
      const props = {
        size: 'lg',
        variant: 'primary',
        disabled: false,
      };

      const baseClasses = 'px-4 py-2 rounded font-medium';
      const sizeClasses = props.size === 'lg' ? 'px-6 py-3 text-lg' : 'px-4 py-2';
      const variantClasses =
        props.variant === 'primary' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';
      const disabledClasses = props.disabled ? 'opacity-50 cursor-not-allowed' : '';

      const finalClasses = cn(baseClasses, sizeClasses, variantClasses, disabledClasses);

      assert(finalClasses !== undefined);
      assert(finalClasses.length > 0);
    });

    it('should compose multiple utility functions', () => {
      const textClasses = cn('text-sm', 'font-medium', 'text-gray-700');
      const spacingClasses = cn('px-4', 'py-2');
      const containerClasses = cn('rounded bg-white shadow', textClasses, spacingClasses);

      assert(containerClasses.includes('rounded'));
      assert(containerClasses.includes('text-sm'));
      assert(containerClasses.includes('px-4'));
    });
  });

  describe('Type Safety', () => {
    it('should accept string class values', () => {
      const result = cn('px-4');
      assert.strictEqual(typeof result, 'string');
    });

    it('should accept boolean values', () => {
      const result = cn(true && 'px-4', false && 'py-2');
      assert.strictEqual(typeof result, 'string');
    });

    it('should accept undefined values', () => {
      const value = undefined;
      const result = cn('px-4', value);
      assert.strictEqual(typeof result, 'string');
    });

    it('should return string type', () => {
      const result = cn('px-4', 'py-2');
      assert.strictEqual(typeof result, 'string');
    });
  });
});
