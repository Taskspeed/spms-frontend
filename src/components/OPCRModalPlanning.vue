<template>
  <q-card class="my-card" style="width: 90vw; max-width: 1200px">
    <!-- Header section -->
    <q-card-section
      class="header-section row items-center justify-between"
      style="background-color: #e98193; height: 50px"
    >
      <div class="text-h6 text-white">Office Performance Commitment Review (OPCR)</div>
      <q-btn flat round dense icon="close" @click="handleClose" color="white" />
    </q-card-section>

    <q-separator />

    <!-- Loading State -->
    <q-card-section v-if="loading" class="text-center q-pa-xl">
      <q-spinner color="primary" size="3rem" />
      <div class="text-grey-7 q-mt-md">Loading OPCR data...</div>
    </q-card-section>

    <!-- Error State -->
    <q-card-section v-else-if="error" class="text-center q-pa-xl">
      <q-icon name="error_outline" color="negative" size="3rem" />
      <div class="text-negative q-mt-md">{{ error }}</div>
      <q-btn flat color="primary" label="Retry" @click="loadOpcrData" class="q-mt-md" />
    </q-card-section>

    <!-- Main Content -->
    <template v-else-if="opcrData">
      <div class="row justify-between items-center q-px-md q-py-sm bg-grey-3">
        <div class="text-body1">{{ opcrData.name }} - {{ employee?.position || 'N/A' }}</div>
        <div class="flex justify-end q-gutter-sm">
          <!-- <q-btn color="blue-9" icon="edit" label="Input" @click="openEditModal" /> -->
          <q-btn color="green-9" icon="print" label="Print" @click="handlePrint" />
        </div>
      </div>

      <q-separator />

      <div style="overflow-y: auto; max-height: 70vh; padding: 8px">
        <div class="preview-container" id="opcr-preview">
          <!-- Header Section with Logos -->
          <div class="header">
            <img src="/tagumlogo.png" alt="City of Tagum Logo" class="logo" />
            <div class="center-text">
              <div>Republic of the Philippines</div>
              <div>Province of Davao del Norte</div>
              <div>CITY OF TAGUM</div>
            </div>
            <img src="/rotp.png" alt="Republic of the Philippines Logo" class="logo" />
          </div>

          <div class="opcr-title">OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)</div>

          <!-- Commitment Statement -->
          <div class="commitment-container q-mt-md">
            <table style="width: 100%; border-collapse: collapse; border: 1px solid #000">
              <tbody>
                <tr>
                  <td
                    style="width: 100%; padding: 8px; border: 1px solid #000; vertical-align: top"
                  >
                    I, <b>{{ opcrData.name }}</b
                    >, {{ employee?.position || 'N/A' }} of the {{ employee?.office || 'N/A' }},
                    commit to deliver and agree to be rated on the attainment of the following
                    targets in accordance with the indicated measures for the period of
                    <b>{{ currentPeriod?.semester || 'N/A' }}, {{ currentPeriod?.year || 'N/A' }}</b
                    >.

                    <!-- Signatory Info Bottom Right -->
                    <div style="margin-top: 20px; text-align: right; padding-right: 200px">
                      <div style="display: inline-block; text-align: left">
                        <div>{{ opcrData.name }}</div>
                        <div>{{ employee?.position || 'N/A' }}</div>
                        <div>Date: {{ currentDate }}</div>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- Approval Section -->
                <tr>
                  <td style="width: 100%; padding: 0; border: 1px solid #000">
                    <table style="width: 100%; border-collapse: collapse">
                      <tbody>
                        <tr>
                          <th
                            style="
                              padding: 8px;
                              width: 50%;
                              border-right: 1px solid #000;
                              text-align: left;
                              border-bottom: 1px solid #000;
                            "
                          >
                            Approved by:
                          </th>
                          <th
                            style="
                              padding: 8px;
                              width: 50%;
                              text-align: center;
                              border-bottom: 1px solid #000;
                            "
                          >
                            Date
                          </th>
                        </tr>
                        <tr>
                          <td
                            style="
                              padding: 8px;
                              border-right: 1px solid #000;
                              text-align: center;
                              height: 80px;
                              vertical-align: bottom;
                            "
                          >
                            <div style="font-weight: bold; font-size: 1.1em">REY T. UY</div>
                            <hr style="margin: 5px 0; border-top: 1px solid #000" />
                            <div>City Mayor</div>
                          </td>
                          <td style="text-align: center"></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Rating Scale Table -->
          <div style="display: flex; justify-content: flex-end; margin-top: 20px">
            <table
              class="rating-scale-table"
              style="border: 1px solid #000; border-collapse: collapse; width: auto"
            >
              <tbody>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px; min-width: 180px">
                    Outstanding
                  </td>
                  <td
                    style="
                      border: 1px solid #000;
                      padding: 6px 14px;
                      text-align: center;
                      min-width: 50px;
                    "
                  >
                    5
                  </td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px">Very Satisfactory</td>
                  <td style="border: 1px solid #000; padding: 6px 14px; text-align: center">4</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px">Satisfactory</td>
                  <td style="border: 1px solid #000; padding: 6px 14px; text-align: center">3</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px">Unsatisfactory</td>
                  <td style="border: 1px solid #000; padding: 6px 14px; text-align: center">2</td>
                </tr>
                <tr>
                  <td style="border: 1px solid #000; padding: 6px 14px">Poor</td>
                  <td style="border: 1px solid #000; padding: 6px 14px; text-align: center">1</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Main OPCR Table -->
          <table class="opcr-table q-mt-md" style="border-collapse: collapse; width: 100%">
            <thead>
              <tr>
                <th rowspan="2" style="width: 11.11%; text-align: center; vertical-align: middle">
                  MFO
                </th>

                <th rowspan="2" style="width: 11.11%; text-align: center; vertical-align: middle">
                  REQUIRED COMPETENCY &<br />PROFICIENCY LEVEL
                </th>

                <th rowspan="2" style="width: 11.11%; text-align: center; vertical-align: middle">
                  SUCCESS INDICATOR
                </th>

                <th rowspan="2" style="width: 11.11%; text-align: center; vertical-align: middle">
                  ALLOTED BUDGET
                </th>

                <th rowspan="2" style="width: 11.11%; text-align: center; vertical-align: middle">
                  DIVISION/ INDIVIDUAL ACCOUNTABLE
                </th>

                <th rowspan="2" style="width: 11.11%; text-align: center; vertical-align: middle">
                  ACTUAL ACCOMPLISHMENT
                </th>

                <th colspan="4" style="width: 11.11%; text-align: center; vertical-align: middle">
                  RATING
                </th>

                <th rowspan="2" style="width: 11.11%; text-align: center; vertical-align: middle">
                  PROFICIENCY RESULT
                </th>

                <th rowspan="2" style="width: 11.11%; text-align: center; vertical-align: middle">
                  REMARKS
                </th>
              </tr>

              <tr>
                <th style="width: 2.78%; text-align: center; vertical-align: middle">Q</th>

                <th style="width: 2.78%; text-align: center; vertical-align: middle">E</th>

                <th style="width: 2.78%; text-align: center; vertical-align: middle">T</th>

                <th style="width: 2.78%; text-align: center; vertical-align: middle">A</th>
              </tr>
            </thead>

            <tbody>
              <!-- Render categories dynamically -->
              <template v-for="(category, index) in categories" :key="index">
                <tr>
                  <td colspan="12" class="section-header" style="border: 1px solid black">
                    {{ category }}
                  </td>
                </tr>

                <!-- Render performance standards for this category -->
                <tr v-for="standard in getStandardsByCategory(category)" :key="standard.id">
                  <td style="padding: 4px">
                    <b>{{ standard.mfo || 'N/A' }}</b>
                  </td>
                  <td style="padding: 4px">
                    <div v-html="formatCompetencies(standard)"></div>
                  </td>
                  <td style="padding: 4px">
                    {{ standard.success_indicator || 'N/A' }}
                  </td>
                  <td style="text-align: center; padding: 4px">
                    {{ standard.opcr?.budget || '-' }}
                  </td>
                  <td style="text-align: center; padding: 4px">
                    {{ standard.opcr?.accountable || '-' }}
                  </td>
                  <td style="padding: 4px">
                    {{ standard.opcr?.accomplishment || '-' }}
                  </td>
                  <td style="text-align: center; padding: 4px">
                    {{ standard.opcr?.rating_q || '-' }}
                  </td>
                  <td style="text-align: center; padding: 4px">
                    {{ standard.opcr?.rating_e || '-' }}
                  </td>
                  <td style="text-align: center; padding: 4px">
                    {{ standard.opcr?.rating_t || '-' }}
                  </td>
                  <td style="text-align: center; padding: 4px">
                    {{ standard.opcr?.rating_a || '-' }}
                  </td>
                  <td style="padding: 4px">
                    <div v-html="formatProficiencyResult(standard)"></div>
                  </td>
                  <td style="padding: 4px">
                    {{ standard.opcr?.remarks || '' }}
                  </td>
                </tr>
              </template>

              <!-- Average Rating Section by Category -->
              <tr>
                <th colspan="2" style="padding: 8px">Category</th>
                <th colspan="10" style="padding: 8px; text-align: center">
                  COMPETENCY ASSESSMENT (Subjective)
                </th>
              </tr>

              <!-- Strategic Functions (if exists) -->
              <tr v-if="hasCategoryData('A. STRATEGIC FUNCTION')">
                <td style="padding: 8px"><b>Strategic Functions:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ calculateCategoryRating('A. STRATEGIC FUNCTION') }}</b>
                </td>
                <td rowspan="5" colspan="10" style="padding: 8px; text-align: center"></td>
              </tr>

              <!-- Core Functions (if exists) -->
              <tr v-if="hasCategoryData('B. CORE FUNCTION')">
                <td style="padding: 8px"><b>Core Functions:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ calculateCategoryRating('B. CORE FUNCTION') }}</b>
                </td>
              </tr>

              <!-- Support Functions (if exists) -->
              <tr v-if="hasCategoryData('C. SUPPORT FUNCTION')">
                <td style="padding: 8px"><b>Support Functions:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ calculateCategoryRating('C. SUPPORT FUNCTION') }}</b>
                </td>
              </tr>

              <!-- Final Rating -->
              <tr>
                <td style="padding: 8px"><b>Final Rating:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ calculateAverageRating() }}</b>
                </td>
              </tr>

              <!-- Adjectival Rating -->
              <tr>
                <td style="padding: 8px"><b>Adjectival Rating:</b></td>
                <td style="padding: 8px; text-align: center">
                  <b>{{ getAdjectivalRating(calculateAverageRating()) }}</b>
                </td>
              </tr>

              <!-- Signatory Section -->
              <tr>
                <td colspan="12" style="padding: 0">
                  <table
                    style="width: 100%; border-collapse: collapse; border-top: 1px solid black"
                  >
                    <tbody>
                      <tr>
                        <td style="padding: 6px; border-right: none; width: 50%">
                          <b>Assessed by:</b>
                        </td>
                        <td style="padding: 6px; width: 50%">
                          <b>Final Rating by:</b>
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            text-align: center;
                            vertical-align: bottom;
                            padding-top: 60px;
                            width: 50%;
                          "
                        >
                          <div style="font-weight: bold">{{ employee?.supervisor || 'N/A' }}</div>
                          <div style="border-top: 1px solid black; margin-bottom: 3px"></div>
                          <div>Immediate Supervisor</div>
                        </td>
                        <td
                          style="
                            text-align: center;
                            vertical-align: bottom;
                            padding-top: 60px;
                            width: 50%;
                          "
                        >
                          <div style="font-weight: bold">REY T. UY</div>
                          <div style="border-top: 1px solid black; margin-bottom: 3px"></div>
                          <div>City Mayor</div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- No Data State -->
    <q-card-section v-else class="text-center q-pa-xl">
      <q-icon name="inbox" color="grey" size="3rem" />
      <div class="text-grey-7 q-mt-md">No OPCR data available</div>
    </q-card-section>

    <q-dialog v-model="editModalOpen" persistent>
      <OPCRInput :employee="employee" :targetPeriod="targetPeriod" @close="closeEditModal" />
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOpcrStore } from 'src/stores/office/opcrStore'
import { useQuasar } from 'quasar'
import OPCRInput from './OPCRInput.vue'

