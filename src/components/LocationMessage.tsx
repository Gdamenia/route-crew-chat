import { MapPin } from 'lucide-react';

interface LocationMessageProps {
  lat: number;
  lng: number;
  isSelf?: boolean;
  onTap?: () => void;
}

export function LocationMessage({ lat, lng, isSelf, onTap }: LocationMessageProps) {
  // Use OSM static tile as thumbnail
  const zoom = 14;
  const tileUrl = `https://tile.openstreetmap.org/${zoom}/${Math.floor(((lng + 180) / 360) * Math.pow(2, zoom))}/${Math.floor((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2 * Math.pow(2, zoom))}.png`;

  return (
    <button onClick={onTap} className="block w-full text-left">
      <div className="relative w-[200px] h-[120px] rounded-lg overflow-hidden bg-accent border border-border">
        <img src={tileUrl} alt="Location" className="w-full h-full object-cover opacity-80" loading="lazy" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSelf ? 'bg-primary' : 'bg-destructive'}`}>
            <MapPin className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="absolute bottom-1 left-1 right-1 bg-background/80 backdrop-blur-sm rounded px-1.5 py-0.5">
          <p className="text-[10px] text-muted-foreground truncate">
            {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        </div>
      </div>
    </button>
  );
}
