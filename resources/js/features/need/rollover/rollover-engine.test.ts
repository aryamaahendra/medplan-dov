import assert from 'node:assert/strict';
import test from 'node:test';

import {
  calculateSelectedBudget,
  filterCandidates,
  isCandidateRecommended,
  sortCandidates,
  toggleSelectionAll,
  toggleSelectionOne,
} from './rollover-engine.ts';
import type { CandidateNeed } from './rollover-engine.ts';

const mockCandidates: CandidateNeed[] = [
  {
    id: 1,
    title: 'Server Pengadaan',
    description: 'Pengadaan server baru',
    year: 2025,
    total_price: 50000000,
    is_recommended_for_next_cycle: false,
    organizational_unit: { id: 10, name: 'IT' },
  },
  {
    id: 2,
    title: 'Lisensi Software',
    description: 'Perpanjangan lisensi',
    year: 2025,
    total_price: '25000000',
    is_recommended_for_next_cycle: 1,
    organizational_unit: { id: 10, name: 'IT' },
  },
  {
    id: 3,
    title: 'Laptop Operasional',
    description: 'Unit operasional lapangan',
    year: 2025,
    total_price: 30000000,
    is_recommended_for_next_cycle: true,
    organizational_unit: { id: 20, name: 'Keuangan' },
  },
];

test('isCandidateRecommended: normalizes boolean and truthy numbers', () => {
  assert.equal(isCandidateRecommended(mockCandidates[0]), false);
  assert.equal(isCandidateRecommended(mockCandidates[1]), true);
  assert.equal(isCandidateRecommended(mockCandidates[2]), true);
});

test('sortCandidates: ranks recommended candidates ahead of non-recommended', () => {
  const sorted = sortCandidates(mockCandidates);

  assert.equal(sorted[0].id, 3);
  assert.equal(sorted[1].id, 2);
  assert.equal(sorted[2].id, 1);
});

test('filterCandidates: matches title, description, or unit', () => {
  const byTitle = filterCandidates(mockCandidates, 'server');
  assert.equal(byTitle.length, 1);
  assert.equal(byTitle[0].id, 1);

  const byUnit = filterCandidates(mockCandidates, 'keuangan');
  assert.equal(byUnit.length, 1);
  assert.equal(byUnit[0].id, 3);
});

test('toggleSelectionOne: toggles id into and out of selection array', () => {
  const step1 = toggleSelectionOne([], 1);
  assert.deepEqual(step1, [1]);

  const step2 = toggleSelectionOne(step1, 2);
  assert.deepEqual(step2, [1, 2]);

  const step3 = toggleSelectionOne(step2, 1);
  assert.deepEqual(step3, [2]);
});

test('toggleSelectionAll: selects all or deselects all when already full', () => {
  const allSelected = toggleSelectionAll([], mockCandidates);
  assert.deepEqual(allSelected, [1, 2, 3]);

  const allDeselected = toggleSelectionAll([1, 2, 3], mockCandidates);
  assert.deepEqual(allDeselected, []);
});

test('calculateSelectedBudget: sums string and numeric total prices accurately', () => {
  const sum1 = calculateSelectedBudget(mockCandidates, [1, 2]);
  assert.equal(sum1, 75000000);

  const sumAll = calculateSelectedBudget(mockCandidates, [1, 2, 3]);
  assert.equal(sumAll, 105000000);

  const empty = calculateSelectedBudget(mockCandidates, []);
  assert.equal(empty, 0);
});
