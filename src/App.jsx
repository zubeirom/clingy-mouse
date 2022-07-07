/* eslint-disable no-restricted-globals */
import React from "react";
import { TinyliciousClient } from "@fluidframework/tinylicious-client";
import { SharedMap, Sequence } from "fluid-framework";
import "./App.css";

const getFluidData = async () => {
  // Configure Container
  const client = new TinyliciousClient();
  const containerSchema = { initialObjects: { sharedCursors: SharedMap } };

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

function generateString(length) {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function App() {
  const [fluidSharedObjects, setFluidSharedObjects] = React.useState();
  const [cursors, setCursors] = React.useState();

  React.useEffect(() => {
    getFluidData().then((data) => {
      setFluidSharedObjects(data);
    });
  }, []);

  React.useEffect(() => {
    if (fluidSharedObjects) {
      console.log(fluidSharedObjects.sharedCursors.get("data"));
      const { sharedCursors } = fluidSharedObjects;
      const updateCursors = () => setCursors({ data: JSON.parse(sharedCursors.get('data'))});

      updateCursors();
      sharedCursors.on('valueChanged', updateCursors);

      return () => {
        sharedCursors.off('valueChanged', updateCursors)
      }
    } else {
      return;
    }
  }, [fluidSharedObjects]);

  const updateMousePosition = async () => {
    if (fluidSharedObjects) {
      const str = fluidSharedObjects.sharedCursors.get("data");
      if (str == null) {
        fluidSharedObjects.sharedCursors.set("data", JSON.stringify([generateString(5)]));
      } else {
        const data = JSON.parse(str);
        fluidSharedObjects.sharedCursors.set("data", JSON.stringify([...data, generateString(5)]));
      }
    }
  };

  if(cursors) {
    return (
      <div className="main App">
        <button onClick={updateMousePosition}>Click</button>
        { cursors.data.map(c => {
          return <h1>{c}</h1>;
        })}
      </div>
    );
  } else {
    <button onClick={updateMousePosition}>Click</button>
  }

}

export default App;
