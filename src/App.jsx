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
      const updateCursors = () =>
        setCursors({ data: JSON.parse(sharedCursors.get("data")) });

      updateCursors();
      sharedCursors.on("valueChanged", updateCursors);

      return () => {
        sharedCursors.off("valueChanged", updateCursors);
      };
    } else {
      return;
    }
  }, [fluidSharedObjects]);

  const mouseMove = async (event) => {
    if(fluidSharedObjects) {
      fluidSharedObjects.sharedCursors.set('data', JSON.stringify([event.clientY, event.clientX]));
    }
  };

  if(cursors && cursors.data) {
    return (
      <><div className="main" onMouseMove={mouseMove}>
        {/* {cursors.data.map((c) => {
          return <h1>{c}</h1>;
        })} */}
      <div id="hov" style={{ top: cursors.data[0], left: cursors.data[1]}}>clingy mouse</div> 
      </div>
      </>
    );
  } else {
    return <div className="main" onMouseMove={mouseMove}>
      <div id="hov" style={{top: 10, left: 10 }}>clingy mouse</div>
      </div>
  }


}

export default App;
