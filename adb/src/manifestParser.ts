import AppInfoParser from "app-info-parser";
import type { ManifestInfo } from "@adb/shared";

export async function parseManifest(
  apkPath: string
): Promise<ManifestInfo | null> {
  try {
    const parser = new AppInfoParser(apkPath);
    const info = await parser.parse();

    return {
      packageName: info.package,
      versionName: info.versionName,
      versionCode: info.versionCode?.toString(),
      launchableActivity: undefined, // app-info-parser does not expose this reliably
    };
  } catch (err) {
    console.error("Manifest parse error:", err);
    return null;
  }
}
