/**
 * Fuzzy Engine
 * 
 * A modern fuzzy logic library for JavaScript & TypeScript.
 * Elegant fuzzy inference for intelligent decision-making systems.
 * 
 * @packageDocumentation
 * @module fuzzy-engine
 * 
 * @example
 * ```ts
 * import { FuzzyEngine, triangular, trapezoidal, gaussian } from 'fuzzy-engine';
 * 
 * const engine = new FuzzyEngine();
 * 
 * engine.addVariable('temperature', {
 *   cold: trapezoidal(0, 0, 10, 20),
 *   warm: triangular(15, 25, 35),
 *   hot: trapezoidal(30, 40, 50, 50)
 * });
 * 
 * engine.addOutput('fanSpeed', {
 *   low: triangular(0, 25, 50),
 *   medium: triangular(30, 50, 70),
 *   high: triangular(50, 75, 100)
 * });
 * 
 * engine.addRules([
 *   { if: { temperature: 'cold' }, then: { fanSpeed: 'low' } },
 *   { if: { temperature: 'warm' }, then: { fanSpeed: 'medium' } },
 *   { if: { temperature: 'hot' }, then: { fanSpeed: 'high' } }
 * ]);
 * 
 * const result = engine.evaluate({ temperature: 28 });
 * console.log(result.fanSpeed);
 * ```
 */

// Main engine
export { FuzzyEngine } from './engine';

// Membership functions
export {
  triangular,
  trapezoidal,
  gaussian,
  sigmoid,
  bell,
  singleton,
  piShaped,
  sShaped,
  zShaped,
  createMembershipFunction,
} from './membership';

// Fuzzy operators
export {
  // T-norms (AND)
  tNormMin,
  tNormProduct,
  tNormLukasiewicz,
  tNormDrastic,
  // S-norms (OR)
  sNormMax,
  sNormSum,
  sNormProbor,
  sNormLukasiewicz,
  sNormDrastic,
  // Operator factories
  getAndOperator,
  getOrOperator,
  // Set operations
  union,
  intersection,
  complement,
  difference,
  isSubset,
  isEqual,
  alphaCut,
  strongAlphaCut,
  support,
  core,
} from './operators';

// Defuzzification
export {
  centroid,
  bisector,
  meanOfMaximum,
  smallestOfMaximum,
  largestOfMaximum,
  weightedAverage,
  getDefuzzifier,
  defuzzify,
} from './defuzzification';

// Types
export type {
  MembershipFunction,
  MembershipFunctionFactory,
  FuzzySet,
  LinguisticVariable,
  RuleCondition,
  RuleConsequence,
  FuzzyRule,
  DefuzzificationMethod,
  AndMethod,
  OrMethod,
  ImplicationMethod,
  AggregationMethod,
  FuzzyEngineConfig,
  FuzzificationResult,
  RuleEvaluationResult,
  EvaluationResult,
  TriangularParams,
  TrapezoidalParams,
  GaussianParams,
  SigmoidParams,
  BellParams,
} from './types';
