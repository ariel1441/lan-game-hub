import { runGameMetadataTests } from '../games/game-metadata.test.js';
import { runConnect4GameTests } from '../games/connect4/connect4.game.test.js';
import { runWouldYouRatherGameTests } from '../games/would-you-rather/would-you-rather.game.test.js';
import { runImposterGameTests } from '../games/imposter/imposter.game.test.js';
import { runCheckersGameTests } from '../games/checkers/checkers.game.test.js';

const suites: Array<{ name: string; run: () => void }> = [
  { name: 'game metadata', run: runGameMetadataTests },
  { name: 'connect4', run: runConnect4GameTests },
  { name: 'would-you-rather', run: runWouldYouRatherGameTests },
  { name: 'imposter', run: runImposterGameTests },
  { name: 'checkers', run: runCheckersGameTests },
];

for (const suite of suites) {
  suite.run();
  console.log(`PASS ${suite.name}`);
}
