import React from "react";

const Sidebar = () => {
  return (
    <div>
     <aside className="flex min-h-[90vh] w-72 flex-col justify-between  border-r border-white/10 bg-background-light p-4">

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
