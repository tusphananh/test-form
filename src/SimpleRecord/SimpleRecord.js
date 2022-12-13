import {
  PauseOutlined,
  CaretRightOutlined,
  CheckSquareOutlined,
} from "@ant-design/icons";
import { Button } from "antd";
import React, { useState } from "react";
import Recorder from "./recorder";

const AudioContext = window.AudioContext || window.webkitAudioContext;
var rec;
function SimpleRecord({ id, audioDetails, setAudioDetails }) {
  const [gumStream, setGumStream] = useState();
  const [disableButtons, setDisableButtons] = useState([
    "stopButton",
    "pauseButton",
  ]);
  const startRecording = () => {
    var constraints = { audio: true, video: false };

    setDisableButtons(["recordButton"]);

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then(function (stream) {
        console.log(
          "getUserMedia() success, stream created, initializing Recorder.js ..."
        );

        const audioContext = new AudioContext();

        setGumStream(stream);

        const input = audioContext.createMediaStreamSource(stream);

        rec = new Recorder(input, { numChannels: 1 });

        rec.record();
      })
      .catch(function (err) {
        setDisableButtons(["recordButton"]);
      });
  };

  const pauseRecording = () => {
    if (rec.recording) {
      //pause
      rec.stop();
    } else {
      //resume
      rec.record();
    }
  };

  const stopRecording = () => {
    console.log("stopButton clicked");

    setDisableButtons(["stopButton", "pauseButton"]);
    rec.stop();

    gumStream.getAudioTracks()[0].stop();

    rec.exportWAV(createDownloadLink);
  };

  function createDownloadLink(blob) {
    const url = URL.createObjectURL(blob);
    setAudioDetails(id, {
      url: url,
      blob: blob,
    });
  }

  return (
    <div>
      <div id="controls">
        <Button
          type="primary"
          shape="circle"
          icon={<CaretRightOutlined />}
          size="medium"
          id="recordButton"
          onClick={startRecording}
          disabled={disableButtons.includes("recordButton")}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<PauseOutlined />}
          size="medium"
          id="pauseButton"
          onClick={pauseRecording}
          disabled={disableButtons.includes("pauseButton")}
        />
        <Button
          type="primary"
          shape="circle"
          icon={<CheckSquareOutlined />}
          size="medium"
          id="stopButton"
          onClick={stopRecording}
          disabled={disableButtons.includes("stopButton")}
        />
      </div>
      {audioDetails.url && (
        <audio className="section-audio" controls src={audioDetails.url} />
      )}
    </div>
  );
}

export default SimpleRecord;
