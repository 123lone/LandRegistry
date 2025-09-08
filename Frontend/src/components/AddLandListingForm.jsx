import React, { useState, useRef, useEffect } from 'react';

const AddLandListingForm = () => {
  const mapRef = useRef(null);
  const leafletMap = useRef(null);
  const drawControl = useRef(null);
  const drawnItems = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState([40.7128, -74.0060]); // NYC default
  const [drawnShapes, setDrawnShapes] = useState([]);
  const [pins, setPins] = useState([]);
  
  const [formData, setFormData] = useState({
    propertyAddress: '',
    area: '',
    price: '',
    description: '',
    propertyPID: '',
    surveyNumber: '',
    coordinates: [], // Store drawn coordinates
    pinLocations: [], // Store pin locations
    deedDocument: null,
    taxDocument: null,
  });

  // Load Leaflet and Leaflet.draw
  useEffect(() => {
    const loadLeaflet = async () => {
      // Load Leaflet CSS
      const leafletCSS = document.createElement('link');
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletCSS.rel = 'stylesheet';
      leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      leafletCSS.crossOrigin = '';
      document.head.appendChild(leafletCSS);

      // Load Leaflet.draw CSS
      const drawCSS = document.createElement('link');
      drawCSS.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css';
      drawCSS.rel = 'stylesheet';
      document.head.appendChild(drawCSS);

      // Load Leaflet JS
      const leafletScript = document.createElement('script');
      leafletScript.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletScript.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      leafletScript.crossOrigin = '';
      
      leafletScript.onload = () => {
        // Load Leaflet.draw JS
        const drawScript = document.createElement('script');
        drawScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js';
        drawScript.onload = () => {
          setLeafletLoaded(true);
        };
        document.head.appendChild(drawScript);
      };
      
      document.head.appendChild(leafletScript);
    };

    loadLeaflet();
  }, []);

  // Initialize map when Leaflet is loaded
  useEffect(() => {
    if (!leafletLoaded || leafletMap.current) return;

    const L = window.L;

    // Initialize map
    leafletMap.current = L.map(mapRef.current).setView(mapCenter, 13);

    // Add tile layer (using OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(leafletMap.current);

    // Initialize feature group for drawn items
    drawnItems.current = new L.FeatureGroup();
    leafletMap.current.addLayer(drawnItems.current);

    // Initialize draw control
    drawControl.current = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems.current,
        remove: true,
      },
      draw: {
        polygon: {
          allowIntersection: false,
          drawError: {
            color: '#e1e100',
            message: '<strong>Error:</strong> Shape edges cannot cross!',
          },
          shapeOptions: {
            color: '#97009c',
            fillOpacity: 0.3,
          },
        },
        rectangle: {
          shapeOptions: {
            color: '#97009c',
            fillOpacity: 0.3,
          },
        },
        circle: {
          shapeOptions: {
            color: '#97009c',
            fillOpacity: 0.3,
          },
        },
        marker: {
          icon: new L.Icon({
            iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          }),
        },
        polyline: false,
        circlemarker: false,
      },
    });

    leafletMap.current.addControl(drawControl.current);

    // Event handlers
    leafletMap.current.on(L.Draw.Event.CREATED, (e) => {
      const layer = e.layer;
      drawnItems.current.addLayer(layer);
      
      if (e.layerType === 'marker') {
        const latLng = layer.getLatLng();
        const newPin = { lat: latLng.lat, lng: latLng.lng, id: Date.now() };
        setPins(prev => [...prev, newPin]);
        setFormData(prev => ({
          ...prev,
          pinLocations: [...prev.pinLocations, newPin]
        }));
        
        // Add popup to marker
        layer.bindPopup(`Pin Location<br>Lat: ${latLng.lat.toFixed(6)}<br>Lng: ${latLng.lng.toFixed(6)}`);
      } else {
        // Handle polygons, rectangles, circles
        const coordinates = getCoordinatesFromLayer(layer, e.layerType);
        const newShape = {
          id: Date.now(),
          type: e.layerType,
          coordinates: coordinates,
          area: calculateArea(layer, e.layerType)
        };
        
        setDrawnShapes(prev => [...prev, newShape]);
        updateFormCoordinates();
      }
    });

    leafletMap.current.on(L.Draw.Event.EDITED, (e) => {
      updateFormCoordinates();
    });

    leafletMap.current.on(L.Draw.Event.DELETED, (e) => {
      e.layers.eachLayer((layer) => {
        if (layer.getLatLng) {
          // It's a marker
          const latLng = layer.getLatLng();
          setPins(prev => prev.filter(pin => 
            Math.abs(pin.lat - latLng.lat) > 0.000001 || Math.abs(pin.lng - latLng.lng) > 0.000001
          ));
        }
      });
      updateFormCoordinates();
    });

    return () => {
      if (leafletMap.current) {
        leafletMap.current.remove();
        leafletMap.current = null;
      }
    };
  }, [leafletLoaded, mapCenter]);

  const getCoordinatesFromLayer = (layer, type) => {
    if (type === 'polygon' || type === 'rectangle') {
      return layer.getLatLngs()[0].map(latLng => [latLng.lat, latLng.lng]);
    } else if (type === 'circle') {
      const center = layer.getLatLng();
      const radius = layer.getRadius();
      return { center: [center.lat, center.lng], radius: radius };
    }
    return [];
  };

  const calculateArea = (layer, type) => {
    if (type === 'polygon' || type === 'rectangle') {
      const latLngs = layer.getLatLngs()[0];
      // Simple area calculation (not geodesic)
      let area = 0;
      for (let i = 0; i < latLngs.length; i++) {
        const j = (i + 1) % latLngs.length;
        area += latLngs[i].lat * latLngs[j].lng;
        area -= latLngs[j].lat * latLngs[i].lng;
      }
      return Math.abs(area) / 2 * 111320 * 111320; // Rough conversion to square meters
    } else if (type === 'circle') {
      const radius = layer.getRadius();
      return Math.PI * radius * radius;
    }
    return 0;
  };

  const updateFormCoordinates = () => {
    const allCoordinates = [];
    const totalArea = drawnShapes.reduce((sum, shape) => sum + (shape.area || 0), 0);
    
    drawnItems.current.eachLayer((layer) => {
      if (layer.getLatLngs) {
        // Polygon or rectangle
        const coords = layer.getLatLngs()[0].map(latLng => [latLng.lat, latLng.lng]);
        allCoordinates.push({ type: 'polygon', coordinates: coords });
      } else if (layer.getLatLng && layer.getRadius) {
        // Circle
        const center = layer.getLatLng();
        const radius = layer.getRadius();
        allCoordinates.push({ 
          type: 'circle', 
          center: [center.lat, center.lng], 
          radius: radius 
        });
      }
    });

    setFormData(prev => ({
      ...prev,
      coordinates: allCoordinates,
      area: Math.round(totalArea).toString()
    }));
  };

  const clearAllShapes = () => {
    if (drawnItems.current) {
      drawnItems.current.clearLayers();
      setDrawnShapes([]);
      setPins([]);
      setFormData(prev => ({
        ...prev,
        coordinates: [],
        pinLocations: [],
        area: ''
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: files[0],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting new land listing:", formData);
    console.log("Drawn shapes:", drawnShapes);
    console.log("Pin locations:", pins);
    alert("Land listing submitted for Verifier's Manual Review!");
  };

  // Get user's location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          if (leafletMap.current) {
            leafletMap.current.setView([latitude, longitude], 15);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not get your location. Please allow location access.");
        }
      );
    }
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm";
  const labelClasses = "block text-sm font-medium text-gray-700";
  const fileInputClasses = "mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100";

  return (
    <div className="max-w-7xl mx-auto p-8 bg-white rounded-lg shadow-md my-8">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
        🗺️ Land Registry - Interactive Map
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Draw boundaries, pin locations, and register your land on the blockchain
      </p>

      <div className="space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="propertyAddress" className={labelClasses}>Property Address</label>
            <input
              type="text"
              id="propertyAddress"
              name="propertyAddress"
              value={formData.propertyAddress}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Enter full property address"
            />
          </div>

          <div>
            <label htmlFor="price" className={labelClasses}>Price (in ETH)</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className={inputClasses}
              step="0.001"
              min="0"
              placeholder="0.5"
            />
          </div>

          <div>
            <label htmlFor="propertyPID" className={labelClasses}>Property PID</label>
            <input
              type="text"
              id="propertyPID"
              name="propertyPID"
              value={formData.propertyPID}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Enter Property ID"
            />
          </div>

          <div>
            <label htmlFor="surveyNumber" className={labelClasses}>Survey Number</label>
            <input
              type="text"
              id="surveyNumber"
              name="surveyNumber"
              value={formData.surveyNumber}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Enter survey number"
            />
          </div>

          <div>
            <label htmlFor="area" className={labelClasses}>Area (in sq meters)</label>
            <input
              type="text"
              id="area"
              name="area"
              value={formData.area}
              onChange={handleInputChange}
              className={inputClasses}
              placeholder="Auto-calculated from drawings"
              readOnly
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClasses}>Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="3"
            className={inputClasses}
            placeholder="Describe the property features, location benefits, etc."
          />
        </div>

        {/* Interactive Map Section */}
        <div className="space-y-4 p-6 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border-2 border-blue-200">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <h3 className="text-xl font-semibold text-gray-800">🗺️ Interactive Land Map</h3>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={getUserLocation}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
              >
                📍 My Location
              </button>
              <button
                type="button"
                onClick={clearAllShapes}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>

          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-96 rounded-lg border-2 border-gray-300 shadow-lg"
            style={{ minHeight: '500px', zIndex: 1 }}
          />

          {/* Map Instructions */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h4 className="font-semibold text-gray-800 mb-3">🎯 Drawing Tools Instructions:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <strong>🔸 Drawing Shapes:</strong>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Use toolbar on top-left to draw</li>
                  <li>• Draw polygons for irregular boundaries</li>
                  <li>• Draw rectangles for square plots</li>
                  <li>• Draw circles for circular areas</li>
                </ul>
              </div>
              <div>
                <strong>📍 Markers & Editing:</strong>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Add markers to pin important locations</li>
                  <li>• Click edit tool to modify shapes</li>
                  <li>• Click delete tool to remove shapes</li>
                  <li>• Area is auto-calculated</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Status Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-800">{drawnShapes.length}</div>
              <div className="text-sm text-blue-600">Shapes Drawn</div>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-800">{pins.length}</div>
              <div className="text-sm text-green-600">Pins Added</div>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-800">
                {formData.area ? `${formData.area}` : '0'}
              </div>
              <div className="text-sm text-purple-600">Total Area (sq m)</div>
            </div>
          </div>
        </div>

        {/* Document Upload Section */}
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">📄 Required Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="deedDocument" className={labelClasses}>Deed Document</label>
              <input
                type="file"
                id="deedDocument"
                name="deedDocument"
                onChange={handleFileChange}
                className={fileInputClasses}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>

            <div>
              <label htmlFor="taxDocument" className={labelClasses}>Tax Documents</label>
              <input
                type="file"
                id="taxDocument"
                name="taxDocument"
                onChange={handleFileChange}
                className={fileInputClasses}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full flex justify-center py-4 px-6 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
            disabled={formData.coordinates.length === 0 && pins.length === 0}
          >
            🚀 Submit to Blockchain for Verification
          </button>
          {formData.coordinates.length === 0 && pins.length === 0 && (
            <p className="text-sm text-red-600 mt-2 text-center">
              ⚠️ Please draw land boundaries or add pins on the map before submitting
            </p>
          )}
        </div>

        {/* Debug Information */}
        {(formData.coordinates.length > 0 || pins.length > 0) && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">🔍 Data Preview (for blockchain):</h4>
            <pre className="text-xs text-gray-600 overflow-auto max-h-32">
              {JSON.stringify({
                coordinates: formData.coordinates,
                pins: formData.pinLocations,
                area: formData.area
              }, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddLandListingForm;