window.addEventListener("load", () => {
    requestAnimationFrame(() => {
      const height = document.documentElement.scrollHeight;
      console.log("Calculated height:", height);
      window.parent.postMessage({ type: "adjustHeight", height: height }, "https://waterlooworks.uwaterloo.ca/*");
    });
  });
  