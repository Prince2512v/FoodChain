import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const LogisticsMap = ({ logs = [] }) => {
    // Default center (can be current position or first log)
    const center = logs.length > 0 
        ? [parseFloat(logs[0].latitude), parseFloat(logs[0].longitude)] 
        : [20.5937, 78.9629]; // India center as default

    const positions = logs.map(log => [parseFloat(log.latitude), parseFloat(log.longitude)]);

    return (
        <div style={{ height: '400px', width: '100%', borderRadius: '20px', overflow: 'hidden', border: '5px solid rgba(255,255,255,0.05)' }}>
            <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {logs.map((log, idx) => (
                    <Marker key={idx} position={[parseFloat(log.latitude), parseFloat(log.longitude)]}>
                        <Popup>
                            <div style={{ color: '#000' }}>
                                <strong>Log {idx + 1}</strong><br />
                                {log.locationName}<br />
                                <small>{new Date(log.timestamp).toLocaleString()}</small>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {positions.length > 1 && (
                    <Polyline positions={positions} color="#00A8FF" weight={4} opacity={0.7} dashArray="10, 10" />
                )}
            </MapContainer>
        </div>
    );
};

export default LogisticsMap;
