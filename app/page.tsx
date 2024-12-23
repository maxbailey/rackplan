import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col items-center justify-center gap-4">
        <Image
          src="/rackplan-logo.svg"
          alt="rackplan.dev"
          width={60}
          height={60}
        />
        <h1 className="text-4xl font-medium font-geist-mono gradient-text">
          rackplan.dev
        </h1>
      </div>
    </div>
  );
}
