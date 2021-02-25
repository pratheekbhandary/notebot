import { IInitSocketsParams } from "types/sockets";
import { socketListeners } from "sockets/listeners";
import { sendHi, closeConnection } from "./emitters";
export const socket = new WebSocket("ws://localhost:4040/session");

socket.onopen = function () {
  sendHi();
  console.log("clientWebSocket.readyState", "websocketstatus");
};

socket.onclose = function (error) {
  console.log("clientWebSocket.onclose", socket, error);
  closeConnection();
  //events("Closing connection");
};

socket.onerror = function (error) {
  console.log("clientWebSocket.onerror", socket, error);
  //events("An error occured");
};

export const initSockets = ({
  setTextFromSpeach,
  setIsSocketReady,
  setSessionId,
}: IInitSocketsParams) => {
  socketListeners({ setTextFromSpeach, setIsSocketReady, setSessionId });
};

export async function asyncForEach<T>(array: T[], callback: any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
