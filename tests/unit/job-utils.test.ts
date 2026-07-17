import { describe, it, expect } from 'vitest'
import {
  canTransition,
  nextStatuses,
  isTerminal,
  JOB_FLOW,
  statusIndex,
  isBefore,
  isAtOrBefore,
} from '~/lib/job-utils'

describe('canTransition', () => {
  it('allows the linear flow', () => {
    expect(canTransition('checkedIn', 'assigned')).toBe(true)
    expect(canTransition('assigned', 'diagnosed')).toBe(true)
    expect(canTransition('diagnosed', 'waitingRelease')).toBe(true)
    expect(canTransition('waitingRelease', 'inProgress')).toBe(true)
    expect(canTransition('inProgress', 'readyForPickup')).toBe(true)
    expect(canTransition('readyForPickup', 'completed')).toBe(true)
    expect(canTransition('completed', 'paid')).toBe(true)
  })

  it('allows diagnosed to skip directly to inProgress', () => {
    expect(canTransition('diagnosed', 'inProgress')).toBe(true)
  })

  it('allows waitingRelease back to diagnosed (rework)', () => {
    expect(canTransition('waitingRelease', 'diagnosed')).toBe(true)
  })

  it('disallows invalid transitions', () => {
    expect(canTransition('checkedIn', 'inProgress')).toBe(false)
    expect(canTransition('checkedIn', 'paid')).toBe(false)
    expect(canTransition('inProgress', 'completed')).toBe(false)
    expect(canTransition('paid', 'checkedIn')).toBe(false)
  })

  it('disallows skipping stages', () => {
    expect(canTransition('assigned', 'readyForPickup')).toBe(false)
    expect(canTransition('diagnosed', 'completed')).toBe(false)
  })
})

describe('nextStatuses', () => {
  it('returns valid next statuses for each stage', () => {
    expect(nextStatuses('checkedIn')).toEqual(['assigned'])
    expect(nextStatuses('assigned')).toEqual(['diagnosed'])
    expect(nextStatuses('diagnosed')).toEqual(['waitingRelease', 'inProgress'])
    expect(nextStatuses('paid')).toEqual([])
  })
})

describe('isTerminal', () => {
  it('only paid is terminal', () => {
    expect(isTerminal('paid')).toBe(true)
    expect(isTerminal('completed')).toBe(false)
    expect(isTerminal('checkedIn')).toBe(false)
  })
})

describe('statusIndex', () => {
  it('returns the position in the flow', () => {
    expect(statusIndex('checkedIn')).toBe(0)
    expect(statusIndex('paid')).toBe(7)
  })
})

describe('isBefore / isAtOrBefore', () => {
  it('compares status positions', () => {
    expect(isBefore('checkedIn', 'assigned')).toBe(true)
    expect(isBefore('inProgress', 'diagnosed')).toBe(false)
    expect(isAtOrBefore('diagnosed', 'diagnosed')).toBe(true)
    expect(isAtOrBefore('completed', 'inProgress')).toBe(false)
  })
})

describe('JOB_FLOW', () => {
  it('has 8 stages in order', () => {
    expect(JOB_FLOW).toHaveLength(8)
    expect(JOB_FLOW[0]).toBe('checkedIn')
    expect(JOB_FLOW[7]).toBe('paid')
  })
})
