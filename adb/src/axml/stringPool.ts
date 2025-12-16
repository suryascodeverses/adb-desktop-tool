import { StringPool } from "./axmlTypes";

export function parseStringPool(
  buffer: Buffer,
  offset: number
): { pool: StringPool; size: number } {
  const stringCount = buffer.readUInt32LE(offset + 8);
  const flags = buffer.readUInt32LE(offset + 16);
  const stringsStart = buffer.readUInt32LE(offset + 20);

  const isUtf8 = (flags & 0x100) !== 0;
  const offsetsOffset = offset + 28;
  const strings: string[] = [];

  for (let i = 0; i < stringCount; i++) {
    const strOffset = buffer.readUInt32LE(offsetsOffset + i * 4);
    let cursor = offset + stringsStart + strOffset;

    let strLen: number;
    if (isUtf8) {
      const u8len = buffer[cursor++];
      strLen = buffer[cursor++];
      strings.push(buffer.toString("utf8", cursor, cursor + strLen));
    } else {
      strLen = buffer.readUInt16LE(cursor) * 2;
      cursor += 2;
      strings.push(buffer.toString("utf16le", cursor, cursor + strLen));
    }
  }

  const chunkSize = buffer.readUInt32LE(offset + 4);
  return { pool: { strings }, size: chunkSize };
}
