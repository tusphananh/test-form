import React, { useState, useRef } from "react";

function SimpleRecord(props) {
  const [fileBlob, setFileBlob] = useState(null);

  let items = [];
  const audioRef = useRef();
  let recorder;

  const startRecorde = () => {
    console.log("test");
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        items.push(e.data);
        if (recorder.state === "inactive") {
          console.log("inactive");
          let blob = new Blob(items, { type: "audio/webm" });
          audioRef.current.src = URL.createObjectURL(blob);
        }
      };
      recorder.start(10);
    });
  };

  const handleAudioStop = () => {
    recorder.stop();
  };

  const handleAudioUpload = () => {
    console.log(audioRef.current.src);
    console.log(fileBlob);
    let file = new File([...items], "file_name", {
      lastModified: 1534584790000,
    });

    setFileBlob(file);
  };

  console.log(fileBlob);
  const handleReset = () => {
    items = [];
    audioRef.current.src = null;
  };

  return (
    <div className="App">
      <audio ref={audioRef} controls={true} type="video.webm" />
      <button onClick={() => startRecorde()}>Start Rec </button>
      <button onClick={() => handleAudioStop()}>stop Rec </button>
      <button onClick={() => handleReset()}>clear Rec </button>
      <button onClick={() => handleAudioUpload()}>upload Rec </button>
      <audio
        src={fileBlob ? URL.createObjectURL(fileBlob) : null}
        controls={true}
      />
    </div>
  );
}

export default SimpleRecord;
