/**
 * Fuzzy Engine
 * 
 * Main class for building and evaluating fuzzy inference systems.
 */

import type {
  MembershipFunction,
  FuzzySet,
  FuzzyRule,
  FuzzyEngineConfig,
  DefuzzificationMethod,
  AndMethod,
  OrMethod,
  ImplicationMethod,
  AggregationMethod,
  FuzzificationResult,
  RuleEvaluationResult,
  EvaluationResult,
} from './types';

import { getAndOperator, getOrOperator, sNormMax, tNormMin } from './operators';
import { defuzzify } from './defuzzification';

/**
 * Internal representation of a variable
 */
interface Variable {
  name: string;
  sets: FuzzySet;
  range: [number, number];
  isOutput: boolean;
}

/**
 * FuzzyEngine - A Mamdani fuzzy inference system
 * 
 * @example
 * ```ts
 * const engine = new FuzzyEngine();
 * 
 * engine.addVariable('temperature', {
 *   cold: triangular(0, 10, 20),
 *   warm: triangular(15, 25, 35),
 *   hot: triangular(30, 40, 50)
 * });
 * 
 * engine.addOutput('fanSpeed', {
 *   low: triangular(0, 25, 50),
 *   high: triangular(50, 75, 100)
 * });
 * 
 * engine.addRule({
 *   if: { temperature: 'hot' },
 *   then: { fanSpeed: 'high' }
 * });
 * 
 * const result = engine.evaluate({ temperature: 35 });
 * console.log(result.fanSpeed); // Crisp output value
 * ```
 */
export class FuzzyEngine {
  private variables: Map<string, Variable> = new Map();
  private rules: FuzzyRule[] = [];
  
  // Configuration
  private defuzzificationMethod: DefuzzificationMethod = 'centroid';
  private andMethod: AndMethod = 'min';
  private orMethod: OrMethod = 'max';
  private implicationMethod: ImplicationMethod = 'min';
  private aggregationMethod: AggregationMethod = 'max';
  private resolution: number = 100;

  /**
   * Creates a new FuzzyEngine instance.
   * 
   * @param config - Optional configuration
   */
  constructor(config?: FuzzyEngineConfig) {
    if (config) {
      if (config.defuzzificationMethod) {
        this.defuzzificationMethod = config.defuzzificationMethod;
      }
      if (config.andMethod) {
        this.andMethod = config.andMethod;
      }
      if (config.orMethod) {
        this.orMethod = config.orMethod;
      }
      if (config.implicationMethod) {
        this.implicationMethod = config.implicationMethod;
      }
      if (config.aggregationMethod) {
        this.aggregationMethod = config.aggregationMethod;
      }
      if (config.resolution) {
        this.resolution = config.resolution;
      }
    }
  }

  /**
   * Adds an input linguistic variable.
   * 
   * @param name - Variable name
   * @param sets - Object mapping term names to membership functions
   * @param range - Optional [min, max] range for the variable
   */
  addVariable(
    name: string, 
    sets: FuzzySet, 
    range?: [number, number]
  ): this {
    const inferredRange = range || this.inferRange(sets);
    
    this.variables.set(name, {
      name,
      sets,
      range: inferredRange,
      isOutput: false,
    });
    
    return this;
  }

  /**
   * Adds an output linguistic variable.
   * 
   * @param name - Variable name
   * @param sets - Object mapping term names to membership functions
   * @param range - Optional [min, max] range for the variable
   */
  addOutput(
    name: string, 
    sets: FuzzySet, 
    range?: [number, number]
  ): this {
    const inferredRange = range || this.inferRange(sets);
    
    this.variables.set(name, {
      name,
      sets,
      range: inferredRange,
      isOutput: true,
    });
    
    return this;
  }

  /**
   * Adds a single fuzzy rule.
   * 
   * @param rule - The fuzzy rule
   */
  addRule(rule: FuzzyRule): this {
    this.validateRule(rule);
    this.rules.push(rule);
    return this;
  }

  /**
   * Adds multiple fuzzy rules.
   * 
   * @param rules - Array of fuzzy rules
   */
  addRules(rules: FuzzyRule[]): this {
    for (const rule of rules) {
      this.addRule(rule);
    }
    return this;
  }

  /**
   * Removes all rules from the engine.
   */
  clearRules(): this {
    this.rules = [];
    return this;
  }

  /**
   * Sets the defuzzification method.
   */
  setDefuzzificationMethod(method: DefuzzificationMethod): this {
    this.defuzzificationMethod = method;
    return this;
  }

  /**
   * Sets the AND (T-norm) method.
   */
  setAndMethod(method: AndMethod): this {
    this.andMethod = method;
    return this;
  }

  /**
   * Sets the OR (S-norm) method.
   */
  setOrMethod(method: OrMethod): this {
    this.orMethod = method;
    return this;
  }

