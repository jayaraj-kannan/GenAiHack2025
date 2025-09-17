import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface MapModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly onPlaceSelect: (place: { name: string; lat: number; lng: number }) => void;
}

export function MapModal({ open, onClose, onPlaceSelect }: MapModalProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedPlace, setSelectedPlace] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [marker, setMarker] = useState<any>(null);
  const mapInstanceRef = useRef<any>(null);

  // Helper to clear marker and selected place
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
      const mapInstance = new google.maps.Map(mapRef.current, {
        center: { lat: 20.5937, lng: 78.9629 },
        zoom: 5,
      });
      mapInstanceRef.current = mapInstance;

      // Create custom close button as Google Maps control
      const closeButton = document.createElement("button");
      closeButton.innerHTML = "✕";
      closeButton.className =
        "w-8 h-8 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow focus:outline-none";
      closeButton.style.margin = "10px";
      closeButton.onclick = () => {
        clearMapState();
        if (typeof onClose === "function") onClose();
      };

      // Add to TOP_RIGHT so it sits with fullscreen/zoom controls
      mapInstance.controls[google.maps.ControlPosition.TOP_RIGHT].push(closeButton);

      // Map click listener
      mapInstance.addListener("click", handleMapClick(mapInstance));
    };

    if (!(window as any).google) {
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBHRMkF3wgiqxDI1AGJwQzd5DvouziN2rg&libraries=places`;
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
        setSelectedPlace({ name: results[0].formatted_address, lat, lng });
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
