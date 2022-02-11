/* eslint-disable no-undef */
// noinspection ES6UnusedImports
import should from 'should';
import Lobby from '../../../../lib/game/stage/Lobby.js';
import {getPlayers, getStage} from '../../../util/stage.js';

describe('Lobby Stage Unit', function() {
    describe('Cycle through the game', function() {
        describe(`start()`, function() {
            const lobby = getStage(getPlayers(6), Lobby);
            it(`should not end prematurely`, function() {
                lobby.onStageComplete(() => {
                    should(true).be.false('Lobby stage ended prematurely');
                });
                lobby.start();
            });
        });
        describe(`startGame()`, function() {
            it(`should complete stage when all players are ready`, done => {
                const lobby = getStage(getPlayers(6), Lobby);
                lobby.onStageComplete(() => {
                    done();
                });
                lobby.start();
                for (const player of lobby.players) {
                    lobby.onStageAction(player, 'ready', true);
                }
            });
            it(`should complete stage when all players are ready`, () => {
                const lobby = getStage(getPlayers(1), Lobby);
                lobby.onStageComplete(() => {
                    should(true).be.false('Lobby stage ended without enough players');
                });
                lobby.start();
                for (const player of lobby.players) {
                    lobby.onStageAction(player, 'ready', true);
                }
            });
        });
        describe(`matchPartners()`, function() {
            const matchPartnerTests = [
                {
                    name: 'all partners want each other',
                    playerCount: 4,
                    partnerRequests: {a: 'c', b: 'd', c: 'a', d: 'b'},
                    expectedPositions: ['a', 'b', 'c', 'd'],
                    expectedMatches: ['ac', 'bd'],
                },
                {
                    name: 'no players request a partner',
                    playerCount: 8,
                    partnerRequests: {a: '', b: '', c: '', d: '', e: '', f: '', g: '', h: ''},
                    expectedPositions: ['a', 'c', 'e', 'g', 'b', 'd', 'f', 'h'],
                    expectedMatches: ['ab', 'cd', 'ef', 'gh'],
                },
                {
                    name: 'nobody can agree on anything',
                    playerCount: 6,
                    partnerRequests: {a: 'e', b: 'e', c: '', d: 'c', e: 'f', f: 'a'},
                    expectedPositions: ['a', 'b', 'c', 'f', 'e', 'd'],
                    expectedMatches: ['af', 'be', 'cd'],
                },
                {
                    name: 'mutual requests are prioritized',
                    playerCount: 4,
                    partnerRequests: {a: 'b', b: 'a', c: 'a', d: 'b'},
                    expectedPositions: ['a', 'c', 'b', 'd'],
                    expectedMatches: ['ab', 'cd'],
                },
            ];
            for (const testCase of matchPartnerTests) {
                it(testCase.name, function() {
                    const lobby = getStage(getPlayers(testCase.playerCount), Lobby);
                    const partnerRequestsToIds = partnerRequests => {
                        const idRequests = {};
                        for (const [k, v] of Object.entries(partnerRequests)) {
                            idRequests[lobby.getPlayerByName(k).id] = lobby.getPlayerByName(v)?.id;
                        }
                        return idRequests;
                    };
                    lobby.matchPartners(partnerRequestsToIds(testCase.partnerRequests));
                    for (let [a, b] of testCase.expectedMatches) {
                        a = lobby.getPlayerByName(a);
                        b = lobby.getPlayerByName(b);
                        should(a.partner).not.be.null();
                        should(b.partner).not.be.null();
                        a.partner.should.equal(b);
                        b.partner.should.equal(a);
                    }
                    lobby.setPlayerPositions();
                    testCase.playerCount.should.equal(testCase.expectedPositions.length);
                    testCase.playerCount.should.equal(lobby.players.length);
                    for (let i = 0; i < testCase.expectedPositions.length; i++) {
                        const player = lobby.getPlayerByName(testCase.expectedPositions[i]);
                        const playerAtPosition = lobby.players[i];
                        should(player.position).not.be.null();
                        player.position.should.equal(i, `Player is not in correct position, expected player ${player.name} to have position ${i} instead of ${player.position}`);
                        playerAtPosition.position.should.equal(i, `stage.players is not sorted correctly player at position ${i} had their position set to ${playerAtPosition.position}`);
                    }
                });
            }
        });
    });
});
