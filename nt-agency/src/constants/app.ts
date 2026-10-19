// App-wide values shared between the client and the API.

/** Longest chat message a visitor can send (also enforced by chatSchema). */
export const CHAT_MAX_MESSAGE_LENGTH = 1000;

/** Most recent chat turns sent to the API with each question. */
export const CHAT_HISTORY_LIMIT = 10;

/** Window event that opens the Nixo chat panel from anywhere on the page. */
export const OPEN_NIXO_EVENT = "nixo:open";

/** Quote form: range of the "number of key features" slider. */
export const QUOTE_FEATURES = { min: 1, max: 20, default: 3 } as const;

/** Debounce before asking the server for a fresh estimate while the visitor edits the form. */
export const ESTIMATE_DEBOUNCE_MS = 250;

/** Rows per page in the leads table, and the single large page the board view loads. */
export const LEADS_PAGE_SIZE = { table: 15, board: 100 } as const;
