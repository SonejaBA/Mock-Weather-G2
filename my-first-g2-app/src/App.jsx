import { useEffect, useRef, useState } from "react";
import {
  waitForEvenAppBridge,
  TextContainerProperty,
  CreateStartUpPageContainer,
  TextContainerUpgrade,
} from "@evenrealities/even_hub_sdk";
import formatWeather from "./weatherFormatter.js";

export default function App() {
  const [status, setStatus] = useState("Waiting for even hub...");
  const dayOfTheWeek = useRef(0);

  const weather = [
    { day: "Monday", high: 62, low: 55 },
    { day: "Tuesday", high: 75, low: 58 },
    { day: "Wednesday", high: 78, low: 60 },
    { day: "Thursday", high: 80, low: 62 },
    { day: "Friday", high: 85, low: 65 },
  ];

  const textContainer = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,

    containerID: 1,
    containerName: "main",
    content: formatWeather(weather[dayOfTheWeek.current]),

    borderWidth: 0,
    paddingLength: 4,
    isEventCapture: 1,
  });

  useEffect(() => {
    waitForEvenAppBridge()
      .then(async (bridge) => {
        const result = await bridge.createStartUpPageContainer(
          new CreateStartUpPageContainer({
            containerTotalNum: 1,
            textObject: [textContainer],
          }),
        );

        console.log("Page creation result: ", result);
        if (result === 0) {
          setStatus("Page created successfully");

          bridge.onEvenHubEvent(async (event) => {
            const gestureType = event.textEvent?.eventType;
            if (gestureType === 1) {
              dayOfTheWeek.current =
                (dayOfTheWeek.current - 1 + weather.length) % weather.length;
              await bridge.textContainerUpgrade(
                new TextContainerUpgrade({
                  containerID: 1,
                  containerName: "main",
                  content: formatWeather(weather[dayOfTheWeek.current]),
                }),
              );
            } else if (gestureType === 2) {
              dayOfTheWeek.current =
                (dayOfTheWeek.current + 1) % weather.length;
              await bridge.textContainerUpgrade(
                new TextContainerUpgrade({
                  containerID: 1,
                  containerName: "main",
                  content: formatWeather(weather[dayOfTheWeek.current]),
                }),
              );
            }
          });
        } else {
          setStatus(`Page creation failed. Result: ${result}`);
        }
      })

      .catch((err) => {
        console.error("Could not connect to even hub:", err);
        setStatus("Connection failed");
      });
  }, []);

  return (
    <main>
      <p>The phone app is running.</p>
      <p>Status: {status}</p>
    </main>
  );
}
