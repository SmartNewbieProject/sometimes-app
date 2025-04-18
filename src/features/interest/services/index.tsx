export enum InterestSteps {
  AGE = 1,
  DRIKNING = 2,
  INTEREST = 3,
  SMOKING = 4,
  TATTOO = 5,
}

export const phaseCount = Object.keys(InterestSteps).length / 2;