// Add pdfMake import
let pdfMake = null

const initPdfMake = async () => {
  if (!pdfMake) {
    const pdfMakeModule = await import('pdfmake/build/pdfmake')
    const pdfFontsModule = await import('pdfmake/build/vfs_fonts')

    pdfMake = pdfMakeModule.default || pdfMakeModule
    const pdfFonts = pdfFontsModule.default || pdfFontsModule

    if (pdfMake && !pdfMake.vfs) {
      pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs
    }
  }
  return pdfMake
}

const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
  targetPeriod: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'refresh'])

const opcrStore = useOpcrStore()
const $q = useQuasar()

// Modal state
const editModalOpen = ref(false)
const isPrinting = ref(false)

// Use store state directly
const loading = computed(() => opcrStore.loading)
const error = computed(() => opcrStore.error)
const opcrData = computed(() => opcrStore.opcrData)

// Get current period from opcrData
const currentPeriod = computed(() => {
  if (!opcrData.value?.target_periods) return null
  return opcrData.value.target_periods.find(
    (tp) => tp.semester === props.targetPeriod.semester && tp.year === props.targetPeriod.year,
  )
})

// Get performance standards
const performanceStandards = computed(() => {
  return currentPeriod.value?.performance_standards || []
})

// Get unique categories
const categories = computed(() => {
  const cats = new Set(performanceStandards.value.map((s) => s.category))
  return Array.from(cats)
})

