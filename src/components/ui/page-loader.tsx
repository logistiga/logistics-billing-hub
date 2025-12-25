import shipLoaderGif from "@/assets/ship-loader.gif";

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <img 
          src={shipLoaderGif} 
          alt="Chargement..." 
          className="w-24 h-24 object-contain"
        />
        <p className="text-muted-foreground text-sm animate-pulse">Chargement...</p>
      </div>
    </div>
  );
}
