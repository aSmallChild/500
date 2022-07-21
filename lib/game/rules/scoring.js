function isPartnerIndex(player, index) {
    return index == player.partner?.position;
}

export function calculateRoundScores(winningBid, winningBidder, tricks, players) {
    const tricksWon = players.map(() => 0);
    tricks.forEach(trick => {
        tricksWon[trick.winner.position]++;
        if (trick.winner.partner?.position >= 0) {
            tricksWon[trick.winner.partner.position]++;
        }
    });
    return tricksWon.map((trickCount, i) => {
        if (winningBid.special) {
            // misere
            if (i == winningBidder.position || isPartnerIndex(winningBidder, i)) {
                return trickCount == 0 ? winningBid.points : -winningBid.points;
            }

            return 0;
        }

        if (i == winningBidder.position || isPartnerIndex(winningBidder, i)) {
            return trickCount >= winningBid ? winningBid.points : -winningBid.points;
        }

        return trickCount * 10;
    });
}

export function addPlayerScores(winningBidder, playerScores, roundScores, targetScore = 500, pegLimit = 0.9) {
    const maxPegScore = targetScore * pegLimit;
    return roundScores.map((roundScore, i) => {
        const currentScore = playerScores[i];
        if (i == winningBidder.position || isPartnerIndex(winningBidder, i)) {
            return currentScore + roundScore;
        }

        if (currentScore >= maxPegScore) {
            return currentScore;
        }

        return Math.min(maxPegScore, currentScore + roundScore);
    });
}