import React from "react";
import "./style.scss";

const Marker = ({ onClick, active }) => (
  <div
    onClick={() => onClick()}
    className="marker"
    style={{
      background: active ? "#006aff" : "orangered",
      opacity: active ? 1 : ".5"
    }}
  />
);

export default Marker;
