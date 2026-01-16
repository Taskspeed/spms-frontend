<template>
  <div class="app-container">
    <!-- App Header -->
    <div class="app-header">
      <div class="header-content">
        <div class="text-h6 text-white">{{ staticUserData.officeName }}</div>
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
                <q-btn color="green-9" icon="print" label="Print" />
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
                    <div class="padded-text">{{ staticUserData.officeName }}</div>
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
                            <td colspan="10">{{ mfoSection.officeHead.position || 'N/A' }}</td>
                          </tr>
                          <tr>
                            <td>Employee Rank:</td>
                            <td colspan="10">{{ mfoSection.officeHead.rank || 'N/A' }}</td>
                          </tr>

                          <!-- Office Head MFO Output -->
                          <tr v-if="mfoSection.officeOutput">
                            <td>{{ mfoSection.mfoName || 'N/A' }}</td>
                            <td>{{ mfoSection.officeOutput.core || 'N/A' }}</td>
                            <td>{{ mfoSection.officeOutput.technical || 'N/A' }}</td>
                            <td>{{ mfoSection.officeOutput.leadership || 'N/A' }}</td>
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
                                <td colspan="10">{{ orgEmployee.position || 'N/A' }}</td>
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
                              <td>{{ output?.name || 'N/A' }}</td>
                              <td>{{ output?.core || 'N/A' }}</td>
                              <td>{{ output?.technical || 'N/A' }}</td>
                              <td>{{ output?.leadership || 'N/A' }}</td>
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
                <div class="q-mt-xl row">
                  <div class="col-6">
                    <div class="text-center">Prepared by:</div>
                    <div class="text-center q-mt-lg">
                      <div class="text-weight-bold">JANYLENE A. PALERMO, MM</div>
                      <div>City Human Resource Management Officer</div>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="text-center">Approved by:</div>
                    <div class="text-center q-mt-lg">
                      <div class="text-weight-bold">HON. REY T. UY</div>
                      <div>City Mayor</div>
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
import { onMounted, ref, computed, watch } from 'vue'
import { useUnitWorkPlanReportStore } from 'src/stores/office/uwpDataStore'

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
    const currentDivisionData = ref(null)
    const selectedDivision = ref('')
    const currentDivisionPath = ref('')

    // Static user data
    const staticUserData = {
      officeName: 'City Human Resource Management Office',
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

    // In your Vue component, add debugging to getOrganizedData:
    const getOrganizedData = () => {
      if (!currentDivisionData.value || !Array.isArray(currentDivisionData.value.employees)) {
        console.log('⚠️ No current division data or employees array')
        return []
      }

      const employees = currentDivisionData.value.employees
      console.log('🔧 Employees data for organization:', JSON.stringify(employees, null, 2))

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
            rank: employee.rank || 'N/A',
            outputs: employee.outputs || [],
          })
        }
      })

      console.log('✅ Final organized data:', JSON.stringify(organized, null, 2))
      return organized
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
      selectDivision,
      fetchCurrentDivisionData,
      retryFetch,
    }
  },
}
</script>

<style scoped src="../assets/office/UnitWorkPlanReport.css"></style>
