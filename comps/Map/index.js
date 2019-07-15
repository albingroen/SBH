import React, { Component } from "react";
import axios from "axios";
import GoogleMapReact from "google-map-react";
import mapStyles from "./mapStyles.json";
import EventCard from "./Event";
import Marker from "./Marker";
import { GMAPS_API_KEY } from "../../config";
import "./style.scss";

export default class Map extends Component {
  constructor(props) {
    super(props);
    this.state = {
      events: [],
      activeEvents: [],
      city: "",
      zoom: 6,
      pos: {
        lat: 59.334591,
        lng: 18.06324
      }
    };
  }

  static defaultProps = {
    center: {
      lat: 59.334591,
      lng: 18.06324
    },
    zoom: 6
  };

  renderPos = location => {
    return {
      lat: location.gps.split(",")[0],
      lng: location.gps.split(",")[1]
    };
  };

  componentDidMount() {
    this.setState({ fetchingEvents: true });
    axios
      .get("https://polisen.se/api/events")
      .then(res => {
        this.setState({
          events: res.data,
          allEvents: res.data,
          fetchingEvents: false
        });
      })
      .catch(err => console.log({ err }));
  }

  handleSearch(e) {
    const { allEvents } = this.state;

    const matchingEvents = allEvents.filter(ev =>
      ev.location.name.toLowerCase().includes(e.target.value.toLowerCase())
    );

    const newPos = {
      lat: Number(this.renderPos(matchingEvents[0].location).lat),
      lng: Number(this.renderPos(matchingEvents[0].location).lng)
    };

    this.setState({
      city: e.target.value,
      events: matchingEvents,
      pos: newPos,
      zoom: 10
    });

    if (!e.target.value) {
      this.setState({
        center: this.props.center,
        zoom: this.props.zoom
      });
    }
  }

  handleClickMarker(event) {
    this.setState({
      activeEvents: this.state.events.filter(
        ev => ev.location.name === event.location.name
      ),
      city: event.location.name,
      zoom: 10,
      pos: {
        lat: Number(this.renderPos(event.location).lat),
        lng: Number(this.renderPos(event.location).lng)
      }
    });
  }

  handleClickLocation() {
    axios
      .get("http://ip-api.com/json")
      .then(res => {
        this.setState(prevState => ({
          activeEvents: prevState.allEvents.filter(
            ev => ev.location.name.toLowerCase() === res.data.city.toLowerCase()
          ),
          pos: {
            lat: res.data.lat,
            lng: res.data.lon
          },
          zoom: 12,
          city: res.data.city
        }));
      })
      .catch(err => console.log({ err }));
  }

  render() {
    const { events, fetchingEvents, activeEvents, city } = this.state;
    const { center, zoom } = this.props;
    const mapOptions = {
      styles: mapStyles,
      disableDefaultUI: true
    };

    return fetchingEvents ? (
      <div className="fetching">
        <h2>Hämtar alla brott och händelser...</h2>
        <div className="preloader" />
      </div>
    ) : (
      <div style={{ height: "100vh", width: "100%" }}>
        {activeEvents && activeEvents.length ? (
          <div className="event-cards-wrapper">
            {activeEvents.length > 1 && (
              <button
                onClick={() => this.setState({ activeEvents: [], city: "" })}
                className="close-button"
              >
                Stäng alla
              </button>
            )}
            <div className="event-cards">
              {activeEvents.map(event => (
                <EventCard
                  event={event}
                  close={() =>
                    this.setState(prevState => ({
                      activeEvents: prevState.activeEvents.filter(
                        ev => ev.id !== event.id
                      )
                    }))
                  }
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="city-search">
          <input
            type="text"
            onInput={e => this.handleSearch(e)}
            value={city}
            placeholder="Sök på en stad..."
          />

          {/* <button
            className="location-button"
            onClick={() => this.handleClickLocation()}
          >
            Använd min plats
          </button> */}
        </div>

        <GoogleMapReact
          bootstrapURLKeys={{ key: GMAPS_API_KEY }}
          defaultCenter={center}
          defaultZoom={zoom}
          center={this.state.pos}
          zoom={this.state.zoom}
          options={mapOptions}
          onChange={data =>
            this.setState({ pos: data.center, zoom: data.zoom })
          }
        >
          {events.map(ev => (
            <Marker
              lat={Number(this.renderPos(ev.location).lat)}
              lng={Number(this.renderPos(ev.location).lng)}
              text="My Marker"
              onClick={() => this.handleClickMarker(ev)}
              active={ev.location.name === city}
            />
          ))}
        </GoogleMapReact>
      </div>
    );
  }
}
