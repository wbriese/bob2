/* eslint-disable max-len */
import brain from 'brain.js';
import _ from 'lodash';

export default function getNeuralNetFunction(allPositions, ship) {
  const maxWindForce = _.max(allPositions.map((pos) => Math.abs(pos.projectedWindForce)));
  const maxSwellForce = _.max(allPositions.map((pos) => Math.abs(pos.projectedSwellForce)));
  const minDraft = 5;
  const maxDraft = 10;
  const minAVGSpeed = 10;
  const maxAVGSpeed = 20;
  const minRPM = 90;
  const maxRPM = 120;

  function getSeaTrialConsumption(speed) {
    const cons = ship.propPolynom[0] + ship.propPolynom[1] * speed + ship.propPolynom[2] * speed ** 2 + ship.propPolynom[3] * speed ** 3;
    //console.log('Speed: ', speed, ' Cons: ', cons);
    return cons;
  }

  function scaleDownInput(position) {
    const input = [
      (0.5 * position.draftAft + 0.5 * position.draftFwd - minDraft) / (maxDraft - minDraft),
      0.50 + position.projectedWindForce / maxWindForce / 2,
      0.50 + position.projectedSwellForce / maxSwellForce / 2,
      (position.AVGSpeed - minAVGSpeed) / (maxAVGSpeed - minAVGSpeed),
      (position.rpm - minRPM) / (maxRPM - minRPM),
    ];
    //console.log('scaledDownInput',input);
    return input;
  }

  function scaleDownOutput(position) {
    const output = [0.5 * position.MEconsAvgSpeed / getSeaTrialConsumption(position.AVGSpeed)];
    //console.log('output into NN', output);
    return output;
  }

  function scaleUpOutput(value, speed) {
    const output = 2 * value * getSeaTrialConsumption(speed);
    //console.log('Output from NN: speed', speed, ' MEcons:', output);
    return output;
  }

  // provide optional config object (or undefined). Defaults shown.
  const config = {
    // Defaults values --> expected validation
    iterations: 20000, // the maximum times to iterate the training data --> number greater than 0
    errorThresh: 0.001, // the acceptable error percentage from training data --> number between 0 and 1
    log: false, // true to use console.log, when a function is supplied it is used --> Either true or a function
    logPeriod: 100, // iterations between logging out --> number greater than 0
    learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
    momentum: 0.2, // scales with next layer's change value --> number between 0 and 1
    callback: null, // a periodic call back that can be triggered while training --> null or function
    callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
    timeout: 10000, // the max number of milliseconds to train for --> number greater than 0
    hiddenLayer: [32, 64, 64, 32],
    activation: 'sigmoid',
  };

  // create a simple feed forward neural network with backpropagation
  const net = new brain.NeuralNetwork(config);
  const trainData = allPositions.map((pos) => ({ input: scaleDownInput(pos), output: scaleDownOutput(pos) }));
  net.train(trainData);

  // Return a function that provides the Fuel Consumption given a position as Input
  return (position) => scaleUpOutput(net.toFunction()(scaleDownInput(position)), position.AVGSpeed);
}
