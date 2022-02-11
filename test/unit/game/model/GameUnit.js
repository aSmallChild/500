/* eslint-disable */
// noinspection ES6UnusedImports
import should from 'should';
import GameStage from '../../../../lib/game/GameStage.js';
import Game from '../../../../lib/game/Game.js';
import Channel from '../../../../lib/server/Channel.js';

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

describe('Game Unit', function() {
    describe('Cycle through the game', function() {
        const game = new Game([
            SampleStage1,
            SampleStage2,
        ], new Channel('a', 'b', 'c'));
        describe(`nextStage()`, function() {
            let stage1DataStore = null, stage2DataStore = null;
            it(`should start on stage 1`, function(done) {
                SampleStage1.startCallback = (instance, dataFromPreviousStage) => {
                    instance.should.be.instanceof(SampleStage1);
                    instance.dataStore.should.be.instanceof(Object);
                    Object.keys(instance.dataStore).should.have.length(0);
                    instance.dataStore.should.not.have.property('stage_1_test_property');
                    instance.dataStore.stage_1_test_property = 'data_from_stage_1';
                    stage1DataStore = instance;
                    should(dataFromPreviousStage).be.undefined();
                    done();
                };
                game.nextStage();
            });
            it(`should proceed to stage 2`, function(done) {
                SampleStage2.startCallback = (instance, dataFromPreviousStage) => {
                    instance.should.be.instanceof(SampleStage2);
                    instance.dataStore.should.be.instanceof(Object);
                    Object.keys(instance.dataStore).should.have.length(0);
                    instance.dataStore.should.not.have.property('stage_2_test_property');
                    instance.dataStore.stage_2_test_property = 'data_from_stage_2';
                    stage2DataStore = instance.dataStore;
                    dataFromPreviousStage.should.equal('data_for_stage_2');
                    done();
                };
                game.currentStage.complete('data_for_stage_2');
            });
            it(`should cycle back to stage 1`, function(done) {
                SampleStage1.startCallback = (instance, dataFromPreviousStage) => {
                    instance.should.be.instanceof(SampleStage1);
                    instance.dataStore.should.be.instanceof(Object);
                    Object.keys(instance.dataStore).should.have.length(1);
                    instance.dataStore.stage_1_test_property.should.equal('data_from_stage_1');
                    instance.dataStore.should.not.equal(stage1DataStore);
                    dataFromPreviousStage.should.equal('data_for_stage_1_again');
                    done();
                };
                game.currentStage.complete('data_for_stage_1_again');
            });
            it(`should proceed to stage 2 again`, function(done) {
                SampleStage2.startCallback = (instance, dataFromPreviousStage) => {
                    instance.should.be.instanceof(SampleStage2);
                    instance.dataStore.should.be.instanceof(Object);
                    Object.keys(instance.dataStore).should.have.length(1);
                    instance.dataStore.stage_2_test_property.should.equal('data_from_stage_2');
                    instance.dataStore.should.not.equal(stage2DataStore);
                    dataFromPreviousStage.should.equal('game_over');
                    done();
                };
                const stage = game.currentStage;
                game.currentStage.complete('game_over');
                should(game.currentStage).be.null();
                should(stage.dataStore).be.undefined();
                should(stage._onStageComplete).be.undefined();
                should(stage.players).be.undefined();
                Object.keys(stage).should.have.length(0);
            });
        });
    });
});
