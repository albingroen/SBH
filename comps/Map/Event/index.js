import React, { Component } from "react";
import cx from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./style.scss";

class EventCard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      closing: false
    };
  }

  render() {
    const { event, close } = this.props;
    const { closing } = this.state;

    return (
      <div className={cx("event-card", closing && "closing")}>
        <i
          onClick={() => {
            this.setState({ closing: true });
            setTimeout(() => {
              close();
              this.setState({ closing: false });
            }, 500);
          }}
        >
          <FontAwesomeIcon icon={faTimes}> </FontAwesomeIcon>
        </i>
        <h2>{event.name}</h2>
        <p>{event.summary}</p>
        <a href={event.url} target="_blank" rel="noopener noreferrer">
          Läs mer
        </a>
      </div>
    );
  }
}

export default EventCard;
