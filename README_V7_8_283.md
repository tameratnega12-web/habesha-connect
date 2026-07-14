# Habesha Agenagn V7.8.283

Marketplace photo disappearance fix only.

- Replaced competing Marketplace photo handlers with one final controller.
- Selected photo previews remain visible until submission or deletion.
- The selected files survive Marketplace DOM re-renders.
- Listing is saved first, photos upload into the listing-ID folder, URLs attach to the same row, and Supabase is re-read before success.
- Existing Marketplace transaction flow is unchanged.
- No new SQL is required after V7.8.282 SQL has been run.
