import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

interface MapModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onPlaceSelect: (place: { name: string; fullName: string; lat: number; lon: number ;placeId: string;type: string;  }) => void;
}

export function MapModal({ open, onClose, onPlaceSelect }: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<{ name: string; fullName: string; lat: number; lon: number ;placeId: string;type: string;  } | null>(null);
  const [marker, setMarker] = useState<any>(null);
  const mapInstanceRef = useRef<any>(null);

  const clearMapState = () => {
    if (marker) marker.setMap(null);
    setMarker(null);
    setSelectedPlace(null);
  };

  useEffect(() => {
    if (!open || !mapRef.current) return;

    const initializeMap = () => {
      if (!mapRef.current) return;
      const google = (window as any).google;

      // Create map
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
      });
      mapInstanceRef.current = mapInstance;

      // Custom close button
      const closeButton = document.createElement("button");
      closeButton.innerHTML = "✕";
      closeButton.className =
        "w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow focus:outline-none";
      closeButton.style.margin = "10px";
      closeButton.onclick = () => {
        clearMapState();
        if (typeof onClose === "function") onClose();
      };
      mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(closeButton);

      // Search box
      if (inputRef.current) {
        const searchBox = new google.maps.places.SearchBox(inputRef.current);
        mapInstance.controls[google.maps.ControlPosition.TOP_LEFT].push(inputRef.current);

        // Bias results towards current map’s viewport
        mapInstance.addListener("bounds_changed", () => {
          searchBox.setBounds(mapInstance.getBounds());
        });

        // When user selects a place
        searchBox.addListener("places_changed", () => {
          const places = searchBox.getPlaces();
          if (!places || places.length === 0) return;

          const place = places[0];
          if (!place.geometry) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();

          // Clear old marker
          if (marker) marker.setMap(null);

          // Add new marker
          const newMarker = new google.maps.Marker({
            map: mapInstance,
            position: { lat, lng },
          });
          setMarker(newMarker);

          // Center and zoom map
          mapInstance.panTo({ lat, lng });
          mapInstance.setZoom(14);

          setSelectedPlace({ name: place.formatted_address || place.name, fullName: place.formatted_address || place.name, lat, lon: place.geometry.location.lng(), placeId: place.place_id, type: place.types[0] });
        });
      }

      // Map click listener
      mapInstance.addListener("click", handleMapClick(mapInstance));
    };

    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.onload = initializeMap;
      document.body.appendChild(script);
    } else {
      initializeMap();
    }

    return () => {
      clearMapState();
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, [open]);

  const handleMapClick = (mapInstance: any) => (e: any) => {
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();
    const geocoder = new (window as any).google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === "OK" && results[0]) {
        setSelectedPlace({ name: results[0].formatted_address, fullName: results[0].formatted_address, lat, lon: results[0].geometry.location.lng(), placeId: results[0].place_id, type: results[0].types[0] });
        if (marker) marker.setMap(null);
        const newMarker = new (window as any).google.maps.Marker({
          position: { lat, lng },
          map: mapInstance,
        });
        setMarker(newMarker);
      }
    });
  };

  return open ? (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
      <div className="relative w-full h-full md:w-4/5 md:h-4/5 bg-white rounded-lg shadow-lg flex flex-col overflow-hidden">
        {/* Search input (hidden, but rendered for Google Maps control) */}
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a place"
          className="border p-2 rounded-md shadow w-64 absolute top-2 left-2 z-10 bg-white"
        />

        <div ref={mapRef} className="flex-1 w-full h-full" />

        {/* Place selection info and confirm */}
        {selectedPlace && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg px-4 py-3 flex flex-col items-center gap-2 w-[90vw] max-w-md border">
            <div className="text-sm font-medium text-center">{selectedPlace.name}</div>
            <Button
              size="sm"
              onClick={() => {
                onPlaceSelect(selectedPlace);
                onClose();
              }}
            >
              Select this place
            </Button>
          </div>
        )}
      </div>
    </div>
  ) : null;
}
