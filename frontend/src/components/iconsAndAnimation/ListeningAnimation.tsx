import React, { FC } from "react";
import { Player } from "@lottiefiles/react-lottie-player";

interface IListeningAnimationProps {
  isSpeaking: boolean;
}
const ListeningAnimation: FC<IListeningAnimationProps> = ({ isSpeaking }) => {
  return (
    <Player
      autoplay
      loop={isSpeaking}
      src="https://assets7.lottiefiles.com/temp/lf20_TuJX7j.json"
    />
  );
};

export default ListeningAnimation;
