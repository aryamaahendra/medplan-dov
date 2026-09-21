# Need Locking System

## Status
accepted

## Context
Needs (procurement proposals) progress through planning, drafting, checklist assessment, and director review. Submitting units must be prevented from modifying proposal content after official deadlines or once executive review begins. However, planning administrators require the ability to grant temporary per-Need extension windows without reopening the entire group, and evaluators (Planners and Directors) must continue assessing and approving proposals whose content is frozen.

## Decision
We implement a two-tier locking architecture with operational whitelisting:
1. **Time-Based Window on `NeedGroup`**: Configured via `submission_start_at` and `submission_end_at`. Outside this window or when inactive, submitters cannot create or edit Needs in that group.
2. **Hybrid Per-Need Lock**: Managed on `Need` using `is_locked` (explicit override flag), `unlocked_until` (temporary extension window), `locked_at`, `locked_by_user_id`, and `lock_reason`. Director approval automatically freezes the Need.
3. **Precedence**: An explicit per-Need override (`unlocked_until` in the future or `is_locked = false`) takes precedence over an expired `NeedGroup` window, allowing targeted revision exceptions.
4. **Whitelisted Operations**: Enforced at the policy layer. While locked, proposal editing, attachment management by submitters, and deletions are blocked. Planner checklist evaluations (`performChecklist`) and Director review/approval (`approve`) remain authorized.
5. **Administration**: Governed by granular permissions (`lock needs`, `unlock needs`, `update need-groups`) assigned to Planners and Super Admins.