// Get current date formatted
const currentDate = computed(() => {
  const today = new Date()
  return `${String(today.getMonth() + 1).padStart(2, '0')}/${String(today.getDate()).padStart(2, '0')}/${today.getFullYear()}`
})

// Get standards by category
const getStandardsByCategory = (category) => {
  return performanceStandards.value.filter((s) => s.category === category)
}

// Check if category has data
const hasCategoryData = (category) => {
  return performanceStandards.value.some((s) => s.category === category)
}

// Calculate rating for a specific category
const calculateCategoryRating = (category) => {
  const categoryStandards = performanceStandards.value.filter((s) => s.category === category)

  if (!categoryStandards || categoryStandards.length === 0) return '0.00'

  let totalRating = 0
  let count = 0

  categoryStandards.forEach((standard) => {
    if (!standard.opcr) return

    const avg =
      (parseFloat(standard.opcr.rating_q || 0) +
        parseFloat(standard.opcr.rating_e || 0) +
        parseFloat(standard.opcr.rating_t || 0) +
        parseFloat(standard.opcr.rating_a || 0)) /
      4

    if (!isNaN(avg)) {
      totalRating += avg
      count++
    }
  })

  return count > 0 ? (totalRating / count).toFixed(2) : '0.00'
}

// Format proficiency level
const getProficiencyLevel = (level) => {
  if (level === null || level === undefined) return 'Not Applicable'

  const levels = {
    1: 'Basic',
    2: 'Intermediate',
    3: 'Advanced',
    4: 'Superior',
  }

  return levels[level] || 'Not Applicable'
}

