/**
 * Membership Functions
 * 
 * This module provides various membership function generators for fuzzy sets.
 * Each function returns a membership function that maps a crisp value to a
 * degree of membership in the range [0, 1].
 */

import type { MembershipFunction, MembershipFunctionFactory } from './types';

/**
 * Creates a triangular membership function.
 * 
 * @param a - Left foot of the triangle (membership = 0)
 * @param b - Peak of the triangle (membership = 1)
 * @param c - Right foot of the triangle (membership = 0)
 * @returns Membership function
 * 
 * @example
 * ```ts
 * const warm = triangular(15, 25, 35);
 * warm(25); // 1.0 (peak)
 * warm(20); // 0.5 (rising edge)
 * warm(30); // 0.5 (falling edge)
 * warm(10); // 0.0 (outside)
 * ```
 */
export function triangular(a: number, b: number, c: number): MembershipFunction {
  if (a > b || b > c) {
    throw new Error('Triangular MF requires a <= b <= c');
  }
  
  return (x: number): number => {
    if (x <= a || x >= c) return 0;
    if (x === b) return 1;
    if (x < b) return (x - a) / (b - a);
    return (c - x) / (c - b);
  };
}

/**
 * Creates a trapezoidal membership function.
 * 
 * @param a - Left foot (membership starts rising from 0)
 * @param b - Left shoulder (membership reaches 1)
 * @param c - Right shoulder (membership starts falling from 1)
 * @param d - Right foot (membership reaches 0)
 * @returns Membership function
 * 
 * @example
 * ```ts
 * const hot = trapezoidal(30, 40, 50, 50);
 * hot(45); // 1.0 (plateau)
 * hot(35); // 0.5 (rising edge)
 * ```
 */
export function trapezoidal(a: number, b: number, c: number, d: number): MembershipFunction {
  if (a > b || b > c || c > d) {
    throw new Error('Trapezoidal MF requires a <= b <= c <= d');
  }
  
  return (x: number): number => {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    if (x < b) return (x - a) / (b - a);
    return (d - x) / (d - c);
  };
}

/**
 * Creates a Gaussian membership function.
 * 
 * @param center - Center of the bell curve
 * @param sigma - Standard deviation (controls width)
 * @returns Membership function
 * 
 * @example
 * ```ts
 * const medium = gaussian(50, 10);
 * medium(50); // 1.0 (center)
 * medium(40); // ~0.61 (one sigma away)
 * ```
 */
export function gaussian(center: number, sigma: number): MembershipFunction {
  if (sigma <= 0) {
    throw new Error('Gaussian MF requires sigma > 0');
  }
  
  return (x: number): number => {
    return Math.exp(-0.5 * Math.pow((x - center) / sigma, 2));
  };
}

/**
 * Creates a sigmoid membership function.
 * 
 * @param center - Inflection point of the sigmoid
 * @param slope - Steepness of the curve (positive = ascending, negative = descending)
 * @param direction - 'right' for ascending (default), 'left' for descending
 * @returns Membership function
 * 
 * @example
 * ```ts
 * const high = sigmoid(50, 0.5, 'right');
 * const low = sigmoid(50, 0.5, 'left');
 * ```
 */
export function sigmoid(
  center: number, 
  slope: number, 
  direction: 'left' | 'right' = 'right'
): MembershipFunction {
  const sign = direction === 'left' ? -1 : 1;
  
  return (x: number): number => {
    return 1 / (1 + Math.exp(-sign * slope * (x - center)));
  };
}

/**
 * Creates a generalized bell membership function.
 * 
 * @param center - Center of the bell
 * @param width - Width of the bell (half-width at crossover points)
 * @param slope - Controls the steepness of the sides
 * @returns Membership function
 * 
 * @example
 * ```ts
 * const medium = bell(50, 20, 4);
 * ```
 */
