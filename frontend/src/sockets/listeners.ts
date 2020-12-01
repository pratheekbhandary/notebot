import { socket } from "sockets";
import { IInitSocketsParams, ITextFromSpeachParams } from "types/sockets";
import { listeners } from "utils/constants";

export const socketListeners = ({
  setTextFromSpeach,
  setIsSocketReady,
}: IInitSocketsParams) => {
  const onTextFromSpeach = ({ message }: ITextFromSpeachParams) => {
    setTextFromSpeach(message);
  };

  const onConnection = () => {
    setIsSocketReady(true);
  };

  socket.on(listeners.CONNECT, onConnection);
  socket.on(listeners.SPEACH_TO_TEXT, onTextFromSpeach);
};
