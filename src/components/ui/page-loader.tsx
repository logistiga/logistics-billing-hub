import shipLoaderGif from "@/assets/ship-loader.gif";

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[80vh] bg-background">
      <div className="flex flex-col items-center gap-2">
        {/* Logo - Same size as login page with background blend */}
        <div className="relative bg-background">
          <img 
            src={shipLoaderGif} 
            alt="Chargement..." 
            className="w-96 h-96 object-contain mix-blend-multiply dark:mix-blend-normal dark:opacity-90"
          />
        </div>
        <p className="text-muted-foreground text-sm font-medium animate-pulse -mt-8">
          Chargement...
        </p>
      </div>
    </div>
  );
}
