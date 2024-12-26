import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  try {
    const equipmentDir = path.join(process.cwd(), "public", "equipment");
    const directories = await fs.readdir(equipmentDir, { withFileTypes: true });

    const equipmentData = await Promise.all(
      directories
        .filter((dirent) => dirent.isDirectory() && dirent.name !== "avatars")
        .map(async (dirent) => {
          const dataPath = path.join(equipmentDir, dirent.name, "data.json");
          const logoPath = path.join(equipmentDir, dirent.name, "logo.png");
          const vectorPath = path.join(equipmentDir, dirent.name, "vector.svg");
          try {
            const fileContent = await fs.readFile(dataPath, "utf-8");
            const data = JSON.parse(fileContent);

            let logoUrl = undefined;
            try {
              await fs.access(logoPath);
              logoUrl = `/equipment/${dirent.name}/logo.png`;
            } catch {
              // skip
            }

            let vectorUrl = undefined;
            try {
              await fs.access(vectorPath);
              vectorUrl = `/equipment/${dirent.name}/vector.svg`;
            } catch {
              // skip
            }

            let avatarUrl = undefined;
            try {
              const avatarPath = path.join(
                equipmentDir,
                "avatars",
                `${data.manufacturer.toLowerCase()}.png`
              );
              await fs.access(avatarPath);
              avatarUrl = `/equipment/avatars/${data.manufacturer.toLowerCase()}.png`;
            } catch {
              // skip
            }

            return {
              id: dirent.name,
              ...data,
              ...(vectorUrl && { vectorUrl }),
              ...(logoUrl && { logoUrl }),
              ...(avatarUrl && { avatarUrl }),
            };
          } catch (error) {
            console.error(`Error reading ${dataPath}:`, error);
            return null;
          }
        })
    );

    const validEquipment = equipmentData.filter((item) => item !== null);

    // Sort by label a-z
    const sortedEquipment = validEquipment.sort((a, b) =>
      (a.label ?? "").localeCompare(b.label ?? "")
    );

    return NextResponse.json(sortedEquipment);
  } catch (error) {
    console.error("Error fetching equipment data:", error);
    return NextResponse.json(
      { error: "Failed to fetch equipment data" },
      { status: 500 }
    );
  }
}
