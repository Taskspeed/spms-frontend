// src/composables/useQuantityRestriction.js

// Category mapping for indicators
export const INDICATOR_CATEGORIES = {
  PRODUCTION: 'Production',
  QUALITY_CONTROL: 'Quality Control',
  DECISION_MAKING: 'Decision Making',
}

/**
 * Get category of a performance indicator
 * @param {string|number} indicatorId - The indicator ID
 * @param {Array} verbs - List of verbs/indicators from store
 * @returns {string} Category name
 */
export const getIndicatorCategory = (indicatorId, verbs) => {
  if (!indicatorId || !verbs) return null

  console.log('Getting category for indicator ID:', indicatorId)

  const indicator = verbs.find((v) => v.id === Number(indicatorId))
  if (!indicator) {
    console.log('Indicator not found in verbs:', indicatorId)
    // Try to find by name if ID doesn't match
    const indicatorStr = indicatorId.toString().toLowerCase()
    const verbByName = verbs.find(
      (v) =>
        v.name?.toLowerCase().includes(indicatorStr) ||
        v.indicator_name?.toLowerCase().includes(indicatorStr),
    )
    if (verbByName) {
      console.log('Found indicator by name:', verbByName)
      return getIndicatorCategory(verbByName.id, verbs)
    }
    return null
  }

  const indicatorName = (indicator.name || indicator.indicator_name || '').toLowerCase()
  console.log('Indicator name:', indicatorName)

  // Map indicator to category based on your business logic
  if (
    indicatorName.includes('produce') ||
    indicatorName.includes('create') ||
    indicatorName.includes('develop') ||
    indicatorName.includes('supervise') || // Add supervise for your case
    indicatorName.includes('managed') ||
    indicatorName.includes('implement') ||
    indicatorName.includes('conduct') ||
    indicatorName.includes('prepare')
  ) {
    return INDICATOR_CATEGORIES.PRODUCTION
  }

  if (
    indicatorName.includes('check') ||
    indicatorName.includes('review') ||
    indicatorName.includes('inspect') ||
    indicatorName.includes('validate') ||
    indicatorName.includes('monitor') ||
    indicatorName.includes('evaluate')
  ) {
    return INDICATOR_CATEGORIES.QUALITY_CONTROL
  }

  if (
    indicatorName.includes('decide') ||
    indicatorName.includes('approve') ||
    indicatorName.includes('recommend') ||
    indicatorName.includes('resolve') ||
    indicatorName.includes('coordinate') ||
    indicatorName.includes('direct')
  ) {
    return INDICATOR_CATEGORIES.DECISION_MAKING
  }

  // Default to Production if we can't determine
  console.log('Could not determine category, defaulting to Production')
  return INDICATOR_CATEGORIES.PRODUCTION
}

/**
 * Find supervisor in cascade data - also consider Office Head
 * @param {Object} supervisor - Supervisor from employee.supervisorySignatory
 * @param {Object} cascadeData - Data from cascade store
 * @returns {Object} Supervisor data from cascade
 */
