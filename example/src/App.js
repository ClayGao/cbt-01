import React, { useState, useEffect, useRef } from 'react';
import { Key } from './key'
import './App.css';
import GoogleMapReact from 'google-map-react';
import { debounce } from 'lodash'

const MyPositionMarker = ({ text }) => <div>{text}</div>;

// Cafe Marker

const CafeMarker = ({ icon, text }) => (
  <div>
    <img style={{ height: '30px', width: '30px' }} src={icon} />
    <div>{text}</div>
  </div>
)

// 搜尋按鈕
const SearchType = ({text, type}) => {
  return <input type="button" value={text} name={type} />
}
  

// Map　
const SimpleMap = (props) => {

  // 預設位置
  const [myPosition, setMyPosition] = useState({
    lat: 25.04, 
    lng: 121.50
  })
  const [searchType, setSearchType] = useState('cafe')
  const [mapType, setMapType] = useState('roadmap')
  const [mapApiLoaded, setMapApiLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState(null)
  const [mapApi, setMapApi] = useState(null)
  const [places, setPlaces] = useState([])
  const [inputText, setInputText] = useState('')

  // 建立參考點
  let inputRef = useRef(null);

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
        type: searchType
      };
    
      service.nearbySearch(request, (results, status) => {
        if(status === mapApi.places.PlacesServiceStatus.OK) {
          setPlaces(results)
        }
      })
    }
  }

  // 自動完成
  const handleAutocomplete = () => {
    if(mapApiLoaded) {
      const service = new mapApi.places.AutocompleteService()
      const request = {
        input: inputText
      }
 
      service.getPlacePredictions(request, (results, status)=> {
        if(status === mapApi.places.PlacesServiceStatus.OK) {
          console.log(results)
        }
      });
    }
  }

  // 參考 inputRef 以更新 inputText
  const handleInput = () => {
    setInputText(inputRef.current.value)
  }
  
  // 當 inputText 改變時，處理自動完成
  useEffect(()=>{
    handleAutocomplete()
  },[inputText])
  
  
  // 當地圖初次載入(mapApiLoaded)、我的位置(myPosition) 以及搜尋類型(searchType) 改變時，執行 effect 
  useEffect(() => {
    findLocation()
  },[mapApiLoaded, myPosition, searchType])

  //console.log(inputText)

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div onClick={handleSearchType}>
        <SearchType text="找餐廳"　type="restaurant" />
        <SearchType text="找牙醫"　type="dentist" />
        <SearchType text="找健身房"　type="gym" />
      </div>
      <input type="button" value="衛星" onClick={handleMapTypeId} name="hybrid" />
      <input type="button" value="路線" onClick={handleMapTypeId} name="roadmap" />
      <div>
      自動完成: <input ref={inputRef} type="text" onChange={ debounce(handleInput,500) } />
      </div>
      <GoogleMapReact
        bootstrapURLKeys={{ 
          key: Key,
          libraries:['places'] 
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
