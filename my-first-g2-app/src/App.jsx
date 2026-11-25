import { useEffect, useState } from "react";
import {
  waitForEvenAppBridge,
  TextContainerProperty,
  CreateStartUpPageContainer,
  TextContainerUpgrade,
} from "@evenrealities/even_hub_sdk";

export default function App() {
  const [status, setStatus] = useState("Waiting for even hub...");

  const weather = { day: "Monday", high: 72, low: 55 };

  const textContainer = new TextContainerProperty({
    xPosition: 0,
    yPosition: 0,
    width: 576,
    height: 288,

    containerID: 1,
    containerName: "main",
    content: "Swipe up for low, down for high",

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
                  content: `${weather.day}: low ${weather.low}°F`,
                }),
              );
            }
            else if (gestureType === 2) {
              await bridge.textContainerUpgrade(
                new TextContainerUpgrade({
                  containerID: 1,
                  containerName: "main",
                  content: `${weather.day}: high ${weather.high}°F`,
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
