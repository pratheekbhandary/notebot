import io from "socket.io-client";
//@ts-ignore
import { IInitSocketsParams } from "types/sockets";
import { socketListeners } from "sockets/listeners";
console.log("socket endpoint", process.env.REACT_APP_SOCKET_ENDPOINT);
export const socket = io.connect(
  process.env.REACT_APP_SOCKET_ENDPOINT as string
);

export const initSockets = ({
  setTextFromSpeach,
  setIsSocketReady,
}: IInitSocketsParams) => {
  socketListeners({ setTextFromSpeach, setIsSocketReady });
};

export async function asyncForEach<T>(array: T[], callback: any) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
