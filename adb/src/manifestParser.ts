import AdmZip from "adm-zip";
import type { ManifestInfo } from "@adb/shared";

/**
 * Minimal APK manifest parser.
 * If APK has binary AXML, this returns null (Batch 3 will include full parser).
 */
export async function parseManifest(
  apkPath: string
): Promise<ManifestInfo | null> {
  try {
    const zip = new AdmZip(apkPath);
    const entry = zip.getEntry("AndroidManifest.xml");
    if (!entry) return null;

    const data = entry.getData();
    const text = data.toString("utf8");

    // If readable XML (some APKs ship plain XML)
    if (text.includes("<manifest")) {
      const pkg = text.match(/package=\"([^\"]+)\"/);
      return pkg ? { packageName: pkg[1] } : null;
    }

    // Otherwise it's Binary XML (AXML) — will implement in Batch 3
    return null;
  } catch (err) {
    return null;
  }
}
