
import React, { useState, useRef, useCallback } from 'react';
import { generateInitialStory, continueStory, generateSpeech } from './services/geminiService';
import { playAudio } from './utils/audioUtils';
import type { Story, InitialStoryPart } from './types';
import { StoryPhase } from './types';
import StoryCard from './components/StoryCard';
import ChoiceButton from './components/ChoiceButton';
import ActionButton from './components/ActionButton';
import LoadingIndicator from './components/LoadingIndicator';
import { SparklesIcon, PlayIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const storySettings = ['a magical forest ✨', 'deep under the blue sea 🐠', 'a sparkly galaxy far away 🚀', 'a secret garden with talking flowers 🌷', 'a land made of yummy candy 🍭'];

const App: React.FC = () => {
  const [phase, setPhase] = useState<StoryPhase>(StoryPhase.Idle);
  const [story, setStory] = useState<Story | null>(null);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentStoryRef = useRef<Story | null>(null);

  const handleStartStory = useCallback(async () => {
    if (phase !== StoryPhase.Idle && phase !== StoryPhase.Finished) return;

    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (e) {
        setError("Your browser doesn't support audio playback. Please try a different browser.");
        return;
      }
    }

    setPhase(StoryPhase.Generating);
    setError(null);
    setStory(null);
    currentStoryRef.current = null;

    try {
      const randomSetting = storySettings[Math.floor(Math.random() * storySettings.length)];
      const initialPart: InitialStoryPart = await generateInitialStory(randomSetting);
      
      const newStory: Story = {
        setting: randomSetting,
        opening: initialPart.openingScene,
        question: initialPart.question,
        options: initialPart.options,
        adventure: '',
        ending: '',
      };
      setStory(newStory);
      currentStoryRef.current = newStory;

      setPhase(StoryPhase.PresentingOpening);

      const openingAudio = await generateSpeech(newStory.opening);
      await playAudio(openingAudio, audioContextRef.current);
      
      const questionAudio = await generateSpeech(newStory.question);
      await playAudio(questionAudio, audioContextRef.current);

      setPhase(StoryPhase.AwaitingChoice);
    } catch (err) {
      console.error(err);
      setError('Oops! I couldn\'t think of a story. Please try again.');
      setPhase(StoryPhase.Idle);
    }
  }, [phase]);

  const handleChoice = useCallback(async (choice: string) => {
    if (phase !== StoryPhase.AwaitingChoice || !currentStoryRef.current) return;

    setPhase(StoryPhase.GeneratingContinuation);
    const storySoFar = currentStoryRef.current;

    try {
      const continuation = await continueStory(storySoFar, choice);
      const updatedStory = { ...storySoFar, ...continuation };
      setStory(updatedStory);
      currentStoryRef.current = updatedStory;

      setPhase(StoryPhase.PresentingEnding);

      const adventureAudio = await generateSpeech(updatedStory.adventure);
      await playAudio(adventureAudio, audioContextRef.current);

      const endingAudio = await generateSpeech(updatedStory.ending);
      await playAudio(endingAudio, audioContextRef.current);
      
      setPhase(StoryPhase.Finished);

    } catch (err) {
      console.error(err);
      setError('Oh no! The story got lost. Let\'s start a new one.');
      setPhase(StoryPhase.Idle);
    }
  }, [phase]);

  const renderContent = () => {
    switch (phase) {
      case StoryPhase.Generating:
      case StoryPhase.GeneratingContinuation:
        return <LoadingIndicator text="Thinking of a magical story..." />;
      
      case StoryPhase.PresentingOpening:
      case StoryPhase.AwaitingChoice:
      case StoryPhase.PresentingEnding:
      case StoryPhase.Finished:
        if (story) {
          return (
            <div className="w-full flex flex-col items-center gap-6">
              <StoryCard text={story.opening} />
              {phase >= StoryPhase.AwaitingChoice && <StoryCard text={story.question} />}
              {story.adventure && <StoryCard text={story.adventure} />}
              {story.ending && <StoryCard text={story.ending} />}
            </div>
          );
        }
        return null;

      case StoryPhase.Idle:
      default:
        return (
          <div className="text-center">
            <SparklesIcon className="w-24 h-24 text-yellow-400 mx-auto animate-pulse" />
            <h1 className="text-4xl md:text-5xl font-bold text-blue-800 mt-4">Story Time with Abood</h1>
            <p className="text-blue-600 mt-2 text-lg">Let's go on an adventure!</p>
          </div>
        );
    }
  };

  const renderActions = () => {
    const isLoading = phase === StoryPhase.Generating || phase === StoryPhase.GeneratingContinuation;

    switch (phase) {
      case StoryPhase.AwaitingChoice:
        return (
          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            {story?.options.map((option, index) => (
              <ChoiceButton key={index} text={option} onClick={() => handleChoice(option)} />
            ))}
          </div>
        );

      case StoryPhase.Idle:
        return <ActionButton text="Start a New Story" icon={PlayIcon} onClick={handleStartStory} disabled={isLoading} />;
      
      case StoryPhase.Finished:
        return <ActionButton text="Tell Another Story!" icon={ArrowPathIcon} onClick={handleStartStory} disabled={isLoading} />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center flex-grow">
        {renderContent()}
      </main>
      <footer className="w-full max-w-2xl mx-auto py-6 flex flex-col items-center justify-center">
        {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}
        {renderActions()}
      </footer>
    </div>
  );
};

export default App;
