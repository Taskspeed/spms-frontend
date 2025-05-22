<!--UnitWorkplanReport.vue-->
<template>
  <div class="app-container">
    <!-- App Header -->
    <div class="app-header">
      <div class="header-content">
        <div class="text-h6 text-white">{{ userStore.officeName }}</div>
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
          <div class="text-h6">Divisions</div>
        </div>

        <q-list padding class="division-list">
          <q-item v-for="(division, index) in store.divisions" :key="index" clickable v-ripple
            :active="store.selectedDivision === division.division"
            @click="selectDivision(division.division, division.target_period)" active-class="active-division">
            <q-item-section>
              <q-item-label>{{ division.division }}</q-item-label>
              <!-- <q-item-label caption>{{ division.target_period }}</q-item-label> -->
            </q-item-section>
          </q-item>
        </q-list>
        <!-- Approved Button at the bottom -->
        <div v-if="showApprovedButton" class="row justify-center q-mt-lg q-pb-lg">
          <q-btn label="Approve" color="green" class="q-mt-md" />
        </div>
      </div>


      <!-- Report Content Area - Single Scrollable Container -->
      <div class="report-container">
        <!-- Loading State -->
        <div v-if="store.loading" class="full-width row flex-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
          <div class="q-ml-sm">Loading division data...</div>
        </div>

        <!-- Error State -->
        <div v-else-if="store.error" class="full-width row flex-center q-pa-xl text-negative">
          <q-icon name="error" size="2em" class="q-mr-sm" />
          <div>{{ store.error }}</div>
        </div>

        <!-- Content when data is loaded -->
        <template v-else-if="currentDivisionData">
          <!-- Fixed Report Header -->
          <div class="report-header">
            <div class="row items-center no-wrap">
              <div class="col">
                <div class="text-h6">{{ currentDivisionData.name }}</div>
                <div class="text-subtitle2">Target Period: {{ store.selectedTargetPeriod }}</div>
              </div>
              <div class="flex justify-end q-gutter-sm">
                <q-btn color="green-9" icon="print" label="Print" @click="directPrint" :loading="isPrinting" />
                <q-btn color="green-9" icon="download" label="Download PDF" @click="downloadPdf"
                  :loading="isGeneratingPdf" />
                <q-tooltip>Download</q-tooltip>
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
                  <img class="logo" alt="City of Tagum Logo"
                    src="https://phshirt.com/wp-content/uploads/2021/11/City-of-Tagum-Logo.png" />
                </div>
                <div class="header-text">
                  <div class="text-green-9 text-caption padded-text">REPUBLIC OF THE PHILIPPINES</div>
                  <div class="text-green-9 text-caption padded-text">PROVINCE OF DAVAO DEL NORTE</div>
                  <div class="text-green-9 text-h5 text-weight-bold padded-text">CITY OF TAGUM</div>

                  <div class="green-banner">
                    <div class="padded-text">{{ userStore.officeName }}</div>
                  </div>
                </div>
              </div>

              <!-- Main Content -->
              <div class="q-mt-md">
                <h2 class="text-center text-weight-bold text-h4">UNIT WORK PLAN</h2>
                <table class="full-width info-table">
                  <tbody>
                    <tr>
                      <td><strong>Division:</strong> {{ currentDivisionData.name }}</td>
                    </tr>
                    <tr>
                      <td><strong>Target Period:</strong> {{ store.selectedTargetPeriod }}</td>
                    </tr>
                  </tbody>
                </table>

                <!-- Main Table -->
                <div class="table-container">
                  <table class="full-width main-table">
                    <thead class="no-repeat-header">
                      <tr>
                        <th class="text-center mfo-column">MFO</th>
                        <th colspan="3" class="text-center competency-header">REQUIRED COMPETENCY & PROFICIENCY LEVEL
                        </th>
                        <th rowspan="2" class="text-center indicator-column">SUCCESS INDICATOR</th>
                        <th rowspan="2" class="text-center output-column">REQUIRED OUTPUT</th>
                        <th class="text-center standards-header" colspan="5">STANDARDS PER OUTPUT/SUCCESS INDICATOR</th>
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
                      <template v-for="(employee, empIndex) in currentDivisionData.employees" :key="empIndex">
                        <tr>
                          <td>Employee:</td>
                          <td colspan="10">{{ employee.name }}</td>
                        </tr>
                        <tr>
                          <td>Position/SG:</td>
                          <td colspan="10">{{ employee.position }}</td>
                        </tr>
                        <tr>
                          <td>Employee Rank:</td>
                          <td colspan="10">{{ employee.rank }}</td>
                        </tr>
                        <!-- <tr v-for="(output, outIndex) in employee.outputs" :key="`${empIndex}-${outIndex}`">
                          <td class="mfo-cell" v-html="output.name"></td>
                          <td v-html="output.core"></td>
                          <td v-html="output.technical"></td>
                          <td v-html="output.leadership"></td>
                          <td v-html="output.indicator"></td>
                          <td v-html="output.required"></td>
                          <td v-html="output.standard5"></td>
                          <td v-html="output.standard4"></td>
                          <td v-html="output.standard3"></td>
                          <td v-html="output.standard2"></td>
                          <td v-html="output.standard1"></td>
                        </tr> -->
                        <tr v-for="(output, outIndex) in employee.outputs" :key="`${empIndex}-${outIndex}`">
                          <td class="mfo-cell" v-html="output.name || 'N/A'"></td>
                          <td v-html="output.core || 'N/A'"></td>
                          <td v-html="output.technical || 'N/A'"></td>
                          <td v-html="output.leadership || 'N/A'"></td>
                          <td v-html="output.indicator || 'N/A'"></td>
                          <td v-html="output.required || 'N/A'"></td>
                          <td v-html="output.standard5 || 'N/A'"></td>
                          <td v-html="output.standard4 || 'N/A'"></td>
                          <td v-html="output.standard3 || 'N/A'"></td>
                          <td v-html="output.standard2 || 'N/A'"></td>
                          <td v-html="output.standard1 || 'N/A'"></td>
                        </tr>
                      </template>
                    </tbody>
                  </table>
                </div>

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

        <!-- Empty State -->
        <div v-else class="full-width row flex-center q-pa-xl text-grey-7">
          <q-icon name="info" size="2em" class="q-mr-sm" />
          <div>Loading division data...</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { useUnitWorkPlanStore } from 'src/stores/office/unit_work_plantStore'
