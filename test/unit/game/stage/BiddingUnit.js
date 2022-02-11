// noinspection ES6UnusedImports
/* eslint-disable no-unused-vars,no-undef */
import should from 'should';
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
            stage.kitty.size.should.equal(3);
            stage.hands.should.length(23);
            stage.players.should.length(23);
            for (const hand of stage.hands) {
                hand.size.should.equal(10);
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
                const stage = getStage(getPlayers(scenario.players, true), Bidding);
                stage.dataStore.firstBidder = scenario.firstBidder;
                stage.start(getStartData(stage));
                for (const [position, call] of scenario.bids) {
                    const player = stage.players[position];
                    const bid = stage.getBid(call);
                    stage.currentBidder.should.equal(position);
                    let bidAnnounced = false;
                    player.client = {
                        emit(event, action) {
                            should(event).equal('stage:action');
                            const {actionName, actionData} = action;
                            actionName.should.not.equal('bid_error', `Received unexpected bid error: ${actionData}, highest bid: ${stage.highestBid}, with bid: ${bid}`);
                        },
                    };
                    stage.channel.emit = (event, action) => {
                        should(event).equal('stage:action');
                        const {actionName, actionData} = action;
                        if (!bidAnnounced && actionName === GameAction.PLACE_BID) {
                            bidAnnounced = true;
                            actionData.player.position.should.equal(player.position);
                            actionData.bid.call.should.equal(bid.call);
                        }
                    };
                    stage.onStageAction(player, GameAction.PLACE_BID, call);
                    bidAnnounced.should.be.true('bid was not announced');
                }
                const [winnerPosition, winningCall] = scenario.winner;
                const winner = stage.players[winnerPosition];
                const expectedWinningBid = stage.getBid(winningCall);
                winner.emit = (event, action) => {
                    should(event).equal('stage:action');
                    const {actionName, actionData} = action;
                    actionName.should.not.equal('kitty_error', `got kitty_error ${actionData}`);
                };
                let stageCompleted = false;
                stage.onStageComplete((dataForNextStage) => {
                    stageCompleted = true;
                    dataForNextStage.winningBid.call.should.equal(expectedWinningBid.call);
                    dataForNextStage.winningBidder.should.equal(winner.position);
                });
                stage.onStageAction(winner, GameAction.TAKE_KITTY);
                stageCompleted.should.be.true('stage did not complete');
            });
        }
    });
});