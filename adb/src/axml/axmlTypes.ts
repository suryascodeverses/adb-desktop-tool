export const CHUNK_AXML_FILE = 0x00080003;
export const CHUNK_STRING_POOL = 0x001c0001;
export const CHUNK_RESOURCEIDS = 0x00080180;
export const CHUNK_START_NAMESPACE = 0x00100100;
export const CHUNK_END_NAMESPACE = 0x00100101;
export const CHUNK_START_TAG = 0x00100102;
export const CHUNK_END_TAG = 0x00100103;
export const CHUNK_TEXT = 0x00100104;

export interface StringPool {
  strings: string[];
}