export const findSupervisorInCascade = (supervisor, cascadeData) => {
  if (!supervisor?.name || !cascadeData) return null

  console.log('Finding supervisor in cascade:', {
    supervisorName: supervisor.name,
    cascadeName: cascadeData.name,
    hasSupervisories: !!(cascadeData.supervisories && cascadeData.supervisories.length),
    hasMfos: !!(cascadeData.mfos && cascadeData.mfos.length),
  })

  // First check in supervisories array
  if (cascadeData.supervisories && cascadeData.supervisories.length > 0) {
    const found = cascadeData.supervisories.find(
      (sup) =>
        sup.name?.toLowerCase().includes(supervisor.name.toLowerCase()) ||
        supervisor.name.toLowerCase().includes(sup.name?.toLowerCase() || ''),
    )
    if (found) {
      console.log('Found supervisor in supervisories:', found.name)
      return found
    }
  }

  // If no supervisories, check if this is the Office Head
  if (cascadeData.name) {
    const nameMatch =
      cascadeData.name.toLowerCase().includes(supervisor.name.toLowerCase()) ||
      supervisor.name.toLowerCase().includes(cascadeData.name.toLowerCase())

    console.log('Checking Office Head match:', {
      officeHeadName: cascadeData.name,
      supervisorName: supervisor.name,
      match: nameMatch,
    })

    if (nameMatch) {
      // Create a supervisor-like object from Office Head data
      const officeHeadAsSupervisor = {
        name: cascadeData.name,
        rank: cascadeData.rank,
        job_title: cascadeData.job_title,
        office: cascadeData.office,
        controlNo: cascadeData.controlNo,
        mfos: cascadeData.mfos || [], // Include MFOs for category checking
        // Calculate available from all MFOs or use first one
        available: cascadeData.mfos?.reduce((total, mfo) => total + (mfo.available || 0), 0) || 0,
      }
      console.log('Using Office Head as supervisor:', officeHeadAsSupervisor)
      return officeHeadAsSupervisor
    }
  }

  console.log('No matching supervisor found')
  return null
}

/**
 * Get supervisor's indicator category based on their MFOs
 * @param {Object} supervisorCascadeData - Supervisor data from cascade
 * @param {Array} verbs - List of verbs/indicators
 * @returns {string} Primary category of supervisor
 */
export const getSupervisorCategory = (supervisorCascadeData, verbs) => {
  if (!supervisorCascadeData?.mfos || !verbs) return null

  console.log('Getting supervisor category from MFOs:', supervisorCascadeData.mfos.length)

  // Collect all indicator categories from supervisor's MFOs
  const categories = new Set()

  supervisorCascadeData.mfos.forEach((mfo, index) => {
    console.log(`Processing MFO ${index + 1}:`, mfo.mfo)

    if (mfo.performance_indicator) {
      // Handle both array of strings and array of objects
      const indicators = Array.isArray(mfo.performance_indicator)
        ? mfo.performance_indicator
        : [mfo.performance_indicator]

      indicators.forEach((indicator) => {
        if (typeof indicator === 'object' && indicator.value) {
          console.log(
            'Found object indicator with value:',
            indicator.value,
            'category:',
            indicator.category,
          )
          // If the indicator already has a category in the data, use that
          if (indicator.category) {
            categories.add(indicator.category)
          } else {
            // Otherwise try to determine from the value
            const verb = verbs.find(
              (v) =>
                v.name?.toLowerCase().includes(indicator.value.toLowerCase()) ||
                v.indicator_name?.toLowerCase().includes(indicator.value.toLowerCase()),
            )
            if (verb) {
              const category = getIndicatorCategory(verb.id, verbs)
              if (category) categories.add(category)
            }
          }
        } else if (typeof indicator === 'string') {
          console.log('Found string indicator:', indicator)
          // Try to find verb by name
          const verb = verbs.find(
            (v) =>
              v.name?.toLowerCase().includes(indicator.toLowerCase()) ||
              v.indicator_name?.toLowerCase().includes(indicator.toLowerCase()),
          )
          if (verb) {
            const category = getIndicatorCategory(verb.id, verbs)
            if (category) categories.add(category)
          }
        }
      })
    }
  })

  console.log('Supervisor categories found:', Array.from(categories))

  // Determine primary category
  if (categories.has(INDICATOR_CATEGORIES.QUALITY_CONTROL)) {
    return INDICATOR_CATEGORIES.QUALITY_CONTROL
  }
  if (categories.has(INDICATOR_CATEGORIES.DECISION_MAKING)) {
    return INDICATOR_CATEGORIES.DECISION_MAKING
  }
  if (categories.has(INDICATOR_CATEGORIES.PRODUCTION)) {
    return INDICATOR_CATEGORIES.PRODUCTION
  }

  return null
}

