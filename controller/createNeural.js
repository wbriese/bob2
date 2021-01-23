/* eslint-disable max-len */
import brain from 'brain.js';

export default function createNeuralNetFunction(allPositions, ship) {
  function getSeaTrialConsumption(speed) {
    const cons = ship.propPolynom[0] + ship.propPolynom[1] * speed + ship.propPolynom[2] * speed ** 2 + ship.propPolynom[3] * speed ** 3;
    //console.log('Speed: ', speed, ' Cons: ', cons);
    return cons;
  }

  function scaleDownInput(position) {
    const input = [
      ( 0.5*position.draftAft + 0.5*position.draftFwd) / (ship.draftAft + ship.draftFwd),
      0.5 + position.projectedWindForce / 2 / Math.max(...allPositions.map((pos) => Math.abs(pos.projectedWindForce))),
      0.5 + position.projectedSwellForce / 2 / Math.max(...allPositions.map((pos) => Math.abs(pos.projectedSwellForce))),
      0.5 * position.AVGSpeed / 15,
    ];
    console.log('scaledDownInput',input);
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
    iterations: 100000, // the maximum times to iterate the training data --> number greater than 0
    errorThresh: 0.00001, // the acceptable error percentage from training data --> number between 0 and 1
    log: true, // true to use console.log, when a function is supplied it is used --> Either true or a function
    logPeriod: 100, // iterations between logging out --> number greater than 0
    learningRate: 0.3, // scales with delta to effect training rate --> number between 0 and 1
    momentum: 0.2, // scales with next layer's change value --> number between 0 and 1
    callback: null, // a periodic call back that can be triggered while training --> null or function
    callbackPeriod: 10, // the number of iterations through the training data between callback calls --> number greater than 0
    timeout: 10000, // the max number of milliseconds to train for --> number greater than 0
    hiddenLayer: [10, 10, 10, 10, 10, 10],
  };

  // create a simple feed forward neural network with backpropagation
  const net = new brain.recurrent.LSTM(config);
  net.train(allPositions.map((pos) => ({
    input: scaleDownInput(pos),
    output: scaleDownOutput(pos),
  })));

  // Return a function that provides the Fuel Consumption given a position as Input
  return (position) => scaleUpOutput(net.toFunction()(scaleDownInput(position)), position.AVGSpeed);
}
