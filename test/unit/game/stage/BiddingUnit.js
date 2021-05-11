// noinspection ES6UnusedImports
import should from 'should';
import Bidding from '../../../../src/game/stage/Bidding.js';
import {getPlayers, getStage} from '../../util/stage.js';

describe('Deal Stage Unit', function() {
    describe(`start()`, function() {
        const stage = getStage(getPlayers(23), Bidding);
        it(`should deal cards to all players`, function() {
            stage.start();
            stage.handsDealt.kitty.size.should.equal(3);
            stage.handsDealt.hands.should.length(23);
            stage.players.should.length(23);
            for (const hand of stage.handsDealt.hands) {
                hand.size.should.equal(10);
            }
        });
    });
    describe(`onBid()`, function() {
        // "P","6♠","6♣","6♦","6♥","6","7♠","7♣","7♦","7♥","7","8♠","M","8♣","8♦","8♥","8","9♠","9♣","9♦","9♥","9","10♠","10♣","10♦","O","10♥","10","B"
        const scenarios = [
            {
                name: 'one bid one pass',
                players: 2,
                firstBidder: 0,
                bids: [
                    [0, '6♠'],
                    [1, 'P'],
                ],
                winner: [0, '6♠'],
            },
            {
                name: 'one bid one pass with more players',
                players: 10,
                firstBidder: 0,
                bids: [
                    [0, '6♠'],
                    [1, '6♣'],
                    [2, '6♦'],
                    [3, '6♥'],
                    [4, '6'],
                    [5, '7♠'],
                    [6, '7♣'],
                    [7, '7♦'],
                    [8, '7♥'],
                    [9, '7'],
                    [0, 'P'],
                    [1, 'P'],
                    [2, 'P'],
                    [3, 'P'],
                    [4, 'P'],
                    [5, 'P'],
                    [6, 'P'],
                    [7, 'P'],
                    [8, 'P'],
                ],
                winner: [9, '7'],
            },
            {
                name: 'highest bidder raises own bid',
                players: 3,
                firstBidder: 0,
                bids: [
                    [0, '6♠'],
                    [1, '6♣'],
                    [2, '6♦'],
                    [0, 'P'],
                    [1, 'P'],
                    [2, '7♠'],
                    [0, 'P'],
                    [1, 'P'],
                ],
                winner: [2, '7♠'],
            },
            {
                name: 'highest bidder raises own bid, and then someone out bids them',
                players: 3,
                firstBidder: 0,
                bids: [
                    [0, '6♠'],
                    [1, '6♣'],
                    [2, '6♦'],
                    [0, 'P'],
                    [1, 'P'],
                    [2, '7♠'],
                    [0, 'P'],
                    [1, '8♠'],
                    [2, 'P'],
                ],
                winner: [1, '8♠'],
            },
        ];
        for (const scenario of scenarios) {
            it(scenario.name, function() {
                const stage = getStage(getPlayers(scenario.players, true), Bidding);
                stage.dataStore.firstBidder = scenario.firstBidder;
                stage.start();
                for (const [position, call] of scenario.bids) {
                    const player = stage.players[position];
                    const bid = stage.getBid(call);
                    stage.currentBidder.should.equal(position);
                    let bidAnnounced = false;
                    player.emit = (name, data) => {
                        name.should.not.equal('bid_error', `Received unexpected bid error: ${data}, highest bid: ${stage.highestBid}, with bid: ${bid}`);
                    };
                    stage.clients.emit = (name, data) => {
                        if (!bidAnnounced && name === 'bid') {
                            bidAnnounced = true;
                            data.player.position.should.equal(player.position);
                            data.bid.call.should.equal(bid.call);
                        }
                    };
                    stage.onPlayerAction(player, 'bid', call);
                    bidAnnounced.should.be.true('bid was not announced');
                }
                const [winnerPosition, winningCall] = scenario.winner;
                const winner = stage.players[winnerPosition];
                const expectedWinningBid = stage.getBid(winningCall);
                winner.emit = (name, data) => {
                    name.should.not.equal('kitty_error', `got kitty_error ${data}`);
                };
                let stageCompleted = false;
                stage.onStageComplete((dataForNextStage) => {
                    stageCompleted = true;
                    dataForNextStage.winningBid.call.should.equal(expectedWinningBid.call);
                    dataForNextStage.winningBidder.should.equal(winner.position);
                });
                stage.onPlayerAction(winner, 'take_kitty');
                stageCompleted.should.be.true('stage did not complete');
            });
        }
    });
});