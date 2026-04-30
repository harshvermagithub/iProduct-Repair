
'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';

/* 
  Leaflet needs to be dynamically imported with ssr: false 
  But we need to import MapContainer, TileLayer, Marker, useMapEvents from 'react-leaflet'
  And 'leaflet' itself for Icon creation.
  
  Since we are inside 'MapPicker' which is 'use client', 
  we assume this component is rendered ONLY on client IF imported with ssr: false in parent.
  However, react-leaflet components might fail on SSR if not handled carefully.
  Let's make THIS whole file purely for client logic, and parent will dynamic import it.
*/

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet's default icon paths issue with Webpack
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
    center: { lat: number; lng: number };
    zoom?: number;
    onLocationChange?: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onChange }: { position: L.LatLngExpression, onChange?: (lat: number, lng: number) => void }) {

    const [markerPos, setMarkerPos] = useState(position);

    const map = useMapEvents({
        click(e) {
            map.flyTo(e.latlng, map.getZoom());
            setMarkerPos(e.latlng);
            onChange?.(e.latlng.lat, e.latlng.lng);
        },
    });

    useEffect(() => {
        setMarkerPos(position);
        map.flyTo(position, map.getZoom());
    }, [position, map]);

    const eventHandlers = useMemo(
        () => ({
            dragend(e: any) {
                const marker = e.target;
                if (marker) {
                    const { lat, lng } = marker.getLatLng();
                    setMarkerPos({ lat, lng });
                    onChange?.(lat, lng);
                }
            },
        }),
        [onChange],
    );

    return (
        <Marker
            position={markerPos}
            draggable={true}
            eventHandlers={eventHandlers}
        >
        </Marker>
    )
}

const MapPicker = ({ center, zoom = 13, onLocationChange }: MapPickerProps) => {
    // Ensure center is valid
    if (!center || typeof center.lat !== 'number' || typeof center.lng !== 'number') return null;

    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden border z-0 relative">
            <MapContainer
                center={[center.lat, center.lng]}
                zoom={zoom}
                className="h-full w-full"
                scrollWheelZoom={false} // Prevent accidental zoom on scroll
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker
                    position={[center.lat, center.lng]}
                    onChange={onLocationChange}
                />
            </MapContainer>

            <div className="absolute top-2 right-2 bg-white/90 p-2 rounded shadow text-xs font-semibold z-[1000] pointer-events-none">
                Drag marker to pinpoint
            </div>
        </div>
    );
};

export default MapPicker;
