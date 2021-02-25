import { socket } from "sockets";
import { IInitSocketsParams, IServerMessage } from "types/sockets";
import { listeners } from "utils/constants";

export const socketListeners = ({
  setTextFromSpeach,
  setIsSocketReady,
  setSessionId,
}: IInitSocketsParams) => {
  const onTextFromSpeach = (message: string) => {
    setTextFromSpeach(message);
  };

  const onConnection = (id: string) => {
    setIsSocketReady(true);
    setSessionId(id);
    console.log("got session id:", id);
  };

  socket.onmessage = function (event) {
    const serverMsg: IServerMessage = JSON.parse(event.data);
    console.log("message from server:", serverMsg);
    switch (serverMsg.Command) {
      case listeners.ReceiveSessionId:
        onConnection(serverMsg.SessionID);
        break;

      case listeners.SPEACH_TO_TEXT:
        onTextFromSpeach(serverMsg.Data);
        break;

      default:
        break;
    }
  };
};
