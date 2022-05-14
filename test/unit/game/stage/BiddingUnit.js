import assert from 'assert';
import Bidding from '../../../../lib/game/stage/Bidding.js';
import {getPlayers, getStage} from '../../../util/stage.js';
import {GameAction} from '../../../../lib/game/GameAction.js';
import OrdinaryNormalDeck from '../../../../lib/game/model/OrdinaryNormalDeck.js';

const getStartData = stage => {
    const config = OrdinaryNormalDeck.config;
    config.kittySize = 3;
    config.cardsPerHand = 10;
    config.totalHands = stage.players.length;
    return {deckConfig: config};
};
describe('Bidding Stage Unit', () => {
    describe(`start()`, () => {
        const stage = getStage(getPlayers(23), Bidding);
        it(`should deal cards to all players`, () => {
            stage.start(getStartData(stage));
            assert.equal(stage.kitty.size, 3);
            assert.equal(stage.hands.length, 23);
            assert.equal(stage.players.length, 23);
            for (const hand of stage.hands) {
                assert.equal(hand.size, 10);
            }
        });
    });
    describe(`onBid()`, () => {
        // "P","6S","6C","6D","6H","6","7S","7C","7D","7H","7","8S","M","8C","8D","8H","8","9S","9C","9D","9H","9","10S","10C","10D","O","10H","10","B"
        const scenarios = [
            {
                name: 'one bid one pass',
                players: 2,
                firstBidder: 0,
                bids: [
                    [0, '6S'],
                    [1, 'P'],
                ],
                winner: [0, '6S'],
            },
            {
                name: 'one bid one pass with more players',
                players: 10,
                firstBidder: 0,
                bids: [
                    [0, '6S'],
                    [1, '6C'],
                    [2, '6D'],
                    [3, '6H'],
                    [4, '6'],
                    [5, '7S'],
                    [6, '7C'],
                    [7, '7D'],
                    [8, '7H'],
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
                    [0, '6S'],
                    [1, '6C'],
                    [2, '6D'],
                    [0, 'P'],
                    [1, 'P'],
                    [2, '7S'],
                    [0, 'P'],
                    [1, 'P'],
                ],
                winner: [2, '7S'],
            },
            {
                name: 'highest bidder raises own bid, and then someone out bids them',
                players: 3,
                firstBidder: 0,
                bids: [
                    [0, '6S'],
                    [1, '6C'],
                    [2, '6D'],
                    [0, 'P'],
                    [1, 'P'],
                    [2, '7S'],
                    [0, 'P'],
                    [1, '8S'],
                    [2, 'P'],
                ],
                winner: [1, '8S'],
            },
        ];
        for (const scenario of scenarios) {
            it(scenario.name, () => {
                const stage = getStage(getPlayers(scenario.players), Bidding);
                stage.dataStore.firstBidder = scenario.firstBidder;
                stage.start(getStartData(stage));
                for (const [position, call] of scenario.bids) {
                    const player = stage.players[position];
                    const bid = stage.getBid(call);
                    assert.equal(stage.currentBidderPosition, position);
                    let bidAnnounced = false;
                    player.user.emit = (event, action) => {
                        assert.equal(event, 'stage:action');
                        const {actionName, actionData} = action;
                        assert.notEqual(actionName, 'bid_error', `Received unexpected bid error: ${actionData}, highest bid: ${stage.highestBid}, with bid: ${bid}`);
                    };
                    stage.setServer({
                        emit(event, action) {
                            assert.equal(event, 'stage:action');
                            const {actionName, actionData} = action;
                            if (!bidAnnounced && actionName === GameAction.PLACE_BID) {
                                bidAnnounced = true;
                                assert.equal(actionData.player.position, player.position);
                                assert.equal(actionData.bid.call, bid.call);
                            }
                        },
                    });
                    stage.onStageAction(player, player.user, GameAction.PLACE_BID, call);
                    assert(bidAnnounced, 'bid was not announced');
                }
                const [winnerPosition, winningCall] = scenario.winner;
                const winner = stage.players[winnerPosition];
                const expectedWinningBid = stage.getBid(winningCall);
                winner.emit = (event, action) => {
                    assert.equal(event, 'stage:action');
                    const {actionName, actionData} = action;
                    assert.notEqual(actionName, 'kitty_error', `got kitty_error ${actionData}`);
                };
                let stageCompleted = false;
                stage.onStageComplete((dataForNextStage) => {
                    stageCompleted = true;
                    assert.equal(dataForNextStage.winningBid?.call, expectedWinningBid.call);
                    assert.equal(dataForNextStage.winningBidderPosition, winner.position);
                });
                stage.onStageAction(winner, winner, GameAction.TAKE_KITTY);
                assert(stageCompleted, 'stage did not complete');
            });
        }
    });
});