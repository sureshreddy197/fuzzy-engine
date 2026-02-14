import { describe, it, expect, beforeEach } from 'vitest';
import { FuzzyEngine, triangular, trapezoidal, gaussian } from '../src';

describe('Membership Functions', () => {
  it('triangular returns 1 at peak, 0 at edges', () => {
    const mf = triangular(0, 50, 100);
    expect(mf(50)).toBe(1);
    expect(mf(0)).toBe(0);
    expect(mf(100)).toBe(0);
    expect(mf(25)).toBe(0.5);
  });

  it('trapezoidal returns 1 on plateau', () => {
    const mf = trapezoidal(0, 25, 75, 100);
    expect(mf(50)).toBe(1);
    expect(mf(0)).toBe(0);
    expect(mf(100)).toBe(0);
  });

  it('gaussian returns 1 at center', () => {
    const mf = gaussian(50, 10);
    expect(mf(50)).toBe(1);
    expect(mf(40)).toBeCloseTo(mf(60), 10);
  });
});

describe('FuzzyEngine', () => {
  let engine: FuzzyEngine;

  beforeEach(() => {
    engine = new FuzzyEngine();
    engine.addVariable('temperature', {
      cold: trapezoidal(0, 0, 20, 40),
      warm: triangular(30, 50, 70),
      hot: trapezoidal(60, 80, 100, 100),
    });
    engine.addOutput('fanSpeed', {
      low: triangular(0, 25, 50),
      medium: triangular(30, 50, 70),
      high: triangular(50, 75, 100),
    }, [0, 100]);
    engine.addRules([
      { if: { temperature: 'cold' }, then: { fanSpeed: 'low' } },
      { if: { temperature: 'warm' }, then: { fanSpeed: 'medium' } },
      { if: { temperature: 'hot' }, then: { fanSpeed: 'high' } },
    ]);
  });

  it('evaluates inputs and returns crisp output', () => {
    const result = engine.evaluate({ temperature: 50 });
    expect(result.fanSpeed).toBeGreaterThan(0);
    expect(result.fanSpeed).toBeLessThan(100);
  });

  it('returns low fan speed for cold temperature', () => {
    const result = engine.evaluate({ temperature: 10 });
    expect(result.fanSpeed).toBeLessThan(50);
  });

  it('returns high fan speed for hot temperature', () => {
    const result = engine.evaluate({ temperature: 90 });
    expect(result.fanSpeed).toBeGreaterThan(50);
  });

  it('returns verbose evaluation results', () => {
    const result = engine.evaluateVerbose({ temperature: 50 });
    expect(result.outputs).toBeDefined();
    expect(result.fuzzification).toHaveLength(1);
    expect(result.ruleEvaluations).toHaveLength(3);
  });

  it('throws for unknown variables in rules', () => {
    expect(() => {
      engine.addRule({ if: { unknown: 'cold' }, then: { fanSpeed: 'low' } });
    }).toThrow(/Unknown variable/);
  });

  it('supports weighted rules', () => {
    engine.clearRules();
    engine.addRule({ if: { temperature: 'hot' }, then: { fanSpeed: 'high' }, weight: 0.5 });
    const result = engine.evaluate({ temperature: 90 });
    expect(result.fanSpeed).toBeDefined();
  });
});
