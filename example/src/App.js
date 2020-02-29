import React, { useState, useEffect, useRef } from 'react';
import { Key } from './key'
import './App.scss';
import GoogleMapReact from 'google-map-react';
import { debounce } from 'lodash'
import placeholder from './placeholder.svg'

const buttonStyle = {
  cursor: 'pointer',
  backgroundColor: 'white', 
  border:'2px solid skyblue', 
  borderRadius: '5px',
  padding: '5px'
}

const MyPositionMarker = ({ text }) => (
  <div style={{ width: '150px', display:'flex', alignItems:'center'}}>
    <img style={{ height: '30px', width: '30px' }} src={placeholder} />
    <span style={{ backgroundColor: 'white', border:'2px solid red', borderRadius: '5px', padding:'5px'}}>{text}</span>
  </div>
)

// Cafe Marker

const CafeMarker = ({ icon, text }) => (
  <div style={{ width: '150px', display:'flex', alignItems:'center'}}>
    <img style={{ height: '30px', width: '30px' }} src={icon} />
    <span style={{ backgroundColor: 'white', border:'2px solid orange', borderRadius: '5px', padding:'5px'}}>{text}</span>
  </div>
)

// 搜尋按鈕
const SearchType = ({text, type}) => {
  return <input style={buttonStyle} type="button" value={text} name={type} />
}
  

// Map　
const SimpleMap = (props) => {

  // 預設位置
  const [currentCenter, setCurrentCenter] = useState(null)
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
  const [autocompleteResults, setAutocompleteResults] = useState([])

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
        input: inputText ? inputText : '台北市大同區'
      }
 
      service.getPlacePredictions(request, (results, status)=> {
        if(status === mapApi.places.PlacesServiceStatus.OK) {
          setAutocompleteResults(results)
        }
      });
    }
  }

  // 點擊自動完成地址
  const handleClickToChangeMyPosition = e => {
    const placeId = e.target.getAttribute('dataid')

    const service = new mapApi.places.PlacesService(mapInstance)
    const request = {
      placeId,
      ffields: ['name', 
      'rating', 
      'formatted_address', 
      'formatted_phone_number', 
      'geometry',
      'opening_hours',
      ]
    }
    service.getDetails(request, (results, status)=>{
      if( status === mapApi.places.PlacesServiceStatus.OK) {
        console.log(results)
        console.log(results.opening_hours.isOpen())
        const newPosition = {
          lat: results.geometry.location.lat(),
          lng: results.geometry.location.lng()
        }
        setCurrentCenter(newPosition)
        setMyPosition(newPosition)
        setAutocompleteResults([])
        inputRef.current.value = ''
      }
    })
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

  const buttonStyle = {
    cursor: 'pointer',
    backgroundColor: 'white', 
    border:'2px solid green', 
    borderRadius: '5px',
    padding: '8px'
  }
  
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <div  style={{ position: 'fixed', zIndex: 3, bottom: '20px'}} >
        <div onClick={handleSearchType}>
          <SearchType text="找餐廳"　type="restaurant" />
          <SearchType text="找牙醫"　type="dentist" />
          <SearchType text="找健身房"　type="gym" />
        </div>
        <div onClick={handleMapTypeId} >
          <input style={buttonStyle} type="button" value="衛星" name="hybrid" />
          <input style={buttonStyle} type="button" value="路線" name="roadmap" />
        </div>
      </div>
      <div style={{ 
        position: 'fixed',
        zIndex: 1, 
        width: '300px',
        backgroundColor: 'wheat',
        top: '10px',
        left: '10px',
        padding: '10px',
        border: '2px solid black',
        borderRadius: '5px'
      }}>
        <div >
        自動完成: <input ref={inputRef} type="text" onChange={ debounce(handleInput, 500) } />
        </div>
        <div onClick={handleClickToChangeMyPosition}>
         {(autocompleteResults && inputText) ? autocompleteResults.map(item=>(
          <div style={{ cursor: 'pointer', margin: '8px 0px'}} key={item.id} dataid={item.place_id}>
            {item.description}
          </div>
         )) : null}
        </div>
      </div>
      <GoogleMapReact
        bootstrapURLKeys={{ 
          key: Key,
          libraries:['places'] 
        }}
        center={currentCenter}
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
          text="MyPosition"
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
