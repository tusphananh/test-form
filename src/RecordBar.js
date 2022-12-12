import React from "react";
import { Recorder } from "react-voice-recorder";

function RecordBar({ id, audioDetails, setAudioDetails }) {
  function handleAudioStop(data) {
    setAudioDetails(id, { ...data });
  }

  function handleAudioUpload(file) {
    console.log(file);
  }

  function handleCountDown(data) {
    // console.log(data);
  }

  function handleReset() {
    const reset = {
      url: null,
      blob: null,
      chunks: null,
      duration: {
        h: 0,
        m: 0,
        s: 0,
      },
    };
    setAudioDetails(id, { ...reset });
  }
  return (
    <Recorder
      record={true}
      showUIAudio
      audioURL={audioDetails.url}
      handleAudioStop={(data) => handleAudioStop(data)}
      handleAudioUpload={(data) => handleAudioUpload(data)}
      handleCountDown={(data) => handleCountDown(data)}
      handleReset={() => handleReset()}
      mimeTypeToUseWhenRecording={`audio/webm`} // For specific mimetype.
    />
  );
}

export default RecordBar;