// Format competencies
const formatCompetencies = (standard) => {
  const core = standard.core || []
  const technical = standard.technical || []
  const leadership = standard.leadership || []

  const combined = [...core, ...technical, ...leadership]

  if (combined.length === 0) {
    return 'Not Applicable'
  }

  const formatted = combined.map((comp, index) => {
    const proficiency = getProficiencyLevel(comp.level)
    return `${index + 1}. ${comp.description} (${proficiency})`
  })

  return formatted.join('\n')
}

// Format proficiency result
const formatProficiencyResult = (standard) => {
  const core = standard.core || []
  const technical = standard.technical || []
  const leadership = standard.leadership || []

  const combined = [...core, ...technical, ...leadership]

  if (combined.length === 0) {
    return 'Not Applicable'
  }

  const proficiencyLevels = combined.map((comp, index) => {
    const proficiency = getProficiencyLevel(comp.level)
    return `${index + 1}. ${proficiency}`
  })

  return proficiencyLevels.join('\n')
}

const loadOpcrData = async () => {
  const controlNo =
    props.employee?.employeeData?.ControlNo ||
    props.employee?.ControlNo ||
    props.employee?.control_no

  if (!controlNo) {
    $q.notify({
      message: 'Employee control number is missing',
      color: 'negative',
    })
    return
  }

  if (!props.targetPeriod?.semester || !props.targetPeriod?.year) {
    $q.notify({
      message: 'Target period is missing',
      color: 'negative',
    })
    return
  }

  try {
    await opcrStore.fetchOpcr(controlNo, props.targetPeriod.semester, props.targetPeriod.year)
  } catch (error) {
    console.error('Failed to load OPCR:', error)
  }
}

