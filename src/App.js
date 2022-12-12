import {
  Button,
  Card,
  Checkbox,
  Divider,
  Input,
  notification,
  Radio,
  Space,
  Typography,
  message,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import "react-voice-recorder/dist/index.css";
import "./App.scss";
import RecordBar from "./RecordBar";
import { Dropbox } from "dropbox";
const dropbox = new Dropbox({
  accessToken: process.env.REACT_APP_DROPBOX_ACCESS_TOKEN,
});

const defaultAudioDetails = {
  url: null,
  blob: null,
  chunks: null,
  duration: {
    h: 0,
    m: 0,
    s: 0,
  },
};

const formKeys = {
  name: "name",
  studentId: "studentId",
  email: "email",
};

const radioQuestions = [
  ["bear", "pear"],
  ["past", "fast"],
  ["taught", "thought"],
  ["tie", "die"],
  ["cold", "gold"],
  ["game", "came"],
  ["down", "town"],
  ["chest", "test"],
];

// Create 8 question with  [
//   { lable: "A", value: "a" },
//   { lable: "B", value: "b" },
// ],
const checkBoxQuestions = Array.from({ length: 8 }, (v, i) => {
  return [
    { label: "A", value: "a" },
    { label: "B", value: "b" },
  ];
});

const audioQuestions = Array.from({ length: 2 }, (v, i) => {
  return {
    id: i,
    audioDetails: defaultAudioDetails,
  };
});
function App() {
  const [audioDetails, setAudioDetails] = useState(audioQuestions);
  const [studentValue, setStudentValue] = useState();
  const [radioValue, setRadioValue] = useState({});
  const [checkBoxValue, setCheckBoxValue] = useState({});
  const [messageApi, contextHolder] = message.useMessage();

  const onSuccess = () => {
    messageApi.open({
      type: "success",
      content: "Successfully, thanks for your time !",
    });
  };

  const onError = () => {
    messageApi.open({
      type: "error",
      content: "There was an error, please try again !",
    });
  };

  const onWarning = () => {
    messageApi.open({
      type: "warning",
      content: "Please complete all the tests before submitting !",
    });
  };
  const getFormLabel = (key) => {
    switch (key) {
      case formKeys.name:
        return "Student Name";
      case formKeys.studentId:
        return "Student ID";
      case formKeys.email:
        return "Student Email";
      default:
        return "";
    }
  };

  const onSetAudioDetails = (id, data) => {
    const newAudioDetails = audioDetails.map((item) => {
      if (item.id === id) {
        return { ...item, audioDetails: data };
      }
      return item;
    });
    setAudioDetails(newAudioDetails);
  };

  const onRadioValueChange = (key, e) => {
    setRadioValue({ ...radioValue, [key]: e.target.value });
  };

  const onCheckBoxValueChange = (key, e) => {
    setCheckBoxValue({ ...checkBoxValue, [key]: e });
  };

  const onStudentValueChange = (key, e) => {
    if (key === formKeys.studentId) {
      setStudentValue({ ...studentValue, [key]: e.target.value.toUpperCase() });
      return;
    }
    setStudentValue({ ...studentValue, [key]: e.target.value });
  };

  const handleSubmit = async () => {
    if (
      Object.keys(radioValue).length !== 8 ||
      Object.keys(checkBoxValue).length !== 8
    ) {
      onWarning();
      return;
    }

    if (
      !studentValue ||
      !studentValue.name ||
      !studentValue.studentId ||
      !studentValue.email
    ) {
      onWarning();
      return;
    }

    if (audioDetails.some((item) => !item.audioDetails.blob)) {
      onWarning();
      return;
    }

    let databody = {
      info: studentValue,
      section_1: radioValue,
      section_2: checkBoxValue,
    };

    try {
      const formRes = await axios.post(`${process.env.REACT_APP_API_URL}`, {
        body: JSON.stringify(databody),
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.log(error);
      onError();
      return;
    }

    audioDetails.forEach(async (item, index) => {
      const file = new File([item.audioDetails.blob], "audio/webm");
      const params = {
        path: `/${studentValue.studentId}/${index}.webm`,
        contents: file,
      };
      const response = await dropbox.filesUpload(params);
      if (response.status !== 200) {
        onError();
        return;
      }
    });

    onSuccess();
  };

  useEffect(() => {
    console.log(audioDetails);
  }, [audioDetails]);

  useEffect(() => {
    console.log(checkBoxValue);
  }, [checkBoxValue]);

  useEffect(() => {
    console.log(radioValue);
  }, [radioValue]);

  useEffect(() => {
    console.log(studentValue);
  }, [studentValue]);

  return (
    <div className="App">
      {contextHolder}
      <Typography.Title>
        Perception and production of English initial aspirated plosives /p-t-k/
        by International University students
      </Typography.Title>
      <Divider orientation="left">Student Information</Divider>
      <div className="form">
        {Object.keys(formKeys).map((key) => {
          return (
            <div key={key} className="input-container">
              <Typography.Text strong>{getFormLabel(key)}</Typography.Text>
              <Input
                value={
                  studentValue && studentValue[key] ? studentValue[key] : ""
                }
                onChange={(e) => onStudentValueChange(key, e)}
              />
            </div>
          );
        })}
      </div>
      <Divider orientation="left">Section 1</Divider>
      <Typography>
        Listen to the recording TWICE for each question and choose the word you
        hear (Các bạn sẽ nghe 2 lần cho mỗi câu hỏi và chọn từ bạn cho là được
        đọc trong file âm thanh.)
      </Typography>
      <audio className="section-audio" controls>
        <source
          src="https://dl.dropbox.com/s/4d9veasrzng7c07/Section%201.mp3?dl=0"
          type="audio/mpeg"
        />
      </audio>
      <div className="form">
        {radioQuestions.map((question, index) => {
          return (
            <Space
              direction="vertical"
              size="middle"
              key={`radio-${index}`}
              style={{ display: "flex" }}
            >
              <Card
                className="radio-container"
                title={`Question ${index + 1}`}
                size="small"
              >
                <Radio.Group
                  onChange={(e) => {
                    onRadioValueChange(index, e);
                  }}
                  value={radioValue?.[index] ? radioValue[index] : ""}
                >
                  {question.map((item) => {
                    return (
                      <Radio
                        style={{
                          minWidth: 80,
                        }}
                        key={item}
                        value={item}
                      >
                        {item}
                      </Radio>
                    );
                  })}
                </Radio.Group>
              </Card>
            </Space>
          );
        })}
      </div>
      <Divider orientation="left">Section 2</Divider>
      <Typography>
        Listen to the recording once for each question. In each question, there
        will be 3 words namely A,B and C. Please choose the word which has the
        same pronunciation as C (you can choose both A and B if A,B and C are
        the same) (Bạn sẽ nghe 3 từ mỗi lần theo thứ tự là A, B và C. Bạn cần
        chọn (A) hoặc (B) hoặc cả (A và B) có cách đọc giống như C. Mỗi câu bạn
        sẽ chỉ nghe 1 lần.)
      </Typography>
      <audio className="section-audio" controls>
        <source
          src="https://dl.dropbox.com/s/l5m34jgpys2upil/Section%202.mp3?dl=0"
          type="audio/mpeg"
        />
      </audio>
      <div className="form">
        {checkBoxQuestions.map((question, index) => {
          return (
            <Space
              direction="vertical"
              size="middle"
              style={{ display: "flex" }}
              key={`checkbox-${index}`}
            >
              <Card
                className="radio-container"
                title={`Question ${index + 1}`}
                size="small"
              >
                <Checkbox.Group
                  style={{ display: "flex", gap: 10 }}
                  options={question}
                  value={checkBoxValue?.[index] ? checkBoxValue[index] : []}
                  onChange={(e) => {
                    onCheckBoxValueChange(index, e);
                  }}
                />
              </Card>
            </Space>
          );
        })}
      </div>
      <Divider orientation="left">Section 2</Divider>
      <Typography>
        Đây là link Fb mình:
        <br />
        <Typography.Link>
          https://www.facebook.com/profile.php?id=100009424078664
        </Typography.Link>
        <br />
        Tên Fb mình là <Typography.Text strong>Bông Omega</Typography.Text> Phần
        ghi âm này sẽ không tính điểm gì cả nên mong các bạn đừng ngại và giúp
        mình hoàn thành phần data để nghiên cứu này nhé.
      </Typography>
      <div className="form">
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Card className="radio-container" title="Task 1" size="small">
            Pronounce the given words THREE times. (Các bạn hãy đọc mỗi từ lập
            lại 3 lần nhé.) Ví dụ: 1. cold thì các bạn cần đọc
            <Typography.Text strong>"cold-cold-cold"</Typography.Text>
            <br />
            <ul>
              <li>cold</li>
              <li>coffee</li>
              <li>to</li>
              <li>talk</li>
              <li>pack</li>
              <li>passport</li>
            </ul>
            <RecordBar
              id={0}
              audioDetails={
                audioDetails.find((item) => item.id === 0).audioDetails
              }
              setAudioDetails={onSetAudioDetails}
            />
          </Card>
        </Space>
        <Space direction="vertical" size="middle" style={{ display: "flex" }}>
          <Card className="radio-container" title="Task 2" size="small">
            Read the given sentences TWICE. (Các bạn hãy đọc mỗi câu lập lại 2
            lần nhé.)
            <br />
            <ul>
              <li>Pack you bags and bring your passport!</li>
              <li>Can I talk to you?</li>
              <li>You gave me cold coffee again.</li>
            </ul>
            <RecordBar
              id={1}
              audioDetails={
                audioDetails.find((item) => item.id === 1).audioDetails
              }
              setAudioDetails={onSetAudioDetails}
            />
          </Card>
        </Space>
      </div>
      <Button onClick={handleSubmit}>Submit</Button>
    </div>
  );
}

export default App;
