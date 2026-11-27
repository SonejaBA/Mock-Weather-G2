import { useEffect, useRef, useState } from "react";
import {
  waitForEvenAppBridge,
  TextContainerProperty,
  ImageContainerProperty,
  CreateStartUpPageContainer,
  TextContainerUpgrade,
} from "@evenrealities/even_hub_sdk";
import formatWeather from "./weatherFormatter.js";

async function makeSampleGraph(low, high) {
  const canvas = document.createElement("canvas");
  canvas.width = 288;
  canvas.height = 120;

  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "white";
  ctx.fillRect(0, 120, 50, -low);
  ctx.fillRect(70, 120, 50, -high);

  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("Could not create graph image");

  return new Uint8Array(await blob.arrayBuffer());
}

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
    height: 88,

    containerID: 2,
    containerName: "data",
    content: formatWeather(weather[dayOfTheWeek.current]),

    borderWidth: 0,
    paddingLength: 4,
    isEventCapture: 0,
  });

  const graphContainer = new ImageContainerProperty({
    xPosition: 0,
    yPosition: 168,
    width: 288,
    height: 120,
    containerID: 3,
    containerName: "graph",
  });

  useEffect(() => {
    waitForEvenAppBridge()
      .then(async (bridge) => {
        const result = await bridge.createStartUpPageContainer(
          new CreateStartUpPageContainer({
            containerTotalNum: 3,
            textObject: [dayContainer, dayDataContainer],
            imageObject: [graphContainer],
          }),
        );

        //0 is a successfull page
        if (result === 0) {
          setStatus("Page created successfully");

          const imageResult = await bridge.updateImageRawData({
            containerID: 3,
            containerName: "graph",
            imageData: await makeSampleGraph(
              weather[dayOfTheWeek.current].low,
              weather[dayOfTheWeek.current].high,
            ),
          });

          console.log("Graph image result:", imageResult);

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

              showDetails.current &&
                (await bridge.textContainerUpgrade(
                  new TextContainerUpgrade({
                    containerID: 2,
                    containerName: "data",
                    content: formatWeather(weather[dayOfTheWeek.current]),
                  }),
                ));

              showDetails.current &&
                (await bridge.updateImageRawData({
                  containerID: 3,
                  containerName: "graph",
                  imageData: await makeSampleGraph(
                    weather[dayOfTheWeek.current].low,
                    weather[dayOfTheWeek.current].high,
                  ),
                }));
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

              showDetails.current &&
                (await bridge.textContainerUpgrade(
                  new TextContainerUpgrade({
                    containerID: 2,
                    containerName: "data",
                    content: formatWeather(weather[dayOfTheWeek.current]),
                  }),
                ));

              showDetails.current &&
                (await bridge.updateImageRawData({
                  containerID: 3,
                  containerName: "graph",
                  imageData: await makeSampleGraph(
                    weather[dayOfTheWeek.current].low,
                    weather[dayOfTheWeek.current].high,
                  ),
                }));
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
                console.log("Rebuild succeeded: ", succeeded);
              } else {
                dayContainer.content = weather[dayOfTheWeek.current].day;

                dayDataContainer.content = formatWeather(
                  weather[dayOfTheWeek.current],
                );

                const succeeded = await bridge.rebuildPageContainer({
                  containerTotalNum: 3,
                  textObject: [dayContainer, dayDataContainer],
                  imageObject: [graphContainer],
                });
                console.log("Rebuild succeeded: ", succeeded);

                if (succeeded) {
                  await bridge.updateImageRawData({
                    containerID: 3,
                    containerName: "graph",
                    imageData: await makeSampleGraph(
                      weather[dayOfTheWeek.current].low,
                      weather[dayOfTheWeek.current].high,
                    ),
                  });
                }
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
