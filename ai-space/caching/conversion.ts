import { encode, decode, JsonValue } from "@toon-format/toon";

export function encodeToToon(jsonData: string): string {
    return encode(jsonData);
}

export function decodeFromToon(toonData: string): JsonValue {
    return decode(toonData);
}
