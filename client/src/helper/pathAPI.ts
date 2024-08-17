const isDev = process.env.NODE_ENV === "development";
export default `${isDev ? "http" : "https"}://${
  !isDev ? process.env.REACT_APP_HOST_SERVER : "localhost"
}${isDev ? ":" + process.env.REACT_APP_NODE_SERVER_PORT : ""}`;
