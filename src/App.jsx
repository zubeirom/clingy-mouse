/* eslint-disable no-restricted-globals */
import React from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedMap } from "fluid-framework";
import "./App.css";

const getFluidData = async () => {
  // Configure Container
  const client = new TinyliciousClient();
  const containerSchema = { initialObjects: { sharedTimestamp: SharedMap } };

  // Get the container from the fluid service
  let container;
  const containerId = location.hash.substring(1);
  if (!containerId) {
    ({ container } = await client.createContainer(containerSchema));
    const id = await container.attach();
    location.hash = id;
  } else {
    ({ container } = await client.getContainer(containerId, containerSchema));
  }

  return container.initialObjects;
};

function App() {
  const [fluidSharedObjects, setFluidSharedObjects] = React.useState();
  const [localTimestamp, setLocalTimestamp] = React.useState();

  React.useEffect(() => {
    getFluidData().then((data) => setFluidSharedObjects(data));
  }, []);

  React.useEffect(() => {
    if (fluidSharedObjects) {
      console.log(fluidSharedObjects);
      const { sharedTimestamp } = fluidSharedObjects;
      const updateLocalTimestamp = () =>
        setLocalTimestamp({ time: sharedTimestamp.get("time") });

      updateLocalTimestamp();

      sharedTimestamp.on("valueChanged", updateLocalTimestamp);

      return () => {
        sharedTimestamp.off("valueChanged", updateLocalTimestamp);
      };
    } else {
      return;
    }
  }, [fluidSharedObjects]);

  if (localTimestamp) {
    return (
      <div className="App">
        <button
          onClick={() =>
            fluidSharedObjects.sharedTimestamp.set(
              "time",
              Date.now().toString()
            )
          }
        >
          Get Time
        </button>
        <span>{localTimestamp.time}</span>
      </div>
    );
  } else {
    return <div />;
  }
}

export default App;
