'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MapPin } from 'lucide-react';

interface Suggestion {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
    country_code?: string;  // 'us' or 'ca'
  };
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (addr: string, city: string, state: string, zip: string, country: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  error?: string;
}

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = 'Service address',
  className = '',
  id,
  error,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Search Nominatim with debounce
  const searchAddress = useCallback((query: string) => {
    if (abortRef.current) abortRef.current.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.length < 5) {
      setSuggestions([]);
      setOpen(false);
      setLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=us,ca&limit=5&addressdetails=1`,
          { signal: controller.signal, headers: { 'User-Agent': 'PlumbCoreAI/1.0' } }
        );
        if (!res.ok) throw new Error('Search failed');
        const data: Suggestion[] = await res.json();
        if (!controller.signal.aborted) {
          setSuggestions(data);
          setOpen(data.length > 0);
          setLoading(false);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setSuggestions([]);
          setOpen(false);
          setLoading(false);
        }
      }
    }, 350);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setSelected(false);
    searchAddress(val);
  };

  const handleSelect = (suggestion: Suggestion) => {
    // Combine house number + street for full address (e.g. "123 Main St")
    const houseNum = suggestion.address?.house_number || '';
    const street = suggestion.address?.road || '';
    const addr = houseNum ? `${houseNum} ${street}` : (street || suggestion.display_name.split(',')[0]);
    const city = suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || '';
    const state = suggestion.address?.state || '';
    const zip = suggestion.address?.postcode || '';
    // Auto-detect country from Nominatim country_code ('us' or 'ca')
    const countryCode = suggestion.address?.country_code || '';
    const country = countryCode === 'ca' ? 'CA' : 'US';
    onChange(suggestion.display_name);
    onSelect?.(addr, city, state, zip, country);
    setSuggestions([]);
    setOpen(false);
    setSelected(true);
  };

  const handleFocus = () => {
    if (suggestions.length > 0 && !selected) {
      setOpen(true);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onFocus={handleFocus}
          autoComplete="off"
          className={`w-full h-11 pl-10 pr-4 bg-white border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all ${
            error
              ? 'border-red-300 focus:ring-2 focus:ring-red-100'
              : 'border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'
          } ${className}`}
        />
        {loading && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}

      {/* Dropdown suggestions */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-50 last:border-b-0 flex items-start gap-2.5"
            >
              <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
              <div>
                <p className="font-medium">{s.display_name}</p>
                {s.address?.city && (
                  <p className="text-xs text-slate-400 mt-0.5">
                    {s.address.city}, {s.address.state} {s.address.postcode}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results state */}
      {open && suggestions.length === 0 && !loading && value.length >= 5 && (
        <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg p-4 text-sm text-slate-400 text-center">
          No addresses found. Try a different search.
        </div>
      )}
    </div>
  );
}
