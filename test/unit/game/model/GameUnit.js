import assert from 'assert';
import GameStage from '../../../../lib/game/GameStage.js';
import Game from '../../../../lib/game/Game.js';

class SampleStage1 extends GameStage {
    static startCallback;

    start(dataFromPreviousStage) {
        this.constructor.startCallback(this, dataFromPreviousStage);
    }
}

class SampleStage2 extends GameStage {
    static startCallback;

    start(dataFromPreviousStage) {
        this.constructor.startCallback(this, dataFromPreviousStage);
    }
}

describe('Game Unit', () => {
    describe('Cycle through the game', () => {
        const game = new Game([
            SampleStage1,
            SampleStage2,
        ]);
        describe(`nextStage()`, () => {
            let stage1DataStore = null, stage2DataStore = null;
            it(`should start on stage 1`, done => {
                SampleStage1.startCallback = (instance, dataFromPreviousStage) => {
                    assert(instance instanceof SampleStage1);
                    assert(instance.dataStore instanceof Object);
                    assert.equal(Object.keys(instance.dataStore).length, 0);
                    instance.dataStore.stage_1_test_property = 'data_from_stage_1';
                    stage1DataStore = instance;
                    assert(!dataFromPreviousStage);
                    done();
                };
                game.nextStage();
            });
            it(`should proceed to stage 2`, done => {
                SampleStage2.startCallback = (instance, dataFromPreviousStage) => {
                    assert(instance instanceof SampleStage2);
                    assert(instance.dataStore instanceof Object);
                    assert.equal(Object.keys(instance.dataStore), 0);
                    assert(!instance.dataStore?.stage_2_test_property);
                    instance.dataStore.stage_2_test_property = 'data_from_stage_2';
                    stage2DataStore = instance.dataStore;
                    assert.equal(dataFromPreviousStage, 'data_for_stage_2');
                    done();
                };
                game.currentStage.complete('data_for_stage_2');
            });
            it(`should cycle back to stage 1`, done => {
                SampleStage1.startCallback = (instance, dataFromPreviousStage) => {
                    assert(instance instanceof SampleStage1);
                    assert(instance.dataStore instanceof Object);
                    assert.equal(Object.keys(instance.dataStore).length, 1);
                    assert.equal(instance.dataStore.stage_1_test_property, 'data_from_stage_1');
                    assert.notEqual(instance.dataStore, stage1DataStore);
                    assert.equal(dataFromPreviousStage, 'data_for_stage_1_again');
                    done();
                };
                game.currentStage.complete('data_for_stage_1_again');
            });
            it(`should proceed to stage 2 again`, done => {
                SampleStage2.startCallback = (instance, dataFromPreviousStage) => {
                    assert(instance instanceof SampleStage2);
                    assert(instance.dataStore instanceof Object);
                    assert.equal(Object.keys(instance.dataStore).length, 1);
                    assert.equal(instance.dataStore.stage_2_test_property, 'data_from_stage_2');
                    assert.notEqual(instance.dataStore, stage2DataStore);
                    assert.equal(dataFromPreviousStage, 'game_over');
                    done();
                };
                const stage = game.currentStage;
                game.currentStage.complete('game_over');
                assert.equal(game.currentStage, null);
                assert(!stage?.dataStore);
                assert(!stage?._onStageComplete);
                assert(!stage?.players);
                assert.equal(Object.keys(stage).length, 0);
            });
        });
    });
});