/**
 * Check if indicator belongs to supervisor
 * @param {Array|string|number} selectedIndicators - Selected indicator IDs
 * @param {Object} supervisorCascadeData - Supervisor data from cascade
 * @returns {boolean} Whether indicator belongs to supervisor
 */
export const indicatorBelongsToSupervisor = (selectedIndicators, supervisorCascadeData) => {
  if (!selectedIndicators || !supervisorCascadeData?.mfos) return false

  const indicatorIds = Array.isArray(selectedIndicators)
    ? selectedIndicators.map((id) => Number(id))
    : [Number(selectedIndicators)]

  console.log('Checking if indicators belong to supervisor:', {
    indicatorIds,
    supervisorMfosCount: supervisorCascadeData.mfos.length,
  })

  // Check if any selected indicator matches supervisor's indicators
  for (const mfo of supervisorCascadeData.mfos) {
    if (mfo.performance_indicator) {
      const indicators = Array.isArray(mfo.performance_indicator)
        ? mfo.performance_indicator
        : [mfo.performance_indicator]

      console.log('Checking MFO:', mfo.mfo, 'indicators:', indicators)

      for (const indicator of indicators) {
        // Handle both object and string formats
        let indicatorValue
        let indicatorCategory

        if (typeof indicator === 'object') {
          indicatorValue = indicator.value
          indicatorCategory = indicator.category
          console.log('Object indicator - value:', indicatorValue, 'category:', indicatorCategory)
        } else {
          indicatorValue = indicator
          console.log('String indicator:', indicatorValue)
        }

        if (!indicatorValue) continue

        // Check for match
        const match = indicatorIds.some((id) => {
          // Find the verb by ID
          const verb = supervisorCascadeData.verbs?.find((v) => v.id === id) || {
            name: id.toString(),
          }

          const verbName = (verb.name || verb.indicator_name || '').toLowerCase()
          const indicatorStr = indicatorValue.toString().toLowerCase()

          // Check if indicator value matches verb name
          const matches = indicatorStr.includes(verbName) || verbName.includes(indicatorStr)

          if (matches) {
            console.log('Match found:', {
              indicatorValue: indicatorStr,
              verbName: verbName,
              id: id,
            })
          }

          return matches
        })

        if (match) return true
      }
    }
  }

  return false
}

/**
 * Determine primary category from multiple indicators
 * @param {Array} categories - List of indicator categories
 * @returns {string} Primary category
 */
export const determinePrimaryCategory = (categories) => {
  if (!categories || categories.length === 0) {
    console.log('No categories provided, defaulting to Production')
    return INDICATOR_CATEGORIES.PRODUCTION
  }

  // Priority: Quality Control > Decision Making > Production
  if (categories.includes(INDICATOR_CATEGORIES.QUALITY_CONTROL)) {
    return INDICATOR_CATEGORIES.QUALITY_CONTROL
  }
  if (categories.includes(INDICATOR_CATEGORIES.DECISION_MAKING)) {
    return INDICATOR_CATEGORIES.DECISION_MAKING
  }
  if (categories.includes(INDICATOR_CATEGORIES.PRODUCTION)) {
    return INDICATOR_CATEGORIES.PRODUCTION
  }

  return categories[0]
}

/**
 * Calculate maximum allowed quantity based on restriction rules
 * @param {Object} params - Parameters for calculation
 * @returns {Object} Max quantity and restriction info
 */