const handleClose = () => {
  opcrStore.clear()
  emit('close')
}

// const openEditModal = () => {
//   editModalOpen.value = true
// }

const closeEditModal = async () => {
  editModalOpen.value = false
  await loadOpcrData()
  emit('refresh')
}

const calculateAverageRating = () => {
  const standards = performanceStandards.value
  if (!standards || standards.length === 0) return '0.00'

  let totalRating = 0
  let count = 0

  standards.forEach((standard) => {
    if (!standard.opcr) return

    const avg =
      (parseFloat(standard.opcr.rating_q || 0) +
        parseFloat(standard.opcr.rating_e || 0) +
        parseFloat(standard.opcr.rating_t || 0) +
        parseFloat(standard.opcr.rating_a || 0)) /
      4

    if (!isNaN(avg)) {
      totalRating += avg
      count++
    }
  })

  return count > 0 ? (totalRating / count).toFixed(2) : '0.00'
}

const getAdjectivalRating = (rating) => {
  const numRating = parseFloat(rating)
  if (isNaN(numRating)) return 'N/A'

  if (numRating >= 4.5) return 'Outstanding'
  if (numRating >= 3.5) return 'Very Satisfactory'
  if (numRating >= 2.5) return 'Satisfactory'
  if (numRating >= 1.5) return 'Unsatisfactory'
  return 'Poor'
}

// Helper to convert image URL to base64
const convertImageToBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'Anonymous'
    img.onload = function () {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0)
        const dataURL = canvas.toDataURL('image/png')
        resolve(dataURL)
      } catch (err) {
        reject(err)
      }
    }
    img.onerror = function (err) {
      reject(err)
    }
    img.src = url
  })
}

// Create SVG placeholder function
const createSvgPlaceholder = (text, width = 80, height = 80) => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0" stroke="#666" stroke-width="1" stroke-dasharray="2" />
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-size="10" font-family="Arial">
      ${text}
    </text>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

const formatDate = (date) => {
  if (!date) return '__/__/____'
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${month}/${day}/${year}`
}

// PDF Generation Function
const handlePrint = async () => {
  if (!opcrData.value) {
    $q.notify({
      type: 'warning',
      message: 'No OPCR data available to print',
      position: 'top',
    })
    return
  }

  isPrinting.value = true

  try {
    const pdfMakeInstance = await initPdfMake()

    if (!pdfMakeInstance) {
      throw new Error('Failed to load pdfMake')
    }

    // Load images as base64 data URLs
    let tagumLogoBase64 = null
    let rotpLogoBase64 = null

    try {
      tagumLogoBase64 = await convertImageToBase64('/tagumlogo.png')
      rotpLogoBase64 = await convertImageToBase64('/rotp.png')
    } catch (error) {
      console.warn('Could not load images, using SVG placeholders:', error)
      tagumLogoBase64 = createSvgPlaceholder('TAGUM LOGO')
      rotpLogoBase64 = createSvgPlaceholder('ROTP LOGO')
    }

    const docDefinition = generateOpcrPdfContent(tagumLogoBase64, rotpLogoBase64)

    // Open in new window
    pdfMakeInstance.createPdf(docDefinition).open()

    $q.notify({
      type: 'positive',
      message: 'PDF generated successfully',
      position: 'top',
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to generate PDF: ${error.message}`,
      position: 'top',
    })
  } finally {
    isPrinting.value = false
  }
}

