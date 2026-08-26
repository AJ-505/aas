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
    expect(canTransition('checkedIn', 'diagnosed')).toBe(true)
    expect(canTransition('diagnosed', 'inProgress')).toBe(true)
    expect(canTransition('inProgress', 'readyForPickup')).toBe(true)
    expect(canTransition('readyForPickup', 'completed')).toBe(true)
    expect(canTransition('completed', 'paid')).toBe(true)
  })

  it('allows checkedIn directly to inProgress', () => {
    expect(canTransition('checkedIn', 'inProgress')).toBe(true)
  })

  it('disallows invalid transitions', () => {
    expect(canTransition('checkedIn', 'paid')).toBe(false)
    expect(canTransition('inProgress', 'completed')).toBe(false)
    expect(canTransition('paid', 'checkedIn')).toBe(false)
  })

  it('disallows skipping stages', () => {
    expect(canTransition('checkedIn', 'readyForPickup')).toBe(false)
    expect(canTransition('diagnosed', 'completed')).toBe(false)
  })
})

describe('nextStatuses', () => {
  it('returns valid next statuses for each stage', () => {
    expect(nextStatuses('checkedIn')).toEqual(['diagnosed', 'inProgress'])
    expect(nextStatuses('diagnosed')).toEqual(['inProgress'])
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
    expect(statusIndex('paid')).toBe(5)
  })
})

describe('isBefore / isAtOrBefore', () => {
  it('compares status positions', () => {
    expect(isBefore('checkedIn', 'diagnosed')).toBe(true)
    expect(isBefore('inProgress', 'diagnosed')).toBe(false)
    expect(isAtOrBefore('diagnosed', 'diagnosed')).toBe(true)
    expect(isAtOrBefore('completed', 'inProgress')).toBe(false)
  })
})

describe('JOB_FLOW', () => {
  it('has 6 stages in order', () => {
    expect(JOB_FLOW).toHaveLength(6)
    expect(JOB_FLOW[0]).toBe('checkedIn')
    expect(JOB_FLOW[5]).toBe('paid')
  })
})
