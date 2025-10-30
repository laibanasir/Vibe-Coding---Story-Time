
export enum StoryPhase {
  Idle,
  Generating,
  PresentingOpening,
  AwaitingChoice,
  GeneratingContinuation,
  PresentingEnding,
  Finished,
}

export interface InitialStoryPart {
  openingScene: string;
  question: string;
  options: [string, string];
}

export interface StoryContinuationPart {
    adventure: string;
    ending: string;
}

export interface Story {
  setting: string;
  opening: string;
  question: string;
  options: [string, string];
  adventure: string;
  ending: string;
}
