const waitFor = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const playBlobAudio = async (blob: Blob) => {
  const audioUrl = URL.createObjectURL(blob);
  const audio = new Audio(audioUrl);
  audio.play();
  //audio.play promise returned here suka ijji
  await waitFor(4000);
};
