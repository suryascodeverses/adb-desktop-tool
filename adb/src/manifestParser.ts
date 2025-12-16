import AdmZip from "adm-zip";
import type { ManifestInfo } from "@adb/shared/dist/index";
import { extractManifestInfo } from "./axml/manifestExtractor";

export async function parseManifest(
  apkPath: string
): Promise<ManifestInfo | null> {
  try {
    const zip = new AdmZip(apkPath);
    const entry = zip.getEntry("AndroidManifest.xml");
    if (!entry) return null;

    const buffer = entry.getData();

    // Binary AXML
    if (buffer.readUInt32LE(0) === 0x00080003) {
      return extractManifestInfo(buffer);
    }

    // Plain XML fallback
    const text = buffer.toString("utf8");
    const pkg = text.match(/package=\"([^\"]+)\"/);
    return pkg ? { packageName: pkg[1] } : null;
  } catch {
    return null;
  }
}
