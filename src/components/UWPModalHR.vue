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
          <div class="row items-center no-wrap q-gutter-sm">
            <div class="text-h6">Division/Section/Unit</div>
          </div>
        </div>

        <!-- Navigation List -->
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
      </div>

      <!-- Report Content Area -->
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
            <!-- <q-icon name="error" color="negative" size="3em" />
            <div class="q-mt-md text-negative">Error loading data</div> -->
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
                <div class="text-subtitle2 text-weight-medium">
                  Status:
                  <q-badge
                    :color="
                      getStatusBadgeColor(officeData?.unitworkplan_status || targetPeriod?.status)
                    "
                    :label="officeData?.unitworkplan_status || targetPeriod?.status || 'N/A'"
                    class="q-ml-xs"
                  />
                </div>
                <div class="text-subtitle2">
                  Target Period: {{ targetPeriod?.semester || '' }} {{ targetPeriod?.year || '' }}
                </div>
                <!-- <div v-if="currentDivisionPath" class="text-caption text-grey-7">
                  Path: {{ currentDivisionPath }}
                </div> -->
              </div>
              <div class="flex justify-end q-gutter-sm">
                <q-btn color="orange-9" icon="edit" label="Update" @click="openStatusModal">
                  <q-tooltip>Change Status</q-tooltip>
                </q-btn>
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

                <div
                  v-if="
                    !currentDivisionData.employees || currentDivisionData.employees.length === 0
                  "
                  class="text-center q-py-xl"
                >
                  <q-icon name="info" size="2em" color="grey" />
                  <div class="q-mt-md">
                    {{
                      currentDivisionData.errorMessage ||
                      'No work plan data available for this division.'
                    }}
                  </div>
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

                          <template
                            v-for="(orgEmployee, empIndex) in mfoSection.orgEmployees"
                            :key="empIndex"
                          >
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

                            <tr
                              v-for="(output, outIndex) in orgEmployee.outputs"
                              :key="`${empIndex}-${outIndex}`"
                            >
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
                  <div v-if="getEmployeesByRank('Rank-in-File').length > 0" class="q-mb-lg">
                    <div class="text-weight-bold">Conformed and Agreed by:</div>
                    <div class="row q-mt-md">
                      <div
                        v-for="(emp, index) in getEmployeesByRank('Rank-in-File')"
                        :key="`rank-in-file-${index}`"
                        :class="
                          getEmployeesByRank('Rank-in-File').length === 1 ? 'col-12' : 'col-6'
                        "
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

  <!-- ═══════════════════════════════════════════════════════════════════
     STATUS CONFIRMATION MODAL
