import consola, {FancyReporter} from 'consola';

export const logger = consola.create(
  {
    reporters: [
      new FancyReporter,
    ],
  },
);
