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
