import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";
import Sidebar from "./Sidebar";

export default function LeafletDrawMap() {
  useEffect(() => {
    // Initialize map *after* the div is rendered
    const map = L.map("map").setView([28.6139, 77.209], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
    });
    map.addControl(drawControl);

    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.addLayer(e.layer);
    });

    // ✅ Cleanup on component unmount
    return () => {
      map.remove();
    };
  }, []);

  return (
    <>
      <div>
        <header className="flex shrink-0 items-center justify-between border-b border-white/10 bg-background-light px-6 py-3 font-display text-black">
          <div className="flex items-center gap-4 ">
            <span className="material-symbols-outlined  text-2xl">traffic</span>
            <h2 className=" text-lg font-bold leading-tight tracking-[-0.015em]">
              City Traffic Command
            </h2>
          </div>
          <div className="flex flex-1 justify-end gap-4">
            <label className="flex flex-col h-10 w-full max-w-sm">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-gray-400 flex border-none bg-zinc-200 items-center justify-center pl-3 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-black focus:outline-0 focus:ring-0 border-none bg-zinc-200 focus:border-none h-full placeholder:text-gray-400 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                  placeholder="Search for intersections or addresses"
                />
              </div>
            </label>
            <div className="flex gap-2">
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white text-black gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-white text-black gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
                <span className="material-symbols-outlined">settings</span>
              </button>
            </div>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              data-alt="User profile picture"
              style={{
                backgroundImage: `url(
                  "https://lh3.googleusercontent.com/aida-public/AB6AXuCNFkrQLsbAuoBZp2vi7tFNSaueqiG4isoudsHNGXy4OCOSVqqF6WQp_fjau7-5fxyFFIbgul31lBwnqvVmov1kcdsPFTrWGOi83s9amJwNejH6WAc1IUtDAfQCC0ZD9Jl8gt3cRR9b1YVdqvepCjA0dvBd7iPiE6u6X29bGrKHrBZpP0URk-1LPlBKKdqNYnVgdtGieIAHFOT96TB2irlxiakiQ96l8NmVYtaeudyaljKN32fCR0qrmLk0URhz7iOInE7llB8AaJk"
                )`,
              }}
            ></div>
          </div>
        </header>
        <div className="w-full h-screen flex">
          <div className="w-[20vw] h-screen">
            <Sidebar />
          </div>
          <div id="map" style={{ height: "80vh", width: "80%" }} />
        </div>
      </div>
    </>
  );
}
