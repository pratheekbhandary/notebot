import React, { useEffect, useRef, useState, useContext, FC } from "react";
import hark from "hark";
import RecordRTCPromisesHandler from "recordrtc";
import { microphone } from "utils/constants";
import { sendStream, sendAudio } from "sockets/emitters";
import { Button } from "@material-ui/core";
import { playBlobAudio } from "utils/misc";
import AppContext from "contexts/AppContext";

interface IMicrophoneProps {}

const Microphone: FC<IMicrophoneProps> = () => {
  // this recorder instance can listen to user in controlled manner
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
        // Get permission from user to spy on him
        // Returns a stream of audio which is sent to backend every 6000 ms using sockets
        let stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        //recorder lets us control the stream
        let recorder = new RecordRTCPromisesHandler(stream, {
          type: "audio",
          mimeType: "audio/webm",
          sampleRate: 44100,
          desiredSampRate: 16000,
          recorderType: RecordRTCPromisesHandler.StereoAudioRecorder,
          numberOfAudioChannels: 1,
          timeSlice: 6000,
          ondataavailable: function (blob) {
            sendAudio(blob);
          },
        });
        setRecorder(recorder);
      } catch (err) {}
    })();
  }, []);

  useEffect(() => {
    let speechEvents: hark.Harker;
    if (recorder !== null) {
      (async () => {
        try {
          // this stream is used to activate/deactivate the main recorder based on user's silence
          let stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          //hark helps us by triggering events when user speaks and is silent
          speechEvents = hark(stream, {});

          speechEvents.on("speaking", () => {
            if (pauseRecording) {
              return;
            }
            if (stopRecordingTimeoutRef.current !== null) {
              //if hark thinks that user stopped speaking, but the user starts rambling again
              clearTimeout(stopRecordingTimeoutRef.current);
              stopRecordingTimeoutRef.current = null;
            } else {
              recorder.startRecording();
            }
          });
          speechEvents.on("stopped_speaking", function () {
            stopRecordingTimeoutRef.current = setTimeout(() => {
              recorder.stopRecording();
              stopRecordingTimeoutRef.current = null;
              // actually stop the recording when hark thinks speaker stopped + STOP_SILENCE_TIME ms
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