  /**
   * Sets the implication method.
   */
  setImplicationMethod(method: ImplicationMethod): this {
    this.implicationMethod = method;
    return this;
  }

  /**
   * Sets the aggregation method.
   */
  setAggregationMethod(method: AggregationMethod): this {
    this.aggregationMethod = method;
    return this;
  }

  /**
   * Sets the resolution for defuzzification.
   */
  setResolution(resolution: number): this {
    this.resolution = resolution;
    return this;
  }

  /**
   * Evaluates the fuzzy inference system with given inputs.
   * 
   * @param inputs - Object mapping input variable names to crisp values
   * @returns Object mapping output variable names to defuzzified values
   */
  evaluate(inputs: Record<string, number>): Record<string, number> {
    const result = this.evaluateVerbose(inputs);
    return result.outputs;
  }

  /**
   * Evaluates the fuzzy inference system with detailed results.
   * 
   * @param inputs - Object mapping input variable names to crisp values
   * @returns Detailed evaluation result
   */
  evaluateVerbose(inputs: Record<string, number>): EvaluationResult {
    // Step 1: Fuzzification
    const fuzzification = this.fuzzify(inputs);
    
    // Step 2: Rule evaluation
    const ruleEvaluations = this.evaluateRules(fuzzification);
    
    // Step 3: Aggregation
    const aggregatedOutputs = this.aggregate(ruleEvaluations);
    
    // Step 4: Defuzzification
    const outputs = this.defuzzifyOutputs(aggregatedOutputs);
    
    return {
      outputs,
      fuzzification,
      ruleEvaluations,
      aggregatedOutputs,
    };
  }

  /**
   * Fuzzifies input values.
   */
  private fuzzify(inputs: Record<string, number>): FuzzificationResult[] {
    const results: FuzzificationResult[] = [];
    
    for (const [name, value] of Object.entries(inputs)) {
      const variable = this.variables.get(name);
      if (!variable || variable.isOutput) {
        continue;
      }
      
      const memberships: Record<string, number> = {};
      for (const [termName, mf] of Object.entries(variable.sets)) {
        memberships[termName] = mf(value);
      }
      
      results.push({
        variable: name,
        value,
        memberships,
      });
    }
    
    return results;
  }

  /**
   * Evaluates all rules.
   */
  private evaluateRules(
    fuzzification: FuzzificationResult[]
  ): RuleEvaluationResult[] {
    const results: RuleEvaluationResult[] = [];
    const andOp = getAndOperator(this.andMethod);
    const orOp = getOrOperator(this.orMethod);
    
    // Create lookup for fuzzified values
    const fuzzified: Record<string, Record<string, number>> = {};
    for (const f of fuzzification) {
      fuzzified[f.variable] = f.memberships;
    }
    
    for (const rule of this.rules) {
      // Evaluate antecedent
      const antecedentStrengths: number[] = [];
      
      for (const [varName, terms] of Object.entries(rule.if)) {
        const varMemberships = fuzzified[varName];
        if (!varMemberships) continue;
        
        // Handle single term or array of terms (OR)
        const termList = Array.isArray(terms) ? terms : [terms];
        const termStrengths = termList.map(term => varMemberships[term] || 0);
        
        // OR together multiple terms for same variable
        antecedentStrengths.push(
          termStrengths.length > 1 ? orOp(...termStrengths) : termStrengths[0]
        );
      }
      
      // AND together all variable conditions
      let firingStrength = antecedentStrengths.length > 0
        ? andOp(...antecedentStrengths)
        : 0;
      
      // Apply rule weight
      if (rule.weight !== undefined) {
        firingStrength *= rule.weight;
      }
      
      // Store output contributions
      const outputContributions: Record<string, { term: string; strength: number }> = {};
      for (const [outputVar, term] of Object.entries(rule.then)) {
        outputContributions[outputVar] = {
          term,
          strength: firingStrength,
        };
      }
      
      results.push({
        rule,
        firingStrength,
        outputContributions,
      });
    }
    
    return results;
  }

  /**
   * Aggregates rule outputs.
   */
  private aggregate(
    ruleEvaluations: RuleEvaluationResult[]
  ): Record<string, MembershipFunction> {
    const aggregated: Record<string, MembershipFunction[]> = {};
    
    // Collect all output contributions
    for (const result of ruleEvaluations) {
      for (const [outputVar, contribution] of Object.entries(result.outputContributions)) {
        if (!aggregated[outputVar]) {
          aggregated[outputVar] = [];
        }
        
        const variable = this.variables.get(outputVar);
        if (!variable) continue;
        
        const baseMF = variable.sets[contribution.term];
        if (!baseMF) continue;
        
        // Apply implication (clip or scale the output set)
        const impliedMF = this.applyImplication(baseMF, contribution.strength);
        aggregated[outputVar].push(impliedMF);
      }
    }
    
    // Aggregate contributions for each output
    const result: Record<string, MembershipFunction> = {};
    for (const [outputVar, mfs] of Object.entries(aggregated)) {
      result[outputVar] = this.aggregateMFs(mfs);
    }
    
    return result;
  }

