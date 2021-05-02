// noinspection ES6UnusedImports
import should from 'should';
import Lobby from '../../../../src/game/stage/Lobby.js';
import Player from '../../../../src/game/model/Player.js';

function getPlayers(count) {
    const players = [];
    for (let i = 0; i < count; i++) {
        players.push(new Player((i + 10).toString(36), null));
    }
    return players;
}

function getLobby(players) {
    const lobby = new Lobby();
    lobby.setDataStore({});
    lobby.setNotifyClientCallback(() => {});
    lobby.setPlayers(players);
    return lobby;
}

describe('Lobby Unit', function() {
    describe('Cycle through the game', function() {

        describe(`start()`, function() {
            const lobby = getLobby(getPlayers(6));
            it(`should not end prematurely`, function() {
                lobby.onStageComplete(() => {
                    should(true).be.false('Lobby stage ended prematurely');
                });
                lobby.start();
            });
        });
        describe(`matchPartners()`, function() {
            const matchPartnerTests = [
                {
                    name: 'all partners want each other',
                    playerCount: 4,
                    partnerRequests: {a: 'b', b: 'a', c: 'd', d: 'c'},
                    expectedPositions: ['a', 'c', 'b', 'd'],
                    expectedMatches: ['ab', 'cd'],
                },
                {
                    name: 'no players request a partner',
                    playerCount: 6,
                    partnerRequests: {a: '', b: '', c: '', d: '', e: '', f: ''},
                    expectedPositions: ['a', 'c', 'e', 'b', 'd', 'f'],
                    expectedMatches: ['ab', 'cd', 'ef'],
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
                    const lobby = getLobby(getPlayers(testCase.playerCount));
                    lobby.matchPartners(testCase.partnerRequests);
                    for (let [a, b] of testCase.expectedMatches) {
                        a = lobby.getPlayerByName(a);
                        b = lobby.getPlayerByName(b);
                        should(a.partner).not.be.null();
                        should(b.partner).not.be.null();
                        a.partner.should.equal(b);
                        b.partner.should.equal(a);
                    }
                    lobby.setPlayerPositions();
                    for (let i = 0; i < testCase.expectedPositions.length; i++) {
                        const player = lobby.getPlayerByName(testCase.expectedPositions[i]);
                        should(player.position).not.be.null();
                        player.position.should.equal(i, `Player is not in correct position, expected player ${player.name} to have position ${i} instead of ${player.position}`);
                    }
                });
            }
        });
    });
});
