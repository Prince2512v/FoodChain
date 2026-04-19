import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in Leaflet + Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapView = ({ lat, lng, farmerName }) => {
    if (!lat || !lng) return <div className="p-3 text-center text-muted">No location data available.</div>;

    const position = [lat, lng];

    return (
        <div style={{ height: '200px', width: '100%', borderRadius: '12px', overflow: 'hidden' }} className="shadow-sm border border-secondary border-opacity-25">
            <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        <strong>{farmerName || 'Farmer'}</strong><br />
                        Origin Farm Location
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    );
};

export default MapView;