export function bell(center: number, width: number, slope: number): MembershipFunction {
  if (width <= 0) {
    throw new Error('Bell MF requires width > 0');
  }
  
  return (x: number): number => {
    return 1 / (1 + Math.pow(Math.abs((x - center) / width), 2 * slope));
  };
}

/**
 * Creates a singleton membership function (a spike at a single point).
 * 
 * @param value - The point where membership is 1
 * @param tolerance - Small tolerance for floating-point comparison (default: 1e-10)
 * @returns Membership function
 */
export function singleton(value: number, tolerance: number = 1e-10): MembershipFunction {
  return (x: number): number => {
    return Math.abs(x - value) < tolerance ? 1 : 0;
  };
}

/**
 * Creates a pi-shaped membership function (S-shaped rise followed by Z-shaped fall).
 * 
 * @param a - Start of rising edge
 * @param b - End of rising edge / start of plateau
 * @param c - End of plateau / start of falling edge
 * @param d - End of falling edge
 * @returns Membership function
 */
export function piShaped(a: number, b: number, c: number, d: number): MembershipFunction {
  return (x: number): number => {
    if (x <= a || x >= d) return 0;
    if (x >= b && x <= c) return 1;
    
    if (x < b) {
      // Rising S-curve
      const mid = (a + b) / 2;
      if (x <= mid) {
        return 2 * Math.pow((x - a) / (b - a), 2);
      }
      return 1 - 2 * Math.pow((x - b) / (b - a), 2);
    }
    
    // Falling Z-curve
    const mid = (c + d) / 2;
    if (x <= mid) {
      return 1 - 2 * Math.pow((x - c) / (d - c), 2);
    }
    return 2 * Math.pow((x - d) / (d - c), 2);
  };
}

/**
 * Creates an S-shaped membership function (smooth transition from 0 to 1).
 * 
 * @param a - Start of transition (membership = 0)
 * @param b - End of transition (membership = 1)
 * @returns Membership function
 */
export function sShaped(a: number, b: number): MembershipFunction {
  if (a >= b) {
    throw new Error('S-shaped MF requires a < b');
  }
  
  return (x: number): number => {
    if (x <= a) return 0;
    if (x >= b) return 1;
    
    const mid = (a + b) / 2;
    if (x <= mid) {
      return 2 * Math.pow((x - a) / (b - a), 2);
    }
    return 1 - 2 * Math.pow((x - b) / (b - a), 2);
  };
}

/**
 * Creates a Z-shaped membership function (smooth transition from 1 to 0).
 * 
 * @param a - Start of transition (membership = 1)
 * @param b - End of transition (membership = 0)
 * @returns Membership function
 */
export function zShaped(a: number, b: number): MembershipFunction {
  if (a >= b) {
    throw new Error('Z-shaped MF requires a < b');
  }
  
  return (x: number): number => {
    if (x <= a) return 1;
    if (x >= b) return 0;
    
    const mid = (a + b) / 2;
    if (x <= mid) {
      return 1 - 2 * Math.pow((x - a) / (b - a), 2);
    }
    return 2 * Math.pow((x - b) / (b - a), 2);
  };
}

/**
 * Creates a custom membership function from a factory function.
 * 
 * @param fn - Factory function that takes parameters and returns a membership function
 * @returns Configured membership function factory
 * 
 * @example
 * ```ts
 * const customMF = createMembershipFunction((x, { center, width }) => {
 *   return Math.max(0, 1 - Math.abs(x - center) / width);
 * });
 * 
 * const mySet = customMF({ center: 50, width: 25 });
 * ```
 */
export function createMembershipFunction<T extends Record<string, number>>(
  fn: (x: number, params: T) => number
): MembershipFunctionFactory<T> {
  return (params: T): MembershipFunction => {
    return (x: number): number => {
      const result = fn(x, params);
      return Math.max(0, Math.min(1, result)); // Clamp to [0, 1]
    };
  };
}
