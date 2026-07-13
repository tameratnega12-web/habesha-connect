# Habesha Agenagn V7.8.235

Business Directory Admin approval fix only.

- Admin approval updates the exact business by unique Supabase ID.
- Removed unsafe `.single()` coercion from Business Directory save/approval responses.
- Multiple businesses owned by the same email remain separate.
- No SQL change required.
- No other modules changed.
