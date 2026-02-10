<template>
  <div class="app-container">
    <!-- App Header -->
    <div class="app-header">
      <div class="header-content">
        <div class="text-h6 text-white">{{ currentDivisionPath.split(' / ')[0] }}</div>
      </div>
      <div class="col-auto">
        <q-btn flat round dense text-color="white" icon="close" @click="$emit('close')" />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Fixed Left Navigation -->
      <div class="division-nav">
        <div class="division-nav-header">
          <div class="text-h6">Level</div>
        </div>

        <!-- Use firstSubLevel if provided, otherwise use divisions -->
        <q-list padding class="division-list">
          <q-item
            v-for="(division, index) in navigationItems || []"
            :key="division?.id || index"
            clickable
            v-ripple
            :active="selectedDivision === (division?.id || '')"
            @click="selectDivision(division)"
            active-class="active-division"
          >
            <q-item-section>
              <q-item-label>{{ division?.label || `Division ${index + 1}` }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Loading State for Navigation -->
        <div v-if="store?.loading && !currentDivisionData" class="q-pa-md text-center">
          <q-spinner color="primary" size="2em" />
          <div class="q-mt-sm text-caption">Loading divisions...</div>
        </div>

        <!-- Approved Button at the bottom -->
        <div v-if="showApprovedButton" class="row justify-center q-mt-lg q-pb-lg">
          <q-btn label="Approve" color="green" class="q-mt-md" />
        </div>
      </div>

      <!-- Report Content Area - Single Scrollable Container -->
      <div class="report-container">
        <!-- Loading State -->
        <div v-if="store?.loading && selectedDivision" class="full-height flex flex-center">
          <div class="text-center">
            <q-spinner color="primary" size="3em" />
            <div class="q-mt-md">Loading report data...</div>
          </div>
        </div>

        <!-- Error State -->
        <div v-else-if="store?.hasError" class="full-height flex flex-center">
          <div class="text-center">
            <q-icon name="error" color="negative" size="3em" />
            <div class="q-mt-md text-negative">Error loading data</div>
            <div class="q-mt-sm text-caption">{{ store?.getError || 'Unknown error' }}</div>
            <q-btn color="primary" label="Retry" @click="retryFetch" class="q-mt-md" />
          </div>
        </div>

        <!-- Content when data is loaded -->
        <template v-else-if="currentDivisionData && Array.isArray(currentDivisionData.employees)">
          <!-- Fixed Report Header -->
          <div class="report-header">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">{{ currentDivisionData?.name || 'Division Report' }}</div>
                <div class="text-subtitle2">
                  Target Period: {{ targetPeriod?.semester || '' }} {{ targetPeriod?.year || '' }}
                </div>
                <!-- Show hierarchy path -->
                <div v-if="currentDivisionPath" class="text-caption text-grey-7">
                  Path: {{ currentDivisionPath }}
                </div>
              </div>
              <div class="flex justify-end q-gutter-sm">
                <q-btn color="green-9" icon="print" label="Print" @click="handlePrint" />
              </div>
            </div>
          </div>

          <!-- Scrollable Report Content -->
          <div class="report-content-scroll">
            <div class="report-content" id="print-section">
              <!-- Header with Logo -->
              <div class="header-container">
                <div class="green-line">
                  <div class="line"></div>
                </div>
                <div class="city-logo">
                  <img
                    class="logo"
                    alt="City of Tagum Logo"
                    src="https://phshirt.com/wp-content/uploads/2021/11/City-of-Tagum-Logo.png"
                  />
                </div>
                <div class="header-text">
                  <div class="text-green-9 text-caption padded-text">
                    REPUBLIC OF THE PHILIPPINES
                  </div>
                  <div class="text-green-9 text-caption padded-text">
                    PROVINCE OF DAVAO DEL NORTE
                  </div>
                  <div class="text-green-9 text-h5 text-weight-bold padded-text">CITY OF TAGUM</div>

                  <div class="green-banner">
                    <div class="padded-text">{{ currentDivisionPath.split(' / ')[0] }}</div>
                  </div>
                </div>
              </div>

              <!-- Main Content -->
              <div class="q-mt-md">
                <h2 class="text-center text-weight-bold text-h4">UNIT WORK PLAN</h2>

                <!-- Show message if no employees found -->
                <div
                  v-if="
                    !currentDivisionData.employees || currentDivisionData.employees.length === 0
                  "
                  class="text-center q-py-xl"
                >
                  <q-icon name="info" size="2em" color="grey" />
                  <div class="q-mt-md">No work plan data available for this division.</div>
                </div>

                <template v-else>
                  <table class="full-width info-table">
                    <tbody>
                      <tr>
                        <td><strong>Division:</strong> {{ currentDivisionData?.name || 'N/A' }}</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Target Period:</strong> {{ targetPeriod?.semester || '' }}
                          {{ targetPeriod?.year || '' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Main Table -->
                  <div class="table-container">
                    <table class="full-width main-table">
                      <thead class="no-repeat-header">
                        <tr>
                          <th class="text-center mfo-column">MFO</th>
                          <th colspan="3" class="text-center competency-header">
                            REQUIRED COMPETENCY & PROFICIENCY LEVEL
                          </th>
                          <th rowspan="2" class="text-center indicator-column">
                            SUCCESS INDICATOR
                          </th>
                          <th rowspan="2" class="text-center output-column">REQUIRED OUTPUT</th>
                          <th class="text-center standards-header" colspan="5">
                            STANDARDS PER OUTPUT/SUCCESS INDICATOR
                          </th>
                        </tr>
                        <tr>
                          <th class="text-left">CORE FUNCTIONS</th>
                          <th class="text-left competency-column">CORE</th>
                          <th class="text-left competency-column">TECHNICAL</th>
                          <th class="text-left competency-column">LEADERSHIP</th>
                          <th class="text-center standard-column">5</th>
                          <th class="text-center standard-column">4</th>
                          <th class="text-center standard-column">3</th>
                          <th class="text-center standard-column">2</th>
                          <th class="text-center standard-column">1</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template
                          v-for="(mfoSection, sectionIndex) in getOrganizedData()"
                          :key="sectionIndex"
                        >
                          <!-- Office Head Section for this MFO -->
                          <tr>
                            <td>Employee:</td>
                            <td colspan="10">{{ mfoSection.officeHead.name || 'N/A' }}</td>
                          </tr>
                          <tr>
                            <td>Position/SG:</td>
                            <td colspan="10">
                              {{ mfoSection.officeHead.position || 'N/A' }} -
                              {{ mfoSection.officeHead.sg || '0' }}
                            </td>
                          </tr>
                          <tr>
                            <td>Employee Rank:</td>
                            <td colspan="10">{{ mfoSection.officeHead.rank || 'N/A' }}</td>
                          </tr>

                          <!-- Office Head MFO Output -->
                          <tr v-if="mfoSection.officeOutput">
                            <td>MFO: {{ mfoSection.mfoName || 'N/A' }}</td>
                            <td>
                              <div
                                v-html="formatCompetencies(mfoSection.officeHead.sg, 'core')"
                              ></div>
                            </td>
                            <td>
                              <div
                                v-html="formatCompetencies(mfoSection.officeHead.sg, 'technical')"
                              ></div>
                            </td>
                            <td>
                              <div
                                v-html="formatCompetencies(mfoSection.officeHead.sg, 'leadership')"
                              ></div>
                            </td>
                            <td>{{ mfoSection.officeOutput.indicator || 'N/A' }}</td>
                            <td>{{ mfoSection.officeOutput.required || 'N/A' }}</td>
                            <td class="standard-cell">
                              {{ mfoSection.officeOutput.standard5 || 'N/A' }}
                            </td>
                            <td class="standard-cell">
                              {{ mfoSection.officeOutput.standard4 || 'N/A' }}
                            </td>
                            <td class="standard-cell">
                              {{ mfoSection.officeOutput.standard3 || 'N/A' }}
                            </td>
                            <td class="standard-cell">
                              {{ mfoSection.officeOutput.standard2 || 'N/A' }}
                            </td>
                            <td class="standard-cell">
                              {{ mfoSection.officeOutput.standard1 || 'N/A' }}
                            </td>
                          </tr>

                          <!-- Organization Employees for this MFO -->
                          <template
                            v-for="(orgEmployee, empIndex) in mfoSection.orgEmployees"
                            :key="empIndex"
                          >
                            <!-- Only show employee header if different from previous -->
                            <template
                              v-if="
                                empIndex === 0 ||
                                orgEmployee.name !== mfoSection.orgEmployees[empIndex - 1]?.name
                              "
                            >
                              <tr>
                                <td>Employee:</td>
                                <td colspan="10">{{ orgEmployee.name || 'N/A' }}</td>
                              </tr>
                              <tr>
                                <td>Position/SG:</td>
                                <td colspan="10">
                                  {{ orgEmployee.position || 'N/A' }} -
                                  {{ orgEmployee.sg || 'N/A' }}
                                </td>
                              </tr>
                              <tr>
                                <td>Employee Rank:</td>
                                <td colspan="10">{{ orgEmployee.rank || 'N/A' }}</td>
                              </tr>
                            </template>

                            <!-- Organization Employee Outputs -->
                            <tr
                              v-for="(output, outIndex) in orgEmployee.outputs"
                              :key="`${empIndex}-${outIndex}`"
                            >
                              <!-- Show output name in CORE FUNCTIONS column for organization employees -->
                              <td>Output: {{ output?.name || 'N/A' }}</td>
                              <td>
                                <div v-html="formatCompetencies(orgEmployee.sg, 'core')"></div>
                              </td>
                              <td>
                                <div v-html="formatCompetencies(orgEmployee.sg, 'technical')"></div>
                              </td>
                              <td>
                                <div
                                  v-html="formatCompetencies(orgEmployee.sg, 'leadership')"
                                ></div>
                              </td>
                              <td>{{ output?.indicator || 'N/A' }}</td>
                              <td>{{ output?.required || 'N/A' }}</td>
                              <td class="standard-cell">{{ output?.standard5 || 'N/A' }}</td>
                              <td class="standard-cell">{{ output?.standard4 || 'N/A' }}</td>
                              <td class="standard-cell">{{ output?.standard3 || 'N/A' }}</td>
                              <td class="standard-cell">{{ output?.standard2 || 'N/A' }}</td>
                              <td class="standard-cell">{{ output?.standard1 || 'N/A' }}</td>
                            </tr>
                          </template>
                        </template>
                      </tbody>
                    </table>
                  </div>
                </template>

                <!-- Signature Section -->
                <div class="q-mt-xl">
                  <!-- Conformed and Agreed by (Employee rank) -->
                  <div v-if="getEmployeesByRank('Employee').length > 0" class="q-mb-lg">
                    <div class="text-weight-bold">Conformed and Agreed by:</div>
                    <div class="row q-mt-md">
                      <div
                        v-for="(emp, index) in getEmployeesByRank('Employee')"
                        :key="`employee-${index}`"
                        :class="getEmployeesByRank('Employee').length === 1 ? 'col-12' : 'col-6'"
                      >
                        <div class="text-center q-mt-lg">
                          <div class="text-weight-bold" style="text-decoration: underline">
                            {{ emp.name.toUpperCase() }}
                          </div>
                          <div>{{ emp.position }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Reviewed and Assessed by (Supervisory rank) -->
                  <div v-if="getEmployeesByRank('Supervisory').length > 0" class="q-mb-lg">
                    <div class="text-weight-bold">Reviewed and Assessed by:</div>
                    <div class="row q-mt-md">
                      <div
                        v-for="(emp, index) in getEmployeesByRank('Supervisory')"
                        :key="`supervisory-${index}`"
                        :class="getEmployeesByRank('Supervisory').length === 1 ? 'col-12' : 'col-6'"
                      >
                        <div class="text-center q-mt-lg">
                          <div class="text-weight-bold" style="text-decoration: underline">
                            {{ emp.name.toUpperCase() }}
                          </div>
                          <div>{{ emp.position }}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Noted by (Managerial rank) -->
                  <div v-if="getEmployeesByRank('Managerial').length > 0" class="q-mb-lg">
                    <div class="text-weight-bold">Noted by:</div>
                    <div class="row q-mt-md">
                      <div
                        v-for="(emp, index) in getEmployeesByRank('Managerial')"
                        :key="`managerial-${index}`"
                        :class="getEmployeesByRank('Managerial').length === 1 ? 'col-12' : 'col-6'"
                      >
                        <div class="text-center q-mt-lg">
                          <div class="text-weight-bold" style="text-decoration: underline">
                            {{ emp.name.toUpperCase() }}
                          </div>
                          <div>{{ emp.position }}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Initial state when no division selected -->
        <div v-else-if="!selectedDivision" class="full-height flex flex-center">
          <div class="text-center text-grey">
            <q-icon name="description" size="4em" />
            <div class="q-mt-md text-h6">Select a division to view report</div>
            <div class="q-mt-sm text-caption">Choose a division from the left navigation</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import tagumLogo from 'src/assets/tagumlogo.png'

import { onMounted, ref, computed, watch } from 'vue'
import { useUnitWorkPlanReportStore } from 'src/stores/office/uwpDataStore'
import { useCompetencyStore } from 'src/stores/competencyStore'

export default {
  name: 'UnitWorkPlanReport',

  props: {
    targetPeriod: {
      type: Object,
      default: () => ({
        semester: '',
        year: '',
      }),
    },
    filteredDivisions: {
      type: Array,
      default: () => [],
    },
    officeStructure: {
      type: Array,
      default: () => [],
    },
    firstSubLevel: {
      type: Array,
      default: () => [],
    },
    selectedNodeLabel: {
      type: String,
      default: '',
    },
    showApprovedButton: {
      type: Boolean,
      default: false,
    },
  },

  setup(props) {
    const store = useUnitWorkPlanReportStore()
    const competencyStore = useCompetencyStore()
    const currentDivisionData = ref(null)
    const selectedDivision = ref('')
    const currentDivisionPath = ref('')

    // Dynamic user data - will be populated from API response
    const staticUserData = ref({
      officeName: 'City Human Resource Management Office', // Default fallback
    })

    // Proficiency level to number mapping
    const proficiencyLevelMap = {
      Superior: 5,
      Advanced: 4,
      Intermediate: 3,
      Basic: 2,
      '-': '-',
    }

    // Function to format competencies based on SG
    const formatCompetencies = (sg, type) => {
      console.log(`🔧 Formatting competencies for SG: ${sg}, type: ${type}`)

      // Handle null, undefined, and other invalid SGs
      if (sg === null || sg === undefined || sg === 'null' || sg === 'undefined') {
        console.log('⚠️ SG is null or undefined')
        return 'N/A'
      }

      const sgStr = String(sg).trim()

      if (sgStr === '' || sgStr === '0' || sgStr === 'N/A') {
        console.log('⚠️ No valid SG provided:', sgStr)
        return 'N/A'
      }

      // Clean the SG value
      const cleanSG = sgStr.replace(/\D/g, '')

      if (!cleanSG || cleanSG === '') {
        console.log(`⚠️ No numeric SG found in: ${sgStr}`)
        return 'N/A'
      }

      console.log(`🔧 Cleaned SG: ${cleanSG}`)

      // IMPORTANT: The competency store expects SG ranges like "23-25", "20-22", etc.
      // Need to map numeric SG to the correct range
      const sgNum = parseInt(cleanSG)
      console.log(`🔧 SG as number: ${sgNum}`)

      // First, determine the level based on SG
      // According to your store structure: 15+ = "2nd Level", below 15 = "1st Level"
      const level = sgNum >= 15 ? '2nd Level' : '1st Level'
      console.log(`🔧 Determined level: ${level} for SG ${sgNum}`)

      // Now find the SG range in the competency store
      const competencyRow = findCompetencyBySGRange(level, sgNum)
      console.log(`🔧 Competency row found:`, competencyRow)

      if (!competencyRow) {
        console.log(`❌ No competency row found for SG ${sgNum} in level ${level}`)
        return 'N/A'
      }

      // Get descriptions for the type
      const descriptions = competencyStore.descriptions[type]
      if (!descriptions) {
        console.log(`❌ No descriptions found for type ${type}`)
        return 'N/A'
      }

      console.log(`🔧 Descriptions for ${type}:`, descriptions)

      const competencies = []

      // Loop through each competency code in descriptions
      for (const [code, description] of Object.entries(descriptions)) {
        const proficiencyLevel = competencyRow[code]
        const proficiencyNumber = proficiencyLevelMap[proficiencyLevel] || '-'

        console.log(`🔧 Processing ${code}:`, {
          description,
          proficiencyLevel,
          proficiencyNumber,
        })

        if (proficiencyLevel && proficiencyLevel !== '-') {
          competencies.push(`${code} - ${proficiencyNumber}`)
        }
      }

      console.log(`✅ Final competencies for SG ${sgNum}, type ${type}:`, competencies)

      return competencies.length > 0 ? competencies.join('<br>') : 'N/A'
    }

    // Helper function to find the correct SG range
    const findCompetencyBySGRange = (level, sgNum) => {
      const levelData = competencyStore.byLevel[level]
      if (!levelData) return null

      // Check single SGs first (e.g., "14", "13")
      if (levelData[sgNum.toString()]) {
        return levelData[sgNum.toString()]
      }

      // Check SG ranges (e.g., "15-17", "18-19")
      for (const [range, competencies] of Object.entries(levelData)) {
        if (range.includes('-')) {
          const [minStr, maxStr] = range.split('-')
          const min = parseInt(minStr)
          const max = parseInt(maxStr)

          if (!isNaN(min) && !isNaN(max) && sgNum >= min && sgNum <= max) {
            return competencies
          }
        }
      }

      // For 2nd Level, check these specific ranges
      if (level === '2nd Level') {
        if (sgNum >= 23 && sgNum <= 25) return levelData['23-25']
        if (sgNum >= 20 && sgNum <= 22) return levelData['20-22']
        if (sgNum >= 18 && sgNum <= 19) return levelData['18-19']
        if (sgNum >= 15 && sgNum <= 17) return levelData['15-17']
        if (sgNum === 14) return levelData['14']
        if (sgNum >= 12 && sgNum <= 13) return levelData['12-13']
        if (sgNum >= 9 && sgNum <= 11) return levelData['9-11']
      }

      // For 1st Level
      if (level === '1st Level') {
        if (sgNum === 18) return levelData['18']
        if (sgNum === 14) return levelData['14']
        if (sgNum === 13) return levelData['13']
        if (sgNum >= 11 && sgNum <= 12) return levelData['11-12']
        if (sgNum === 10) return levelData['10']
        if (sgNum >= 8 && sgNum <= 9) return levelData['8-9']
        if (sgNum >= 3 && sgNum <= 7) return levelData['3-7']
      }

      return null
    }

    // Navigation items
    const navigationItems = computed(() => {
      if (props.firstSubLevel && Array.isArray(props.firstSubLevel)) {
        return props.firstSubLevel.map((node) => ({
          id: node?.id || '',
          label: node?.label || '',
          type: node?.type || '',
          children: node?.children || [],
        }))
      } else if (props.filteredDivisions && Array.isArray(props.filteredDivisions)) {
        return props.filteredDivisions
      } else {
        return [
          {
            id: 'hr-development',
            label: 'Human Resource Development',
            type: 'division',
          },
          {
            id: 'personnel-management',
            label: 'Personnel Management',
            type: 'division',
          },
          {
            id: 'records-management',
            label: 'Records Management',
            type: 'division',
          },
        ]
      }
    })

    // Function to get hierarchy path
    const getHierarchyPath = (nodeId, nodes = props.officeStructure) => {
      if (!nodeId || !nodes || !Array.isArray(nodes)) return ''

      const path = []

      const findPath = (targetId, currentNodes, currentPath) => {
        if (!currentNodes || !Array.isArray(currentNodes)) return false

        for (const node of currentNodes) {
          if (!node) continue

          const newPath = [...currentPath, node?.label || '']

          if (node?.id === targetId) {
            path.push(...newPath)
            return true
          }

          if (node?.children && findPath(targetId, node.children, newPath)) {
            return true
          }
        }
        return false
      }

      findPath(nodeId, nodes, [])
      return path.filter(Boolean).join(' / ')
    }

    const getOrganizedData = () => {
      if (!currentDivisionData.value || !Array.isArray(currentDivisionData.value.employees)) {
        console.log('⚠️ No current division data or employees array')
        return []
      }

      const employees = currentDivisionData.value.employees
      console.log('🔧 Employees data for organization:', JSON.stringify(employees, null, 2))

      // Log all SGs for debugging
      employees.forEach((emp, idx) => {
        console.log(`Employee ${idx}: ${emp.name}, SG: "${emp.sg}", Type: ${typeof emp.sg}`)
      })

      const organized = []
      let currentSection = null

      // Group employees by MFO
      employees.forEach((employee, index) => {
        console.log(`🔧 Processing employee ${index}:`, {
          name: employee.name,
          isMfoHeader: employee.isMfoHeader,
          isOfficeHead: employee.isOfficeHead,
          outputs: employee.outputs,
        })

        if (employee.isMfoHeader && employee.outputs && employee.outputs[0]) {
          // Start a new MFO section
          currentSection = {
            mfoName: employee.mfoName || employee.outputs[0].name || 'Unnamed MFO',
            officeHead: {
              name: employee.name || 'N/A',
              position: employee.position || 'N/A',
              sg: employee.sg || '0',
              rank: employee.rank || 'N/A',
            },
            officeOutput: employee.outputs[0],
            orgEmployees: [],
          }
          console.log('🔧 Created new MFO section:', currentSection)
          organized.push(currentSection)
        } else if (!employee.isOfficeHead && currentSection) {
          // Add org employee to current MFO section
          console.log('🔧 Adding org employee to current section:', {
            name: employee.name,
            outputs: employee.outputs,
          })
          currentSection.orgEmployees.push({
            name: employee.name || 'N/A',
            position: employee.position || 'N/A',
            sg: employee.sg || '0',
            level: employee.level || '1',
            rank: employee.rank || 'N/A',
            outputs: employee.outputs || [],
          })
        }
      })

      console.log('✅ Final organized data:', JSON.stringify(organized, null, 2))
      return organized
    }

    // Function to get employees by rank for signature section
    const getEmployeesByRank = (rank) => {
      if (!currentDivisionData.value || !Array.isArray(currentDivisionData.value.employees)) {
        return []
      }

      const uniqueEmployees = new Map()

      currentDivisionData.value.employees.forEach((employee) => {
        if (employee.rank === rank && employee.name && employee.position) {
          // Use name as key to avoid duplicates
          if (!uniqueEmployees.has(employee.name)) {
            uniqueEmployees.set(employee.name, {
              name: employee.name,
              position: employee.position,
              rank: employee.rank,
            })
          }
        }
      })

      return Array.from(uniqueEmployees.values())
    }

    // Retry function
    const retryFetch = async () => {
      if (selectedDivision.value) {
        const currentDivision = navigationItems.value?.find(
          (div) => div?.id === selectedDivision.value,
        )
        if (currentDivision) {
          await fetchCurrentDivisionData(currentDivision)
        }
      }
    }

    // Fetch data from store
    const fetchCurrentDivisionData = async (division) => {
      try {
        if (!division || !division.id) {
          console.warn('No valid division provided')
          return
        }

        console.log('Fetching data for division:', division)

        // Clear previous data
        currentDivisionData.value = null

        // Set hierarchy path
        currentDivisionPath.value = getHierarchyPath(division.id)

        // Prepare filters for the store
        const filters = {
          organization: division.label || '',
          semester: props.targetPeriod?.semester || '',
          year: props.targetPeriod?.year || '',
          nodeId: division.id || '',
          nodeType: division.type || '',
          hierarchyPath: currentDivisionPath.value || '',
        }

        console.log('Using filters:', filters)

        // Fetch data from store
        await store.fetchUnitWorkPlan(filters)

        // Update office name from API response
        if (store.data?.office?.name) {
          staticUserData.value.officeName = store.data.office.name
          console.log('✅ Updated office name to:', staticUserData.value.officeName)
        } else if (store.data?.organization?.name) {
          staticUserData.value.officeName = store.data.organization.name
          console.log('✅ Updated office name from organization:', staticUserData.value.officeName)
        }

        // Get transformed data from store
        const reportData = store.getReportData
        console.log('Received report data:', reportData)

        if (reportData && Array.isArray(reportData.employees)) {
          currentDivisionData.value = {
            name: reportData.name || division.label || 'Division Report',
            employees: reportData.employees || [],
          }
        } else {
          // Fallback if no data returned
          currentDivisionData.value = {
            name: division.label || 'Division Report',
            employees: [],
          }
        }

        console.log('Current division data:', currentDivisionData.value)
      } catch (error) {
        console.error('Error in fetchCurrentDivisionData:', error)
        // Set empty data to prevent rendering errors
        currentDivisionData.value = {
          name: division?.label || 'Division Report',
          employees: [],
        }
      }
    }

    const selectDivision = async (division) => {
      try {
        selectedDivision.value = division?.id || ''
        await fetchCurrentDivisionData(division)
      } catch (error) {
        console.error('Error in selectDivision:', error)
      }
    }

    const handlePrint = async () => {
      try {
        // Import pdfmake
        const pdfMake = await import('pdfmake/build/pdfmake')
        const pdfMakeInstance = pdfMake.default || pdfMake

        // Import fonts
        const vfsFonts = await import('pdfmake/build/vfs_fonts')
        pdfMakeInstance.vfs = vfsFonts.default || vfsFonts.pdfMake?.vfs

        // Use the imported logo (Quasar/Vite converts this to base64 during build)
        let logoBase64 = tagumLogo

        // If for some reason it's not base64, try to convert it
        if (logoBase64 && !logoBase64.startsWith('data:image')) {
          try {
            const response = await fetch(logoBase64)
            if (response.ok) {
              const blob = await response.blob()
              logoBase64 = await new Promise((resolve) => {
                const reader = new FileReader()
                reader.onloadend = () => resolve(reader.result)
                reader.readAsDataURL(blob)
              })
            }
          } catch (error) {
            console.warn('Could not convert logo to base64:', error)
          }
        }

        // Prepare table data for PDF
        const organizedData = getOrganizedData()

        // Get employees grouped by rank
        const employeeRank = getEmployeesByRank('Employee')
        const supervisoryRank = getEmployeesByRank('Supervisory')
        const managerialRank = getEmployeesByRank('Managerial')

        // Build PDF table rows
        const tableRows = []

        // Add table headers (EXACTLY like in template)
        tableRows.push([
          { text: 'MFO', style: 'tableHeader', colSpan: 1, rowSpan: 2, alignment: 'center' },
          {
            text: 'REQUIRED COMPETENCY & PROFICIENCY LEVEL',
            style: 'tableHeader',
            colSpan: 3,
            alignment: 'center',
          },
          '', // Empty for colspan
          '', // Empty for colspan
          { text: 'SUCCESS INDICATOR', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
          { text: 'REQUIRED OUTPUT', style: 'tableHeader', rowSpan: 2, alignment: 'center' },
          {
            text: 'STANDARDS PER OUTPUT/SUCCESS INDICATOR',
            style: 'tableHeader',
            colSpan: 5,
            alignment: 'center',
          },
          '',
          '',
          '',
          '', // Empty for colspan
        ])

        tableRows.push([
          { text: 'CORE FUNCTIONS', style: 'tableSubHeader', alignment: 'left' },
          { text: 'CORE', style: 'tableSubHeader', alignment: 'left' },
          { text: 'TECHNICAL', style: 'tableSubHeader', alignment: 'left' },
          { text: 'LEADERSHIP', style: 'tableSubHeader', alignment: 'left' },
          '', // Empty
          '', // Empty
          { text: '5', style: 'tableSubHeader', alignment: 'center' },
          { text: '4', style: 'tableSubHeader', alignment: 'center' },
          { text: '3', style: 'tableSubHeader', alignment: 'center' },
          { text: '2', style: 'tableSubHeader', alignment: 'center' },
          { text: '1', style: 'tableSubHeader', alignment: 'center' },
        ])

        // Add data rows for each MFO section (same structure as template)
        organizedData.forEach((mfoSection) => {
          // Add office head information
          tableRows.push([
            { text: 'Employee:', style: 'labelCell', colSpan: 1 },
            { text: mfoSection.officeHead.name || 'N/A', style: 'dataCell', colSpan: 10 },
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '', // Empty cells for colspan
          ])

          tableRows.push([
            { text: 'Position/SG:', style: 'labelCell' },
            {
              text: `${mfoSection.officeHead.position || 'N/A'} - ${mfoSection.officeHead.sg || '0'}`,
              style: 'dataCell',
              colSpan: 10,
            },
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
          ])

          tableRows.push([
            { text: 'Employee Rank:', style: 'labelCell' },
            { text: mfoSection.officeHead.rank || 'N/A', style: 'dataCell', colSpan: 10 },
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
          ])

          // Add office head MFO output
          if (mfoSection.officeOutput) {
            tableRows.push([
              { text: `MFO: ${mfoSection.mfoName || 'N/A'}`, style: 'mfoCell', vAlign: 'center' },
              {
                text: formatCompetenciesForPDF(mfoSection.officeHead.sg, 'core'),
                style: 'competencyCell',
              },
              {
                text: formatCompetenciesForPDF(mfoSection.officeHead.sg, 'technical'),
                style: 'competencyCell',
              },
              {
                text: formatCompetenciesForPDF(mfoSection.officeHead.sg, 'leadership'),
                style: 'competencyCell',
              },
              { text: mfoSection.officeOutput.indicator || 'N/A', style: 'dataCell' },
              { text: mfoSection.officeOutput.required || 'N/A', style: 'dataCell' },
              {
                text: mfoSection.officeOutput.standard5 || 'N/A',
                style: 'standardCell',
                alignment: 'left',
              },
              {
                text: mfoSection.officeOutput.standard4 || 'N/A',
                style: 'standardCell',
                alignment: 'left',
              },
              {
                text: mfoSection.officeOutput.standard3 || 'N/A',
                style: 'standardCell',
                alignment: 'left',
              },
              {
                text: mfoSection.officeOutput.standard2 || 'N/A',
                style: 'standardCell',
                alignment: 'left',
              },
              {
                text: mfoSection.officeOutput.standard1 || 'N/A',
                style: 'standardCell',
                alignment: 'left',
              },
            ])
          }

          // Add organization employees
          mfoSection.orgEmployees.forEach((orgEmployee, empIndex) => {
            // Add employee header if different from previous
            const isNewEmployee =
              empIndex === 0 || orgEmployee.name !== mfoSection.orgEmployees[empIndex - 1]?.name

            if (isNewEmployee) {
              tableRows.push([
                { text: 'Employee:', style: 'labelCell' },
                { text: orgEmployee.name || 'N/A', style: 'dataCell', colSpan: 10 },
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
              ])

              tableRows.push([
                { text: 'Position/SG:', style: 'labelCell' },
                {
                  text: `${orgEmployee.position || 'N/A'} - ${orgEmployee.sg || 'N/A'}`,
                  style: 'dataCell',
                  colSpan: 10,
                },
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
              ])

              tableRows.push([
                { text: 'Employee Rank:', style: 'labelCell' },
                { text: orgEmployee.rank || 'N/A', style: 'dataCell', colSpan: 10 },
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
                '',
              ])
            }

            // Add outputs for this employee
            orgEmployee.outputs.forEach((output) => {
              tableRows.push([
                { text: `Output: ${output?.name || 'N/A'}`, style: 'outputCell' },
                {
                  text: formatCompetenciesForPDF(orgEmployee.sg, 'core'),
                  style: 'competencyCell',
                },
                {
                  text: formatCompetenciesForPDF(orgEmployee.sg, 'technical'),
                  style: 'competencyCell',
                },
                {
                  text: formatCompetenciesForPDF(orgEmployee.sg, 'leadership'),
                  style: 'competencyCell',
                },
                { text: output?.indicator || 'N/A', style: 'dataCell' },
                { text: output?.required || 'N/A', style: 'dataCell' },
                { text: output?.standard5 || 'N/A', style: 'standardCell', alignment: 'left' },
                { text: output?.standard4 || 'N/A', style: 'standardCell', alignment: 'left' },
                { text: output?.standard3 || 'N/A', style: 'standardCell', alignment: 'left' },
                { text: output?.standard2 || 'N/A', style: 'standardCell', alignment: 'left' },
                { text: output?.standard1 || 'N/A', style: 'standardCell', alignment: 'left' },
              ])
            })
          })
        })

        const docDefinition = {
          pageSize: 'LEGAL',
          pageOrientation: 'landscape',
          pageMargins: [40, 100, 40, 60], // Adjusted for the exact header layout
          header: function () {
            return {
              stack: [
                // Green banner
                {
                  canvas: [
                    {
                      type: 'rect',
                      x: (1008 - 936) / 2,
                      y: 60,
                      w: 936,
                      h: 25,
                      color: '#036431',
                    },
                  ],
                },

                {
                  margin: [72, -65, 72, 0],
                  columns: [
                    {
                      width: 65,
                      stack: [
                        {
                          canvas: [
                            {
                              type: 'rect',
                              x: 0,
                              y: 0,
                              w: 75,
                              h: 80,
                              color: '#ffffff',
                            },
                          ],
                        },

                        ...(logoBase64
                          ? [
                              {
                                image: logoBase64,
                                width: 65,
                                height: 65,
                                absolutePosition: { x: 77, y: 22 },
                              },
                            ]
                          : []),
                      ],
                    },
                    {
                      width: '*',
                      margin: [15, -15, 0, 0],
                      stack: [
                        {
                          text: 'REPUBLIC OF THE PHILIPPINES',
                          fontSize: 8,
                          color: '#00703c',
                          alignment: 'left',
                          margin: [0, 20, 0, 2],
                        },
                        {
                          text: 'PROVINCE OF DAVAO DEL NORTE',
                          fontSize: 8,
                          color: '#00703c',
                          alignment: 'left',
                          margin: [0, 0, 0, 2],
                        },

                        {
                          text: 'CITY OF TAGUM',
                          fontSize: 10,
                          bold: true,
                          color: '#00703c',
                          alignment: 'left',
                        },

                        {
                          text: 'OFFICE OF THE CITY INFORMATION AND COMMUNICATIONS TECHNOLOGY MANAGEMENT OFFICER',
                          fontSize: 13,
                          bold: true,
                          color: 'white',
                          margin: [0, 5, 0, 0],
                        },

                        // {
                        //   text: currentDivisionPath.value.split(' / ')[0],
                        //   fontSize: 13,
                        //   bold: true,
                        //   color: 'white',
                        //   margin: [0, 5, 0, 0],
                        // },
                      ],
                    },
                  ],
                },
              ],
            }
          },

          content: [
            // Main title
            {
              text: 'UNIT WORK PLAN',
              fontSize: 14,
              bold: true,
              margin: [0, 0, 0, 10],
              alignment: 'center',
            },

            // Division and period info table (like in template)
            {
              table: {
                widths: ['100%'],
                body: [
                  [
                    {
                      text: [
                        { text: 'Division: ', bold: true },
                        currentDivisionData.value?.name || 'N/A',
                      ],
                      fontSize: 9,
                    },
                  ],
                  [
                    {
                      text: [
                        { text: 'Target Period: ', bold: true },
                        `${props.targetPeriod?.semester || ''} ${props.targetPeriod?.year || ''}`,
                      ],
                      fontSize: 9,
                    },
                  ],
                ],
              },
              margin: [0, 0, 0, 15],
            },

            // Main table
            {
              table: {
                headerRows: 2,
                widths: ['12%', '8%', '8%', '8%', '12%', '12%', '8%', '8%', '8%', '8%', '8%'],
                body: tableRows,
              },
              margin: [0, 0, 0, 0],
              layout: {
                hLineWidth: function (i, node) {
                  return i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5
                },
                vLineWidth: function (i, node) {
                  return i === 0 || i === node.table.widths.length ? 1 : 0.5
                },
                hLineColor: function () {
                  return '#000000'
                },
                vLineColor: function () {
                  return '#000000'
                },
                paddingLeft: function () {
                  return 3
                },
                paddingRight: function () {
                  return 3
                },
                paddingTop: function () {
                  return 2
                },
                paddingBottom: function () {
                  return 2
                },
              },
            },

            // Signature section - Smart responsive layout
            {
              stack: [
                // Only show if there are any signatures
                ...(employeeRank.length > 0 ||
                supervisoryRank.length > 0 ||
                managerialRank.length > 0
                  ? [
                      // Determine layout based on content height
                      ...(() => {
                        // Estimate the height each section will take
                        // Each employee takes ~40pts (name + position + spacing)
                        const employeeHeight = employeeRank.length * 40 + 30 // +30 for header
                        const supervisoryHeight = supervisoryRank.length * 40 + 30
                        const managerialHeight = managerialRank.length * 40 + 30

                        // Get the maximum height among all sections
                        const maxHeight = Math.max(
                          employeeHeight,
                          supervisoryHeight,
                          managerialHeight,
                        )

                        // If any section is very tall (more than 150pts), use vertical stacking
                        // Otherwise, use horizontal layout
                        const useHorizontalLayout =
                          maxHeight < 150 &&
                          employeeHeight + supervisoryHeight + managerialHeight < 250

                        if (useHorizontalLayout) {
                          // HORIZONTAL LAYOUT - all sections side by side
                          return [
                            {
                              columns: [
                                // Column 1: Conformed and Agreed by
                                ...(employeeRank.length > 0
                                  ? [
                                      {
                                        width: '*',
                                        stack: [
                                          {
                                            text: 'Conformed and Agreed by:',
                                            fontSize: 9,
                                            bold: true,
                                            margin: [0, 0, 0, 10],
                                            alignment: 'center',
                                          },
                                          ...employeeRank.map((emp) => ({
                                            stack: [
                                              {
                                                text: emp.name.toUpperCase(),
                                                fontSize: 9,
                                                bold: true,
                                                decoration: 'underline',
                                                alignment: 'center',
                                                margin: [0, 20, 0, 5],
                                              },
                                              {
                                                text: emp.position,
                                                fontSize: 8,
                                                alignment: 'center',
                                                margin: [0, 0, 0, 0],
                                              },
                                            ],
                                          })),
                                        ],
                                      },
                                    ]
                                  : []),

                                // Column 2: Reviewed and Assessed by
                                ...(supervisoryRank.length > 0
                                  ? [
                                      {
                                        width: '*',
                                        stack: [
                                          {
                                            text: 'Reviewed and Assessed by:',
                                            fontSize: 9,
                                            bold: true,
                                            margin: [0, 0, 0, 10],
                                            alignment: 'center',
                                          },
                                          ...supervisoryRank.map((emp) => ({
                                            stack: [
                                              {
                                                text: emp.name.toUpperCase(),
                                                fontSize: 9,
                                                bold: true,
                                                decoration: 'underline',
                                                alignment: 'center',
                                                margin: [0, 20, 0, 5],
                                              },
                                              {
                                                text: emp.position,
                                                fontSize: 8,
                                                alignment: 'center',
                                                margin: [0, 0, 0, 0],
                                              },
                                            ],
                                          })),
                                        ],
                                      },
                                    ]
                                  : []),

                                // Column 3: Noted by
                                ...(managerialRank.length > 0
                                  ? [
                                      {
                                        width: '*',
                                        stack: [
                                          {
                                            text: 'Noted by:',
                                            fontSize: 9,
                                            bold: true,
                                            margin: [0, 0, 0, 10],
                                            alignment: 'center',
                                          },
                                          ...managerialRank.map((emp) => ({
                                            stack: [
                                              {
                                                text: emp.name.toUpperCase(),
                                                fontSize: 9,
                                                bold: true,
                                                decoration: 'underline',
                                                alignment: 'center',
                                                margin: [0, 20, 0, 5],
                                              },
                                              {
                                                text: emp.position,
                                                fontSize: 8,
                                                alignment: 'center',
                                                margin: [0, 0, 0, 0],
                                              },
                                            ],
                                          })),
                                        ],
                                      },
                                    ]
                                  : []),
                              ],
                              columnGap: 20,
                              margin: [0, 0, 0, 0],
                            },
                          ]
                        } else {
                          // VERTICAL LAYOUT - sections stacked one below another
                          const sections = []

                          // Conformed and Agreed by
                          if (employeeRank.length > 0) {
                            sections.push({
                              text: 'Conformed and Agreed by:',
                              fontSize: 9,
                              bold: true,
                              margin: [0, 20, 0, 10],
                              alignment: 'center',
                            })

                            // Create a row for employee signatures
                            sections.push({
                              columns: employeeRank.map((emp) => ({
                                width: '*',
                                stack: [
                                  {
                                    text: emp.name.toUpperCase(),
                                    fontSize: 9,
                                    bold: true,
                                    decoration: 'underline',
                                    alignment: 'center',
                                    margin: [0, 20, 0, 5],
                                  },
                                  {
                                    text: emp.position,
                                    fontSize: 8,
                                    alignment: 'center',
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              })),
                              columnGap: 10,
                              margin: [0, 0, 0, 0],
                            })
                          }

                          // Reviewed and Assessed by
                          if (supervisoryRank.length > 0) {
                            sections.push({
                              text: 'Reviewed and Assessed by:',
                              fontSize: 9,
                              bold: true,
                              margin: [0, 20, 0, 10],
                              alignment: 'center',
                            })

                            sections.push({
                              columns: supervisoryRank.map((emp) => ({
                                width: '*',
                                stack: [
                                  {
                                    text: emp.name.toUpperCase(),
                                    fontSize: 9,
                                    bold: true,
                                    decoration: 'underline',
                                    alignment: 'center',
                                    margin: [0, 20, 0, 5],
                                  },
                                  {
                                    text: emp.position,
                                    fontSize: 8,
                                    alignment: 'center',
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              })),
                              columnGap: 10,
                              margin: [0, 0, 0, 0],
                            })
                          }

                          // Noted by
                          if (managerialRank.length > 0) {
                            sections.push({
                              text: 'Noted by:',
                              fontSize: 9,
                              bold: true,
                              margin: [0, 20, 0, 10],
                              alignment: 'center',
                            })

                            sections.push({
                              columns: managerialRank.map((emp) => ({
                                width: '*',
                                stack: [
                                  {
                                    text: emp.name.toUpperCase(),
                                    fontSize: 9,
                                    bold: true,
                                    decoration: 'underline',
                                    alignment: 'center',
                                    margin: [0, 20, 0, 5],
                                  },
                                  {
                                    text: emp.position,
                                    fontSize: 8,
                                    alignment: 'center',
                                    margin: [0, 0, 0, 0],
                                  },
                                ],
                              })),
                              columnGap: 10,
                              margin: [0, 0, 0, 0],
                            })
                          }

                          return sections
                        }
                      })(),
                    ]
                  : []),
              ],
            },
          ],

          styles: {
            tableHeader: {
              bold: true,
              fontSize: 9,

              fillColor: '#f2f2f2',
              alignment: 'center',
            },
            tableSubHeader: {
              bold: true,
              fontSize: 9,
              fillColor: '#f2f2f2',
            },
            labelCell: {
              fontSize: 9,
              bold: true,
            },
            dataCell: {
              fontSize: 9,
            },
            mfoCell: {
              fontSize: 9,
              bold: true,
            },
            outputCell: {
              fontSize: 9,
            },
            competencyCell: {
              fontSize: 9,
            },
            standardCell: {
              fontSize: 9,
            },
          },

          defaultStyle: {
            fontSize: 9,
          },
        }

        // Open PDF in browser's native viewer
        pdfMakeInstance.createPdf(docDefinition).open()
      } catch (error) {
        console.error('Error generating PDF:', error)
        // Fallback to browser print if PDF generation fails
        window.print()
      }
    }

    // Helper function for PDF competency formatting (no HTML)
    const formatCompetenciesForPDF = (sg, type) => {
      try {
        // Handle null or invalid SGs
        if (sg === null || sg === undefined || sg === 'null' || sg === 'undefined') {
          return 'N/A'
        }

        const sgStr = String(sg).trim()
        if (sgStr === '' || sgStr === '0' || sgStr === 'N/A') {
          return 'N/A'
        }

        const cleanSG = sgStr.replace(/\D/g, '')
        if (!cleanSG || cleanSG === '') {
          return 'N/A'
        }

        const sgNum = parseInt(cleanSG)
        const level = sgNum >= 15 ? '2nd Level' : '1st Level'
        const competencyRow = findCompetencyBySGRange(level, sgNum)

        if (!competencyRow) {
          return 'N/A'
        }

        const descriptions = competencyStore.descriptions[type]
        if (!descriptions) {
          return 'N/A'
        }

        const competencies = []
        for (const [code] of Object.entries(descriptions)) {
          const proficiencyLevel = competencyRow[code]
          const proficiencyNumber = proficiencyLevelMap[proficiencyLevel] || '-'

          if (proficiencyLevel && proficiencyLevel !== '-') {
            competencies.push(`${code} - ${proficiencyNumber}`)
          }
        }

        return competencies.length > 0 ? competencies.join('\n') : 'N/A'
      } catch (error) {
        console.error('Error formatting competencies for PDF:', error)
        return 'N/A'
      }
    }

    onMounted(() => {
      try {
        // Select first division by default
        if (navigationItems.value && navigationItems.value.length > 0) {
          const firstDivision = navigationItems.value[0]
          selectDivision(firstDivision)
        }
      } catch (error) {
        console.error('Error in onMounted:', error)
      }
    })

    // Watch for target period changes
    watch(
      () => props.targetPeriod,
      () => {
        try {
          if (selectedDivision.value) {
            const currentDivision = navigationItems.value?.find(
              (div) => div?.id === selectedDivision.value,
            )
            if (currentDivision) {
              fetchCurrentDivisionData(currentDivision)
            }
          }
        } catch (error) {
          console.error('Error watching target period:', error)
        }
      },
      { deep: true },
    )

    return {
      store,
      currentDivisionData,
      selectedDivision,
      currentDivisionPath,
      navigationItems,
      staticUserData,
      getOrganizedData,
      getEmployeesByRank,
      selectDivision,
      fetchCurrentDivisionData,
      retryFetch,
      handlePrint,
      formatCompetencies,
    }
  },
}
</script>

<style scoped src="../assets/office/UnitWorkPlanReport.css"></style>