import { onMounted, ref, watch } from 'vue'
import { useUserStore } from 'src/stores/userStore'


export default {
  name: 'UnitWorkPlanReport',

  props: {
    targetPeriod: String,
    filteredDivisions: Array
  },

  setup(props) {
    const store = useUnitWorkPlanStore()
    const currentDivisionData = ref(null)
    const isGeneratingPdf = ref(false)
    const isPrinting = ref(false)
    const userStore = useUserStore()

    onMounted(() => {
      userStore.loadUserData();
    });

    // Function to select the first division automatically
    const selectFirstDivisionAvailable = async () => {
      if (store.divisions && store.divisions.length > 0) {
        const firstDivision = store.divisions[0]
        await selectDivision(firstDivision.division, firstDivision.target_period)
      }
    }

    onMounted(async () => {
      try {
        // Fetch divisions with work plans for the selected target period
        await store.fetchDivisionsWithWorkPlans(props.targetPeriod)

        // Select the first division automatically after divisions are loaded
        await selectFirstDivisionAvailable()
      } catch (error) {
        console.error('Error initializing component:', error)
      }
    })

    // Also watch for changes in the divisions array
    watch(() => store.divisions, async (newDivisions) => {
      if (newDivisions && newDivisions.length > 0 && !store.selectedDivision) {
        await selectFirstDivisionAvailable()
      }
    }, { deep: true })

    const selectDivision = async (division, targetPeriod) => {
      try {
        store.setSelectedDivision(division)
        store.setTargetPeriod(targetPeriod || props.targetPeriod)
        store.selectedTargetPeriod = targetPeriod || props.targetPeriod

        // Use the filtered divisions if available
        if (props.filteredDivisions && props.filteredDivisions.length > 0) {
          const filteredDivision = props.filteredDivisions.find(d => d.division === division)
          if (filteredDivision) {
            currentDivisionData.value = await store.fetchDivisionDetails(division, filteredDivision.targetPeriod)
            return
          }
        }

        // Fallback to API call if filtered divisions not available
        currentDivisionData.value = await store.fetchDivisionDetails(division, targetPeriod || props.targetPeriod)
      } catch (error) {
        console.error('Error loading division data:', error)
        // Use Quasar notification if available
        if (typeof store.$q !== 'undefined') {
          store.$q.notify({
            type: 'negative',
            message: 'Failed to load division data. Please try again.'
          })
        }
      }
    }

    const directPrint = () => {
      isPrinting.value = true
      // Create a hidden iframe with proper styling for printing
      const printFrame = document.createElement('iframe')
      printFrame.style.position = 'fixed'
      printFrame.style.right = '0'
      printFrame.style.bottom = '0'
      printFrame.style.width = '0'
      printFrame.style.height = '0'
      printFrame.style.border = '0'

      document.body.appendChild(printFrame)

      printFrame.onload = () => {
        const printDocument = printFrame.contentWindow.document
        const printSection = document.getElementById('print-section')

        // Copy the CSS
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]')
        styles.forEach(style => {
          printDocument.head.appendChild(style.cloneNode(true))
        })

        // Add print-specific stylesheet
        const printStyle = document.createElement('style')
        printStyle.textContent = `
          @page {
            size: legal landscape;
            margin: 10mm;
          }
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
          }
          .logo {
            width: 120px;
            height: auto;
          }
          .main-table {
            table-layout: fixed;
            width: 100%;
          }
          .main-table tr {
            page-break-inside: avoid; /* Prevent rows from breaking across pages */
          }
          /* Force headers to NOT repeat */
          .no-repeat-header {
            display: table-header-group !important;
            break-inside: avoid !important;
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          /* Explicit override for print browsers that repeat headers */
          thead.no-repeat-header {
            display: table-header-group !important;
          }
          @media print {
            thead.no-repeat-header { display: table-row-group !important; }
          }
          .main-table tbody {
            display: table-row-group; /* Keep body rows together */
          }
          table {
            page-break-inside: auto; /* Allow page breaks between rows if needed */
          }
          .header-container {
            display: flex;
            align-items: center;
          }
          .header-text {
            margin-left: 20px;
          }
          .green-banner {
            background-color: #00703C;
            color: white;
            font-weight: bold;
            padding: 8px 0;
            text-align: center;
            width: 100%;
          }
          .mfo-column { width: 10%; }
          .competency-column { width: 10%; }
          .indicator-column { width: 10%; }
          .output-column { width: 10%; }
          .standard-column { width: 8%; }
        `
        printDocument.head.appendChild(printStyle)

        // Copy the content
        printDocument.body.innerHTML = printSection.innerHTML

        // Print and cleanup
        setTimeout(() => {
          printFrame.contentWindow.print()
          setTimeout(() => {
            document.body.removeChild(printFrame)
            isPrinting.value = false
          }, 500)
        }, 500)
      }

      // Set iframe source to trigger onload
      printFrame.src = 'about:blank'
    }

    const downloadPdf = async () => {
      try {
        isGeneratingPdf.value = true

        const printSection = document.getElementById('print-section')
        const canvas = await html2canvas(printSection, {
          scale: 2, // Higher scale for better quality
          useCORS: true,
          logging: false,
          allowTaint: true
        })

        // Create PDF in landscape orientation
        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: 'legal'
        })

        const imgData = canvas.toDataURL('image/png')
        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()
        const imgWidth = canvas.width
        const imgHeight = canvas.height
        const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
        const imgX = (pdfWidth - imgWidth * ratio) / 2
        const imgY = 10 // Small margin from top

        pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)

        // Save PDF with division name
        const divisionName = currentDivisionData.value.name.replace(/\s+/g, '_')
        pdf.save(`Unit_Work_Plan_${divisionName}.pdf`)
      } catch (error) {
        console.error('PDF generation error:', error)
        if (typeof store.$q !== 'undefined') {
          store.$q.notify({
            color: 'negative',
            message: 'Failed to generate PDF. Please try again.',
            icon: 'error'
          })
        } else {
          alert('Failed to generate PDF. Please try again.')
        }
      } finally {
        isGeneratingPdf.value = false
      }
    }

    return {
      store,
      currentDivisionData,
      isGeneratingPdf,
      isPrinting,
      directPrint,
      downloadPdf,
      selectDivision,
      selectFirstDivisionAvailable,
      userStore
    }
  }
}
</script>

<style scoped src="../assets/office/UnitWorkPlanReport.css"></style>
