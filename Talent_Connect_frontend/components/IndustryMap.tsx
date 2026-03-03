"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import dynamic from 'next/dynamic';

const GeoJSON = dynamic(() => import('react-leaflet').then(mod => mod.GeoJSON), {
    ssr: false
});

// Fix Leaflet marker missing images in Next.js
if (typeof window !== 'undefined') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
}

const MapClickEvent = ({
    onLocationSelect,
    userLocation
}: {
    onLocationSelect: (latlng: [number, number]) => void,
    userLocation: [number, number] | null
}) => {
    useMapEvents({
        click(e: L.LeafletMouseEvent) {
            onLocationSelect([e.latlng.lat, e.latlng.lng]);
        }
    });

    const map = useMap();
    useEffect(() => {
        if (userLocation) map.flyTo(userLocation, map.getZoom());
    }, [userLocation, map]);

    return null;
};

export default function IndustryMap({
    userLocation,
    onLocationSelect
}: {
    userLocation: [number, number] | null;
    onLocationSelect: (latlng: [number, number]) => void;
}) {
    const [punjabGeoJson, setPunjabGeoJson] = useState<any>(null);

    useEffect(() => {
        fetch('/punjab_state.geojson')
            .then(res => res.json())
            .then(data => setPunjabGeoJson(data))
            .catch(err => console.error("Error loading Punjab GeoJSON:", err));
    }, []);

    return (
        <MapContainer
            center={userLocation || [31.1471, 75.3412]}
            zoom={userLocation ? 14 : 7}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
        >
            <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {/* Outline Punjab with GeoJSON */}
            {punjabGeoJson && (
                <GeoJSON
                    data={punjabGeoJson}
                    style={() => ({
                        color: '#605dff',
                        weight: 2,
                        fillColor: '#605dff',
                        fillOpacity: 0.1,
                    })}
                />
            )}
            {userLocation && <Marker position={userLocation} />}
            <MapClickEvent userLocation={userLocation} onLocationSelect={onLocationSelect} />
        </MapContainer>
    );
}
