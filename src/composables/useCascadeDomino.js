// composables/useCascadeDomino.js
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'

const HEAD_JOB_TITLES = [
  'office head',
  'office2 head',
  'group head',
  'division head',
  'section head',
  'unit head',
]

const isHeadByJobTitle = (emp) => {
  if (!emp) return false
  const jobTitle = (
    emp.employeeData?.job_title ||
    emp.jobTitle ||
    emp.job_title ||
    emp.designation ||
    emp.employeeData?.designation ||
    ''
  )
    .toLowerCase()
    .trim()

  return HEAD_JOB_TITLES.some((title) => jobTitle.includes(title))
}

export function useCascadeDomino({
  officeLibraryIndicatorStore,
  quantityRestriction,
  employeeTabs,
  cascadeData,
  autoApply = true,
  debug = false,
}) {
  const $q = useQuasar()

  // ==================== STATE ====================
  const headEmployee = ref(null)
  const processingUpdate = ref(false)
  const lastUpdateTimestamp = ref(Date.now())
  const restrictionCache = ref(new Map())
  const pendingUpdates = ref(new Set())

  // Track claimed quantities per MFO across all staff
  const claimedByStaff = ref(new Map())

  // ==================== LOGGER ====================
  const log = (...args) => {
    if (debug) console.log('🏢 [CascadeDomino]', ...args)
  }

  // ==================== COMPUTED ====================

  const identifyHead = computed(() => {
    if (!employeeTabs.value || employeeTabs.value.length === 0) return null

    // Find employee whose job_title matches a head title
    const headByJobTitle = employeeTabs.value.find(
      (emp) => emp.employeeId !== null && isHeadByJobTitle(emp),
    )

    if (headByJobTitle) {
      log('Head identified by job_title:', headByJobTitle.name)
      return headByJobTitle
    }

    // No head job_title found — no head in tabs
    log('No head found by job_title in tabs')
    return null
  })

  const getStaffEmployees = () => {
    if (!headEmployee.value) return []
    return employeeTabs.value.filter((emp) => emp.employeeId && emp.id !== headEmployee.value.id)
  }

  const hasRestrictions = (employeeId) => {
    for (const key of restrictionCache.value.keys()) {
      if (key.startsWith(`${employeeId}_`)) return true
    }
    return false
  }

  // ==================== CLAIMED TRACKING ====================

  /**
   * Recalculate total claimed per MFO by summing all staff quantity targets
   */
  const recalculateClaimedByStaff = () => {
    if (!headEmployee.value) return

    const newClaimed = new Map()
    const staff = getStaffEmployees()

    staff.forEach((emp) => {
      emp.performanceStandards.forEach((standard) => {
        if (!standard.rows.mfo) return

        const mfoId = standard.rows.mfo
        let staffQuantity = 0

        if (standard.quantityIndicatorType === 'numeric') {
          const row5 = standard.standardOutcomeRows?.find((row) => row.rating === '5')
          staffQuantity = parseFloat(row5?.quantity) || parseFloat(standard.targetOutputValue) || 0
        } else if (standard.quantityIndicatorType === 'B') {
          staffQuantity = parseFloat(standard.targetOutputValue) || 0
          if (!staffQuantity) {
            const row5 = standard.standardOutcomeRows?.find((row) => row.rating === '5')
            if (row5?.quantity) {
              const match = row5.quantity.match(/^(\d+)/)
              staffQuantity = match ? parseFloat(match[1]) : 0
            }
          }
        } else if (standard.quantityIndicatorType === 'C') {
          staffQuantity = 0
        }

        const current = newClaimed.get(mfoId) || 0
        newClaimed.set(mfoId, current + staffQuantity)
      })
    })

    claimedByStaff.value = newClaimed
    log('Recalculated claimed by staff:', Object.fromEntries(newClaimed))
  }

  const getAvailableIncludingCurrent = (staffId, mfoId, currentClaim = 0) => {
    if (!headEmployee.value) {
      // Scenario 2: No head - use cascade store directly
      // This will be handled in checkAndShowCascadeModal with cascadeStore data
      return 0
    }

    // Scenario 1: With head - use pool tracking
    const headTarget = getHeadTarget(mfoId)
    if (!headTarget) return 0

    const totalTarget = parseFloat(headTarget.targetOutputValue) || 0

    // Calculate what others have claimed
    let claimedByOthers = 0
    const staff = getStaffEmployees()

    staff.forEach((emp) => {
      if (emp.id === staffId) return // Skip current employee

      emp.performanceStandards.forEach((standard) => {
        if (standard.rows.mfo !== mfoId) return

        let staffQuantity = 0
        if (standard.quantityIndicatorType === 'numeric') {
          const row5 = standard.standardOutcomeRows?.find((row) => row.rating === '5')
          staffQuantity = parseFloat(row5?.quantity) || 0
        } else if (standard.quantityIndicatorType === 'B') {
          staffQuantity = parseFloat(standard.targetOutputValue) || 0
        }

        claimedByOthers += staffQuantity
      })
    })

    // Available for this employee = total - claimedByOthers
    // This INCLUDES their current claim because claimedByOthers excludes them
    const availableForThisEmployee = Math.max(0, totalTarget - claimedByOthers)

    console.log(`Available for ${staffId} on MFO ${mfoId}:`, {
      totalTarget,
      claimedByOthers,
      availableForThisEmployee,
      currentClaim,
    })

    return availableForThisEmployee
  }

  /**
   * Get available quantity for a specific staff member for a specific MFO
   * Excludes the current staff member's own claimed amount
   */
  const getAvailableForStaff = (staffId, mfoId) => {
    if (!headEmployee.value) return 0

    const headTarget = getHeadTarget(mfoId)
    if (!headTarget) return 0

    const totalTarget = parseFloat(headTarget.targetOutputValue) || 0

    let claimedByOthers = 0
    const staff = getStaffEmployees()

    staff.forEach((emp) => {
      if (emp.id === staffId) return

      emp.performanceStandards.forEach((standard) => {
        if (standard.rows.mfo !== mfoId) return

        let staffQuantity = 0
        if (standard.quantityIndicatorType === 'numeric') {
          const row5 = standard.standardOutcomeRows?.find((row) => row.rating === '5')
          staffQuantity = parseFloat(row5?.quantity) || 0
        } else if (standard.quantityIndicatorType === 'B') {
          staffQuantity = parseFloat(standard.targetOutputValue) || 0
        }

        claimedByOthers += staffQuantity
      })
    })

    const available = Math.max(0, totalTarget - claimedByOthers)
    log(
      `Available for staff ${staffId} on MFO ${mfoId}: ${totalTarget} - ${claimedByOthers} = ${available}`,
    )

    return available
  }

  // ==================== WATCHERS ====================

  watch(
    identifyHead,
    (newHead) => {
      if (newHead && (!headEmployee.value || headEmployee.value.id !== newHead.id)) {
        log('Head employee identified:', newHead.name)
        headEmployee.value = newHead

        log('Head employee data:', {
          name: newHead.name,
          employeeId: newHead.employeeId,
          id: newHead.id,
          sg: newHead.sg,
          level: newHead.level,
          rank: newHead.rank,
          position: newHead.position,
          job_title: newHead.employeeData?.job_title,
          performanceStandards: newHead.performanceStandards?.length,
        })

        $q.notify({
          message: `${newHead.name} set as source for quantity restrictions`,
          color: 'info',
          position: 'top',
          timeout: 3000,
          icon: 'account_tree',
        })

        applyToAllStaff()
      } else if (!newHead && headEmployee.value) {
        // Head was removed from tabs
        log('Head employee removed from tabs, clearing head')
        headEmployee.value = null
      }
    },
    { immediate: true },
  )

  watch(
    () => {
      if (!headEmployee.value) return null
      return headEmployee.value.performanceStandards.map((s) => ({
        mfo: s.rows.mfo,
        output: s.rows.output,
        target: s.targetOutputValue,
        type: s.quantityIndicatorType,
        indicators: s.indicatorName,
        restriction: s.quantityRestriction,
        outputName: s.outputName,
        successIndicator: s.successIndicator,
        standardOutcomeRows: JSON.stringify(s.standardOutcomeRows),
      }))
    },
    () => {
      if (autoApply && headEmployee.value && !processingUpdate.value) {
        log('Head standards changed, reapplying to staff')
        applyToAllStaff()
      }
    },
    { deep: true },
  )

  watch(
    () => cascadeData?.value,
    (newData) => {
      if (newData && headEmployee.value && autoApply) {
        log('Cascade data updated, reapplying restrictions')

        if (newData.mfos) {
          headEmployee.value.performanceStandards.forEach((standard) => {
            if (standard.rows.mfo) {
              const matchedMfo = newData.mfos.find(
                (m) => m.mfo === standard.rows.mfo || m.mfo === standard.rows.mfo?.toString(),
              )
              if (matchedMfo) {
                if (!standard.quantityRestriction) standard.quantityRestriction = {}
                standard.quantityRestriction.claimed = matchedMfo.claimed || 0
                standard.quantityRestriction.available = matchedMfo.available || 0
                standard.quantityRestriction.total_target = matchedMfo.total_target || 0
              }
            }
          })
        }

        applyToAllStaff()
      }
    },
    { deep: true },
  )

  watch(
    () => employeeTabs.value.map((emp) => emp.employeeId).filter(Boolean),
    (newIds, oldIds) => {
      if (!headEmployee.value) return

      const newEmployees = employeeTabs.value.filter(
        (emp) =>
          emp.employeeId && emp.id !== headEmployee.value.id && !oldIds.includes(emp.employeeId),
      )

      if (newEmployees.length > 0) {
        log('New employees detected:', newEmployees.length)
        newEmployees.forEach((emp) => pendingUpdates.value.add(emp.id))

        setTimeout(() => {
          newEmployees.forEach((emp) => {
            applyToEmployee(emp.id)
            pendingUpdates.value.delete(emp.id)
          })

          $q.notify({
            message: `Applied restrictions to ${newEmployees.length} new employee(s)`,
            color: 'info',
            position: 'top',
            timeout: 2000,
          })
        }, 500)
      }
    },
    { deep: true },
  )

  watch(
    () => employeeTabs.value.map((emp) => emp.id),
    (newIds, oldIds) => {
      if (!headEmployee.value) return

      const removedIds = oldIds.filter((id) => !newIds.includes(id))
      if (removedIds.length > 0) {
        log('Employees removed:', removedIds.length)
        removedIds.forEach((id) => {
          for (const key of restrictionCache.value.keys()) {
            if (key.startsWith(`${id}_`)) restrictionCache.value.delete(key)
          }
        })
        recalculateClaimedByStaff()
        applyToAllStaff()
      }
    },
  )

  /**
   * Watch for staff quantity changes to update available for other staff
   */
  watch(
    () => {
      if (!headEmployee.value) return null
      const staff = getStaffEmployees()
      return staff.map((emp) =>
        emp.performanceStandards.map((s) => ({
          mfo: s.rows.mfo,
          qty: s.targetOutputValue,
          type: s.quantityIndicatorType,
          row5: s.standardOutcomeRows?.find((r) => r.rating === '5')?.quantity,
        })),
      )
    },
    (newVals, oldVals) => {
      if (!headEmployee.value || processingUpdate.value) return
      if (JSON.stringify(newVals) === JSON.stringify(oldVals)) return

      log('Staff quantities changed, recalculating available for all staff')
      recalculateClaimedByStaff()

      processingUpdate.value = true
      const staff = getStaffEmployees()
      staff.forEach((emp) => {
        applyToEmployee(emp.id)
      })
      processingUpdate.value = false
    },
    { deep: true },
  )

  // ==================== UTILITY METHODS ====================

  const isHead = (employeeId) => headEmployee.value?.id === employeeId

  const findEmployeeByTabId = (tabId) => employeeTabs.value.find((emp) => emp.id === tabId)

  const findEmployeeByEmployeeId = (empId) =>
    employeeTabs.value.find((emp) => emp.employeeId === empId)

  /**
   * Get head's target for an MFO
   */
  const getHeadTarget = (mfoId, outputId = null) => {
    if (!headEmployee.value) return null

    log('Getting head target for MFO:', mfoId)
    log('Head employee standards:', headEmployee.value.performanceStandards?.length)

    const head = headEmployee.value
    log('Head raw data in getHeadTarget:', {
      name: head?.name,
      rank: head?.rank,
      position: head?.position,
      employeeId: head?.employeeId,
      id: head?.id,
    })

    for (const standard of headEmployee.value.performanceStandards) {
      if (standard.rows.mfo === mfoId) {
        if (outputId && standard.rows.output !== outputId) continue

        let targetValue = standard.targetOutputValue

        if (!targetValue && standard.quantityIndicatorType === 'B') {
          const row5 = standard.standardOutcomeRows?.find((row) => row.rating === '5')
          if (row5?.quantity) {
            const match = row5.quantity.match(/(\d+)/)
            if (match) targetValue = match[1]
          }
        }

        if (!targetValue && standard.quantityIndicatorType === 'numeric') {
          const row5 = standard.standardOutcomeRows?.find((row) => row.rating === '5')
          targetValue = row5?.quantity
        }

        log('Extracted target value:', targetValue)

        const target = {
          quantityType: standard.quantityIndicatorType,
          targetOutputValue: targetValue,
          indicatorNames: standard.indicatorName || [],
          quantityRestriction: standard.quantityRestriction || {},
          standardOutcomeRows: standard.standardOutcomeRows || [],
          mfoId: standard.rows.mfo,
          outputId: standard.rows.output,
          category: standard.rows.category,
          successIndicator: standard.successIndicator,
          headName: head?.name || '',
          headId: head?.employeeId || head?.id || '',
          headRank: head?.rank || '',
          headPosition: head?.position || head?.job_title || '',
          headSG: head?.sg || '',
          headLevel: head?.level || '',
        }

        log('Found head target:', target)
        return target
      }
    }

    log('No head target found for MFO:', mfoId)
    return null
  }

  const getHeadMFOs = () => {
    if (!headEmployee.value) return []
    const mfos = []
    headEmployee.value.performanceStandards.forEach((standard) => {
      if (standard.rows.mfo) {
        mfos.push({
          mfoId: standard.rows.mfo,
          outputId: standard.rows.output,
          category: standard.rows.category,
          target: standard.targetOutputValue,
          type: standard.quantityIndicatorType,
        })
      }
    })
    return mfos
  }

  // ==================== CORE RESTRICTION METHODS ====================

  /**
   * Apply restriction to a specific standard of a staff member
   */
  const applyRestriction = (staffId, standardIndex) => {
    if (processingUpdate.value) return false
    if (!headEmployee.value) return false

    const staff = findEmployeeByTabId(staffId)
    if (!staff || staff.id === headEmployee.value.id) return false

    const standard = staff.performanceStandards[standardIndex]
    if (!standard || !standard.rows.mfo) return false

    log(`Applying restriction for ${staff.name}, standard ${standardIndex + 1}`)

    const headTarget = getHeadTarget(standard.rows.mfo, standard.rows.output)

    if (!headTarget) {
      log('No head target for this MFO, clearing restriction')
      standard.quantityRestriction = null
      restrictionCache.value.delete(`${staffId}_${standardIndex}`)
      return false
    }

    const totalTarget = parseFloat(headTarget.targetOutputValue) || 0
    const available = getAvailableForStaff(staffId, standard.rows.mfo)

    log(`Restriction calc for ${staff.name}: totalTarget=${totalTarget}, available=${available}`)

    const performanceIndicators =
      headTarget.indicatorNames?.map((id) => {
        const verb = officeLibraryIndicatorStore.verbs.find((v) => v.id === Number(id))
        return {
          value: verb?.indicator_name || verb?.name || id,
          category: quantityRestriction.getIndicatorCategory(id, officeLibraryIndicatorStore.verbs),
        }
      }) || []

    const head = headEmployee.value

    const supervisor = {
      name: head?.name || '',
      id: head?.employeeId || head?.id || '',
      rank: head?.rank || '',
      job_title: head?.employeeData?.job_title || head?.position || head?.job_title || '',
      office: head?.position || head?.office || '',
      mfos: [
        {
          mfo: standard.rows.mfo,
          total_target: totalTarget,
          claimed: totalTarget - available,
          available: available,
          output_name: headTarget.successIndicator || '',
          performance_indicator: performanceIndicators,
        },
      ],
    }

    const mfoCascadeData = {
      name: supervisor.name,
      rank: supervisor.rank,
      job_title: supervisor.job_title,
      office: supervisor.office,
      controlNo: null,
      mfos: supervisor.mfos,
      supervisories: [supervisor],
    }

    const employeeWithSupervisor = {
      ...staff,
      supervisorySignatory: supervisor,
    }

    const restriction = quantityRestriction.determineRestriction({
      selectedEmployee: employeeWithSupervisor,
      selectedIndicators: standard.indicatorName || [],
      quantityType: standard.quantityIndicatorType,
      verbs: officeLibraryIndicatorStore.verbs,
      cascadeData: mfoCascadeData,
    })

    const cacheKey = `${staffId}_${standardIndex}`
    const currentRestriction = standard.quantityRestriction
    const restrictionChanged = JSON.stringify(currentRestriction) !== JSON.stringify(restriction)

    if (restrictionChanged) {
      log(`Updating restriction for ${staff.name}:`, { from: currentRestriction, to: restriction })
      standard.quantityRestriction = restriction

      if (restriction) {
        restrictionCache.value.set(cacheKey, restriction)
      } else {
        restrictionCache.value.delete(cacheKey)
      }

      if (restriction?.maxQuantity && standard.quantityIndicatorType === 'B') {
        const currentTarget = parseFloat(standard.targetOutputValue)
        if (!isNaN(currentTarget) && currentTarget > restriction.maxQuantity) {
          standard.targetOutputValue = restriction.maxQuantity.toString()
        }
      }

      return true
    }

    return false
  }

  const applyToEmployee = (staffId, forceRefresh = false) => {
    if (!headEmployee.value) return 0

    const staff = findEmployeeByTabId(staffId)
    if (!staff || staff.id === headEmployee.value.id) return 0

    if (forceRefresh) {
      for (const key of restrictionCache.value.keys()) {
        if (key.startsWith(`${staffId}_`)) restrictionCache.value.delete(key)
      }
    }

    let count = 0
    staff.performanceStandards.forEach((_, idx) => {
      if (applyRestriction(staffId, idx)) count++
    })

    return count
  }

  const applyToAllStaff = () => {
    if (!headEmployee.value) return 0

    processingUpdate.value = true

    recalculateClaimedByStaff()

    const staff = getStaffEmployees()
    log(`Applying restrictions to ${staff.length} staff members`)

    let total = 0
    staff.forEach((emp) => {
      const count = applyToEmployee(emp.id)
      total += count
    })

    processingUpdate.value = false
    lastUpdateTimestamp.value = Date.now()

    if (total > 0) {
      $q.notify({
        message: `Updated ${total} restrictions based on ${headEmployee.value.name}`,
        color: 'info',
        position: 'top',
        timeout: 2000,
      })
    }

    return total
  }

  const applyToMFO = (mfoId, outputId = null) => {
    if (!headEmployee.value) return 0

    const staff = getStaffEmployees()
    let total = 0

    staff.forEach((emp) => {
      emp.performanceStandards.forEach((standard, idx) => {
        if (standard.rows.mfo === mfoId) {
          if (!outputId || standard.rows.output === outputId) {
            if (applyRestriction(emp.id, idx)) total++
          }
        }
      })
    })

    if (total > 0) log(`Updated ${total} restrictions for MFO: ${mfoId}`)

    return total
  }

  // ==================== CACHE MANAGEMENT ====================

  const getRestriction = (employeeId, standardIndex) => {
    return restrictionCache.value.get(`${employeeId}_${standardIndex}`) || null
  }

  const clearRestrictions = (employeeId) => {
    for (const key of restrictionCache.value.keys()) {
      if (key.startsWith(`${employeeId}_`)) restrictionCache.value.delete(key)
    }

    const employee = findEmployeeByTabId(employeeId)
    if (employee) {
      employee.performanceStandards.forEach((standard) => {
        standard.quantityRestriction = null
      })
    }
  }

  const clearAllRestrictions = () => {
    restrictionCache.value.clear()
    const staff = getStaffEmployees()
    staff.forEach((emp) => {
      emp.performanceStandards.forEach((standard) => {
        standard.quantityRestriction = null
      })
    })
  }

  // ==================== RESET AND REFRESH ====================

  const reset = () => {
    clearAllRestrictions()
    claimedByStaff.value.clear()
    headEmployee.value = identifyHead.value
    if (headEmployee.value) {
      applyToAllStaff()
      $q.notify({
        message: 'Cascade system reset',
        color: 'info',
        position: 'top',
        timeout: 2000,
      })
    }
  }

  const refresh = () => {
    clearAllRestrictions()
    recalculateClaimedByStaff()
    return applyToAllStaff()
  }

  const isPendingUpdate = (employeeId) => pendingUpdates.value.has(employeeId)

  // ==================== EXPORTS ====================

  return {
    headEmployee,
    lastUpdateTimestamp,
    restrictionCache,
    pendingUpdates,
    claimedByStaff,

    isHead,
    hasRestrictions,
    getStaffEmployees,
    getHeadMFOs,
    isPendingUpdate,
    getAvailableForStaff,
    getAvailableIncludingCurrent,

    applyToEmployee,
    applyToAllStaff,
    applyToMFO,

    getHeadTarget,

    getRestriction,
    clearRestrictions,
    clearAllRestrictions,

    reset,
    refresh,
    recalculateClaimedByStaff,
    findEmployeeByTabId,
    findEmployeeByEmployeeId,
  }
}
