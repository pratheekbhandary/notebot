import React, { useEffect, useRef, useState } from "react";
import hark from "hark";
import RecordRTCPromisesHandler from "recordrtc";
import { microphone } from "utils/constants";
import { sendStream } from "sockets/emitters";
import { Button } from "@material-ui/core";
import { playBlobAudio } from "utils/misc";

interface IMicrophoneProps {}

const Microphone = () => {
  const [recorder, setRecorder] = useState<RecordRTCPromisesHandler | null>(
    null
  );
  const stopRecordingTimeoutRef: { current: NodeJS.Timeout | null } = useRef(
    null
  );
  const [pauseRecording, setPauseRecording] = useState<boolean>(false);

  useEffect(() => {
    //IIFE coz useEffect expects a cleanup function in return not promise
    (async () => {
      try {
        let stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        let recorder = new RecordRTCPromisesHandler(stream, {
          type: "audio",
          mimeType: "audio/webm",
          sampleRate: 44100,
          desiredSampRate: 16000,
          recorderType: RecordRTCPromisesHandler.StereoAudioRecorder,
          numberOfAudioChannels: 1,
          timeSlice: 4000,
          ondataavailable: function (blob) {
            sendStream(blob);
            console.log("PRAT::sending chunk", blob.size);
          },
        });
        setRecorder(recorder);
      } catch (err) {}
    })();
  }, []);

  useEffect(() => {
    console.log("PRAT::effected");
    let speechEvents: hark.Harker;
    if (recorder !== null) {
      (async () => {
        try {
          let stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          speechEvents = hark(stream, {});

          speechEvents.on("speaking", () => {
            if (pauseRecording) {
              return;
            }
            if (stopRecordingTimeoutRef.current !== null) {
              clearTimeout(stopRecordingTimeoutRef.current);
              stopRecordingTimeoutRef.current = null;
            } else {
              recorder.startRecording();
              console.log("PRAT::Recording Started");
            }
          });
          speechEvents.on("stopped_speaking", function () {
            stopRecordingTimeoutRef.current = setTimeout(() => {
              recorder.stopRecording();
              stopRecordingTimeoutRef.current = null;
              console.log("PRAT::Recording Stopped");
            }, microphone.STOP_SILENCE_TIME);
          });
        } catch (err) {}
      })();
    }
    return () => {
      speechEvents && speechEvents.stop();
    };
  }, [recorder, pauseRecording]);

  const onPauseClick = React.useCallback(() => {
    setPauseRecording(!pauseRecording);
  }, [pauseRecording]);

  return (
    <>
      <Button onClick={onPauseClick} variant="contained" size="large">
        Pause Recording
      </Button>
    </>
  );
};

export default Microphone;