═══════════════════════════════════════════════════════════════════ -->

  <q-dialog v-model="showStatusModal" persistent>
    <q-card style="min-width: 450px; max-width: 550px; border-radius: 16px; overflow: hidden">
      <!-- Modal Header with Orange Background -->
      <div style="background: #f57c00; padding: 24px 28px 20px; position: relative">
        <div class="row items-center no-wrap">
          <q-icon name="assignment_turned_in" color="white" size="28px" class="q-mr-sm" />
          <div>
            <div class="text-white text-weight-bold" style="font-size: 18px">Update Status</div>
            <div class="text-orange-2 text-caption">Change target period status</div>
          </div>
        </div>
        <q-btn
          flat
          round
          dense
          icon="close"
          class="absolute-top-right q-mt-sm q-mr-sm"
          text-color="white"
          @click="closeStatusModal"
          :disable="statusLoading"
        />
      </div>

      <!-- Modal Body -->
      <q-card-section class="q-pt-lg q-pb-md q-px-xl">
        <!-- Period Summary Card - Changed border to match orange theme -->
        <div
          class="q-pa-md rounded-borders q-mb-lg"
          style="background: #f8f9fa; border-left: 4px solid #f57c00; border-radius: 8px"
        >
          <div class="row items-center q-gutter-sm">
            <q-icon name="calendar_month" size="20px" color="orange-8" />
            <span class="text-subtitle2 text-weight-medium text-grey-8">
              {{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}
            </span>
          </div>
          <div class="row items-center q-gutter-sm q-mt-sm">
            <q-icon name="badge" size="20px" color="orange-8" />
            <span class="text-body2 text-grey-7">
              Current Status:
              <q-badge
                :color="
                  getStatusBadgeColor(officeData?.unitworkplan_status || targetPeriod?.status)
                "
                :label="officeData?.unitworkplan_status || targetPeriod?.status || 'N/A'"
                class="q-ml-sm q-pa-sm"
                style="font-size: 0.8rem"
              />
            </span>
          </div>
        </div>

        <!-- Remarks Field (Optional) -->
        <div class="q-mb-md">
          <div class="row items-center q-mb-xs">
            <div class="text-subtitle2 text-weight-medium text-grey-8">Remarks</div>
            <div class="text-caption text-grey-6 q-ml-sm">(Optional)</div>
          </div>
          <q-input
            v-model="statusRemarks"
            type="textarea"
            outlined
            dense
            placeholder="Add any comments or notes about this status change..."
            :maxlength="500"
            :rows="3"
            class="remarks-input"
            :disable="statusLoading"
          >
            <template v-slot:counter>
              <span class="text-caption text-grey-6">{{ statusRemarks.length }}/500</span>
            </template>
          </q-input>
        </div>

        <!-- Error Alert -->
        <q-slide-transition>
          <div v-if="monitorStore.error">
            <q-banner dense rounded class="text-white q-mb-md" style="background: #c62828">
              <template v-slot:avatar>
                <q-icon name="error" />
              </template>
              {{ monitorStore.error }}
            </q-banner>
          </div>
        </q-slide-transition>
      </q-card-section>

      <!-- Modal Actions -->
      <q-card-actions align="right" class="q-px-xl q-pb-lg q-pt-md bg-grey-1">
        <q-btn
          flat
          label="Returned"
          text-color="grey-7"
          icon="undo"
          :disable="statusLoading"
          @click="updateStatus('Returned')"
          style="border-radius: 8px; padding: 8px 24px; border: 1px solid #e0e0e0"
          class="q-mr-sm"
        />
        <q-btn
          label="Reviewed"
          icon="check_circle"
          color="purple"
          text-color="white"
          unelevated
          :loading="statusLoading"
          :disable="statusLoading"
          @click="updateStatus('Reviewed')"
          style="border-radius: 8px; padding: 8px 24px; min-width: 120px"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import tagumLogo from 'src/assets/tagumlogo.png'

import { onMounted, ref, computed, watch } from 'vue'
import { useUnitWorkPlanReportStore } from 'src/stores/office/uwpDataStore'
import { useCompetencyStore } from 'src/stores/competencyStore'
import { useMonitorStatusStore } from 'src/stores/monitorStatusStore'
import { useQuasar } from 'quasar'

export default {
  name: 'UnitWorkPlanReport',

  props: {
    targetPeriod: {
      type: Object,
      default: () => ({
        semester: '',
        year: '',
        status: '',
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
    officeId: {
      type: [Number, String],
      default: null,
    },
  },

  emits: ['close', 'status-updated'],

  setup(props, { emit }) {
    const $q = useQuasar()
    const store = useUnitWorkPlanReportStore()
    const competencyStore = useCompetencyStore()
    const monitorStore = useMonitorStatusStore()

    const currentDivisionData = ref(null)
    const selectedDivision = ref('')
    const currentDivisionPath = ref('')
    const showStatusModal = ref(false)

    const statusRemarks = ref('')
    const statusLoading = ref(false)

    const staticUserData = ref({
      officeName: 'City Human Resource Management Office',
    })

    // ✅ officeData is now sourced from store.data.office which preserves unitworkplan_status
    const officeData = ref(null)

    // ── Status helpers ──────────────────────────────────────────────────────
    const getStatusBadgeColor = (status) => {
      if (!status) return 'grey-5'
      const s = status.toLowerCase()
      if (s === 'monitored') return 'green-8'
      if (s === 'pending') return 'orange-8'
      if (s === 'approved') return 'blue-8'
      if (s === 'rejected') return 'red-8'
      return 'grey-7'
    }

    // ── Status Modal ────────────────────────────────────────────────────────
    const openStatusModal = () => {
      monitorStore.error = ''
      statusRemarks.value = ''
      showStatusModal.value = true
    }

    const closeStatusModal = () => {
      showStatusModal.value = false
      statusRemarks.value = ''
      monitorStore.error = ''
    }

    const updateStatus = async (status) => {
      statusLoading.value = true

      // Get the unitworkplan ID from the store data
      const unitworkplanId = store.data?.office?.unitworkplan?.id || null

      if (!unitworkplanId) {
        $q.notify({
          message: 'Unit Work Plan ID not found. Cannot update status.',
          color: 'negative',
          position: 'top',
          icon: 'error',
        })
        statusLoading.value = false
        return
      }

      const today = new Date().toISOString().split('T')[0]

      try {
        const success = await monitorStore.storeStatus({
          unitworkplan_id: unitworkplanId, // Changed from office_id to unitworkplan_id
          year: props.targetPeriod?.year || '',
          semester: props.targetPeriod?.semester || '',
          date: today,
          status: status,
          remarks: statusRemarks.value.trim() || null,
        })

        if (success) {
          showStatusModal.value = false

          // Update local officeData to reflect new status
          if (officeData.value) {
            officeData.value = {
              ...officeData.value,
              unitworkplan_status: status,
            }
          }

          $q.notify({
            message: `Status updated to ${status} successfully.`,
            color: 'positive',
            position: 'top',
            icon: 'check_circle',
            timeout: 3000,
          })

          emit('status-updated', {
            status: status,
            remarks: statusRemarks.value,
          })
        }
      } catch (error) {
        console.error('Error updating status:', error)
        $q.notify({
          message: error?.response?.data?.message || 'Failed to update status',
          color: 'negative',
          position: 'top',
          icon: 'error',
        })
      } finally {
        statusLoading.value = false
      }
    }

    // ── Proficiency mapping ─────────────────────────────────────────────────
    const proficiencyLevelMap = {
      Superior: 5,
      Advanced: 4,
      Intermediate: 3,
      Basic: 2,
      '-': '-',
    }

    const formatCompetencies = (sg, type) => {
      if (sg === null || sg === undefined || sg === 'null' || sg === 'undefined') return 'N/A'
      const sgStr = String(sg).trim()
      if (sgStr === '' || sgStr === '0' || sgStr === 'N/A') return 'N/A'
      const cleanSG = sgStr.replace(/\D/g, '')
      if (!cleanSG) return 'N/A'
      const sgNum = parseInt(cleanSG)
      const level = sgNum >= 15 ? '2nd Level' : '1st Level'
      const competencyRow = findCompetencyBySGRange(level, sgNum)
      if (!competencyRow) return 'N/A'
      const descriptions = competencyStore.descriptions[type]
      if (!descriptions) return 'N/A'
      const competencies = []
      for (const [code] of Object.entries(descriptions)) {
        const proficiencyLevel = competencyRow[code]
        const proficiencyNumber = proficiencyLevelMap[proficiencyLevel] || '-'
        if (proficiencyLevel && proficiencyLevel !== '-') {
          competencies.push(`${code} - ${proficiencyNumber}`)
        }
      }
      return competencies.length > 0 ? competencies.join('<br>') : 'N/A'
    }

    const findCompetencyBySGRange = (level, sgNum) => {
      const levelData = competencyStore.byLevel[level]
      if (!levelData) return null
      if (levelData[sgNum.toString()]) return levelData[sgNum.toString()]
      for (const [range, competencies] of Object.entries(levelData)) {
        if (range.includes('-')) {
          const [minStr, maxStr] = range.split('-')
          const min = parseInt(minStr)
          const max = parseInt(maxStr)
          if (!isNaN(min) && !isNaN(max) && sgNum >= min && sgNum <= max) return competencies
        }
      }
      if (level === '2nd Level') {
        if (sgNum >= 23 && sgNum <= 25) return levelData['23-25']
        if (sgNum >= 20 && sgNum <= 22) return levelData['20-22']
        if (sgNum >= 18 && sgNum <= 19) return levelData['18-19']
        if (sgNum >= 15 && sgNum <= 17) return levelData['15-17']
        if (sgNum === 14) return levelData['14']
        if (sgNum >= 12 && sgNum <= 13) return levelData['12-13']
        if (sgNum >= 9 && sgNum <= 11) return levelData['9-11']
      }
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

    // ── Navigation ──────────────────────────────────────────────────────────
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
      }
      return [
        { id: 'hr-development', label: 'Human Resource Development', type: 'division' },
        { id: 'personnel-management', label: 'Personnel Management', type: 'division' },
        { id: 'records-management', label: 'Records Management', type: 'division' },
      ]
    })

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
          if (node?.children && findPath(targetId, node.children, newPath)) return true
        }
        return false
      }
      findPath(nodeId, nodes, [])
      return path.filter(Boolean).join(' / ')
    }

    // ── Data organisation ───────────────────────────────────────────────────
    const getOrganizedData = () => {
      if (!currentDivisionData.value || !Array.isArray(currentDivisionData.value.employees)) {
        return []
      }
      const employees = currentDivisionData.value.employees
      const organized = []
      let currentSection = null
      employees.forEach((employee) => {
        if (employee.isMfoHeader && employee.outputs && employee.outputs[0]) {
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
          organized.push(currentSection)
        } else if (!employee.isOfficeHead && currentSection) {
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
      return organized
    }

    const getEmployeesByRank = (rank) => {
      if (!currentDivisionData.value || !Array.isArray(currentDivisionData.value.employees)) {
        return []
      }
      const uniqueEmployees = new Map()
      currentDivisionData.value.employees.forEach((employee) => {
        const employeeRank = String(employee.rank || '').trim()
        const targetRank = String(rank).trim()
        if (
          employeeRank.toLowerCase() === targetRank.toLowerCase() &&
          employee.name &&
          employee.position
        ) {
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

    // ── Fetch / Select ──────────────────────────────────────────────────────
    const retryFetch = async () => {
      if (selectedDivision.value) {
        const currentDivision = navigationItems.value?.find(
          (div) => div?.id === selectedDivision.value,
        )
        if (currentDivision) await fetchCurrentDivisionData(currentDivision)
      }
    }

    const fetchCurrentDivisionData = async (division) => {
      try {
        if (!division || !division.id) return
        currentDivisionData.value = null
        currentDivisionPath.value = getHierarchyPath(division.id)
        const filters = {
          organization: division.label || '',
          semester: props.targetPeriod?.semester || '',
          year: props.targetPeriod?.year || '',
          nodeId: division.id || '',
          nodeType: division.type || '',
          hierarchyPath: currentDivisionPath.value || '',
        }
        await store.fetchUnitWorkPlan(filters)

        // ✅ FIX: store.data.office now contains unitworkplan_status because
        // transformDataForReport preserves it. This will correctly show "Pending".
        officeData.value = store.data?.office || null

        if (store.data?.office?.name) {
          staticUserData.value.officeName = store.data.office.name
        } else if (store.data?.organization?.name) {
          staticUserData.value.officeName = store.data.organization.name
        }

        const reportData = store.getReportData
        if (reportData && Array.isArray(reportData.employees)) {
          currentDivisionData.value = {
            name: reportData.name || division.label || 'Division Report',
            employees: reportData.employees || [],
            office: store.data?.office,
          }
        } else {
          currentDivisionData.value = {
            name: division.label || 'Division Report',
            employees: [],
            office: store.data?.office,
          }
        }
      } catch (error) {
        const msg = error?.response?.data?.message || ''
        currentDivisionData.value = {
          name: division?.label || 'Division Report',
          employees: [],
          office: store.data?.office,
          errorMessage: msg || 'Failed to load data.',
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

    // ── Print / PDF ─────────────────────────────────────────────────────────
    const handlePrint = async () => {
      try {
        const pdfMake = await import('pdfmake/build/pdfmake')
        const pdfMakeInstance = pdfMake.default || pdfMake
        const vfsFonts = await import('pdfmake/build/vfs_fonts')
        pdfMakeInstance.vfs = vfsFonts.default || vfsFonts.pdfMake?.vfs

        let logoBase64 = tagumLogo
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

        const organizedData = getOrganizedData()
        const rankInFileEmployees = getEmployeesByRank('Rank-in-File')
        const supervisoryRank = getEmployeesByRank('Supervisory')
        const managerialRank = getEmployeesByRank('Managerial')

        const formatCompetenciesForPDF = (sg, type) => {
          try {
            if (sg === null || sg === undefined || sg === 'null' || sg === 'undefined') return 'N/A'
            const sgStr = String(sg).trim()
            if (sgStr === '' || sgStr === '0' || sgStr === 'N/A') return 'N/A'
            const cleanSG = sgStr.replace(/\D/g, '')
            if (!cleanSG) return 'N/A'
            const sgNum = parseInt(cleanSG)
            const level = sgNum >= 15 ? '2nd Level' : '1st Level'
            const competencyRow = findCompetencyBySGRange(level, sgNum)
            if (!competencyRow) return 'N/A'
            const descriptions = competencyStore.descriptions[type]
            if (!descriptions) return 'N/A'
            const competencies = []
            for (const [code] of Object.entries(descriptions)) {
              const proficiencyLevel = competencyRow[code]
              const proficiencyNumber = proficiencyLevelMap[proficiencyLevel] || '-'
              if (proficiencyLevel && proficiencyLevel !== '-') {
                competencies.push(`${code} - ${proficiencyNumber}`)
              }
            }
            return competencies.length > 0 ? competencies.join('\n') : 'N/A'
          } catch {
            return 'N/A'
          }
        }

        const tableRows = []
        tableRows.push([
          { text: 'MFO', style: 'tableHeader', colSpan: 1, rowSpan: 2, alignment: 'center' },
          {
            text: 'REQUIRED COMPETENCY & PROFICIENCY LEVEL',
            style: 'tableHeader',
            colSpan: 3,
            alignment: 'center',
          },
          '',
          '',
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
          '',
        ])
        tableRows.push([
          { text: 'CORE FUNCTIONS', style: 'tableSubHeader', alignment: 'left' },
          { text: 'CORE', style: 'tableSubHeader', alignment: 'left' },
          { text: 'TECHNICAL', style: 'tableSubHeader', alignment: 'left' },
          { text: 'LEADERSHIP', style: 'tableSubHeader', alignment: 'left' },
          '',
          '',
          { text: '5', style: 'tableSubHeader', alignment: 'center' },
          { text: '4', style: 'tableSubHeader', alignment: 'center' },
          { text: '3', style: 'tableSubHeader', alignment: 'center' },
          { text: '2', style: 'tableSubHeader', alignment: 'center' },
          { text: '1', style: 'tableSubHeader', alignment: 'center' },
        ])

        const span10 = (text, style = 'dataCell') => [
          { text, style, colSpan: 10 },
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
        ]

        organizedData.forEach((mfoSection) => {
          tableRows.push([
            { text: 'Employee:', style: 'labelCell' },
            ...span10(mfoSection.officeHead.name || 'N/A').slice(1),
          ])
          tableRows.push([
            { text: 'Position/SG:', style: 'labelCell' },
            ...span10(
              `${mfoSection.officeHead.position || 'N/A'} - ${mfoSection.officeHead.sg || '0'}`,
            ).slice(1),
          ])
          tableRows.push([
            { text: 'Employee Rank:', style: 'labelCell' },
            ...span10(mfoSection.officeHead.rank || 'N/A').slice(1),
          ])

          if (mfoSection.officeOutput) {
            tableRows.push([
              { text: `MFO: ${mfoSection.mfoName || 'N/A'}`, style: 'mfoCell' },
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
              { text: mfoSection.officeOutput.standard5 || 'N/A', style: 'standardCell' },
              { text: mfoSection.officeOutput.standard4 || 'N/A', style: 'standardCell' },
              { text: mfoSection.officeOutput.standard3 || 'N/A', style: 'standardCell' },
              { text: mfoSection.officeOutput.standard2 || 'N/A', style: 'standardCell' },
              { text: mfoSection.officeOutput.standard1 || 'N/A', style: 'standardCell' },
            ])
          }

          mfoSection.orgEmployees.forEach((orgEmployee, empIndex) => {
            const isNewEmployee =
              empIndex === 0 || orgEmployee.name !== mfoSection.orgEmployees[empIndex - 1]?.name
            if (isNewEmployee) {
              tableRows.push([
                { text: 'Employee:', style: 'labelCell' },
                ...span10(orgEmployee.name || 'N/A').slice(1),
              ])
              tableRows.push([
                { text: 'Position/SG:', style: 'labelCell' },
                ...span10(`${orgEmployee.position || 'N/A'} - ${orgEmployee.sg || 'N/A'}`).slice(1),
              ])
              tableRows.push([
                { text: 'Employee Rank:', style: 'labelCell' },
                ...span10(orgEmployee.rank || 'N/A').slice(1),
              ])
            }
            orgEmployee.outputs.forEach((output) => {
              tableRows.push([
                { text: `Output: ${output?.name || 'N/A'}`, style: 'outputCell' },
                { text: formatCompetenciesForPDF(orgEmployee.sg, 'core'), style: 'competencyCell' },
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
                { text: output?.standard5 || 'N/A', style: 'standardCell' },
                { text: output?.standard4 || 'N/A', style: 'standardCell' },
                { text: output?.standard3 || 'N/A', style: 'standardCell' },
                { text: output?.standard2 || 'N/A', style: 'standardCell' },
                { text: output?.standard1 || 'N/A', style: 'standardCell' },
              ])
            })
          })
        })

        // Signature helpers
        const signatureSections = []
        const createSignatureColumn = (title, employees) => {
          if (employees.length === 0) return null
          return {
            width: '*',
            stack: [
              { text: title, fontSize: 9, bold: true, margin: [0, 0, 0, 10], alignment: 'center' },
              ...employees.map((emp) => ({
                stack: [
                  {
                    text: emp.name.toUpperCase(),
                    fontSize: 9,
                    bold: true,
                    decoration: 'underline',
                    alignment: 'center',
                    margin: [0, 20, 0, 5],
                  },
                  { text: emp.position, fontSize: 8, alignment: 'center' },
                ],
              })),
            ],
          }
        }

        const rankInFileHeight = rankInFileEmployees.length * 40 + 30
        const supervisoryHeight = supervisoryRank.length * 40 + 30
        const managerialHeight = managerialRank.length * 40 + 30
        const useHorizontalLayout =
          Math.max(rankInFileHeight, supervisoryHeight, managerialHeight) < 150 &&
          rankInFileHeight + supervisoryHeight + managerialHeight < 250

        if (
          useHorizontalLayout &&
          (rankInFileEmployees.length || supervisoryRank.length || managerialRank.length)
        ) {
          const columns = [
            createSignatureColumn('Conformed and Agreed by:', rankInFileEmployees),
            createSignatureColumn('Reviewed and Assessed by:', supervisoryRank),
            createSignatureColumn('Noted by:', managerialRank),
          ].filter(Boolean)
          if (columns.length)
            signatureSections.push({ columns, columnGap: 20, margin: [0, 20, 0, 0] })
        } else {
          const addSig = (title, employees) => {
            if (!employees.length) return
            signatureSections.push({
              text: title,
              fontSize: 9,
              bold: true,
              margin: [0, 20, 0, 10],
              alignment: 'center',
            })
            signatureSections.push({
              columns: employees.map((emp) => ({
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
                  { text: emp.position, fontSize: 8, alignment: 'center' },
                ],
              })),
              columnGap: 10,
            })
          }
          addSig('Conformed and Agreed by:', rankInFileEmployees)
          addSig('Reviewed and Assessed by:', supervisoryRank)
          addSig('Noted by:', managerialRank)
        }

        const docDefinition = {
          pageSize: 'LEGAL',
          pageOrientation: 'landscape',
          pageMargins: [40, 100, 40, 60],
          header: () => ({
            stack: [
              {
                canvas: [
                  { type: 'rect', x: (1008 - 936) / 2, y: 60, w: 936, h: 25, color: '#036431' },
                ],
              },
              {
                margin: [72, -65, 72, 0],
                columns: [
                  {
                    width: 65,
                    stack: [
                      { canvas: [{ type: 'rect', x: 0, y: 0, w: 75, h: 80, color: '#ffffff' }] },
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
                        text:
                          currentDivisionPath.value.split(' / ')[0] ||
                          staticUserData.value.officeName,
                        fontSize: 13,
                        bold: true,
                        color: 'white',
                        margin: [0, 5, 0, 0],
                      },
                    ],
                  },
                ],
              },
            ],
          }),
          content: [
            {
              text: 'UNIT WORK PLAN',
              fontSize: 14,
              bold: true,
              margin: [0, 0, 0, 10],
              alignment: 'center',
            },
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
            {
              table: {
                headerRows: 2,
                widths: ['12%', '8%', '8%', '8%', '12%', '12%', '8%', '8%', '8%', '8%', '8%'],
                body: tableRows,
              },
              layout: {
                hLineWidth: (i, node) =>
                  i === 0 || i === 1 || i === node.table.body.length ? 1 : 0.5,
                vLineWidth: (i, node) => (i === 0 || i === node.table.widths.length ? 1 : 0.5),
                hLineColor: () => '#000000',
                vLineColor: () => '#000000',
                paddingLeft: () => 3,
                paddingRight: () => 3,
                paddingTop: () => 2,
                paddingBottom: () => 2,
              },
            },
            ...signatureSections,
          ],
          styles: {
            tableHeader: { bold: true, fontSize: 9, fillColor: '#f2f2f2', alignment: 'center' },
            tableSubHeader: { bold: true, fontSize: 9, fillColor: '#f2f2f2' },
            labelCell: { fontSize: 9, bold: true },
            dataCell: { fontSize: 9 },
            mfoCell: { fontSize: 9, bold: true },
            outputCell: { fontSize: 9 },
            competencyCell: { fontSize: 9 },
            standardCell: { fontSize: 9 },
          },
          defaultStyle: { fontSize: 9 },
        }

        pdfMakeInstance.createPdf(docDefinition).open()
      } catch (error) {
        console.error('Error generating PDF:', error)
        window.print()
      }
    }

    // ── Lifecycle ───────────────────────────────────────────────────────────
    onMounted(() => {
      try {
        if (navigationItems.value && navigationItems.value.length > 0) {
          selectDivision(navigationItems.value[0])
        }
      } catch (error) {
        console.error('Error in onMounted:', error)
      }
    })

    watch(
      () => props.targetPeriod,
      () => {
        try {
          if (selectedDivision.value) {
            const currentDivision = navigationItems.value?.find(
              (div) => div?.id === selectedDivision.value,
            )
            if (currentDivision) fetchCurrentDivisionData(currentDivision)
          }
        } catch (error) {
          console.error('Error watching target period:', error)
        }
      },
      { deep: true },
    )

    return {
      store,
      monitorStore,
      currentDivisionData,
      selectedDivision,
      currentDivisionPath,
      navigationItems,
      staticUserData,
      officeData,
      showStatusModal,
      statusRemarks, // Add this if you want to expose it
      statusLoading, // Add this if you want to expose it
      getStatusBadgeColor,

      openStatusModal,
      closeStatusModal,
      updateStatus, // Replace confirmStatusUpdate with updateStatus
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

<style scoped src="../assets/office/UnitWorkPlanReportHR.css"></style>
