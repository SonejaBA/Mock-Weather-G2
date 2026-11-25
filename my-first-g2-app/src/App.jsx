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
  const showDetails = useRef(true);
  const dayOfTheWeek = useRef(0);

  const weather = [
    { day: "Monday", high: 62, low: 55 },
    { day: "Tuesday", high: 75, low: 58 },
    { day: "Wednesday", high: 78, low: 60 },
    { day: "Thursday", high: 80, low: 62 },
    { day: "Friday", high: 85, low: 65 },
  ];

  const dayContainer = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 64,

    containerID: 1,
    containerName: "day",
    content: weather[dayOfTheWeek.current].day,

    borderWidth: 0,
    paddingLength: 4,
    isEventCapture: 1,
  });

  const dayDataContainer = new TextContainerProperty({
    xPosition: 0,
    yPosition: 72,
    width: 576,
    height: 216,

    containerID: 2,
    containerName: "data",
    content: formatWeather(weather[dayOfTheWeek.current]),

    borderWidth: 0,
    paddingLength: 4,
    isEventCapture: 0,
  });

  useEffect(() => {
    waitForEvenAppBridge()
      .then(async (bridge) => {
        const result = await bridge.createStartUpPageContainer(
          new CreateStartUpPageContainer({
            containerTotalNum: 2,
            textObject: [dayContainer, dayDataContainer],
          }),
        );

        if (result === 0) {
          setStatus("Page created successfully");

          bridge.onEvenHubEvent(async (event) => {
            const gestureType = event.textEvent?.eventType;
            const systemType = event.sysEvent?.eventType;

            if (gestureType === 1) {
              dayOfTheWeek.current =
                (dayOfTheWeek.current - 1 + weather.length) % weather.length;

              await bridge.textContainerUpgrade(
                new TextContainerUpgrade({
                  containerID: 1,
                  containerName: "day",
                  content: weather[dayOfTheWeek.current].day,
                }),
              );

              await bridge.textContainerUpgrade(
                new TextContainerUpgrade({
                  containerID: 2,
                  containerName: "data",
                  content: formatWeather(weather[dayOfTheWeek.current]),
                }),
              );
            } else if (gestureType === 2) {
              dayOfTheWeek.current =
                (dayOfTheWeek.current + 1) % weather.length;

              await bridge.textContainerUpgrade(
                new TextContainerUpgrade({
                  containerID: 1,
                  containerName: "day",
                  content: weather[dayOfTheWeek.current].day,
                }),
              );

              await bridge.textContainerUpgrade(
                new TextContainerUpgrade({
                  containerID: 2,
                  containerName: "data",
                  content: formatWeather(weather[dayOfTheWeek.current]),
                }),
              );
            }

            //click is under system type as undefined
            if (gestureType === undefined && systemType === undefined) {
              showDetails.current = !showDetails.current;

              if (!showDetails.current) {
                dayContainer.content = weather[dayOfTheWeek.current].day;
                dayDataContainer.content = formatWeather(
                  weather[dayOfTheWeek.current],
                );
                const succeeded = await bridge.rebuildPageContainer({
                  containerTotalNum: 1,
                  textObject: [dayContainer],
                });
              } else {
                dayContainer.content = weather[dayOfTheWeek.current].day;
                dayDataContainer.content = formatWeather(
                  weather[dayOfTheWeek.current],
                );

                const succeeded = await bridge.rebuildPageContainer({
                  containerTotalNum: 2,
                  textObject: [dayContainer, dayDataContainer],
                });
              }
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
