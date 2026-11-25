import { useEffect, useRef, useState } from "react";
import {
  waitForEvenAppBridge,
  TextContainerProperty,
  CreateStartUpPageContainer,
  TextContainerUpgrade,
} from "@evenrealities/even_hub_sdk";

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
    content: "Simulated weather data.",

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
            console.log("Gesture received:", gestureType);
            if (gestureType === 1) {
              await bridge.textContainerUpgrade(
                new TextContainerUpgrade({
                  containerID: 1,
                  containerName: "main",
                  content: `${weather[dayOfTheWeek.current].day}\nLow: ${weather[dayOfTheWeek.current].low}°F\nHigh: ${weather[dayOfTheWeek.current].high}°F`,
                }),
              );
              dayOfTheWeek.current = (dayOfTheWeek.current - 1 + weather.length) % weather.length;
            } else if (gestureType === 2) {
              await bridge.textContainerUpgrade(
                new TextContainerUpgrade({
                  containerID: 1,
                  containerName: "main",
                  content: `${weather[dayOfTheWeek.current].day}\nLow: ${weather[dayOfTheWeek.current].low}°F\nHigh: ${weather[dayOfTheWeek.current].high}°F`,
                }),
              );

              dayOfTheWeek.current = (dayOfTheWeek.current + 1) % weather.length;
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
