// src/composables/useQuantityRestriction.js

export const INDICATOR_CATEGORIES = {
  PRODUCTION: 'Production',
  QUALITY_CONTROL: 'Quality Control',
  DECISION_MAKING: 'Decision Making',
}

/**
 * Get category of a performance indicator
 * Handles nested category object, flat string, indicator_category field, and category_id fallback
 */
export const getIndicatorCategory = (indicatorId, verbs) => {
  if (!indicatorId || !verbs) return null

  console.log('Getting category for indicator ID:', indicatorId)

  const indicator = verbs.find((v) => v.id === Number(indicatorId))
  if (!indicator) {
    console.log('Indicator not found in verbs:', indicatorId)
    return INDICATOR_CATEGORIES.PRODUCTION
  }

  console.log('Indicator found:', indicator)

  // Handle nested category object: { id, categories_name, ... }
  if (indicator.category && typeof indicator.category === 'object') {
    const categoryName = indicator.category.categories_name || ''
    console.log('Category from nested object:', categoryName)

    if (categoryName.toLowerCase().includes('production')) return INDICATOR_CATEGORIES.PRODUCTION
    if (categoryName.toLowerCase().includes('quality')) return INDICATOR_CATEGORIES.QUALITY_CONTROL
    if (categoryName.toLowerCase().includes('decision')) return INDICATOR_CATEGORIES.DECISION_MAKING

    return INDICATOR_CATEGORIES.PRODUCTION
  }

  // Handle flat string category field
  if (indicator.category && typeof indicator.category === 'string') {
    console.log('Category from flat string:', indicator.category)
    const cat = indicator.category.toLowerCase()
    if (cat.includes('production')) return INDICATOR_CATEGORIES.PRODUCTION
    if (cat.includes('quality')) return INDICATOR_CATEGORIES.QUALITY_CONTROL
    if (cat.includes('decision')) return INDICATOR_CATEGORIES.DECISION_MAKING
    return INDICATOR_CATEGORIES.PRODUCTION
  }

  // Handle flat indicator_category field
  if (indicator.indicator_category) {
    console.log('Category from indicator_category:', indicator.indicator_category)
    const cat = indicator.indicator_category.toLowerCase()
    if (cat.includes('production')) return INDICATOR_CATEGORIES.PRODUCTION
    if (cat.includes('quality')) return INDICATOR_CATEGORIES.QUALITY_CONTROL
    if (cat.includes('decision')) return INDICATOR_CATEGORIES.DECISION_MAKING
    return INDICATOR_CATEGORIES.PRODUCTION
  }

  // Handle category_id as fallback (1=Production, 2=Quality Control, 3=Decision Making)
  if (indicator.category_id) {
    const id = Number(indicator.category_id)
    console.log('Category from category_id:', id)
    if (id === 1) return INDICATOR_CATEGORIES.PRODUCTION
    if (id === 2) return INDICATOR_CATEGORIES.QUALITY_CONTROL
    if (id === 3) return INDICATOR_CATEGORIES.DECISION_MAKING
  }

  console.log('No category resolved, defaulting to Production')
  return INDICATOR_CATEGORIES.PRODUCTION
}

/**
 * Determine primary category from employee's selected indicators
 * Uses majority rule — most common category wins, ties go to Production
 */
export const determinePrimaryCategory = (categories) => {
  if (!categories || categories.length === 0) {
    console.log('No categories provided, defaulting to Production')
    return INDICATOR_CATEGORIES.PRODUCTION
  }

  const counts = {
    [INDICATOR_CATEGORIES.PRODUCTION]: 0,
    [INDICATOR_CATEGORIES.QUALITY_CONTROL]: 0,
    [INDICATOR_CATEGORIES.DECISION_MAKING]: 0,
  }

  categories.forEach((cat) => {
    if (cat && counts[cat] !== undefined) counts[cat]++
  })

  console.log('Category counts:', counts)

  const maxCount = Math.max(...Object.values(counts))

  if (counts[INDICATOR_CATEGORIES.PRODUCTION] === maxCount) return INDICATOR_CATEGORIES.PRODUCTION
  if (counts[INDICATOR_CATEGORIES.QUALITY_CONTROL] === maxCount)
    return INDICATOR_CATEGORIES.QUALITY_CONTROL
  if (counts[INDICATOR_CATEGORIES.DECISION_MAKING] === maxCount)
    return INDICATOR_CATEGORIES.DECISION_MAKING

  return INDICATOR_CATEGORIES.PRODUCTION
}

/**
 * Calculate maximum allowed quantity based on indicator category rules
 *
 * Rules:
 *  - Same indicator as supervisor (any category) → always `available`
 *  - Production only                             → `available`
 *  - Quality Control only                        → `total_target`
 *  - Decision Making only                        → `total_target`
 *  - Mixed (any combination)                     → `total_target`
 *  - Type C                                      → no restriction
 */
