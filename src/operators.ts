/**
 * Fuzzy Operators
 * 
 * This module provides T-norms (AND), S-norms (OR), and other
 * fuzzy logic operators used in rule evaluation.
 */

import type { AndMethod, OrMethod, MembershipFunction } from './types';

// ============================================================================
// T-Norms (AND operators)
// ============================================================================

/**
 * Minimum T-norm (Gödel T-norm)
 * Standard fuzzy AND operation.
 */
export function tNormMin(...values: number[]): number {
  return Math.min(...values);
}

/**
 * Product T-norm (Algebraic product)
 * Multiplies membership values together.
 */
export function tNormProduct(...values: number[]): number {
  return values.reduce((acc, val) => acc * val, 1);
}

/**
 * Łukasiewicz T-norm (Bounded difference)
 */
export function tNormLukasiewicz(...values: number[]): number {
  return Math.max(0, values.reduce((acc, val) => acc + val, 0) - (values.length - 1));
}

/**
 * Drastic T-norm
 * Returns minimum if one value is 1, otherwise 0.
 */
export function tNormDrastic(...values: number[]): number {
  const hasOne = values.some(v => v === 1);
  if (values.length === 1) return values[0];
  if (!hasOne) return 0;
  return Math.min(...values.filter(v => v !== 1));
}

// ============================================================================
// S-Norms (OR operators)
// ============================================================================

/**
 * Maximum S-norm (Gödel S-norm)
 * Standard fuzzy OR operation.
 */
export function sNormMax(...values: number[]): number {
  return Math.max(...values);
}

/**
 * Algebraic sum S-norm
 * Also known as probabilistic sum.
 */
export function sNormSum(...values: number[]): number {
  return values.reduce((acc, val) => acc + val - acc * val, 0);
}

/**
 * Probabilistic OR (same as algebraic sum)
 */
export const sNormProbor = sNormSum;

/**
 * Łukasiewicz S-norm (Bounded sum)
 */
export function sNormLukasiewicz(...values: number[]): number {
  return Math.min(1, values.reduce((acc, val) => acc + val, 0));
}

/**
 * Drastic S-norm
 * Returns maximum if one value is 0, otherwise 1.
 */
export function sNormDrastic(...values: number[]): number {
  const hasZero = values.some(v => v === 0);
  if (values.length === 1) return values[0];
  if (!hasZero) return 1;
  return Math.max(...values.filter(v => v !== 0));
}

// ============================================================================
// Operator Factory
// ============================================================================

/**
 * Gets the T-norm function for the specified method.
 */
export function getAndOperator(method: AndMethod): (...values: number[]) => number {
  switch (method) {
    case 'min':
      return tNormMin;
    case 'product':
      return tNormProduct;
    default:
      return tNormMin;
  }
}

/**
 * Gets the S-norm function for the specified method.
 */
export function getOrOperator(method: OrMethod): (...values: number[]) => number {
  switch (method) {
    case 'max':
      return sNormMax;
    case 'sum':
      return sNormSum;
    case 'probor':
      return sNormProbor;
    default:
      return sNormMax;
  }
}

// ============================================================================
// Set Operations
// ============================================================================

/**
 * Computes the union of two fuzzy sets.
 */
export function union(
  mf1: MembershipFunction, 
  mf2: MembershipFunction, 
  method: OrMethod = 'max'
): MembershipFunction {
  const op = getOrOperator(method);
  return (x: number): number => op(mf1(x), mf2(x));
}

/**
 * Computes the intersection of two fuzzy sets.
 */
export function intersection(
  mf1: MembershipFunction, 
  mf2: MembershipFunction, 
  method: AndMethod = 'min'
): MembershipFunction {
  const op = getAndOperator(method);
  return (x: number): number => op(mf1(x), mf2(x));
}

/**
 * Computes the complement of a fuzzy set.
 */
export function complement(mf: MembershipFunction): MembershipFunction {
  return (x: number): number => 1 - mf(x);
}

/**
 * Computes the difference of two fuzzy sets (A AND NOT B).
 */
export function difference(
  mf1: MembershipFunction, 
  mf2: MembershipFunction,
  method: AndMethod = 'min'
): MembershipFunction {
  return intersection(mf1, complement(mf2), method);
}

/**
 * Checks if fuzzy set A is a subset of fuzzy set B.
 * Returns true if membership of A <= membership of B for all sampled points.
 */
export function isSubset(
  mfA: MembershipFunction, 
  mfB: MembershipFunction,
  range: [number, number],
  resolution: number = 100
): boolean {
  const [min, max] = range;
  const step = (max - min) / resolution;
  
  for (let x = min; x <= max; x += step) {
    if (mfA(x) > mfB(x) + 1e-10) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if two fuzzy sets are equal (within tolerance).
 */
export function isEqual(
  mfA: MembershipFunction, 
  mfB: MembershipFunction,
  range: [number, number],
  resolution: number = 100,
  tolerance: number = 1e-6
): boolean {
  const [min, max] = range;
  const step = (max - min) / resolution;
  
  for (let x = min; x <= max; x += step) {
    if (Math.abs(mfA(x) - mfB(x)) > tolerance) {
      return false;
    }
  }
  return true;
}

/**
 * Computes the alpha-cut of a fuzzy set (crisp set where membership >= alpha).
 */
export function alphaCut(
  mf: MembershipFunction, 
  alpha: number
): MembershipFunction {
  return (x: number): number => mf(x) >= alpha ? 1 : 0;
}

/**
 * Computes the strong alpha-cut (membership > alpha).
 */
export function strongAlphaCut(
  mf: MembershipFunction, 
  alpha: number
): MembershipFunction {
  return (x: number): number => mf(x) > alpha ? 1 : 0;
}

/**
 * Computes the support of a fuzzy set (points with membership > 0).
 */
export function support(mf: MembershipFunction): MembershipFunction {
  return alphaCut(mf, 0);
}

/**
 * Computes the core of a fuzzy set (points with membership = 1).
 */
export function core(mf: MembershipFunction): MembershipFunction {
  return alphaCut(mf, 1);
}