export const calculateMaxQuantity = ({
  indicatorCategories,
  supervisorCascadeData,
  supervisorCategory,
  indicatorBelongsToSupervisor,
  cascadeData,
  quantityType,
}) => {
  console.log('Calculating max quantity with:', {
    indicatorCategories,
    supervisorCategory,
    indicatorBelongsToSupervisor,
    supervisorAvailable: supervisorCascadeData?.available,
    totalTarget: cascadeData?.total_target,
  })

  // Type C quantity - no restriction
  if (quantityType === 'C') {
    return {
      maxQuantity: null,
      restrictionType: 'none',
      message: 'No quantity restriction for Type C',
    }
  }

  // No supervisor or cascade data
  if (!supervisorCascadeData || !cascadeData) {
    return {
      maxQuantity: null,
      restrictionType: 'unknown',
      message: 'Unable to determine restriction',
    }
  }

  // Get primary category of selected indicators (default to Production if none)
  const primaryCategory = determinePrimaryCategory(indicatorCategories)
  console.log('Primary category:', primaryCategory)

  // Rule 1: Same indicator - use available
  if (indicatorBelongsToSupervisor) {
    const maxQty = supervisorCascadeData.available || 0
    console.log('Rule 1 applied - Same indicator, using available:', maxQty)
    return {
      maxQuantity: maxQty,
      restrictionType: 'available',
      message: `Maximum allowed: ${maxQty} (based on available quantity)`,
    }
  }

  // Rule 2: Both Production - use available
  if (
    primaryCategory === INDICATOR_CATEGORIES.PRODUCTION &&
    supervisorCategory === INDICATOR_CATEGORIES.PRODUCTION
  ) {
    const maxQty = supervisorCascadeData.available || 0
    console.log('Rule 2 applied - Both Production, using available:', maxQty)
    return {
      maxQuantity: maxQty,
      restrictionType: 'available',
      message: `Maximum allowed: ${maxQty} (Production to Production)`,
    }
  }

  // Rule 3: Both Quality Control - use total_target if same indicator, else available
  if (
    primaryCategory === INDICATOR_CATEGORIES.QUALITY_CONTROL &&
    supervisorCategory === INDICATOR_CATEGORIES.QUALITY_CONTROL
  ) {
    const maxValue = indicatorBelongsToSupervisor
      ? cascadeData.total_target || 0
      : supervisorCascadeData.available || 0

    console.log('Rule 3 applied - Both Quality Control:', {
      maxValue,
      sameIndicator: indicatorBelongsToSupervisor,
    })

    return {
      maxQuantity: maxValue,
      restrictionType: indicatorBelongsToSupervisor ? 'total_target' : 'available',
      message: `Maximum allowed: ${maxValue} (Quality Control ${indicatorBelongsToSupervisor ? 'same indicator' : 'different indicator'})`,
    }
  }

  // Rule 4: Both Decision Making - use total_target if same indicator, else available
  if (
    primaryCategory === INDICATOR_CATEGORIES.DECISION_MAKING &&
    supervisorCategory === INDICATOR_CATEGORIES.DECISION_MAKING
  ) {
    const maxValue = indicatorBelongsToSupervisor
      ? cascadeData.total_target || 0
      : supervisorCascadeData.available || 0

    console.log('Rule 4 applied - Both Decision Making:', {
      maxValue,
      sameIndicator: indicatorBelongsToSupervisor,
    })

    return {
      maxQuantity: maxValue,
      restrictionType: indicatorBelongsToSupervisor ? 'total_target' : 'available',
      message: `Maximum allowed: ${maxValue} (Decision Making ${indicatorBelongsToSupervisor ? 'same indicator' : 'different indicator'})`,
    }
  }

  // Rule 5: Production and Quality Control/Decision Making - use total_target
  if (
    (primaryCategory === INDICATOR_CATEGORIES.PRODUCTION &&
      (supervisorCategory === INDICATOR_CATEGORIES.QUALITY_CONTROL ||
        supervisorCategory === INDICATOR_CATEGORIES.DECISION_MAKING)) ||
    ((primaryCategory === INDICATOR_CATEGORIES.QUALITY_CONTROL ||
      primaryCategory === INDICATOR_CATEGORIES.DECISION_MAKING) &&
      supervisorCategory === INDICATOR_CATEGORIES.PRODUCTION)
  ) {
    const maxQty = cascadeData.total_target || 0
    console.log('Rule 5 applied - Mixed categories, using total target:', maxQty)
    return {
      maxQuantity: maxQty,
      restrictionType: 'total_target',
      message: `Maximum allowed: ${maxQty} (Mixed categories - using total target)`,
    }
  }

  // Default fallback - use available
  console.log('No specific rule matched, using available as default')
  return {
    maxQuantity: supervisorCascadeData.available || 0,
    restrictionType: 'available',
    message: `Maximum allowed: ${supervisorCascadeData.available || 0} (based on available quantity)`,
  }
}

