# Domain Badge and Visual Standards

## Status

accepted

## Context

Various attributes across procurement proposals (`Need`), planning periods (`NeedGroup`), and operational reviews (`ChecklistAnswer`, locking, urgency, and impact) lacked visual consistency. Attributes were rendered using arbitrary badge styles, mixed raw database flags (`draft`, `approved`, `rejected`) with business workflow stages, and conflated binary executive priority with technical urgency/impact scoring.

## Decision

We establish a unified visual language and component architecture for domain status badges:

1. **Separation of Proposal Status and Director Review**: Proposal lifecycle is separated into two distinct domain badges:
    - **Proposal Status (`ProposalStatusBadge`)**: Reflects unit-level submission progress (`draft` = Draft/Abu-abu, `approved` = Diajukan/Biru Info, `rejected` = Ditolak/Destructive).
    - **Director Review (`DirectorReviewBadge`)**: Reflects executive governance:
        - `approved` (`approved_by_director_at !== null`): Disetujui Direktur (semantic `success` / green).
        - `needs_revision` (`notes` exists while unapproved): Perlu Revisi / Ada Catatan (semantic `destructive` / red with tooltip notes preview).
        - `awaiting_review` (`status === 'approved'` without notes/approval): Menunggu Review Direktur (semantic `warning` / amber).
2. **Priority vs. Urgency & Impact Distinction**: Executive priority (`is_priority`) is treated as a binary strategic marker (rendered with an amber star accent). Technical urgency and impact are operational scores (`high`, `medium`, `low`) rendered as a compact combined badge (`[Urgensi Tinggi · Dampak Tinggi]`) using the highest severity token (`warning` for high, `info` for medium, `muted` for low).
3. **Semantic Token Mapping**:
    - `success`: Approved workflow stage, open submission window, checklist answer 'yes', checklist readiness ≥85%.
    - `warning`: Under review workflow stage, upcoming submission window, high urgency/impact, checklist readiness 50–84%, lock indicators.
    - `destructive`: Rejected workflow stage, closed submission window, checklist answer 'no', checklist readiness <50%, critical anomalies.
    - `info`: Temporary lock override, medium urgency/impact.
    - `muted`: Draft workflow stage, indefinite window, low urgency/impact, checklist answer 'skip'.
4. **Component Architecture**: Centralize reusable, strongly-typed components under `resources/js/components/badges/` (`WorkflowStageBadge`, `SubmissionWindowBadge`, `PriorityBadge`, `UrgencyImpactBadge`, `ChecklistAnswerBadge`, `ReadinessBadge`, `LockStatusBadge`) supporting standard sizes (`sm`, `default`), icon toggling, and built-in contextual tooltips.