export const calculateMaxQuantity = ({
  primaryCategory,
  indicatorCategories,
  supervisorAvailable,
  supervisorTotalTarget,
  quantityType,
  isSameIndicatorAsSupervisor,
}) => {
  console.log('calculateMaxQuantity:', {
    primaryCategory,
    indicatorCategories,
    supervisorAvailable,
    supervisorTotalTarget,
    quantityType,
    isSameIndicatorAsSupervisor,
  })

  // Type C - percentage based, no numeric restriction
  if (quantityType === 'C') {
    return {
      maxQuantity: null,
      restrictionType: 'none',
      message: 'No quantity restriction for Type C',
    }
  }

  // Override rule: if selected indicator matches supervisor's indicator → always use available
  if (isSameIndicatorAsSupervisor) {
    return {
      maxQuantity: supervisorAvailable,
      restrictionType: 'available',
      message: `Maximum allowed: ${supervisorAvailable} (same indicator as supervisor — capped to available)`,
    }
  }

  // Check if mixed categories
  const uniqueCategories = [...new Set(indicatorCategories.filter(Boolean))]
  const isMixed = uniqueCategories.length > 1

  if (isMixed) {
    return {
      maxQuantity: supervisorTotalTarget,
      restrictionType: 'total_target',
      message: `Maximum allowed: ${supervisorTotalTarget} (mixed indicators — capped to total target)`,
    }
  }

  // Single category rules
  switch (primaryCategory) {
    case INDICATOR_CATEGORIES.PRODUCTION:
      return {
        maxQuantity: supervisorAvailable,
        restrictionType: 'available',
        message: `Maximum allowed: ${supervisorAvailable} (Production — capped to available)`,
      }

    case INDICATOR_CATEGORIES.QUALITY_CONTROL:
      return {
        maxQuantity: supervisorTotalTarget,
        restrictionType: 'total_target',
        message: `Maximum allowed: ${supervisorTotalTarget} (Quality Control — capped to total target)`,
      }

    case INDICATOR_CATEGORIES.DECISION_MAKING:
      return {
        maxQuantity: supervisorTotalTarget,
        restrictionType: 'total_target',
        message: `Maximum allowed: ${supervisorTotalTarget} (Decision Making — capped to total target)`,
      }

    default:
      return {
        maxQuantity: supervisorAvailable,
        restrictionType: 'available',
        message: `Maximum allowed: ${supervisorAvailable} (default — capped to available)`,
      }
  }
}

/**
 * Main function to determine quantity restriction
 * Based on employee's selected indicator category + same-indicator override
 */
export const determineRestriction = ({
  selectedEmployee,
  selectedIndicators,
  quantityType,
  verbs,
  cascadeData,
}) => {
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
    },
  })

  // Type C short-circuit
  if (quantityType === 'C') {
    return {
      maxQuantity: null,
      restrictionType: 'none',
      message: 'No quantity restriction for Type C',
    }
  }

  const supervisor = selectedEmployee.supervisorySignatory
  if (!supervisor) {
    return {
      maxQuantity: null,
      restrictionType: 'no_supervisor',
      message: 'No supervisory signatory found',
    }
  }

  // Get MFO data from cascade
  const mfoData = cascadeData?.mfos?.[0] || null
  const supervisorAvailable = mfoData?.available ?? supervisor?.available ?? 0
  const supervisorTotalTarget = mfoData?.total_target ?? supervisor?.total_target ?? 0

  console.log('Supervisor MFO data:', { supervisorAvailable, supervisorTotalTarget })

  // Resolve selected indicator IDs
  const indicatorIds = Array.isArray(selectedIndicators) ? selectedIndicators : [selectedIndicators]

  // Get categories for each selected indicator
  const indicatorCategories = indicatorIds
    .map((id) => getIndicatorCategory(id, verbs))
    .filter(Boolean)

  console.log('Employee indicator categories:', indicatorCategories)

  const primaryCategory = determinePrimaryCategory(indicatorCategories)
  console.log('Primary category resolved to:', primaryCategory)

  // Check if ANY selected indicator matches supervisor's indicators
  const supervisorIndicators = mfoData?.performance_indicator || []
  const supervisorIndicatorNames = supervisorIndicators.map((ind) => {
    if (ind === null || ind === undefined) return ''
    if (typeof ind === 'object') {
      const val = ind.value || ind.indicator_name || ind.name || ''
      return typeof val === 'string' ? val.toLowerCase() : String(val).toLowerCase()
    }
    return typeof ind === 'string' ? ind.toLowerCase() : String(ind).toLowerCase()
  })

  console.log('Supervisor indicator names:', supervisorIndicatorNames)

  const isSameIndicatorAsSupervisor = indicatorIds.some((id) => {
    const verb = verbs.find((v) => v.id === Number(id))
    if (!verb) return false
    const verbName = (verb.name || verb.indicator_name || '').toLowerCase()
    const matched = supervisorIndicatorNames.some(
      (supName) => supName === verbName || supName.includes(verbName) || verbName.includes(supName),
    )
    if (matched) {
      console.log(`Indicator match found — employee: "${verbName}" matches supervisor indicator`)
    }
    return matched
  })

  console.log('Is same indicator as supervisor:', isSameIndicatorAsSupervisor)

  const result = calculateMaxQuantity({
    primaryCategory,
    indicatorCategories,
    supervisorAvailable,
    supervisorTotalTarget,
    quantityType,
    isSameIndicatorAsSupervisor,
  })

  console.log('Final restriction result:', result)
  console.log('=========================================')

  return result
}

export const useQuantityRestriction = () => {
  return {
    determineRestriction,
    getIndicatorCategory,
    calculateMaxQuantity,
    determinePrimaryCategory,
    INDICATOR_CATEGORIES,
  }
}
