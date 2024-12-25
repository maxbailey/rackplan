import BrandPanel from "@/components/brand-panel";
import RackPlanner from "@/components/rack-planner";
import SettingsPanel from "@/components/settings-panel";
import { RackProvider } from "@/context/rack-context";
import { CommandDialogDemo } from "@/components/command-dialog";

export default function Home() {
  return (
    <RackProvider>
      <div className="container">
        <div className="flex flex-row items-stretch gap-6 p-6">
          {/* Brand Sidebar */}
          <div className="flex-1">
            <BrandPanel />
          </div>

          {/* Rack Plan */}
          <div className="w-[648px] flex-shrink-0">
            <RackPlanner />
          </div>

          {/* Right Sidebar */}
          <div className="flex-1">
            <SettingsPanel />
          </div>
        </div>
        <CommandDialogDemo />
      </div>
    </RackProvider>
  );
}
