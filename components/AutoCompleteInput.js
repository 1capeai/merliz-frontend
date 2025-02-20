// AutoCompleteInput.jsx
"use client";
import { useEffect, useRef } from "react";

export default function AutoCompleteInput({ placeholder, onSelect, value, className, isLoaded }) {
  const inputRef = useRef(null);

  // Fallback to a standard text input if the Maps API isn’t loaded.
  if (!isLoaded) {
    return (
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onSelect(e.target.value)}
        className={className}
      />
    );
  }

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    // Create an autocomplete instance without limiting to just geocode results.
    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      // Removing types restriction lets the API return addresses and establishments.
      // types: ["geocode"],
      fields: ["formatted_address", "name", "address_components", "geometry"],
    });

    // Listen for the place_changed event.
    const listener = autocomplete.addListener("place_changed", () => {
      const place = autocomplete.getPlace();
      // Use the formatted address if available; otherwise, fall back to the place name.
      if (place && place.formatted_address) {
        onSelect(place.formatted_address);
      } else if (place && place.name) {
        onSelect(place.name);
      }
    });

    // Clean up the listener on unmount.
    return () => {
      if (window.google && window.google.maps && listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [onSelect]);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      defaultValue={value}
      className={className}
    />
  );
}
