/**
 * Hedges - Linguistic Modifiers
 * 
 * Hedges modify the shape of membership functions to express
 * linguistic concepts like "very", "somewhat", "not", etc.
 */

import type { MembershipFunction } from './types';

/**
 * Concentrates a membership function (makes it more specific).
 * Implements "very" - membership is squared.
 * 
 * @param mf - Original membership function
 * @returns Modified membership function
 * 
 * @example
 * ```ts
 * const veryHot = very(trapezoidal(30, 40, 50, 50));
 * ```
 */
export function very(mf: MembershipFunction): MembershipFunction {
  return (x: number): number => Math.pow(mf(x), 2);
}

/**
 * Dilates a membership function (makes it more inclusive).
 * Implements "somewhat" - membership is square-rooted.
 * 
 * @param mf - Original membership function
 * @returns Modified membership function
 * 
 * @example
 * ```ts
 * const somewhatCold = somewhat(trapezoidal(0, 0, 10, 20));
 * ```
 */
export function somewhat(mf: MembershipFunction): MembershipFunction {
  return (x: number): number => Math.sqrt(mf(x));
}

/**
 * Alias for somewhat - implements "fairly" modifier.
 */
export const fairly = somewhat;

/**
 * Complements a membership function.
 * Implements "not" - membership is inverted.
 * 
 * @param mf - Original membership function
 * @returns Modified membership function
 * 
 * @example
 * ```ts
 * const notHot = not(trapezoidal(30, 40, 50, 50));
 * ```
 */
export function not(mf: MembershipFunction): MembershipFunction {
  return (x: number): number => 1 - mf(x);
}

/**
 * Strongly concentrates a membership function.
 * Implements "extremely" - membership is raised to the 3rd power.
 * 
 * @param mf - Original membership function
 * @returns Modified membership function
 */
export function extremely(mf: MembershipFunction): MembershipFunction {
  return (x: number): number => Math.pow(mf(x), 3);
}

/**
 * Intensifies a membership function around 0.5.
 * Values > 0.5 are increased, values < 0.5 are decreased.
 * Implements "intensify" contrast enhancement.
 * 
 * @param mf - Original membership function
 * @returns Modified membership function
 */
export function intensify(mf: MembershipFunction): MembershipFunction {
  return (x: number): number => {
    const mu = mf(x);
    if (mu <= 0.5) {
      return 2 * Math.pow(mu, 2);
    }
    return 1 - 2 * Math.pow(1 - mu, 2);
  };
}

/**
 * Slightly dilates a membership function.
 * Implements "slightly" - a minor expansion.
 * 
 * @param mf - Original membership function
 * @returns Modified membership function
 */
export function slightly(mf: MembershipFunction): MembershipFunction {
  return (x: number): number => Math.pow(mf(x), 1/3);
}

/**
 * Applies the "more or less" hedge - moderate dilation.
 * 
 * @param mf - Original membership function
 * @returns Modified membership function
 */
export function moreOrLess(mf: MembershipFunction): MembershipFunction {
  return (x: number): number => Math.pow(mf(x), 0.75);
}

/**
 * Combines "very" applied twice.
 * Implements "very very" - membership raised to the 4th power.
 * 
 * @param mf - Original membership function
 * @returns Modified membership function
 */
export function veryVery(mf: MembershipFunction): MembershipFunction {
  return (x: number): number => Math.pow(mf(x), 4);
}

/**
 * Applies a custom power hedge.
 * 
 * @param mf - Original membership function
 * @param power - Exponent to apply (< 1 dilates, > 1 concentrates)
 * @returns Modified membership function
 */
export function power(mf: MembershipFunction, exponent: number): MembershipFunction {
  return (x: number): number => Math.pow(mf(x), exponent);
}

/**
 * Creates a threshold modifier - values below threshold become 0.
 * 
 * @param mf - Original membership function
 * @param threshold - Minimum membership to retain
 * @returns Modified membership function
 */
export function threshold(mf: MembershipFunction, threshold: number): MembershipFunction {
  return (x: number): number => {
    const mu = mf(x);
    return mu >= threshold ? mu : 0;
  };
}

/**
 * Scales a membership function by a factor.
 * 
 * @param mf - Original membership function
 * @param factor - Scaling factor (0-1 reduces, >1 amplifies then clips)
 * @returns Modified membership function
 */
export function scale(mf: MembershipFunction, factor: number): MembershipFunction {
  return (x: number): number => Math.min(1, mf(x) * factor);
}
