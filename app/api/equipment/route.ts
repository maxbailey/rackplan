import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const equipmentDir = path.join(process.cwd(), "equipment");
    const directories = await fs.readdir(equipmentDir, { withFileTypes: true });

    const equipmentData = await Promise.all(
      directories
        .filter((dirent) => dirent.isDirectory())
        .map(async (dirent) => {
          const dataPath = path.join(equipmentDir, dirent.name, "data.json");
          try {
            const fileContent = await fs.readFile(dataPath, "utf-8");
            const data = JSON.parse(fileContent);
            return {
              id: dirent.name,
              ...data,
              vectorUrl: `/equipment/${dirent.name}/vector.svg`,
            };
          } catch (error) {
            console.error(`Error reading ${dataPath}:`, error);
            return null;
          }
        })
    );

    // Filter out any null values from failed reads
    const validEquipment = equipmentData.filter((item) => item !== null);

    return NextResponse.json(validEquipment);
  } catch (error) {
    console.error("Error fetching equipment data:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment data" },
      { status: 500 }
    );
  }
}
