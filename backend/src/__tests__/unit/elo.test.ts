import { describe, it, expect } from 'vitest';
import { calculateElo } from '../../services/elo';

describe('calculateElo', () => {
  it('winner gains points and loser loses points', () => {
    const { newWinnerScore, newLoserScore } = calculateElo(1000, 1000);
    expect(newWinnerScore).toBeGreaterThan(1000);
    expect(newLoserScore).toBeLessThan(1000);
  });

  it('total points are conserved', () => {
    const winner = 1000;
    const loser = 1000;
    const { newWinnerScore, newLoserScore } = calculateElo(winner, loser);
    expect(newWinnerScore + newLoserScore).toBeCloseTo(winner + loser, 5);
  });

  it('upsets yield larger score swings', () => {
    // Lower-rated player beats higher-rated — bigger swing
    const upset = calculateElo(800, 1200);
    const expected = calculateElo(1200, 800);
    expect(upset.newWinnerScore - 800).toBeGreaterThan(expected.newWinnerScore - 1200);
  });

  it('favored winner gains fewer points than upset winner', () => {
    const favored = calculateElo(1200, 800);
    const underdog = calculateElo(800, 1200);
    expect(favored.newWinnerScore - 1200).toBeLessThan(underdog.newWinnerScore - 800);
  });

  it('equal scores produce symmetric 16-point swing with K=32', () => {
    const { newWinnerScore, newLoserScore } = calculateElo(1000, 1000);
    expect(newWinnerScore).toBeCloseTo(1016, 0);
    expect(newLoserScore).toBeCloseTo(984, 0);
  });
});
