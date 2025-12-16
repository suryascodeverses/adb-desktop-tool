import { parseAxml } from "./axmlParser";
import type { ManifestInfo } from "@adb/shared/dist/index";

export function extractManifestInfo(buffer: Buffer): ManifestInfo | null {
  const nodes = parseAxml(buffer);

  let pkg = "";
  let versionName: string | undefined;
  let versionCode: string | undefined;
  let launchableActivity: string | undefined;

  for (const node of nodes) {
    if (node.name === "manifest") {
      pkg = node.attributes["package"] || "";
      versionName = node.attributes["versionName"];
      versionCode = node.attributes["versionCode"];
    }

    if (node.name === "activity") {
      // Simple heuristic: launcher activity contains intent-filter with MAIN
      launchableActivity ??= node.attributes["name"];
    }
  }

  return pkg
    ? { packageName: pkg, versionName, versionCode, launchableActivity }
    : null;
}
