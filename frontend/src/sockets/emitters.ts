import { socket } from "sockets";
//@ts-ignore
import ss from "socket.io-stream";

import { emitters, STREAM_NAME } from "utils/constants/sockets";

export const sendStream = (blob: Blob) => {
  const stream = ss.createStream();
  ss(socket).emit(emitters.STREAM_AUDIO, stream, {
    name: STREAM_NAME,
    size: blob.size,
  });
  // pipe the audio blob to the read stream
  ss.createBlobReadStream(blob).pipe(stream);
};

export const sendAudio = (blob: Blob) => {
  const reader = new FileReader();
  const prefix = "data:*/*;base64,";
  reader.readAsDataURL(blob);
  reader.onloadend = function () {
    const base64data = (reader.result as string).split(",")[1];
    const msg = {
      // TODO: test if prefix should be added
      // data: prefix + base64data,
      Data: base64data,
      Command: emitters.STREAM_AUDIO,
    };
    socket.send(JSON.stringify(msg));
  };
};

export const sendHi = () => {
  const msg = {
    Data: "Hi",
    Command: emitters.ON_CONNECTION,
  };
  console.log("sent hi");
  socket.send(JSON.stringify(msg));
};

export const closeConnection = () => {
  const msg = {
    Data: "Closing connection",
    Command: emitters.ON_CONNECTION,
  };
  socket.send(JSON.stringify(msg));
};
