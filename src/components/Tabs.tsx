"use client";

import React from "react";

interface TabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabs: { id: string; label: string }[];
}

const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="flex gap-6 border-b mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-2 px-1 border-b-2 text-sm font-semibold ${
            activeTab === tab.id
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-black"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
