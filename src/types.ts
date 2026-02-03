/**
 * Fuzzy Engine - Type Definitions
 * @packageDocumentation
 */

/**
 * A membership function that returns the degree of membership (0-1) for a given value
 */
export type MembershipFunction = (x: number) => number;

/**
 * Configuration for creating a membership function with parameters
 */
export type MembershipFunctionFactory<T extends Record<string, number>> = (
  params: T
) => MembershipFunction;

/**
 * A fuzzy set is a named collection of membership functions
 */
export type FuzzySet = Record<string, MembershipFunction>;

/**
 * Defines a linguistic variable with its fuzzy sets
 */
export interface LinguisticVariable {
  name: string;
  sets: FuzzySet;
  range?: [number, number];
}

/**
 * Condition for a fuzzy rule (AND/OR of variable-term pairs)
 */
export type RuleCondition = Record<string, string | string[]>;

/**
 * Consequence of a fuzzy rule
 */
export type RuleConsequence = Record<string, string>;

/**
 * A fuzzy IF-THEN rule
 */
export interface FuzzyRule {
  /** Antecedent conditions */
  if: RuleCondition;
  /** Consequent actions */
  then: RuleConsequence;
  /** Optional rule weight (0-1), defaults to 1 */
  weight?: number;
  /** Optional rule description */
  description?: string;
}

/**
 * Defuzzification methods supported by the engine
 */
export type DefuzzificationMethod = 
  | 'centroid'   // Center of gravity
  | 'bisector'   // Bisector of area
  | 'mom'        // Mean of maximum
  | 'som'        // Smallest of maximum
  | 'lom';       // Largest of maximum

/**
 * T-norm (AND) operation methods
 */
export type AndMethod = 'min' | 'product';

/**
 * S-norm (OR) operation methods
 */
export type OrMethod = 'max' | 'sum' | 'probor';

/**
 * Implication methods
 */
export type ImplicationMethod = 'min' | 'product';

/**
 * Aggregation methods
 */
export type AggregationMethod = 'max' | 'sum';

/**
 * Configuration options for the fuzzy engine
 */
export interface FuzzyEngineConfig {
  /** Defuzzification method (default: 'centroid') */
  defuzzificationMethod?: DefuzzificationMethod;
  /** AND operation method (default: 'min') */
  andMethod?: AndMethod;
  /** OR operation method (default: 'max') */
  orMethod?: OrMethod;
  /** Implication method (default: 'min') */
  implicationMethod?: ImplicationMethod;
  /** Aggregation method (default: 'max') */
  aggregationMethod?: AggregationMethod;
  /** Resolution for defuzzification (default: 100) */
  resolution?: number;
}

/**
 * Result of fuzzifying an input value
 */
export interface FuzzificationResult {
  variable: string;
  value: number;
  memberships: Record<string, number>;
}

/**
 * Result of evaluating a single rule
 */
export interface RuleEvaluationResult {
  rule: FuzzyRule;
  firingStrength: number;
  outputContributions: Record<string, { term: string; strength: number }>;
}

/**
 * Detailed result of fuzzy inference
 */
export interface EvaluationResult {
  /** Crisp output values */
  outputs: Record<string, number>;
  /** Fuzzification details for each input */
  fuzzification: FuzzificationResult[];
  /** Evaluation details for each rule */
  ruleEvaluations: RuleEvaluationResult[];
  /** Aggregated fuzzy output before defuzzification */
  aggregatedOutputs: Record<string, MembershipFunction>;
}

/**
 * Parameters for triangular membership function
 */
export interface TriangularParams {
  /** Left foot of the triangle */
  a: number;
  /** Peak of the triangle */
  b: number;
  /** Right foot of the triangle */
  c: number;
}

/**
 * Parameters for trapezoidal membership function
 */
export interface TrapezoidalParams {
  /** Left foot */
  a: number;
  /** Left shoulder */
  b: number;
  /** Right shoulder */
  c: number;
  /** Right foot */
  d: number;
}

/**
 * Parameters for Gaussian membership function
 */
export interface GaussianParams {
  /** Center of the bell curve */
  center: number;
  /** Standard deviation */
  sigma: number;
}

/**
 * Parameters for sigmoid membership function
 */
export interface SigmoidParams {
  /** Inflection point */
  center: number;
  /** Steepness of the curve */
  slope: number;
  /** Direction: 'left' (descending) or 'right' (ascending) */
  direction?: 'left' | 'right';
}

/**
 * Parameters for generalized bell membership function
 */
export interface BellParams {
  /** Center of the bell */
  center: number;
  /** Width of the bell */
  width: number;
  /** Slope of the bell */
  slope: number;
}