  /**
   * Applies implication to a membership function.
   */
  private applyImplication(
    mf: MembershipFunction, 
    strength: number
  ): MembershipFunction {
    if (this.implicationMethod === 'min') {
      // Mamdani implication (clip)
      return (x: number) => Math.min(mf(x), strength);
    } else {
      // Larsen implication (scale)
      return (x: number) => mf(x) * strength;
    }
  }

  /**
   * Aggregates multiple membership functions into one.
   */
  private aggregateMFs(mfs: MembershipFunction[]): MembershipFunction {
    if (mfs.length === 0) {
      return () => 0;
    }
    
    if (mfs.length === 1) {
      return mfs[0];
    }
    
    if (this.aggregationMethod === 'max') {
      return (x: number) => Math.max(...mfs.map(mf => mf(x)));
    } else {
      // Sum aggregation
      return (x: number) => Math.min(1, mfs.reduce((sum, mf) => sum + mf(x), 0));
    }
  }

  /**
   * Defuzzifies all output variables.
   */
  private defuzzifyOutputs(
    aggregatedOutputs: Record<string, MembershipFunction>
  ): Record<string, number> {
    const outputs: Record<string, number> = {};
    
    for (const [name, mf] of Object.entries(aggregatedOutputs)) {
      const variable = this.variables.get(name);
      if (!variable) continue;
      
      outputs[name] = defuzzify(mf, this.defuzzificationMethod, {
        min: variable.range[0],
        max: variable.range[1],
        resolution: this.resolution,
      });
    }
    
    return outputs;
  }

  /**
   * Validates a rule against defined variables.
   */
  private validateRule(rule: FuzzyRule): void {
    // Validate antecedent variables
    for (const [varName, terms] of Object.entries(rule.if)) {
      const variable = this.variables.get(varName);
      if (!variable) {
        throw new Error(`Unknown variable in rule antecedent: ${varName}`);
      }
      
      const termList = Array.isArray(terms) ? terms : [terms];
      for (const term of termList) {
        if (!variable.sets[term]) {
          throw new Error(`Unknown term '${term}' for variable '${varName}'`);
        }
      }
    }
    
    // Validate consequent variables
    for (const [varName, term] of Object.entries(rule.then)) {
      const variable = this.variables.get(varName);
      if (!variable) {
        throw new Error(`Unknown variable in rule consequent: ${varName}`);
      }
      if (!variable.isOutput) {
        throw new Error(`Variable '${varName}' is not an output variable`);
      }
      if (!variable.sets[term]) {
        throw new Error(`Unknown term '${term}' for output variable '${varName}'`);
      }
    }
  }

  /**
   * Infers the range of a variable from its membership functions.
   */
  private inferRange(sets: FuzzySet): [number, number] {
    // Sample each membership function to find approximate range
    let min = 0;
    let max = 100;
    
    // This is a simple heuristic - in practice, ranges should be specified
    const testPoints = [-1000, -100, -10, 0, 10, 100, 1000];
    
    for (const mf of Object.values(sets)) {
      for (const x of testPoints) {
        if (mf(x) > 0.01) {
          min = Math.min(min, x);
          max = Math.max(max, x);
        }
      }
    }
    
    return [min, max];
  }

  /**
   * Gets the membership degree for a specific variable and term.
   */
  getMembership(variable: string, term: string, value: number): number {
    const v = this.variables.get(variable);
    if (!v) {
      throw new Error(`Unknown variable: ${variable}`);
    }
    const mf = v.sets[term];
    if (!mf) {
      throw new Error(`Unknown term '${term}' for variable '${variable}'`);
    }
    return mf(value);
  }

  /**
   * Gets all membership degrees for a variable at a given value.
   */
  getMemberships(variable: string, value: number): Record<string, number> {
    const v = this.variables.get(variable);
    if (!v) {
      throw new Error(`Unknown variable: ${variable}`);
    }
    
    const result: Record<string, number> = {};
    for (const [term, mf] of Object.entries(v.sets)) {
      result[term] = mf(value);
    }
    return result;
  }

  /**
   * Returns information about all defined variables.
   */
  getVariables(): Array<{ name: string; terms: string[]; isOutput: boolean; range: [number, number] }> {
    return Array.from(this.variables.values()).map(v => ({
      name: v.name,
      terms: Object.keys(v.sets),
      isOutput: v.isOutput,
      range: v.range,
    }));
  }

  /**
   * Returns all defined rules.
   */
  getRules(): FuzzyRule[] {
    return [...this.rules];
  }
}
