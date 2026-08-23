import type { BusinessesSlice } from "./slices/businesses";
import type { UiSlice } from "./slices/ui";

export type AppStore = UiSlice & BusinessesSlice;