// Generate OPCR PDF Content
const generateOpcrPdfContent = (tagumLogoBase64, rotpLogoBase64) => {
  const employeeName = opcrData.value?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.employee?.office || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'}, ${props.targetPeriod?.year || 'N/A'}`

  const content = []

  // Header with logos
  content.push({
    columns: [
      {
        width: 'auto',
        stack: tagumLogoBase64
          ? [
              {
                image: tagumLogoBase64,
                width: 40,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ]
          : [
              {
                text: 'TAGUM LOGO',
                alignment: 'center',
                italics: true,
                margin: [0, 20, 0, 10],
              },
            ],
      },
      {
        width: '*',
        stack: [
          {
            text: 'Republic of the Philippines',
            alignment: 'center',
            fontSize: 10,
            margin: [0, 10, 0, 2],
          },
          {
            text: 'Province of Davao del Norte',
            alignment: 'center',
            fontSize: 10,
            margin: [0, 0, 0, 2],
          },
          {
            text: 'CITY OF TAGUM',
            alignment: 'center',
            fontSize: 10,
            bold: true,
            margin: [0, 0, 0, 10],
          },
        ],
      },
      {
        width: 'auto',
        stack: rotpLogoBase64
          ? [
              {
                image: rotpLogoBase64,
                width: 40,
                alignment: 'center',
                margin: [0, 10, 0, 10],
              },
            ]
          : [
              {
                text: 'ROTP LOGO',
                alignment: 'center',
                italics: true,
                margin: [0, 20, 0, 10],
              },
            ],
      },
    ],
    margin: [0, 0, 0, 0],
  })

  // Title
  content.push({
    text: 'OFFICE PERFORMANCE COMMITMENT AND REVIEW (OPCR)',
    alignment: 'center',
    fontSize: 11,
    bold: true,
    margin: [0, 0, 0, 15],
  })

  // Commitment Statement Table
  content.push({
    table: {
      widths: ['100%'],
      body: [
        [
          {
            text: [
              { text: 'I, ' },
              { text: employeeName, bold: true },
              { text: ', ' },
              { text: position },
              { text: ' of the ' },
              { text: office },
              {
                text: ', commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measures for the period of ',
              },
              { text: period, bold: true },
              { text: '.' },
            ],
            fontSize: 9,
            margin: [5, 5, 5, 5],
            border: [true, true, true, false],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  // Signatory section in commitment
  content.push({
    table: {
      widths: ['*', '*'],
      body: [
        [
          {
            text: '',
            border: [true, false, false, false],
          },
          {
            stack: [
              {
                text: employeeName,
                bold: true,
                fontSize: 9,
                alignment: 'center',
                margin: [0, 10, 0, 2],
              },
              {
                text: position,
                fontSize: 8,
                alignment: 'center',
              },
              {
                text: `Date: ${formatDate(new Date())}`,
                fontSize: 8,
                alignment: 'center',
              },
            ],
            border: [false, false, true, false],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 1,
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  // Approval Section
  content.push({
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          {
            text: 'Approved by:',
            fontSize: 9,
            bold: true,
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          {
            text: 'Date',
            fontSize: 9,
            bold: true,
            alignment: 'left',
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
        ],
        [
          {
            stack: [
              {
                text: 'REY T. UY',
                bold: true,
                fontSize: 9,
                alignment: 'center',
                margin: [0, 20, 0, 0],
              },
              {
                text: '________________________________',
                alignment: 'center',
                fontSize: 9,
              },
              {
                text: 'City Mayor',
                fontSize: 9,
                alignment: 'center',
              },
            ],
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          {
            text: '',
            border: [true, true, true, true],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 15],
  })

  // Rating Scale Table (aligned right)
  content.push({
    columns: [
      { width: '*', text: '' },
      {
        width: 'auto',
        table: {
          widths: [100, 30],
          body: [
            [
              {
                text: 'Outstanding',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
              {
                text: '5',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
            [
              {
                text: 'Very Satisfactory',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
              {
                text: '4',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
            [
              {
                text: 'Satisfactory',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
              {
                text: '3',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
            [
              {
                text: 'Unsatisfactory',
                fontSize: 8,
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
              {
                text: '2',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
            [
              { text: 'Poor', fontSize: 8, border: [true, true, true, true], margin: [3, 3, 3, 3] },
              {
                text: '1',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
                margin: [3, 3, 3, 3],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
        },
      },
    ],
    margin: [0, 0, 0, 10],
  })

  // Main OPCR Table
  const tableBody = [
    // Header rows
    [
      {
        text: 'MFO',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'REQUIRED COMPETENCY &\nPROFICIENCY LEVEL',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'SUCCESS INDICATOR',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'ALLOTED BUDGET',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'DIVISION/\nINDIVIDUAL\nACCOUNTABLE',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'ACTUAL\nACCOMPLISHMENT',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'RATING',
        colSpan: 4,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {
        text: 'PROFICIENCY\nRESULT',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'REMARKS',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
    ],
    [
      {},
      {},
      {},
      {},
      {},
      {},
      {
        text: 'Q',
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'E',
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'T',
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {
        text: 'A',
        alignment: 'center',
        fontSize: 8,
        bold: true,
        fillColor: '#f2f2f2',
        border: [true, true, true, true],
      },
      {},
      {},
    ],
  ]

  // Add data rows for each category
  categories.value.forEach((category) => {
    // Category header
    tableBody.push([
      {
        text: category,
        colSpan: 12,
        fontSize: 9,
        bold: true,
        fillColor: '#d9d9d9',
        border: [true, true, true, true],
        margin: [3, 3, 3, 3],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ])

    // Standards for this category
    const standards = getStandardsByCategory(category)
    standards.forEach((standard) => {
      tableBody.push([
        {
          text: standard.mfo || 'N/A',
          fontSize: 7,
          bold: true,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text: formatCompetencies(standard),
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text: standard.success_indicator || 'N/A',
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text: standard.opcr?.budget || '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text: standard.opcr?.accountable || '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text: standard.opcr?.accomplishment || '-',
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text: standard.opcr?.rating_q || '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text: standard.opcr?.rating_e || '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text: standard.opcr?.rating_t || '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text: standard.opcr?.rating_a || '-',
          fontSize: 7,
          alignment: 'center',
          border: [true, true, true, true],
        },
        {
          text: formatProficiencyResult(standard),
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
        {
          text: standard.opcr?.remarks || '',
          fontSize: 7,
          border: [true, true, true, true],
          margin: [2, 2, 2, 2],
        },
      ])
    })
  })

  // Average Rating Section
  tableBody.push([
    {
      text: 'Category',
      colSpan: 2,
      fontSize: 8,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {},
    {
      text: 'COMPETENCY ASSESSMENT (Subjective)',
      colSpan: 10,
      fontSize: 8,
      bold: true,
      alignment: 'center',
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ])

  // Calculate how many category rating rows we'll have
  let categoryRatingRowCount = 0
  if (hasCategoryData('A. STRATEGIC FUNCTION')) categoryRatingRowCount++
  if (hasCategoryData('B. CORE FUNCTION')) categoryRatingRowCount++
  if (hasCategoryData('C. SUPPORT FUNCTION')) categoryRatingRowCount++
  categoryRatingRowCount += 2 // Final Rating + Adjectival Rating

  // Category ratings
  if (hasCategoryData('A. STRATEGIC FUNCTION')) {
    tableBody.push([
      {
        text: 'Strategic Functions:',
        fontSize: 8,
        bold: true,
        border: [true, true, true, true],
        margin: [3, 3, 3, 3],
      },
      {
        text: calculateCategoryRating('A. STRATEGIC FUNCTION'),
        fontSize: 8,
        bold: true,
        alignment: 'center',
        border: [true, true, true, true],
      },
      {
        text: '',
        colSpan: 10,
        rowSpan: categoryRatingRowCount,
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ])
  }

  if (hasCategoryData('B. CORE FUNCTION')) {
    tableBody.push([
      {
        text: 'Core Functions:',
        fontSize: 8,
        bold: true,
        border: [true, true, true, true],
        margin: [3, 3, 3, 3],
      },
      {
        text: calculateCategoryRating('B. CORE FUNCTION'),
        fontSize: 8,
        bold: true,
        alignment: 'center',
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ])
  }

  if (hasCategoryData('C. SUPPORT FUNCTION')) {
    tableBody.push([
      {
        text: 'Support Functions:',
        fontSize: 8,
        bold: true,
        border: [true, true, true, true],
        margin: [3, 3, 3, 3],
      },
      {
        text: calculateCategoryRating('C. SUPPORT FUNCTION'),
        fontSize: 8,
        bold: true,
        alignment: 'center',
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
      {},
    ])
  }

  // Final Rating
  tableBody.push([
    {
      text: 'Final Rating:',
      fontSize: 8,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {
      text: calculateAverageRating(),
      fontSize: 8,
      bold: true,
      alignment: 'center',
      border: [true, true, true, true],
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ])

  // Adjectival Rating
  tableBody.push([
    {
      text: 'Adjectival Rating:',
      fontSize: 8,
      bold: true,
      border: [true, true, true, true],
      margin: [3, 3, 3, 3],
    },
    {
      text: getAdjectivalRating(calculateAverageRating()),
      fontSize: 8,
      bold: true,
      alignment: 'center',
      border: [true, true, true, true],
    },
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    {},
  ])

  // Add the main table with NO header rows repeating
  content.push({
    table: {
      headerRows: 0, // Don't repeat any header rows
      widths: ['10%', '12%', '10%', '8%', '8%', '10%', '5%', '5%', '5%', '5%', '10%', '12%'],
      body: tableBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 10],
  })

  // Signature Section - Make it unbreakable
  content.push({
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          {
            text: 'Assessed by:',
            fontSize: 9,
            bold: true,
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          {
            text: 'Final Rating by:',
            fontSize: 9,
            bold: true,
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
        ],
        [
          {
            stack: [
              {
                text: props.employee?.supervisor || 'N/A',
                bold: true,
                fontSize: 9,
                alignment: 'center',
                margin: [0, 40, 0, 2],
              },
              {
                text: '________________________________',
                alignment: 'center',
                fontSize: 9,
              },
              {
                text: 'Immediate Supervisor',
                fontSize: 8,
                alignment: 'center',
              },
            ],
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
          {
            stack: [
              {
                text: 'REY T. UY',
                bold: true,
                fontSize: 9,
                alignment: 'center',
                margin: [0, 40, 0, 2],
              },
              {
                text: '________________________________',
                alignment: 'center',
                fontSize: 9,
              },
              {
                text: 'City Mayor',
                fontSize: 8,
                alignment: 'center',
              },
            ],
            border: [true, true, true, true],
            margin: [5, 5, 5, 5],
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
    unbreakable: true, // Prevent signature section from breaking across pages
  })

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [36, 36, 36, 36],
    content: content,
    defaultStyle: {
      fontSize: 8,
    },
  }
}

onMounted(() => {
  loadOpcrData()
})
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo {
  width: 70px;
  height: auto;
  padding: 10px;
}

.center-text {
  text-align: center;
  flex-grow: 1;
  font-weight: bold;
  line-height: 1.5;
  font-size: 11px;
}

.opcr-title {
  font-size: 9px;
  font-weight: bold;
  text-align: center;
  margin-top: 12px;
}

.my-card {
  display: flex;
  flex-direction: column;
}

.header-section {
  padding: 0 20px;
  color: #ffffff;
  border-bottom: 1px solid #e0e0e0;
}

.preview-container {
  padding: 12px;
  background-color: white;
  font-size: 9px;
}

#opcr-preview {
  padding: 12px;
  font-family: Arial, sans-serif;
  font-size: 9px;
  color: #000;
}

#opcr-preview .opcr-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
  font-size: 9px;
  border: 1px solid #000 !important;
}

#opcr-preview .opcr-table th,
#opcr-preview .opcr-table td {
  border: 1px solid #000 !important;
  padding: 4px;
  vertical-align: top;
  font-size: 9px;
}

#opcr-preview .opcr-table th {
  background-color: #f2f2f2;
  font-weight: bold;
  text-align: center;
}

#opcr-preview .section-header {
  background-color: #d9d9d9;
  font-weight: bold;
  padding: 4px;
  border: 1px solid #000;
  font-size: 9px;
}

.commitment-container {
  font-size: 9px;
}

.commitment-container table,
.commitment-container th,
.commitment-container td {
  font-size: 9px;
}

.rating-scale-table {
  border: 1px solid #000;
  border-collapse: collapse;
  float: right;
  margin-left: 16px;
  margin-bottom: 10px;
  width: auto;
  max-width: 180px;
  font-size: 9px;
}

.rating-scale-table td {
  padding: 6px 14px;
  min-width: auto;
  font-size: 9px;
}
</style>
