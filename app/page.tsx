import BrandSidebar from "@/components/brand-sidebar";

export default function Home() {
  return (
    <div className="container">
      <div className="flex flex-row gap-6 p-6">
        {/* Brand Sidebar */}
        <div className="flex-1">
          <BrandSidebar />
        </div>

        {/* Rack Plan */}
        <div className="w-[548px] flex-shrink-0">
          <p>hello world</p>
        </div>

        {/* Right Sidebar */}
        <div className="flex-1">
          <p>right sidebar</p>
        </div>
      </div>
    </div>
  );
}
