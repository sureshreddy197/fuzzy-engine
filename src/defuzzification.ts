/**
 * Defuzzification Methods
 * 
 * This module provides various methods for converting a fuzzy output
 * set back into a crisp (numeric) value.
 */

import type { MembershipFunction, DefuzzificationMethod } from './types';

/**
 * Options for defuzzification
 */
export interface DefuzzifyOptions {
  /** Minimum value of the output range */
  min: number;
  /** Maximum value of the output range */
  max: number;
  /** Number of points to sample (default: 100) */
  resolution?: number;
}

/**
 * Centroid defuzzification (Center of Gravity / Center of Area)
 * 
 * Calculates the center of mass of the fuzzy set.
 * Most commonly used method, produces smooth output.
 */
export function centroid(mf: MembershipFunction, options: DefuzzifyOptions): number {
  const { min, max, resolution = 100 } = options;
  const step = (max - min) / resolution;
  
  let sumWeighted = 0;
  let sumMembership = 0;
  
  for (let x = min; x <= max; x += step) {
    const mu = mf(x);
    sumWeighted += x * mu;
    sumMembership += mu;
  }
  
  if (sumMembership === 0) {
    return (min + max) / 2; // Return midpoint if no membership
  }
  
  return sumWeighted / sumMembership;
}

/**
 * Bisector defuzzification
 * 
 * Finds the x value that divides the area under the curve into two equal parts.
 */
export function bisector(mf: MembershipFunction, options: DefuzzifyOptions): number {
  const { min, max, resolution = 100 } = options;
  const step = (max - min) / resolution;
  
  // Calculate total area
  let totalArea = 0;
  for (let x = min; x <= max; x += step) {
    totalArea += mf(x) * step;
  }
  
  if (totalArea === 0) {
    return (min + max) / 2;
  }
  
  // Find bisector point
  let accumulatedArea = 0;
  const halfArea = totalArea / 2;
  
  for (let x = min; x <= max; x += step) {
    accumulatedArea += mf(x) * step;
    if (accumulatedArea >= halfArea) {
      return x;
    }
  }
  
  return max;
}

/**
 * Mean of Maximum (MoM) defuzzification
 * 
 * Returns the average of all x values where membership is maximum.
 */
export function meanOfMaximum(mf: MembershipFunction, options: DefuzzifyOptions): number {
  const { min, max, resolution = 100 } = options;
  const step = (max - min) / resolution;
  
  let maxMembership = 0;
  const maxPoints: number[] = [];
  
  // Find maximum membership value
  for (let x = min; x <= max; x += step) {
    const mu = mf(x);
    if (mu > maxMembership) {
      maxMembership = mu;
      maxPoints.length = 0;
      maxPoints.push(x);
    } else if (Math.abs(mu - maxMembership) < 1e-10) {
      maxPoints.push(x);
    }
  }
  
  if (maxPoints.length === 0) {
    return (min + max) / 2;
  }
  
  return maxPoints.reduce((a, b) => a + b, 0) / maxPoints.length;
}

/**
 * Smallest of Maximum (SoM) defuzzification
 * 
 * Returns the smallest x value where membership is maximum.
 */
export function smallestOfMaximum(mf: MembershipFunction, options: DefuzzifyOptions): number {
  const { min, max, resolution = 100 } = options;
  const step = (max - min) / resolution;
  
  let maxMembership = 0;
  let smallestMax = min;
  
  for (let x = min; x <= max; x += step) {
    const mu = mf(x);
    if (mu > maxMembership) {
      maxMembership = mu;
      smallestMax = x;
    }
  }
  
  return smallestMax;
}

/**
 * Largest of Maximum (LoM) defuzzification
 * 
 * Returns the largest x value where membership is maximum.
 */
export function largestOfMaximum(mf: MembershipFunction, options: DefuzzifyOptions): number {
  const { min, max, resolution = 100 } = options;
  const step = (max - min) / resolution;
  
  let maxMembership = 0;
  let largestMax = max;
  
  for (let x = max; x >= min; x -= step) {
    const mu = mf(x);
    if (mu > maxMembership) {
      maxMembership = mu;
      largestMax = x;
    }
  }
  
  return largestMax;
}

/**
 * Weighted Average defuzzification
 * 
 * Similar to centroid but uses the peak of each contributing term.
 * Requires knowledge of the contributing fuzzy sets.
 */
export function weightedAverage(
  contributions: Array<{ peak: number; strength: number }>
): number {
  let sumWeighted = 0;
  let sumStrength = 0;
  
  for (const { peak, strength } of contributions) {
    sumWeighted += peak * strength;
    sumStrength += strength;
  }
  
  if (sumStrength === 0) {
    return contributions.length > 0 ? contributions[0].peak : 0;
  }
  
  return sumWeighted / sumStrength;
}

/**
 * Gets the defuzzification function for the specified method.
 */
export function getDefuzzifier(
  method: DefuzzificationMethod
): (mf: MembershipFunction, options: DefuzzifyOptions) => number {
  switch (method) {
    case 'centroid':
      return centroid;
    case 'bisector':
      return bisector;
    case 'mom':
      return meanOfMaximum;
    case 'som':
      return smallestOfMaximum;
    case 'lom':
      return largestOfMaximum;
    default:
      return centroid;
  }
}

/**
 * Defuzzifies a membership function using the specified method.
 */
export function defuzzify(
  mf: MembershipFunction,
  method: DefuzzificationMethod,
  options: DefuzzifyOptions
): number {
  const defuzzifier = getDefuzzifier(method);
  return defuzzifier(mf, options);
}
