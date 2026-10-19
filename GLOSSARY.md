# Domain Glossary

A strategic planning, budgeting, and procurement needs management system aligning organizational proposals with long-term strategic plans and regional performance indicators.

## Language

### Needs & Procurement

**Need**:
A formal procurement or resource requirement proposal submitted by an organizational unit for a specific fiscal year.
_Avoid_: Request, item, submission, ticket

**Need Group**:
A grouped fiscal period and stage container defining applicable checklist questions and collecting needs for a planning cycle.
_Avoid_: Batch, period, category

**Need Type**:
A classification category specifying the nature of the procurement need, such as goods, construction, consulting, or general services.
_Avoid_: Need kind, category

**Checklist Question**:
A verification criterion associated with a need group used to evaluate proposal completeness and readiness.
_Avoid_: Audit item, survey question

**Checklist Answer**:
The evaluation response (yes, no, or skip) assigned to a checklist question for a specific need.
_Avoid_: Checklist result, questionnaire response

**Checklist Readiness Band**:
The proposal evaluation completeness tier computed from the checklist percentage: Siap Ditinjau / Ready (≥85%), Perlu Dilengkapi / In Progress (50–84%), or Belum Lengkap / Incomplete (<50%).
_Avoid_: Completeness level, completion score

**Need Detail**:
The detailed proposal information accompanying a need, including terms of reference (TOR), background, specifications, cost estimates, and KPA assignment.
_Avoid_: Need description, proposal body

**Unapproved Need**:
A Need submitted in a prior Need Group cycle that did not obtain Director approval before the submission window closed, qualifying it for rollover into a subsequent planning cycle.
_Avoid_: Rejected proposal, failed need

**Rollover Need**:
A new Need record created in a target Need Group by cloning an unapproved Need from a prior cycle, inheriting its proposal details while resetting approval, lock, and checklist statuses.
_Avoid_: Reassigned need, duplicate need

**Funding Source**:
The financial appropriation or revenue source allocated to cover the estimated expenditure of a need.
_Avoid_: Budget source, payment origin

**Need Status**:
The unified lifecycle state of a Need: Draft (`draft`), Diajukan (`submitted`), Disetujui (`approved`), Ditolak (`rejected`), or Perlu Revisi (`revision`).
_Avoid_: Proposal status, technical status, stage flag

**Approved Volume**:
The quantitative volume formally accepted by the Director, which may match or be adjusted down from the proposed volume.
_Avoid_: Final volume, accepted volume

**Approved Unit Price**:
The per-unit monetary valuation formally sanctioned by the Director.
_Avoid_: Final unit price, accepted price

**Approved Total Price**:
The total monetary allocation sanctioned by the Director, computed as approved volume multiplied by approved unit price.
_Avoid_: Final total price, accepted total

**Next Cycle Recommendation**:
A formal executive designation applied by the Director on a rejected proposal or on the unapproved residual volume of a partially approved proposal, qualifying it for prioritized rollover into subsequent Need Groups.
_Avoid_: Rollover candidate, rollover flag, deferral

**Director Review Status**:
The executive review determination rendered by the Director on a proposal: Disetujui (`approved`), Ditolak (`rejected`), Perlu Revisi (`revision`), or Menunggu Review (`submitted`).
_Avoid_: Workflow stage, final sign-off, executive stamp
**Priority Flag**:
A binary designation indicating an executive or strategic prioritization mandate on a Need, separate from operational urgency or risk analysis.
_Avoid_: Priority level, priority score

**Urgency**:
A multi-level operational assessment indicating the time sensitivity of fulfilling a Need (Tinggi, Sedang, Rendah).
_Avoid_: Priority, rush level

**Impact**:
A multi-level operational assessment indicating the magnitude of organizational consequence if a Need is unfulfilled (Tinggi, Sedang, Rendah).
_Avoid_: Importance, criticality

### Strategic Planning & Alignment

**Strategic Alignment**:
The formal multi-framework linkage binding a Need to institutional strategic goals (Renstra Tujuan & Sasaran), quantitative performance metrics (KPI Group Indicators), operational service commitments (Strategic Service Plans), and regional budget hierarchy nodes (Planning Activity Versions).
_Avoid_: Alignment matrix, category mapping, strategic link

**Renstra**:
The multi-year organizational strategic plan (Rencana Strategis) spanning a 5-year planning horizon that anchors all institutional objectives.
_Avoid_: Strategic document, master plan

**Tujuan**:
A high-level strategic goal defined under an active Renstra.
_Avoid_: Mission, high-level goal

**Sasaran**:
A concrete, targeted strategic objective derived from a Tujuan.
_Avoid_: Sub-goal, target objective

**Indicator**:
A quantifiable metric measuring progress and performance toward a Sasaran.
_Avoid_: Renstra KPI, measure

**Indicator Target**:
The planned numerical or qualitative goal set for an Indicator for a specific year.
_Avoid_: Benchmark, yearly quota

**Strategic Service Plan**:
An operational service commitment outlining programs, targets, and policy directions aligned with organizational service mandates.
_Avoid_: Operational plan, service strategy

**KPI Group**:
A time-bounded collection of key performance indicators spanning multiple fiscal years.
_Avoid_: KPI category, indicator set

**KPI Indicator**:
A performance measure within a KPI Group tracking institutional achievement against yearly targets.
_Avoid_: Metric, scorecard item

**Planning Version**:
A revision-controlled regional planning baseline document encompassing activities, indicators, and multi-year budgets.
_Avoid_: Budget version, planning cycle

**Planning Activity**:
A hierarchical node within a Planning Version structured as Program, Outcome, Kegiatan, Subkegiatan, or Output.
_Avoid_: Task, action item, project component

### Governance & Locking

**Need Lock**:
The restricted state of a Need preventing submitter modifications to its core proposal, budget details, and attachments.
_Avoid_: Request lock, item lock, frozen proposal

**Submission Window**:
The scheduled time interval defined on a Need Group during which organizational units may create and edit needs.
_Avoid_: Open period, proposal timeframe, intake window

**Submission Window Status**:
The active lifecycle availability of a Need Group's submission intake period: Open (Buka Pengajuan), Closed (Pengajuan Ditutup), Upcoming (Mendatang), or Indefinite (Jadwal Fleksibel).
_Avoid_: Group status, intake status
**Lock Override**:
An explicit exemption granting temporary or individual edit access to a specific Need when its submission window is closed or group is locked.
_Avoid_: Exception pass, manual unlock bypass

**Whitelisted Operation**:
An operational evaluation or executive action (such as checklist assessment or director review) permitted on a Need regardless of whether its content is locked.
_Avoid_: Allowed action, permitted task

### Organization & Governance

**Organizational Unit**:
A department, division, sub-division, or administrative entity submitting and managing needs.
_Avoid_: Department, branch, team

**Director Review**:
The formal executive decision step where a Director approves or rejects a submitted need with optional directives.
_Avoid_: Final sign-off, executive stamp

**Trashed Unit**:
An Organizational Unit that has been deactivated through soft deletion, removing it from active planning filters while preserving its historical relationship to existing proposals.
_Avoid_: Inactive department, deleted agency, archived office

**Orphaned Proposal**:
A Need proposal whose originating Organizational Unit has been soft-deleted, suppressing the unit display in overview lists until restored or reassigned to an active unit.
_Avoid_: Unitless need, detached item, parentless proposal
