
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


export const playAudio = (base64Audio: string, audioContext: AudioContext): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    if (!base64Audio) {
        console.warn("playAudio called with empty audio data.");
        resolve();
        return;
    }
    try {
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      const decodedData = decode(base64Audio);
      // TTS model returns at 24000 sample rate, 1 channel
      const audioBuffer = await decodeAudioData(decodedData, audioContext, 24000, 1);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      source.onended = () => {
        resolve();
      };

      source.start();
    } catch (error) {
      console.error("Failed to play audio:", error);
      reject(error);
    }
  });
};
