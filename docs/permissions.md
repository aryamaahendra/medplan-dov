# Permissions Documentation

This document lists the granular permissions added to the application to replace coarse-grained permissions.

## New Granular Permissions

### KPI Management
| Permission | Description |
|------------|-------------|
| `view any kpi-groups` | Melihat daftar KPI Group |
| `create kpi-groups` | Menambah KPI Group baru |
| `update kpi-groups` | Mengubah data KPI Group |
| `delete kpi-groups` | Menghapus KPI Group |
| `view any kpi-indicators` | Melihat daftar Indikator KPI |
| `create kpi-indicators` | Menambah Indikator KPI baru |
| `update kpi-indicators` | Mengubah data Indikator KPI |
| `delete kpi-indicators` | Menghapus Indikator KPI |
| `view any kpi-targets` | Melihat target tahunan IKK |
| `create kpi-targets` | Menambah target tahunan IKK |
| `update kpi-targets` | Mengubah target tahunan IKK |
| `delete kpi-targets` | Menghapus target tahunan IKK |

### Checklist Management
| Permission | Description |
|------------|-------------|
| `view any checklist-questions` | Melihat daftar pertanyaan checklist |
| `create checklist-questions` | Menambah pertanyaan checklist baru |
| `update checklist-questions` | Mengubah pertanyaan checklist |
| `delete checklist-questions` | Menghapus pertanyaan checklist |

### Planning Management
| Permission | Description |
|------------|-------------|
| `view any planning-versions` | Melihat daftar versi perencanaan |
| `create planning-versions` | Menambah versi perencanaan baru |
| `update planning-versions` | Mengubah versi perencanaan |
| `delete planning-versions` | Menghapus versi perencanaan |
| `view any planning-activity-versions` | Melihat daftar aktivitas perencanaan |
| `create planning-activity-versions` | Menambah aktivitas perencanaan baru |
| `update planning-activity-versions` | Mengubah aktivitas perencanaan |
| `delete planning-activity-versions` | Menghapus aktivitas perencanaan |

### Renstra Management
| Permission | Description |
|------------|-------------|
| `view any renstras` | Melihat daftar Renstra |
| `create renstras` | Menambah Renstra baru |
| `update renstras` | Mengubah data Renstra |
| `delete renstras` | Menghapus Renstra |
| `view any tujuans` | Melihat daftar Tujuan Renstra |
| `create tujuans` | Menambah Tujuan Renstra baru |
| `update tujuans` | Mengubah data Tujuan Renstra |
| `delete tujuans` | Menghapus Tujuan Renstra |
| `view any sasarans` | Melihat daftar Sasaran Renstra |
| `create sasarans` | Menambah Sasaran Renstra baru |
| `update sasarans` | Mengubah data Sasaran Renstra |
| `delete sasarans` | Menghapus Sasaran Renstra |
| `view any indicators` | Melihat daftar Indikator Renstra |
| `create indicators` | Menambah Indikator Renstra baru |
| `update indicators` | Mengubah data Indikator Renstra |
| `delete indicators` | Menghapus Indikator Renstra |

### Strategic Service Plan (SSP) Management
| Permission | Description |
|------------|-------------|
| `view any ssps` | Melihat daftar Strategic Service Plan |
| `create ssps` | Menambah Strategic Service Plan baru |
| `update ssps` | Mengubah Strategic Service Plan |
| `delete ssps` | Menghapus Strategic Service Plan |

### Need Attachments
| Permission | Description |
|------------|-------------|
| `view need-attachments` | Melihat lampiran usulan |
| `create need-attachments` | Mengunggah lampiran baru ke usulan |
| `delete need-attachments` | Menghapus lampiran dari usulan |

## Obsolete Permissions (Deleted)
- `manage need-checklists`
- `manage renstras`
- `manage kpis`
- `manage plannings`
- `manage ssp`

## Role Assignment Summary
- **Super Admin**: Has all permissions.
- **Director**: Has all `view` permissions (read-only).
- **Planner**: Has full CRUD permissions for all strategic planning modules.
- **Unit Head**: Has CRUD permissions for attachments on their unit's needs.
- **Staff**: Has view and create permissions for attachments on their unit's needs.
