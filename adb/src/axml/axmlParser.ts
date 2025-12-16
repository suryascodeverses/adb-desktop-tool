import {
  CHUNK_AXML_FILE,
  CHUNK_STRING_POOL,
  CHUNK_START_TAG,
} from "./axmlTypes";
import { parseStringPool } from "./stringPool";

export interface AxmlNode {
  name: string;
  attributes: Record<string, string>;
}

export function parseAxml(buffer: Buffer): AxmlNode[] {
  let offset = 8;
  let strings: string[] = [];
  const nodes: AxmlNode[] = [];

  while (offset < buffer.length) {
    const chunkType = buffer.readUInt32LE(offset);
    const chunkSize = buffer.readUInt32LE(offset + 4);

    if (chunkType === CHUNK_STRING_POOL) {
      const parsed = parseStringPool(buffer, offset);
      strings = parsed.pool.strings;
      offset += parsed.size;
      continue;
    }

    if (chunkType === CHUNK_START_TAG) {
      const nameIdx = buffer.readUInt32LE(offset + 20);
      const attrCount = buffer.readUInt16LE(offset + 28);
      let attrOffset = offset + 36;

      const attributes: Record<string, string> = {};
      for (let i = 0; i < attrCount; i++) {
        const attrNameIdx = buffer.readUInt32LE(attrOffset + 4);
        const attrValueIdx = buffer.readUInt32LE(attrOffset + 8);
        if (attrNameIdx !== 0xffffffff && attrValueIdx !== 0xffffffff) {
          attributes[strings[attrNameIdx]] = strings[attrValueIdx];
        }
        attrOffset += 20;
      }

      nodes.push({ name: strings[nameIdx], attributes });
    }

    offset += chunkSize;
  }

  return nodes;
}
