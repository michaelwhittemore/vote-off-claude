const K = 32;

export function calculateElo(winnerScore: number, loserScore: number) {
  const expectedWinner = 1 / (1 + Math.pow(10, (loserScore - winnerScore) / 400));
  const expectedLoser = 1 - expectedWinner;

  return {
    newWinnerScore: winnerScore + K * (1 - expectedWinner),
    newLoserScore: loserScore + K * (0 - expectedLoser),
  };
}
