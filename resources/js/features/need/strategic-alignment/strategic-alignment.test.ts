import assert from 'node:assert/strict';
import test from 'node:test';

import {
  toggleSasaranItem,
  toggleIndicatorItem,
  toggleKpiIndicatorItem,
  toggleStrategicServicePlanItem,
  togglePlanningActivityItem,
  togglePlanningIndicatorItem,
  groupRenstraSasaransByTujuan,
} from './strategic-alignment-engine.ts';
import type {
  StrategicAlignmentState,
  TujuanLike,
  PlanningActivityLike,
} from './strategic-alignment-engine.ts';

const initialState: StrategicAlignmentState = {
  sasaran_ids: [],
  indicator_ids: [],
  kpi_indicator_ids: [],
  strategic_service_plan_ids: [],
  planning_activity_version_ids: [],
  planning_activity_indicator_ids: [],
};

const mockTujuans: TujuanLike[] = [
  {
    id: 1,
    name: 'Tujuan 1',
    sasarans: [
      {
        id: 10,
        name: 'Sasaran 10',
        indicators: [
          { id: 101, name: 'Indicator 101' },
          { id: 102, name: 'Indicator 102' },
        ],
      },
      {
        id: 20,
        name: 'Sasaran 20',
        indicators: [{ id: 201, name: 'Indicator 201' }],
      },
    ],
  },
];

const mockPlanningActivities: PlanningActivityLike[] = [
  {
    id: 100,
    indicators: [{ id: 1001, name: 'Plan Ind 1' }],
    children: [
      {
        id: 200,
        indicators: [{ id: 2001, name: 'Plan Ind 2' }],
      },
    ],
  },
];

test('toggleSasaranItem: adds sasaran on checked', () => {
  const next = toggleSasaranItem(initialState, mockTujuans, 10, true);
  assert.deepEqual(next.sasaran_ids, ['10']);
});

test('toggleSasaranItem: removes sasaran and prunes child indicators on unchecked', () => {
  const current: StrategicAlignmentState = {
    ...initialState,
    sasaran_ids: ['10', '20'],
    indicator_ids: ['101', '102', '201'],
  };

  const next = toggleSasaranItem(current, mockTujuans, 10, false);
  assert.deepEqual(next.sasaran_ids, ['20']);
  assert.deepEqual(next.indicator_ids, ['201']); // 101 and 102 are pruned
});

test('toggleIndicatorItem: adds and removes indicator', () => {
  const added = toggleIndicatorItem(initialState, 101, true);
  assert.deepEqual(added.indicator_ids, ['101']);

  const removed = toggleIndicatorItem(added, 101, false);
  assert.deepEqual(removed.indicator_ids, []);
});

test('toggleKpiIndicatorItem: adds and removes kpi indicator', () => {
  const added = toggleKpiIndicatorItem(initialState, 55, true);
  assert.deepEqual(added.kpi_indicator_ids, ['55']);

  const removed = toggleKpiIndicatorItem(added, 55, false);
  assert.deepEqual(removed.kpi_indicator_ids, []);
});

test('toggleStrategicServicePlanItem: adds and removes service plan', () => {
  const added = toggleStrategicServicePlanItem(initialState, 77, true);
  assert.deepEqual(added.strategic_service_plan_ids, ['77']);

  const removed = toggleStrategicServicePlanItem(added, 77, false);
  assert.deepEqual(removed.strategic_service_plan_ids, []);
});

test('togglePlanningActivityItem: adds activity on checked', () => {
  const next = togglePlanningActivityItem(
    initialState,
    mockPlanningActivities,
    100,
    true,
  );
  assert.deepEqual(next.planning_activity_version_ids, ['100']);
});

test('togglePlanningActivityItem: unchecking activity prunes indicators of activity and its descendants', () => {
  const current: StrategicAlignmentState = {
    ...initialState,
    planning_activity_version_ids: ['100', '200'],
    planning_activity_indicator_ids: ['1001', '2001', '9999'],
  };

  // Unchecking root activity 100 should prune 1001 and child 2001, but keep 9999
  const next = togglePlanningActivityItem(
    current,
    mockPlanningActivities,
    100,
    false,
  );
  assert.deepEqual(next.planning_activity_version_ids, ['200']);
  assert.deepEqual(next.planning_activity_indicator_ids, ['9999']);
});

test('togglePlanningIndicatorItem: adds and removes planning indicator', () => {
  const added = togglePlanningIndicatorItem(initialState, 1001, true);
  assert.deepEqual(added.planning_activity_indicator_ids, ['1001']);

  const removed = togglePlanningIndicatorItem(added, 1001, false);
  assert.deepEqual(removed.planning_activity_indicator_ids, []);
});

test('groupRenstraSasaransByTujuan: groups sasarans correctly', () => {
  const sasarans = [
    {
      id: 10,
      tujuan: { id: 1, name: 'Tujuan A' },
      indicators: [{ id: 101 }],
    },
    {
      id: 20,
      tujuan: { id: 1, name: 'Tujuan A' },
      indicators: [{ id: 102 }],
    },
    {
      id: 30,
      tujuan: { id: 2, name: 'Tujuan B' },
      indicators: [{ id: 201 }],
    },
  ];

  const grouped = groupRenstraSasaransByTujuan(sasarans);
  assert.equal(grouped.length, 2);
  assert.equal(grouped[0].id, 1);
  assert.equal(grouped[0].sasarans.length, 2);
  assert.equal(grouped[1].id, 2);
  assert.equal(grouped[1].sasarans.length, 1);
});
