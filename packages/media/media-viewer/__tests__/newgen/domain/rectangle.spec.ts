import { Rectangle } from '../../../src/newgen/domain/rectangle';

import * as jsc from 'jsverify';

const ACCEPTABLE_FLOATING_ERROR = 0.001;

const sideLenGenerator = () => jsc.integer(1, 10000);

describe('Rectangle', () => {
  describe('fitting rectangles', () => {
    jsc.property(
      "no side of the fitted rect is larger than the containing rect's sides",
      sideLenGenerator(),
      sideLenGenerator(),
      sideLenGenerator(),
      sideLenGenerator(),
      (w1, h1, w2, h2) => {
        const containing = new Rectangle(w1, h1);
        const original = new Rectangle(w2, h2);
        const fitted = original.scaled(original.scaleToFit(containing));
        return !(
          Math.round(fitted.width) > Math.round(containing.width) ||
          Math.round(fitted.height) > Math.round(containing.height)
        );
      },
    );

    jsc.property(
      "at least one side of the fitted rect equals a containing rect's side",
      sideLenGenerator(),
      sideLenGenerator(),
      sideLenGenerator(),
      sideLenGenerator(),
      (w1, h1, w2, h2) => {
        const containing = new Rectangle(w1, h1);
        const original = new Rectangle(w2, h2);
        const fitted = original.scaled(original.scaleToFit(containing));
        return (
          Math.round(fitted.width) === Math.round(containing.width) ||
          Math.round(fitted.height) === Math.round(containing.height)
        );
      },
    );

    jsc.property(
      'the fitted rect has the same aspect ratio as the original',
      sideLenGenerator(),
      sideLenGenerator(),
      sideLenGenerator(),
      sideLenGenerator(),
      (w1, h1, w2, h2) => {
        const containing = new Rectangle(w1, h1);
        const original = new Rectangle(w2, h2);
        const fitted = original.scaled(original.scaleToFit(containing));
        return (
          original.aspectRatio - fitted.aspectRatio <= ACCEPTABLE_FLOATING_ERROR
        );
      },
    );
  });

  describe('centering rectangles', () => {
    jsc.property(
      'the distances between opposite sides always match',
      sideLenGenerator(),
      sideLenGenerator(),
      sideLenGenerator(),
      sideLenGenerator(),
      (w1, h1, w2, h2) => {
        const rect1 = new Rectangle(w1, h1);
        const rect2 = new Rectangle(w2, h2);
        const difference = rect1.differenceOfCenters(rect2);
        const distanceLeft = difference.x;
        const distanceRight = rect1.width - (rect2.width + difference.x);
        const distanceTop = difference.y;
        const distanceBottom = rect1.height - (rect2.height + difference.y);
        return (
          distanceLeft - distanceRight <= ACCEPTABLE_FLOATING_ERROR &&
          distanceTop - distanceBottom <= ACCEPTABLE_FLOATING_ERROR
        );
      },
    );
  });
});
