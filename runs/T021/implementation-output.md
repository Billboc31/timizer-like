All 36 tests pass. The fix is clean:

- **`CalendarGrid.tsx:4`** — added `import type { CraDetailsDto } from '../../api/types'`
- **`CalendarGrid.tsx:23`** — changed `onCraUpdate?: (updated: CraDetails) => void` → `onCraUpdate?: (updated: CraDetailsDto) => void`
- **`CalendarGrid.tsx:57`** — removed `as unknown as CraDetails` cast, now just `onCraUpdate?.(result)`

The prop now correctly reflects what `updateDay` actually returns (`CraDetailsDto` from `api/types.ts`), with `note: string | null`, eliminating the type contract lie.
