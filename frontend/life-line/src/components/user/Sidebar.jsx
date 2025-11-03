import React from "react";

const Sidebar = () => {
  return (
    <div>
      <aside className="flex h-full w-72 flex-col justify-between border-r border-white/10 bg-background-light p-4">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-black cursor-pointer">
              <span className="material-symbols-outlined text-white">
                space_dashboard
              </span>
              <p className="text-white text-sm font-medium leading-normal">
                Dashboard
              </p>
            </div>
            <div
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white
            cursor-pointer"
            >
              <span className="material-symbols-outlined text-gray-800">
                traffic
              </span>
              <p className="text-black text-sm font-medium leading-normal">
                Intersections
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
              <span className="material-symbols-outlined text-gray-900">
                warning
              </span>
              <p className="text-gray-900 text-sm font-medium leading-normal">
                Alerts
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 cursor-pointer">
              <span className="material-symbols-outlined text-gray-900">
                bar_chart
              </span>
              <p className="text-gray-900 text-sm font-medium leading-normal">
                Reports
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 rounded-lg p-4 border border-white/10 bg-black/5">
              <p className="text-gray-900 text-sm font-medium leading-normal">
                Active Intersections
              </p>
              <p className="text-black tracking-light text-2xl font-bold leading-tight">
                12
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg p-4 border border-white/10 bg-black/5">
              <p className="text-gray-900 text-sm font-medium leading-normal">
                Emergency Vehicles Detected
              </p>
              <p className="text-black tracking-light text-2xl font-bold leading-tight">
                1
              </p>
            </div>
            <div className="flex flex-col gap-2 rounded-lg p-4 border border-white/10 bg-black/5">
              <p className="text-gray-900 text-sm font-medium leading-normal">
                Overall System Health
              </p>
              <p className="text-black tracking-light text-2xl font-bold leading-tight">
                98%
              </p>
            </div>
          </div>
          <div className="p-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-3 border-t border-white/10">
            <p className="col-span-2 text-black text-base font-medium leading-normal mb-2">
              Map Legend
            </p>
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-[#38A169]"></div>
              <p className="text-gray-900 text-sm font-normal leading-normal">
                Good Flow
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-[#D69E2E]"></div>
              <p className="text-gray-900 text-sm font-normal leading-normal">
                Moderate
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-[#E53E3E]"></div>
              <p className="text-gray-900 text-sm font-normal leading-normal">
                Congested
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full bg-[#9F7AEA]"></div>
              <p className="text-gray-900 text-sm font-normal leading-normal">
                Emergency
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1 border-t border-white/10 pt-4">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 cursor-pointer">
            <span className="material-symbols-outlined text-gray-900">
              logout
            </span>
            <p className="text-gray-900 text-sm font-medium leading-normal">
              Logout
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
