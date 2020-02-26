import React, { useState, useEffect } from 'react';
import { Key } from './key'
import './App.css';
import GoogleMapReact from 'google-map-react';

const MyPositionMarker = ({ text }) => <div>{text}</div>;

// Cafe Marker

const CafeMarker = ({ icon, text }) => (
  <div>
    <img style={{ height: '30px', width: '30px' }} src={icon} />
    <div>{text}</div>
  </div>
)

// 搜尋按鈕

const SearchType= ({text, type, handleSearchType}) => {
  return <input type="button" value={text} name={type} />
}
  


// Map　
const SimpleMap = (props) => {

  // 預設位置
  const [myPosition, setMyPosition] = useState({
    lat: 25.04, 
    lng: 121.50
  })

  const [searchingType, setSearchType] = useState('cafe')
  const [mapType, setMapType] = useState('roadmap')
  const [mapApiLoaded, setMapApiLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)
  const [mapApi, setMapApi] = useState(null)
  const [places, setPlaces] = useState([])

  // 當地圖載入完成，將地圖實體與地圖 API 傳入 state 供之後使用
  const apiHasLoaded = (map, maps) => {
    setMapInstance(map)
    setMapApi(maps)
    setMapApiLoaded(true)
  };

  // 改變地圖樣式
  const handleMapTypeId = e => {
    setMapType(e.target.name)
  }

  // 處理中心點改變
  const handleCenterChange = () => {
    if(mapApiLoaded) {
      setMyPosition({
        lat: mapInstance.center.lat(),
        lng: mapInstance.center.lng()
      })
    }
  } 

  //　改變搜尋類型
  const handleSearchType = e => {
    setSearchType(e.target.name)
  }

  // 搜尋
  const findLocation = () => {
    if(mapApiLoaded) {
      const service = new mapApi.places.PlacesService(mapInstance)

      const request = {
        location: myPosition,
        radius: 1000, 
        type: searchingType
      };
    
      service.nearbySearch(request, (results, status) => {
        if(status === mapApi.places.PlacesServiceStatus.OK) {
          setPlaces(results)
        }
      })
    }
  }
  
  useEffect(() => {
    findLocation()
    console.log()
  },[myPosition, searchingType])
  

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <input type="button" value="開始搜尋" onClick={findLocation} />
      <div onClick={handleSearchType}>
        <SearchType text="找餐廳"　type="restaurant" />
        <SearchType text="找牙醫"　type="dentist" />
        <SearchType text="找健身房"　type="gym" />
      </div>
      <input type="button" value="衛星" onClick={handleMapTypeId} name="hybrid" />
      <input type="button" value="路線" onClick={handleMapTypeId} name="roadmap" />
      <GoogleMapReact
        bootstrapURLKeys={{ 
          key: Key,
          libraries:['places'] // 要在這邊放入我們要使用的 API
        }}
        options={{ mapTypeId: mapType }}
        onBoundsChange={handleCenterChange}
        defaultCenter={props.center}
        defaultZoom={props.zoom}
        yesIWantToUseGoogleMapApiInternals
        onGoogleApiLoaded={({ map, maps }) => apiHasLoaded(map, maps)}
      >
        <MyPositionMarker
          lat={myPosition.lat}
          lng={myPosition.lng}
          text="My Position"
        />
        {places.map(item=>(
          <CafeMarker
            icon={item.icon}
            key={item.id}
            lat={item.geometry.location.lat()}
            lng={item.geometry.location.lng()}
            text={item.name} 
            placeId={item.place_id} 
          />
        ))}
      </GoogleMapReact>
    </div>
  );
}

SimpleMap.defaultProps = {
  center: {
    lat: 25.04,
    lng: 121.50
  },
  zoom: 17
};


// App
function App() {
  return (
    <div className="App">
      <SimpleMap />
    </div> 
  );
}

export default App;
