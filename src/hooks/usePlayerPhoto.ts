
// This file is now a proxy to our new usePlayerPhotoManager hook
// to maintain backwards compatibility
import { usePlayerPhotoManager } from "./usePlayerPhotoManager";

export function usePlayerPhoto() {
  return usePlayerPhotoManager();
}