/**
 * Main function to determine quantity restriction
 * @param {Object} params - All parameters needed for restriction
 * @returns {Object} Restriction result
 */
export const determineRestriction = ({
  selectedEmployee,
  selectedIndicators,
  quantityType,
  verbs,
  cascadeData,
}) => {
  // Validate required params
  if (!selectedEmployee || !selectedIndicators || !verbs || !cascadeData) {
    console.warn('Missing required parameters for quantity restriction', {
      hasEmployee: !!selectedEmployee,
      hasIndicators: !!selectedIndicators,
      hasVerbs: !!verbs,
      hasCascadeData: !!cascadeData,
    })
    return {
      maxQuantity: null,
      restrictionType: 'error',
      message: 'Unable to determine restriction: missing data',
    }
  }

  console.log('=========================================')
  console.log('Determining restriction with params:', {
    selectedEmployee: selectedEmployee.name || selectedEmployee.employeeId,
    selectedIndicators,
    quantityType,
    cascadeData: {
      name: cascadeData.name,
      mfosCount: cascadeData.mfos?.length,
      supervisoriesCount: cascadeData.supervisories?.length,
    },
  })

  // Get supervisor from employee
  const supervisor = selectedEmployee.supervisorySignatory
  console.log('Supervisor from employee:', supervisor)

  if (!supervisor) {
    return {
      maxQuantity: null,
      restrictionType: 'no_supervisor',
      message: 'No supervisory signatory found',
    }
  }

  // Find supervisor in cascade data (including Office Head)
  const supervisorCascadeData = findSupervisorInCascade(supervisor, cascadeData)

  if (!supervisorCascadeData) {
    return {
      maxQuantity: null,
      restrictionType: 'supervisor_not_found',
      message: 'Supervisor not found in cascade data',
    }
  }

  // Add verbs to supervisor data for later use
  supervisorCascadeData.verbs = verbs

  // Get categories for selected indicators
  const indicatorIds = Array.isArray(selectedIndicators) ? selectedIndicators : [selectedIndicators]

  console.log('Indicator IDs:', indicatorIds)

  const indicatorCategories = indicatorIds
    .map((id) => {
      const category = getIndicatorCategory(id, verbs)
      console.log(`Indicator ${id} category:`, category)
      return category
    })
    .filter(Boolean)

  console.log('Indicator categories:', indicatorCategories)

  // Check if indicator belongs to supervisor
  const belongsToSupervisor = indicatorBelongsToSupervisor(
    selectedIndicators,
    supervisorCascadeData,
  )
  console.log('Indicator belongs to supervisor:', belongsToSupervisor)

  // Get supervisor's primary category
  const supervisorCategory = getSupervisorCategory(supervisorCascadeData, verbs)
  console.log('Supervisor category:', supervisorCategory)

  // Calculate max quantity
  const result = calculateMaxQuantity({
    indicatorCategories,
    supervisorCascadeData,
    supervisorCategory,
    indicatorBelongsToSupervisor: belongsToSupervisor,
    cascadeData,
    quantityType,
  })

  console.log('Final restriction result:', result)
  console.log('=========================================')

  return result
}

export const useQuantityRestriction = () => {
  return {
    determineRestriction,
    getIndicatorCategory,
    findSupervisorInCascade,
    getSupervisorCategory,
    indicatorBelongsToSupervisor,
    calculateMaxQuantity,
    INDICATOR_CATEGORIES,
  }
}
