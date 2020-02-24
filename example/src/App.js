import React, { Component } from 'react';
import { Key } from './key'
import './App.css';
import GoogleMapReact from 'google-map-react';

const AnyReactComponent = ({ text }) => <div>{text}</div>;

// Map　
class SimpleMap extends Component {
  static defaultProps = {
    center: {
      lat: 25.04,
      lng: 121.50
    },
    zoom: 17
  };

  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: Key }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
        >
          <AnyReactComponent
            lat={59.955413}
            lng={30.337844}
            text="My Marker"
          />
        </GoogleMapReact>
      </div>
    );
  }
}


// App
function App() {
  return (
    <div className="App">
      <SimpleMap />
    </div> 
  );
}

export default App;
