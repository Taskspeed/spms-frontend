<template>
  <!-- App Header -->
  <div class="app-container">
    <div class="app-header">
      <div class="header-content">
        <div class="text-h6 text-white">
          CITY OF TAGUM -
          {{ levels?.office || 'N/A' }}
        </div>
      </div>
      <div class="col-auto">
        <q-btn flat round dense text-color="white" icon="close" @click="handleClose" />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <!-- Fixed Left Navigation -->
      <div class="division-nav">
        <div class="division-nav-header">
          <div class="text-h6">Employee Details</div>
        </div>
        <q-list padding class="employee-details">
          <q-item>
            <q-item-section>
              <q-item-label caption>Name</q-item-label>
              <q-item-label>{{ employee?.label || employee?.name || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption>Position</q-item-label>
              <q-item-label>{{ employee?.position || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption>Control No</q-item-label>
              <q-item-label>{{ controlNo || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption>Status</q-item-label>
              <q-item-label>
                <q-badge
                  :color="getStatusColor(employee?.ipcrStatus)"
                  :text-color="getStatusTextColor(employee?.ipcrStatus)"
                  align="middle"
                  class="q-px-md q-py-xs"
                  rounded
                >
                  <q-icon :name="getStatusIcon(employee?.ipcrStatus)" class="q-mr-xs" />
                  {{ employee?.ipcrStatus || 'N/A' }}
                </q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>

          <q-separator class="q-my-md" />
          <q-item>
            <q-btn
              color="positive"
              label="Approve"
              class="full-width"
              :disable="employee?.ipcrStatus === 'Approved'"
              @click="handleApprove"
            />
          </q-item>
        </q-list>
      </div>

      <!-- Report Content Area - With Tabs -->
      <div class="report-container">
        <!-- Fixed Report Header -->
        <div class="report-header">
          <div class="row items-center no-wrap">
            <div class="col">
              <div class="text-h6">IPCR Documents</div>
              <div class="text-subtitle2">
                Target Period: {{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}
              </div>
            </div>
            <div class="flex justify-end q-gutter-sm">
              <q-btn
                color="green-9"
                icon="print"
                label="Print"
                @click="printPdf"
                :loading="isPrinting"
                :disable="!hasData"
              />
            </div>
          </div>
        </div>

        <!-- Tabs for different report types -->
        <q-tabs
          v-model="activeTab"
          dense
          class="text-grey"
          active-color="green-8"
          indicator-color="green-8"
          align="justify"
          narrow-indicator
          @update:model-value="handleTabChange"
        >
          <q-tab name="ipcr" label="IPCR" />
          <q-tab name="ps" label="Performance Standard" />
          <q-tab name="mpo" label="Monthly Performance Output" />
          <q-tab name="smpr" label="Summary Monthly Performance Report" />
        </q-tabs>

        <!-- Scrollable Report Content -->
        <div class="report-content-scroll">
          <!-- Loading Indicator -->
          <div v-if="isTabLoading" class="q-pa-xl text-center">
            <q-spinner color="green-8" size="3em" />
            <div class="q-mt-md text-grey-7">Loading data...</div>
          </div>

          <!-- Error Message -->
          <div v-else-if="ipcrStore.error" class="q-pa-xl text-center">
            <q-icon name="error_outline" size="3em" color="negative" />
            <div class="q-mt-md text-negative">{{ ipcrStore.error }}</div>
            <q-btn
              flat
              color="primary"
              label="Retry"
              class="q-mt-md"
              @click="handleTabChange(activeTab)"
            />
          </div>

          <!-- Tab Panels -->
          <q-tab-panels v-else v-model="activeTab" animated>
            <!-- IPCR Tab - Updated to handle monthly_ratings object structure -->
            <q-tab-panel name="ipcr">
              <div class="report-content">
                <!-- Header with Logo -->
                <div class="header">
                  <img src="/tagumlogo.png" alt="City of Tagum Logo" class="logo" />
                  <div class="center-text">
                    <div class="title">INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)</div>
                    <div class="title">
                      {{ currentData?.office || employee?.office || employee?.division || 'N/A' }}
                    </div>
                  </div>
                  <img src="/rotp.png" alt="Republic of the Philippines Logo" class="logo" />
                </div>

                <!-- Commitment Section -->
                <div class="commitment-section">
                  <div style="display: flex">
                    <!-- Left section (3/4 width) -->
                    <div style="flex: 3; padding-right: 10px">
                      <div style="font-size: 11px; line-height: 1.5">
                        I,
                        <strong
                          ><u>{{
                            currentData?.name || employee?.label || employee?.name
                          }}</u></strong
                        >, of
                        <strong
                          ><u>{{
                            currentData?.office || employee?.office || employee?.division || 'N/A'
                          }}</u></strong
                        >, commit to deliver and agree to be rated on the attainment of the
                        following targets in accordance with the indicated measure for the period
                        {{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}.
                      </div>
                      <div style="display: flex; justify-content: flex-end; padding-right: 80px">
                        <div style="padding-bottom: 10px; text-align: center">
                          <div style="padding-top: 30px; font-size: 11px">
                            <strong
                              ><u>{{
                                currentData?.name || employee?.label || employee?.name
                              }}</u></strong
                            >
                          </div>
                          <div style="font-size: 11px">
                            {{ currentData?.position || employee?.position }}
                          </div>
                          <div style="font-size: 11px">
                            Date:<strong
                              ><u>{{ formatDate(new Date()) }}</u></strong
                            >
                          </div>
                        </div>
                      </div>
                      <div>
                        <table
                          style="width: 100%; border-collapse: collapse; border: 1px solid black"
                        >
                          <thead>
                            <tr>
                              <th
                                style="
                                  border: 1px solid black;
                                  padding: 8px;
                                  text-align: left;
                                  font-size: 11px;
                                "
                              >
                                Reviewed by:
                              </th>
                              <th
                                style="
                                  border: 1px solid black;
                                  padding: 8px;
                                  text-align: left;
                                  font-size: 11px;
                                "
                              >
                                Approved by:
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td
                                style="
                                  border: 1px solid black;
                                  padding-top: 30px;
                                  text-align: center;
                                "
                              >
                                <div style="font-size: 11px">
                                  <strong
                                    ><u>
                                      {{
                                        supervisorySignatory?.name || managerialSignatory?.name
                                      }}</u
                                    ></strong
                                  >
                                </div>
                                <div style="font-size: 11px">
                                  {{
                                    supervisorySignatory?.position || managerialSignatory?.position
                                  }}
                                </div>
                                <div style="font-size: 11px">
                                  Date:<u> {{ formatDate(new Date()) }}</u>
                                </div>
                              </td>
                              <td
                                colspan="2"
                                style="
                                  border: 1px solid black;
                                  padding-top: 30px;
                                  text-align: center;
                                "
                              >
                                <div style="font-size: 11px">
                                  <strong
                                    ><u>{{ managerialSignatory?.name }}</u></strong
                                  >
                                </div>
                                <div style="font-size: 11px">
                                  {{ managerialSignatory?.position }}
                                </div>
                                <div style="font-size: 11px">
                                  Date:<u> {{ formatDate(new Date()) }}</u>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Right section (1/4 width) - Stamps -->
                    <div
                      style="
                        flex: 1;
                        align-items: flex-end;
                        display: flex;
                        flex-direction: column;
                        gap: 30px;
                      "
                    >
                      <!-- First Stamp -->
                      <div
                        style="
                          border: 3px double navy;
                          text-align: center;
                          color: navy;
                          width: 250px;
                        "
                      >
                        <div style="font-size: 10px; font-weight: bold">
                          LOCAL GOVERNMENT OF TAGUM CITY
                        </div>

                        <div style="font-size: 11px">IPCR Accomplishment</div>
                        <div style="font-size: 11px; font-weight: bold">RECEIVED</div>
                        <div style="text-align: left; padding-left: 10px; font-size: 10px">
                          By:
                          <span
                            style="
                              border-bottom: 1px solid #000;
                              display: inline-block;
                              width: 190px;
                            "
                          ></span>
                        </div>
                        <div style="text-align: left; padding-left: 10px; font-size: 10px">
                          Date & Time:
                          <span
                            style="
                              border-bottom: 1px solid #000;
                              display: inline-block;
                              width: 120px;
                            "
                          ></span>
                        </div>
                      </div>

                      <!-- Second Stamp -->
                      <div
                        style="
                          border: 3px double navy;
                          text-align: center;
                          color: navy;
                          width: 250px;
                        "
                      >
                        <div style="font-size: 10px; font-weight: bold">
                          LOCAL GOVERNMENT OF TAGUM CITY
                        </div>
                        <div style="font-size: 11px">IPCR Accomplishment</div>
                        <div style="font-size: 11px; font-weight: bold">RECEIVED</div>
                        <div style="text-align: left; padding-left: 10px; font-size: 10px">
                          By:
                          <span
                            style="
                              border-bottom: 1px solid #000;
                              display: inline-block;
                              width: 190px;
                            "
                          ></span>
                        </div>
                        <div style="text-align: left; padding-left: 10px; font-size: 10px">
                          Date & Time:
                          <span
                            style="
                              border-bottom: 1px solid #000;
                              display: inline-block;
                              width: 120px;
                            "
                          ></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Performance Management and Rating Legend -->
                <div style="display: flex; gap: 20px; align-items: flex-start; margin-top: 20px">
                  <!-- Stamp Box -->
                  <div
                    style="
                      border: 3px double navy;
                      text-align: center;
                      color: navy;
                      width: 300px;
                      padding: 10px;
                    "
                  >
                    <div style="font-size: 11px; font-weight: bold">
                      Performance Management Team
                    </div>
                    <div
                      style="
                        text-align: left;
                        padding-left: 10px;
                        font-size: 10px;
                        margin-top: 15px;
                      "
                    >
                      Target Calibrated by:
                      <span
                        style="border-bottom: 1px solid #000; display: inline-block; width: 150px"
                      ></span>
                    </div>
                    <div
                      style="
                        text-align: left;
                        padding-left: 10px;
                        font-size: 10px;
                        margin-top: 10px;
                      "
                    >
                      Date:
                      <span
                        style="border-bottom: 1px solid #000; display: inline-block; width: 230px"
                      ></span>
                    </div>
                  </div>

                  <!-- Rating Table -->
                  <table style="border-collapse: collapse; border: 1px solid black; width: 250px">
                    <tbody>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            width: 30px;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          5
                        </td>
                        <td style="border: 1px solid black; padding: 5px 10px; font-size: 8px">
                          Outstanding
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          4
                        </td>
                        <td style="border: 1px solid black; padding: 5px 8px; font-size: 8px">
                          Very Satisfactory
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          3
                        </td>
                        <td style="border: 1px solid black; padding: 5px 8px; font-size: 8px">
                          Satisfactory
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          2
                        </td>
                        <td style="border: 1px solid black; padding: 5px 8px; font-size: 8px">
                          Unsatisfactory
                        </td>
                      </tr>
                      <tr>
                        <td
                          style="
                            border: 1px solid black;
                            text-align: center;
                            padding: 5px;
                            font-size: 8px;
                          "
                        >
                          1
                        </td>
                        <td style="border: 1px solid black; padding: 5px 8px; font-size: 8px">
                          Poor
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Main Performance Table -->
                <div class="q-mt-md">
                  <div class="table-container">
                    <table class="full-width main-table" style="table-layout: fixed; width: 100%">
                      <thead>
                        <tr>
                          <th rowspan="2" class="text-center col-mfo">MAJOR FINAL OUTPUT</th>
                          <th rowspan="2" class="text-center col-competency">
                            REQUIRED COMPETENCY & PROFICIENCY LEVEL
                          </th>
                          <th rowspan="2" class="text-center col-success">SUCCESS INDICATOR</th>
                          <th rowspan="2" class="text-center col-accomplishment">
                            ACTUAL ACCOMPLISHMENT
                          </th>
                          <th colspan="4" class="text-center">RATING</th>
                          <th rowspan="2" class="text-center col-proficiency">
                            PROFICIENCY RESULT
                          </th>
                          <th rowspan="2" class="text-center col-remarks">REMARKS</th>
                        </tr>
                        <tr>
                          <th class="text-center col-rating">Q</th>
                          <th class="text-center col-rating">E</th>
                          <th class="text-center col-rating">T</th>
                          <th class="text-center col-rating">A</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Display performance standards data -->
                        <template v-if="ipcrPerformanceData?.length">
                          <!-- Group by category -->
                          <template
                            v-for="(categoryGroup, catIndex) in groupedIpcrData"
                            :key="`cat-${catIndex}`"
                          >
                            <!-- Category Header -->
                            <tr>
                              <td colspan="10" class="section-header">
                                {{ categoryGroup.category }}
                              </td>
                            </tr>

                            <!-- Group by MFO -->
                            <template
                              v-for="(mfoGroup, mfoIndex) in categoryGroup.mfos"
                              :key="`mfo-${catIndex}-${mfoIndex}`"
                            >
                              <!-- MFO Header -->
                              <tr>
                                <td colspan="10" class="section-mfo">
                                  MFO {{ mfoIndex + 1 }} - {{ mfoGroup.mfo }}
                                </td>
                              </tr>

                              <!-- Outputs -->
                              <template
                                v-for="(standard, stdIndex) in mfoGroup.standards"
                                :key="`std-${catIndex}-${mfoIndex}-${stdIndex}`"
                              >
                                <tr>
                                  <td>
                                    Output {{ stdIndex + 1 }} -
                                    {{ standard.output || standard.mfo }}
                                  </td>
                                  <td>
                                    <div class="competency-list">
                                      <!-- Combined Competencies -->
                                      <template v-if="getAllCompetencies(standard).length > 0">
                                        <div
                                          v-for="(comp, idx) in getAllCompetencies(standard)"
                                          :key="`comp-${idx}`"
                                          class="competency-item"
                                        >
                                          {{ idx + 1 }}. {{ comp.description }} ({{
                                            getProficiencyLevel(comp.level)
                                          }})
                                        </div>
                                      </template>
                                      <template v-else>
                                        <span class="text-grey-7">No competencies specified</span>
                                      </template>
                                    </div>
                                  </td>
                                  <td>{{ standard.success_indicator }}</td>
                                  <td>
                                    <!-- Show actual accomplishment if available in monthly_ratings -->
                                    <template
                                      v-if="standard.monthly_ratings?.actual_accomplishment"
                                    >
                                      {{ standard.monthly_ratings.actual_accomplishment }}
                                    </template>
                                    <span v-else></span>
                                  </td>
                                  <td class="text-center">
                                    <!-- Quality Rating (Quantity in your data) -->
                                    <template v-if="standard.monthly_ratings?.average?.quantity">
                                      {{ standard.monthly_ratings.average.quantity }}
                                    </template>
                                    <span v-else>-</span>
                                  </td>
                                  <td class="text-center">
                                    <!-- Efficiency Rating (Effectiveness in your data) -->
                                    <template
                                      v-if="standard.monthly_ratings?.average?.effectiveness"
                                    >
                                      {{ standard.monthly_ratings.average.effectiveness }}
                                    </template>
                                    <span v-else>-</span>
                                  </td>
                                  <td class="text-center">
                                    <!-- Timeliness Rating -->
                                    <template v-if="standard.monthly_ratings?.average?.timeliness">
                                      {{ standard.monthly_ratings.average.timeliness }}
                                    </template>
                                    <span v-else>-</span>
                                  </td>
                                  <td class="text-center">
                                    <!-- Average Rating (Overall in your data) -->
                                    <template v-if="standard.monthly_ratings?.average?.overall">
                                      {{ standard.monthly_ratings.average.overall }}
                                    </template>
                                    <span v-else>-</span>
                                  </td>
                                  <td class="text-center">
                                    <!-- Proficiency Result -->
                                    <div class="competency-list">
                                      <!-- Combined Competencies -->
                                      <template v-if="getAllCompetencies(standard).length > 0">
                                        <div
                                          v-for="(comp, idx) in getAllCompetencies(standard)"
                                          :key="`comp-${idx}`"
                                          class="competency-item"
                                        >
                                          {{ idx + 1 }}. {{ getProficiencyLevel(comp.level) }}
                                        </div>
                                      </template>
                                      <template v-else>
                                        <span class="text-grey-7">Not Applicable</span>
                                      </template>
                                    </div>
                                  </td>
                                  <td>
                                    <!-- Show remarks if available -->
                                    <template v-if="standard.monthly_ratings?.remarks">
                                      {{ standard.monthly_ratings.remarks }}
                                    </template>
                                    <span v-else>-</span>
                                  </td>
                                </tr>
                              </template>
                            </template>

                            <!-- Category Average -->
                            <tr>
                              <td colspan="7" class="text-right text-weight-bold">
                                {{ categoryGroup.category }} Average Rating
                              </td>
                              <td class="text-center text-weight-bold">
                                {{ categoryGroup.averageRating }}
                              </td>
                              <td colspan="2"></td>
                            </tr>
                          </template>

                          <!-- Final Rating -->
                          <tr>
                            <td colspan="7" class="text-right text-weight-bold">
                              Final Average Rating
                            </td>
                            <td class="text-center text-weight-bold">
                              {{ finalAverageRating }}
                            </td>
                            <td colspan="2"></td>
                          </tr>
                        </template>
                        <template v-else>
                          <tr>
                            <td colspan="10" class="text-center text-grey-7">
                              No IPCR data available
                            </td>
                          </tr>
                        </template>
                      </tbody>
                      <tfoot>
                        <!-- Category Calculations -->
                        <tr>
                          <td></td>
                          <td style="text-align: center; font-weight: bold">Performance Results</td>
                          <td colspan="5" style="text-align: center; font-weight: bold">
                            Competency Assessment(Subjective)
                          </td>
                          <td colspan="3"></td>
                        </tr>
                        <template v-if="categoryCalculations.length">
                          <tr v-for="(calc, index) in categoryCalculations" :key="`calc-${index}`">
                            <td>{{ calc.category }}</td>
                            <!-- <td>
          {{ calc.weightedAverage }} = ({{ calc.formula }}) * {{ calc.weight }}
        </td> -->
                            <td>
                              {{ calc.weightedAverage }}
                            </td>
                            <td
                              v-if="index === 0"
                              :rowspan="categoryCalculations.length + 2"
                              colspan="5"
                            ></td>
                            <td
                              v-if="index === 0"
                              :rowspan="categoryCalculations.length + 2"
                              colspan="3"
                            >
                              <div
                                style="
                                  border: 3px double navy;
                                  text-align: center;
                                  color: navy;
                                  padding: 8px;
                                "
                              >
                                <div style="font-size: 13px; font-weight: bold">
                                  Performance Management Team
                                </div>
                                <div
                                  style="
                                    text-align: left;
                                    padding-left: 8px;
                                    font-size: 8px;
                                    margin-top: 15px;
                                  "
                                >
                                  Target Calibrated by:
                                  <span
                                    style="
                                      border-bottom: 1px solid #000;
                                      display: inline-block;
                                      width: 150px;
                                    "
                                  ></span>
                                </div>
                                <div
                                  style="
                                    text-align: left;
                                    padding-left: 8px;
                                    font-size: 8px;
                                    margin-top: 10px;
                                  "
                                >
                                  Date:
                                  <span
                                    style="
                                      border-bottom: 1px solid #000;
                                      display: inline-block;
                                      width: 230px;
                                    "
                                  ></span>
                                </div>
                              </div>
                            </td>
                          </tr>

                          <!-- Total Row -->
                          <tr>
                            <td>Total</td>
                            <td colspan="4">{{ finalAverageRating }}</td>
                          </tr>

                          <!-- Adjectival Rating Row -->
                          <tr>
                            <td>ADJECTIVAL RATING</td>
                            <td colspan="4">{{ adjectivalRating }}</td>
                          </tr>
                        </template>

                        <!-- Comments Section -->
                        <tr>
                          <td colspan="10">
                            <strong>Comments and Recommendations for Development Purposes</strong>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="10">
                            <div style="height: 50px"></div>
                          </td>
                        </tr>

                        <!-- Signatures Section - Using nested table for better control -->
                        <tr>
                          <td colspan="10" style="padding: 0">
                            <table
                              style="
                                width: 100%;
                                border-collapse: collapse;

                                table-layout: fixed;
                              "
                            >
                              <tbody>
                                <!-- Header Row -->
                                <tr>
                                  <td style="width: 30%; text-align: left; padding: 10px 5px">
                                    <strong>Discussed with:</strong>
                                  </td>
                                  <td style="width: 10%; text-align: left; padding: 10px 5px">
                                    <strong>Date:</strong>
                                  </td>
                                  <td style="width: 30%; text-align: left; padding: 10px 5px">
                                    <strong>Assessed by:</strong>
                                  </td>
                                  <td style="width: 10%; text-align: left; padding: 10px 5px">
                                    <strong>Date:</strong>
                                  </td>
                                  <td style="width: 20%; text-align: left; padding: 10px 5px">
                                    <strong>Final Rating by:</strong>
                                  </td>
                                  <td style="width: 10%; text-align: left; padding: 10px 5px">
                                    <strong>Date:</strong>
                                  </td>
                                </tr>

                                <!-- Signature Row -->
                                <tr style="height: 80px">
                                  <!-- Employee -->
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div style="padding-top: 50px">
                                      <strong
                                        style="
                                          display: inline;
                                          border-bottom: 1px solid #000;
                                          padding-bottom: 2px;
                                        "
                                      >
                                        {{ employee?.label || employee?.name }}
                                      </strong>
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">
                                      {{ employee?.position }}
                                    </div>
                                  </td>

                                  <!-- Employee Date -->
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div
                                      style="
                                        display: inline;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        min-height: 25px;
                                      "
                                    >
                                      {{ formatDate(new Date()) }}
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">Date</div>
                                  </td>

                                  <!-- Supervisor -->
                                  <td style="vertical-align: top; text-align: center">
                                    <div style="text-align: left; font-size: 10px">
                                      I certify that I discussed my assessment of the performance
                                      with the employee
                                    </div>

                                    <strong
                                      style="
                                        display: inline-block;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        min-height: 25px;
                                        margin-top: 35px;
                                      "
                                    >
                                      {{ supervisorySignatory?.name || managerialSignatory?.name }}
                                    </strong>

                                    <div
                                      style="margin-top: 5px; font-size: 11px; padding-bottom: 5px"
                                    >
                                      {{
                                        supervisorySignatory?.position ||
                                        managerialSignatory?.position
                                      }}
                                    </div>
                                  </td>

                                  <!-- Supervisor Date -->
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div
                                      style="
                                        display: inline;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        min-height: 25px;
                                      "
                                    >
                                      {{ formatDate(new Date()) }}
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">Date</div>
                                  </td>

                                  <!-- Department Head -->
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div style="padding-top: 50px">
                                      <strong
                                        style="
                                          display: inline;
                                          border-bottom: 1px solid #000;
                                          padding-bottom: 2px;
                                        "
                                      >
                                        {{ managerialSignatory?.name }}
                                      </strong>
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">
                                      {{ managerialSignatory?.position }}
                                    </div>
                                  </td>

                                  <!-- Department Date -->
                                  <td
                                    style="
                                      vertical-align: bottom;
                                      text-align: center;
                                      padding-bottom: 15px;
                                    "
                                  >
                                    <div
                                      style="
                                        display: inline;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        min-height: 25px;
                                      "
                                    >
                                      {{ formatDate(new Date()) }}
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">Date</div>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    <div style="padding-left: 30%; padding-top: 30px; padding-bottom: 25px">
                      <table style="border: 1px solid black; border-collapse: collapse">
                        <tbody>
                          <tr style="font-size: 11px">
                            <td
                              colspan="2"
                              style="
                                border: 1px solid black;
                                font-weight: bold;
                                padding: 5px;
                                text-align: center;
                              "
                            >
                              Proficiency Levels of Competency:
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                width: 25%;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Basic
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Understands basic principles; Can perform task with assistance or
                              direction
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Advanced
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Performs routine task with reliable results; Works with minimal
                              supervision
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Intermediate
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Performs complex and multiple tasks; Can coach and teach others
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Superior
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Considered as an expert in this task; Can describe, teach and lead
                              others
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Performance Standard Tab -->
            <q-tab-panel name="ps">
              <div class="report-content">
                <div class="header">
                  <img src="/rotp.png" alt="City of Tagum Logo" class="logo" />
                  <img src="/tagumlogo.png" alt="City of Tagum Logo" class="logo" />

                  <div class="center-text">
                    <div class="title">
                      {{ levels.office || 'N/A' }}
                    </div>
                    <div class="title">
                      PERFORMANCE STANDARDS FOR RATING PERIOD
                      <u>{{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}</u>
                    </div>
                  </div>

                  <div
                    style="
                      border: 7px double #bf9000;
                      text-align: center;
                      color: #7f6000;
                      padding: 8px;
                    "
                  >
                    <div style="font-size: 13px; font-weight: bold">
                      Performance Management Team
                    </div>
                    <div
                      style="text-align: left; padding-left: 8px; font-size: 8px; margin-top: 15px"
                    >
                      Target Calibrated by:
                      <span
                        style="
                          border-bottom: 1px solid #bf9000;
                          display: inline-block;
                          width: 150px;
                        "
                      ></span>
                    </div>
                    <div
                      style="text-align: left; padding-left: 8px; font-size: 8px; margin-top: 10px"
                    >
                      Date:
                      <span
                        style="
                          border-bottom: 1px solid #bf9000;
                          display: inline-block;
                          width: 230px;
                        "
                      ></span>
                    </div>
                  </div>
                </div>

                <div class="q-mt-md">
                  <table class="full-width info-table">
                    <tbody>
                      <tr>
                        <td><strong>Employee:</strong> {{ employee?.label || employee?.name }}</td>
                        <td><strong>Position:</strong> {{ employee?.position }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="table-container q-mt-md">
                    <table class="full-width main-table">
                      <thead>
                        <tr>
                          <th>MAJOR FINAL OUTPUT (MFO)</th>
                          <th>REQUIRED COMPETENCY</th>
                          <th>SUCCESS INDICATOR</th>
                          <th>RATING</th>
                          <th>
                            <div>Q</div>
                            <div>(Quantity)</div>
                          </th>
                          <th>
                            <div>E</div>
                            <div>(Effectiveness)</div>
                          </th>
                          <th>
                            <div>T</div>
                            <div>(Timeliness)</div>
                          </th>
                          <th>Mode of Verification</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Group performance standards by category -->
                        <template v-if="groupedPerformanceStandards.length">
                          <template
                            v-for="(
                              categoryGroup, catIndex
                            ) in groupedPerformanceStandardsByCategory"
                            :key="`cat-${catIndex}`"
                          >
                            <!-- Category Header Row -->
                            <tr class="category-row">
                              <td colspan="9" class="category-header">
                                {{ categoryGroup.category }}
                              </td>
                            </tr>

                            <!-- Group by MFO within category -->
                            <template
                              v-for="(mfoGroup, mfoIndex) in categoryGroup.mfos"
                              :key="`mfo-${catIndex}-${mfoIndex}`"
                            >
                              <!-- MFO Header Row -->
                              <tr class="mfo-row">
                                <td colspan="9" class="mfo-header">
                                  MFO {{ mfoIndex + 1 }} - {{ mfoGroup.mfo }}
                                </td>
                              </tr>

                              <!-- Output rows -->
                              <template
                                v-for="(standard, stdIndex) in mfoGroup.standards"
                                :key="`std-${catIndex}-${mfoIndex}-${stdIndex}`"
                              >
                                <!-- If there are standard outcomes, show each rating level as a separate row -->
                                <template
                                  v-if="
                                    standard.standard_outcomes &&
                                    standard.standard_outcomes.length > 0
                                  "
                                >
                                  <tr
                                    v-for="(outcome, outcomeIndex) in standard.standard_outcomes"
                                    :key="`outcome-${index}-${outcomeIndex}`"
                                  >
                                    <!-- Output cell - show only for first row of each standard -->
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      Output {{ stdIndex + 1 }} - {{ standard.mfo }}
                                    </td>

                                    <!-- Required Competency cell - show only for first row -->
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      <!-- Combined Competencies as numbered list -->
                                      <div class="competency-list">
                                        <!-- Get all competencies as a flat array -->
                                        <template v-if="getAllCompetencies(standard).length > 0">
                                          <div
                                            v-for="(comp, idx) in getAllCompetencies(standard)"
                                            :key="`comp-${idx}`"
                                            class="competency-item"
                                          >
                                            {{ idx + 1 }}. {{ comp.description }}
                                            <span v-if="comp.level" class="text-weight-light">
                                              ({{ getProficiencyLevel(comp.level) }})
                                            </span>
                                          </div>
                                        </template>
                                        <template v-else>
                                          <span class="text-grey-7">No competencies specified</span>
                                        </template>
                                      </div>
                                    </td>

                                    <!-- Success Indicator cell - show only for first row -->
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      {{ standard.success_indicator }}
                                    </td>

                                    <!-- Rating columns (always shown) -->
                                    <td style="text-align: center">{{ outcome.rating || '-' }}</td>
                                    <td style="text-align: center">
                                      {{ outcome.quantity || '-' }}
                                    </td>
                                    <td style="text-align: center">
                                      {{ outcome.effectiveness || '-' }}
                                    </td>
                                    <td style="text-align: center">
                                      {{ outcome.timeliness || '-' }}
                                    </td>

                                    <!-- Mode of Verification cell - show only for first row -->
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                      style="text-align: center"
                                    >
                                      {{ standard.required_output || '-' }}
                                    </td>

                                    <!-- Remarks cell - show only for first row -->
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      {{ standard.remarks || '-' }}
                                    </td>
                                  </tr>
                                </template>
                                <!-- If no standard outcomes, show a single row -->
                                <template v-else>
                                  <tr>
                                    <td>Output {{ stdIndex + 1 }} - {{ standard.mfo }}</td>
                                    <td>
                                      <!-- Combined Competencies as numbered list -->
                                      <div class="competency-list">
                                        <!-- Get all competencies as a flat array -->
                                        <template v-if="getAllCompetencies(standard).length > 0">
                                          <div
                                            v-for="(comp, idx) in getAllCompetencies(standard)"
                                            :key="`comp-${idx}`"
                                            class="competency-item"
                                          >
                                            {{ idx + 1 }}. {{ comp.description }}
                                            <span v-if="comp.level" class="text-weight-light">
                                              ({{ getProficiencyLevel(comp.level) }})
                                            </span>
                                          </div>
                                        </template>
                                        <template v-else>
                                          <span class="text-grey-7">No competencies specified</span>
                                        </template>
                                      </div>
                                    </td>
                                    <td>{{ standard.success_indicator }}</td>
                                    <td class="text-center">-</td>
                                    <td class="text-center">-</td>
                                    <td class="text-center">-</td>
                                    <td class="text-center">-</td>
                                    <td>{{ standard.required_output || '-' }}</td>
                                    <td>{{ standard.remarks || '-' }}</td>
                                  </tr>
                                </template>
                              </template>
                            </template>
                          </template>
                        </template>
                        <tr v-else>
                          <td colspan="9" class="text-center text-grey-7">
                            No performance standard data
                          </td>
                        </tr>
                      </tbody>
                    </table>

                    <div style="padding-left: 30%; padding-top: 25px; padding-bottom: 25px">
                      <table style="border: 1px solid black; border-collapse: collapse">
                        <tbody>
                          <tr style="font-size: 11px">
                            <td
                              colspan="2"
                              style="
                                border: 1px solid black;
                                font-weight: bold;
                                padding: 5px;
                                text-align: center;
                              "
                            >
                              Proficiency Levels of Competency:
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                width: 25%;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Basic
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Understands basic principles; Can perform task with assistance or
                              direction
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Advanced
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Performs routine task with reliable results; Works with minimal
                              supervision
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Intermediate
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Performs complex and multiple tasks; Can coach and teach others
                            </td>
                          </tr>
                          <tr style="font-size: 11px">
                            <td
                              style="
                                border: 1px solid black;
                                padding: 5px;
                                font-weight: bold;
                                text-align: center;
                              "
                            >
                              Superior
                            </td>
                            <td style="border: 1px solid black; padding: 5px">
                              Considered as an expert in this task; Can describe, teach and lead
                              others
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- SIGNATORY SECTION -->
                    <div style="padding-top: 20px; padding-bottom: 25px">
                      <table style="width: 100%; border-collapse: collapse">
                        <tbody>
                          <tr>
                            <td style="width: 33%; vertical-align: top; text-align: center">
                              <div
                                style="
                                  font-weight: bold;
                                  margin-bottom: 40px;
                                  padding-left: 40px;
                                  text-align: left;
                                "
                              >
                                Conformed:
                              </div>
                              <div
                                style="
                                  display: inline;
                                  border-bottom: 1px solid black;
                                  width: 80%;
                                  margin: 0 auto;
                                  padding-top: 5px;
                                "
                              >
                                {{ employee?.label || employee?.name }}
                              </div>
                              <div style="font-size: 11px; margin-top: 5px">
                                {{ employee?.position }}
                              </div>
                              <div style="font-size: 11px; font-style: italic">Employee/Ratee</div>
                            </td>
                            <td style="width: 34%; vertical-align: top; text-align: center">
                              <div
                                style="
                                  font-weight: bold;
                                  margin-bottom: 40px;
                                  padding-left: 40px;
                                  text-align: left;
                                "
                              >
                                Discussed With:
                              </div>
                              <div
                                style="
                                  display: inline;
                                  border-bottom: 1px solid black;
                                  width: 80%;
                                  margin: 0 auto;

                                  padding-top: 5px;
                                "
                              >
                                {{ supervisorySignatory?.name || managerialSignatory?.name }}
                              </div>
                              <div style="font-size: 11px; margin-top: 5px">
                                {{
                                  supervisorySignatory?.position || managerialSignatory?.position
                                }}
                              </div>
                              <div style="font-size: 11px; font-style: italic">
                                Office Head/Rater
                              </div>
                            </td>
                            <td style="width: 33%; vertical-align: top; text-align: center">
                              <div
                                style="
                                  font-weight: bold;
                                  margin-bottom: 40px;
                                  padding-left: 40px;
                                  text-align: left;
                                "
                              >
                                Approved by:
                              </div>
                              <div
                                style="
                                  display: inline;
                                  border-bottom: 1px solid black;
                                  width: 80%;

                                  margin: 0 auto;
                                  padding-top: 5px;
                                "
                              >
                                {{ managerialSignatory?.name }}
                              </div>
                              <div style="font-size: 11px; margin-top: 5px">
                                {{ managerialSignatory?.position }}
                              </div>
                              <div style="font-size: 11px; font-style: italic">
                                Office Head/Rater
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <!-- END SIGNATORY SECTION -->
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Monthly Performance Output Tab -->
            <q-tab-panel name="mpo">
              <div class="report-content">
                <!-- Loop through each month -->
                <template v-if="groupedMonthlyData.length > 0">
                  <div
                    v-for="(monthData, monthIndex) in groupedMonthlyData"
                    :key="`month-${monthIndex}`"
                    :class="{ 'page-break': monthIndex > 0 }"
                  >
                    <!-- Header for each month -->
                    <div class="header-container">
                      <div class="header-text">
                        <div class="padded-text">Republic of the Philippines</div>
                        <div class="padded-text">Province of Davao del Norte</div>
                        <div class="text-weight-bold padded-text">CITY OF TAGUM</div>
                        <div class="text-weight-bold padded-text">
                          MONTHLY PERFORMANCE OUTPUT REPORT
                        </div>
                      </div>
                    </div>

                    <!-- Employee Info Table -->
                    <div class="q-mt-md">
                      <table class="full-width info-table">
                        <tbody>
                          <tr>
                            <td>
                              <strong>Employee:</strong> {{ employee?.label || employee?.name }}
                            </td>
                            <td><strong>Office:</strong> {{ levels?.office || 'N/A' }}</td>
                            <td><strong>Division:</strong> {{ levels?.division || 'N/A' }}</td>
                            <td><strong>Month:</strong> {{ monthData.month }}</td>
                          </tr>
                        </tbody>
                      </table>

                      <!-- Monthly Performance Table -->
                      <div class="table-container q-mt-md">
                        <table class="full-width main-table">
                          <thead>
                            <tr>
                              <th rowspan="3" class="text-center">MAJOR FINAL OUTPUT</th>
                              <th colspan="18" class="text-center">ACCOMPLISHMENTS</th>
                            </tr>
                            <tr>
                              <th colspan="6">QUANTITY</th>
                              <th colspan="6">EFFECTIVENESS</th>
                              <th colspan="6">TIMELINESS</th>
                            </tr>
                            <tr>
                              <th>Wk 1</th>
                              <th>Wk 2</th>
                              <th>Wk 3</th>
                              <th>Wk 4</th>
                              <th>Wk 5</th>
                              <th>TOTAL</th>
                              <th>Wk 1</th>
                              <th>Wk 2</th>
                              <th>Wk 3</th>
                              <th>Wk 4</th>
                              <th>Wk 5</th>
                              <th>TOTAL</th>
                              <th>Wk 1</th>
                              <th>Wk 2</th>
                              <th>Wk 3</th>
                              <th>Wk 4</th>
                              <th>Wk 5</th>
                              <th>TOTAL</th>
                            </tr>
                          </thead>
                          <tbody>
                            <!-- Group by category and MFO -->
                            <template v-if="monthData.categories?.length">
                              <template
                                v-for="(categoryGroup, catIndex) in monthData.categories"
                                :key="`cat-${monthIndex}-${catIndex}`"
                              >
                                <!-- Category Header -->
                                <tr>
                                  <td colspan="19" class="category-header">
                                    {{ categoryGroup.category }}
                                  </td>
                                </tr>

                                <!-- Group by MFO -->
                                <template
                                  v-for="(mfoGroup, mfoIndex) in categoryGroup.mfos"
                                  :key="`mfo-${monthIndex}-${catIndex}-${mfoIndex}`"
                                >
                                  <!-- MFO Header -->
                                  <tr>
                                    <td colspan="19" class="mfo-header">
                                      MFO {{ mfoIndex + 1 }} - {{ mfoGroup.mfo }}
                                    </td>
                                  </tr>

                                  <!-- Outputs -->
                                  <template
                                    v-for="(output, outputIndex) in mfoGroup.outputs"
                                    :key="`output-${monthIndex}-${catIndex}-${mfoIndex}-${outputIndex}`"
                                  >
                                    <tr>
                                      <td>
                                        Output {{ outputIndex + 1 }} - {{ output.outputName }}
                                      </td>

                                      <!-- Quantity -->
                                      <td class="text-center">
                                        {{ output.quantity.week1 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.quantity.week2 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.quantity.week3 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.quantity.week4 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.quantity.week5 }}
                                      </td>

                                      <td class="text-center total-cell">
                                        {{ calculateTotal(output.quantity) }}
                                      </td>

                                      <!-- Effectiveness -->
                                      <td class="text-center">
                                        {{ output.effectiveness.week1 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.effectiveness.week2 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.effectiveness.week3 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.effectiveness.week4 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.effectiveness.week5 }}
                                      </td>

                                      <td class="text-center total-cell">
                                        {{ calculateTotal(output.effectiveness) }}
                                      </td>

                                      <!-- Timeliness -->
                                      <td class="text-center">
                                        {{ output.timeliness.week1 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.timeliness.week2 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.timeliness.week3 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.timeliness.week4 }}
                                      </td>
                                      <td class="text-center">
                                        {{ output.timeliness.week5 }}
                                      </td>

                                      <td class="text-center total-cell">
                                        {{ calculateTotal(output.timeliness) }}
                                      </td>
                                    </tr>
                                  </template>
                                </template>

                                <!-- Category Averages -->
                                <tr>
                                  <td colspan="6" class="text-right text-weight-bold">
                                    {{ categoryGroup.category }} Average
                                  </td>

                                  <td class="text-center text-weight-bold total-cell">
                                    {{ categoryGroup.total.quantity }}
                                  </td>
                                  <td colspan="5"></td>

                                  <td class="text-center text-weight-bold total-cell">
                                    {{ categoryGroup.total.effectiveness }}
                                  </td>
                                  <td colspan="5"></td>
                                  <td class="text-center text-weight-bold total-cell">
                                    {{ categoryGroup.total.timeliness }}
                                  </td>
                                </tr>
                              </template>

                              <!-- Final Averages -->
                              <tr>
                                <td colspan="6" class="text-right text-weight-bold">
                                  Final Average
                                </td>

                                <td class="text-center text-weight-bold total-cell">
                                  {{ monthData.finalTotals.quantity }}
                                </td>
                                <td colspan="5"></td>

                                <td class="text-center text-weight-bold total-cell">
                                  {{ monthData.finalTotals.effectiveness }}
                                </td>
                                <td colspan="5"></td>
                                <td class="text-center text-weight-bold total-cell">
                                  {{ monthData.finalTotals.timeliness }}
                                </td>
                              </tr>

                              <!-- Additional Rows -->
                              <tr>
                                <td colspan="13"></td>
                                <td>Wk 1</td>
                                <td>Wk 2</td>
                                <td>Wk 3</td>
                                <td>Wk 4</td>
                                <td>Wk 5</td>
                                <td>TOTAL</td>
                              </tr>

                              <tr>
                                <td colspan="13">MAN DAY(S) LOST THRU ABSENCE</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </tr>
                              <tr>
                                <td colspan="13">MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME</td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td></td>
                              </tr>
                              <tr>
                                <td colspan="19" style="height: 80px; position: relative">
                                  <div style="position: absolute; top: 4px; left: 4px">
                                    OBSERVATIONS/REMARKS
                                  </div>
                                </td>
                              </tr>
                            </template>
                            <tr v-else>
                              <td colspan="19" class="text-center text-grey-7">
                                No data available for {{ monthData.month }}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!-- Signature Table - Independent Widths -->
                        <div style="display: flex; padding-bottom: 30px; justify-content: center">
                          <table
                            style="width: 100%; border-collapse: collapse; border: 1px solid #ddd"
                          >
                            <tbody>
                              <tr>
                                <!-- Employee Declaration -->
                                <td
                                  style="
                                    width: 35%;
                                    padding: 8px;
                                    font-size: 11px;
                                    border: 1px solid #ddd;
                                    vertical-align: top;
                                  "
                                >
                                  Above entries are true & correct:
                                </td>
                                <!-- Employee Date -->
                                <td
                                  style="
                                    width: 15%;
                                    padding: 8px;
                                    font-size: 11px;
                                    border: 1px solid #ddd;
                                    vertical-align: top;
                                  "
                                >
                                  Date:
                                </td>
                                <!-- Confirmer Title -->
                                <td
                                  style="
                                    width: 35%;
                                    padding: 8px;
                                    font-size: 11px;
                                    border: 1px solid #ddd;
                                    vertical-align: top;
                                  "
                                >
                                  Confirmed:
                                </td>
                                <!-- Confirmer Date -->
                                <td
                                  style="
                                    width: 15%;
                                    padding: 8px;
                                    font-size: 11px;
                                    border: 1px solid #ddd;
                                    vertical-align: top;
                                  "
                                >
                                  Date:
                                </td>
                              </tr>
                              <tr>
                                <!-- Employee Signature Cell -->
                                <td
                                  style="
                                    vertical-align: bottom;
                                    text-align: center;
                                    padding: 8px;
                                    border: 1px solid #ddd;
                                    height: 100px;
                                  "
                                >
                                  <div style="padding-top: 30px">
                                    <strong
                                      style="
                                        display: inline-block;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        width: 90%;
                                        max-width: 250px;
                                      "
                                    >
                                      {{ employee?.label || employee?.name }}
                                    </strong>
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">
                                    {{ employee?.position }}
                                  </div>
                                </td>

                                <!-- Employee Date Cell -->
                                <td
                                  style="
                                    vertical-align: bottom;
                                    text-align: center;
                                    padding: 8px;
                                    border: 1px solid #ddd;
                                    height: 100px;
                                  "
                                >
                                  <div
                                    style="
                                      display: inline-block;
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      max-width: 120px;
                                      min-height: 25px;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">Date</div>
                                </td>

                                <!-- Confirmer Signature Cell -->
                                <td
                                  style="
                                    vertical-align: bottom;
                                    text-align: center;
                                    padding: 8px;
                                    border: 1px solid #ddd;
                                    height: 100px;
                                  "
                                >
                                  <div style="padding-top: 30px">
                                    <strong
                                      style="
                                        display: inline-block;
                                        border-bottom: 1px solid #000;
                                        padding-bottom: 2px;
                                        width: 90%;
                                        max-width: 250px;
                                      "
                                    >
                                      {{ managerialSignatory?.name }}
                                    </strong>
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">
                                    {{ managerialSignatory?.position }}
                                  </div>
                                </td>

                                <!-- Confirmer Date Cell -->
                                <td
                                  style="
                                    vertical-align: bottom;
                                    text-align: center;
                                    padding: 8px;
                                    border: 1px solid #ddd;
                                    height: 100px;
                                  "
                                >
                                  <div
                                    style="
                                      display: inline-block;
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      max-width: 120px;
                                      min-height: 25px;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">Date</div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
                <div v-else class="q-pa-xl text-center text-grey-7">
                  No monthly performance data available
                </div>
              </div>
            </q-tab-panel>

            <!-- Summary Monthly Performance Report Tab -->
            <q-tab-panel name="smpr">
              <div class="report-content">
                <div class="header-container">
                  <div class="header-text">
                    <div class="padded-text">Republic of the Philippines</div>
                    <div class="padded-text">Province of Davao del Norte</div>
                    <div class="text-weight-bold padded-text">CITY OF TAGUM</div>
                    <div class="text-weight-bold padded-text">
                      SUMMARY MONTHLY PERFORMANCE OUTPUT REPORT
                    </div>
                    <div class="text-weight-bold padded-text">
                      {{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}
                    </div>
                  </div>
                </div>

                <div class="q-mt-md">
                  <table class="full-width info-table">
                    <tbody>
                      <tr>
                        <td><strong>Employee:</strong> {{ employee?.label || employee?.name }}</td>
                        <td><strong>Position:</strong> {{ employee?.position }}</td>
                        <td><strong>Office:</strong> {{ levels?.office || 'N/A' }}</td>
                        <td><strong>Division:</strong> {{ levels?.division || 'N/A' }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="table-container q-mt-md">
                    <table class="full-width main-table">
                      <thead>
                        <tr>
                          <th rowspan="3" class="text-center" style="width: 15%">
                            MAJOR FINAL OUTPUT
                          </th>
                          <th colspan="24" class="text-center">ACCOMPLISHMENT</th>
                        </tr>
                        <tr>
                          <th colspan="8" class="text-center">QUANTITY</th>
                          <th colspan="8" class="text-center">EFFECTIVENESS</th>
                          <th colspan="8" class="text-center">TIMELINESS</th>
                        </tr>
                        <tr>
                          <!-- Quantity columns -->
                          <th>Jan</th>
                          <th>Feb</th>
                          <th>Mar</th>
                          <th>Apr</th>
                          <th>May</th>
                          <th>Jun</th>
                          <th>TOTAL</th>
                          <th>RATING</th>
                          <!-- Effectiveness columns -->
                          <th>Jan</th>
                          <th>Feb</th>
                          <th>Mar</th>
                          <th>Apr</th>
                          <th>May</th>
                          <th>Jun</th>
                          <th>TOTAL</th>
                          <th>RATING</th>
                          <!-- Timeliness columns -->
                          <th>Jan</th>
                          <th>Feb</th>
                          <th>Mar</th>
                          <th>Apr</th>
                          <th>May</th>
                          <th>Jun</th>
                          <th>TOTAL</th>
                          <th>RATING</th>
                        </tr>
                      </thead>
                      <tbody>
                        <template v-if="processedSummaryData.length > 0">
                          <template
                            v-for="(categoryData, catIndex) in processedSummaryData"
                            :key="`cat-${catIndex}`"
                          >
                            <!-- Category Header -->
                            <tr>
                              <td colspan="25" class="category-header">
                                {{ categoryData.category }}
                              </td>
                            </tr>

                            <template
                              v-for="(mfoData, mfoIndex) in categoryData.mfos"
                              :key="`mfo-${catIndex}-${mfoIndex}`"
                            >
                              <!-- MFO Header -->
                              <tr>
                                <td colspan="25" class="mfo-header">
                                  MFO {{ mfoIndex + 1 }} - {{ mfoData.mfo }}
                                </td>
                              </tr>

                              <!-- Output Rows -->
                              <template
                                v-for="(output, outputIndex) in mfoData.outputs"
                                :key="`output-${catIndex}-${mfoIndex}-${outputIndex}`"
                              >
                                <tr>
                                  <td>Output {{ outputIndex + 1 }}: {{ output.outputName }}</td>

                                  <!-- Quantity Data -->
                                  <td
                                    v-for="month in ['jan', 'feb', 'mar', 'apr', 'may', 'jun']"
                                    :key="`qty-${month}`"
                                    class="text-center"
                                  >
                                    {{ output.monthly.quantity[month] }}
                                  </td>
                                  <td class="text-center total-cell">
                                    {{ output.totals.quantity.total }}
                                  </td>
                                  <td class="text-center total-cell">
                                    {{ output.totals.quantity.rating }}
                                  </td>

                                  <!-- Effectiveness Data -->
                                  <td
                                    v-for="month in ['jan', 'feb', 'mar', 'apr', 'may', 'jun']"
                                    :key="`eff-${month}`"
                                    class="text-center"
                                  >
                                    {{ output.monthly.effectiveness[month] }}
                                  </td>
                                  <td class="text-center total-cell">
                                    {{ output.totals.effectiveness.total }}
                                  </td>
                                  <td class="text-center total-cell">
                                    {{ output.totals.effectiveness.rating }}
                                  </td>

                                  <!-- Timeliness Data -->
                                  <td
                                    v-for="month in ['jan', 'feb', 'mar', 'apr', 'may', 'jun']"
                                    :key="`time-${month}`"
                                    class="text-center"
                                  >
                                    {{ output.monthly.timeliness[month] }}
                                  </td>
                                  <td class="text-center total-cell">
                                    {{ output.totals.timeliness.total }}
                                  </td>
                                  <td class="text-center total-cell">
                                    {{ output.totals.timeliness.rating }}
                                  </td>
                                </tr>
                              </template>
                            </template>
                            <!-- Additional Rows -->
                            <tr>
                              <td colspan="18"></td>
                              <td>Jan</td>
                              <td>Feb</td>
                              <td>March</td>
                              <td>Apr</td>
                              <td>May</td>
                              <td>June</td>
                              <td>TOTAL</td>
                            </tr>

                            <tr>
                              <td colspan="18">MAN DAY(S) LOST THRU ABSENCE</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                            <tr>
                              <td colspan="18">MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME</td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                              <td></td>
                            </tr>
                            <tr>
                              <td colspan="25" style="height: 80px; position: relative">
                                <div style="position: absolute; top: 4px; left: 4px">
                                  OBSERVATIONS/REMARKS
                                </div>
                              </td>
                            </tr>
                          </template>
                        </template>
                        <tr v-else>
                          <td colspan="25" class="text-center text-grey-7">
                            <template v-if="ipcrStore.loadingSummaryMonthlyPerformance">
                              <q-spinner color="green-8" size="1.5em" />
                              <div class="q-mt-sm">Loading summary data...</div>
                            </template>
                            <template v-else> No summary performance data available </template>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <!-- Signature Table - Equal Widths -->
                    <div style="display: flex; padding-bottom: 30px; justify-content: center">
                      <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd">
                        <tbody>
                          <tr>
                            <!-- First Signatory (Employee) -->
                            <td
                              style="
                                width: 25%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                                position: relative;
                              "
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px">
                                  Above entries are true & correct:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0; text-align: center">
                                  <div style="margin: 0 auto; width: 90%; max-width: 200px">
                                    <strong>{{ employee?.label || employee?.name }}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- First Date -->
                            <td
                              style="
                                width: 8.33%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                                text-align: center;
                              "
                              rowspan="2"
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px; font-size: 11px">
                                  Date:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0">
                                  <div
                                    style="
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      margin: 0 auto;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- Second Signatory (Supervisor) -->
                            <td
                              style="
                                width: 25%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                              "
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px">Confirmed:</div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0; text-align: center">
                                  <div style="margin: 0 auto; width: 90%; max-width: 200px">
                                    <strong>{{
                                      supervisorySignatory?.name || managerialSignatory?.name
                                    }}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- Second Date -->
                            <td
                              style="
                                width: 8.33%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                                text-align: center;
                              "
                              rowspan="2"
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px; font-size: 11px">
                                  Date:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0">
                                  <div
                                    style="
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      margin: 0 auto;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- Third Signatory (Department Head) -->
                            <td
                              style="
                                width: 25%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                              "
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px">
                                  Approved for Final Rating:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0; text-align: center">
                                  <div style="margin: 0 auto; width: 90%; max-width: 200px">
                                    <strong>{{ managerialSignatory?.name }}</strong>
                                  </div>
                                </div>
                              </div>
                            </td>

                            <!-- Third Date -->
                            <td
                              style="
                                width: 8.33%;
                                vertical-align: top;
                                padding: 8px;
                                border: 1px solid #ddd;
                                text-align: center;
                              "
                              rowspan="2"
                            >
                              <div style="height: 120px; display: flex; flex-direction: column">
                                <div style="flex-shrink: 0; padding-bottom: 10px; font-size: 11px">
                                  Date:
                                </div>
                                <div style="flex: 1"></div>
                                <div style="flex-shrink: 0">
                                  <div
                                    style="
                                      border-bottom: 1px solid #000;
                                      padding-bottom: 2px;
                                      width: 90%;
                                      margin: 0 auto;
                                    "
                                  >
                                    {{ formatDate(new Date()) }}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>

                          <!-- Row for position labels -->
                          <tr>
                            <!-- Employee Position -->
                            <td
                              style="
                                text-align: center;
                                font-size: 11px;
                                padding: 5px;
                                border: 1px solid #ddd;
                              "
                            >
                              {{ employee?.position }}
                            </td>

                            <!-- Supervisor Position -->
                            <td
                              style="
                                text-align: center;
                                font-size: 11px;
                                padding: 5px;
                                border: 1px solid #ddd;
                              "
                            >
                              {{ supervisorySignatory?.position || managerialSignatory?.position }}
                            </td>

                            <!-- Department Head Position -->
                            <td
                              style="
                                text-align: center;
                                font-size: 11px;
                                padding: 5px;
                                border: 1px solid #ddd;
                              "
                            >
                              {{ managerialSignatory?.position }}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useIPCRStatus } from 'src/composables/ipcr_status'
import { useIpcrStore } from 'src/stores/office/IpcrStore'

// Dynamically import pdfMake to avoid build issues
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

const $q = useQuasar()
const ipcrStore = useIpcrStore()

// Props
const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
  targetPeriod: {
    type: Object,
    required: true,
  },
  levels: {
    type: Object,
    default: () => ({
      office: null,
      office2: null,
      group: null,
      division: null,
      section: null,
      unit: null,
    }),
  },
  supervisorySignatory: {
    type: Object,
    default: null,
  },
  managerialSignatory: {
    type: Object,
    default: null,
  },
})

// Emits
const emit = defineEmits(['close', 'approve'])

// State
const activeTab = ref('ipcr')
const isPrinting = ref(false)

// Status helpers
const { getStatusColor, getStatusTextColor, getStatusIcon } = useIPCRStatus()

// Computed
const controlNo = computed(() => {
  return (
    props.employee?.employeeData?.ControlNo ||
    props.employee?.ControlNo ||
    props.employee?.control_no ||
    null
  )
})

const isTabLoading = computed(() => {
  switch (activeTab.value) {
    case 'ipcr':
      return ipcrStore.loadingIpcr
    case 'ps':
      return ipcrStore.loadingPerformanceStandard
    case 'mpo':
      return ipcrStore.loadingMonthlyPerformance
    case 'smpr':
      return ipcrStore.loadingSummaryMonthlyPerformance
    default:
      return false
  }
})

const currentData = computed(() => {
  switch (activeTab.value) {
    case 'ipcr': {
      const storeData = ipcrStore.employeeIpcr
      if (storeData) {
        return storeData
      }
      if (props.employee?.target_periods?.length) {
        return props.employee
      }
      return null
    }
    case 'ps':
      return ipcrStore.performanceStandard
    case 'mpo':
      return ipcrStore.monthlyPerformance
    case 'smpr':
      return ipcrStore.summaryMonthlyPerformance
    default:
      return null
  }
})

const hasData = computed(() => {
  return !!currentData.value
})

const groupedPerformanceStandards = computed(() => {
  const performanceData = ipcrStore.performanceStandard

  if (Array.isArray(performanceData)) {
    return performanceData
  }

  if (performanceData?.performance_standards?.length) {
    return performanceData.performance_standards
  }

  return []
})

const groupedPerformanceStandardsByCategory = computed(() => {
  if (!groupedPerformanceStandards.value.length) return []

  // Group by category
  const categoriesMap = {}

  groupedPerformanceStandards.value.forEach((standard) => {
    const category = formatCategoryName(standard.category)

    if (!categoriesMap[category]) {
      categoriesMap[category] = {
        category: category,
        mfos: {},
      }
    }

    const categoryData = categoriesMap[category]
    const mfo = standard.mfo || 'Unnamed MFO'

    if (!categoryData.mfos[mfo]) {
      categoryData.mfos[mfo] = {
        mfo: mfo,
        standards: [],
      }
    }

    categoryData.mfos[mfo].standards.push(standard)
  })

  // Convert to array format
  const categories = Object.values(categoriesMap).map((categoryData) => {
    return {
      ...categoryData,
      mfos: Object.values(categoryData.mfos),
    }
  })

  return categories
})

const ipcrPerformanceData = computed(() => {
  if (activeTab.value === 'ipcr') {
    if (currentData.value?.performance_standards?.length) {
      return currentData.value.performance_standards
    }
    if (currentData.value?.target_periods?.[0]?.performance_standards?.length) {
      return currentData.value.target_periods[0].performance_standards
    }
    return (
      ipcrStore.employeeIpcr?.performance_standards ||
      ipcrStore.employeeIpcr?.target_periods?.[0]?.performance_standards ||
      []
    )
  }
  return []
})

const groupedIpcrData = computed(() => {
  if (!ipcrPerformanceData.value?.length) {
    return []
  }

  const grouped = []
  const categories = [...new Set(ipcrPerformanceData.value.map((item) => item.category))]

  categories.forEach((category) => {
    const categoryStandards = ipcrPerformanceData.value.filter((item) => item.category === category)

    if (categoryStandards.length > 0) {
      const mfos = [...new Set(categoryStandards.map((item) => item.mfo))]
      const mfoGroups = []

      mfos.forEach((mfo) => {
        const mfoStandards = categoryStandards.filter((item) => item.mfo === mfo)

        if (mfoStandards.length > 0) {
          mfoGroups.push({
            mfo,
            standards: mfoStandards,
          })
        }
      })

      let totalRating = 0
      let ratingCount = 0

      // FIXED: Check both possible locations for average rating
      categoryStandards.forEach((standard) => {
        let rating = null

        // Try to get rating from different possible locations
        if (standard.monthly_ratings?.average?.overall) {
          rating = parseFloat(standard.monthly_ratings.average.overall)
        } else if (standard.monthly_ratings?.whole_average?.overall) {
          rating = parseFloat(standard.monthly_ratings.whole_average.overall)
        } else if (standard.whole_average?.overall) {
          rating = parseFloat(standard.whole_average.overall)
        } else if (standard.average?.overall) {
          rating = parseFloat(standard.average.overall)
        } else if (standard.overall_rating) {
          rating = parseFloat(standard.overall_rating)
        }

        if (rating && !isNaN(rating)) {
          totalRating += rating
          ratingCount++
        }
      })

      // Only include category if it has ratings
      if (ratingCount > 0) {
        const categoryAverage = (totalRating / ratingCount).toFixed(2)

        grouped.push({
          category: formatCategoryName(category),
          standards: categoryStandards,
          mfos: mfoGroups,
          averageRating: categoryAverage,
          rawTotal: totalRating,
          count: ratingCount,
        })
      }
    }
  })

  return grouped
})
const finalAverageRating = computed(() => {
  if (!groupedIpcrData.value.length) return 'N/A'

  let totalRating = 0
  let totalCount = 0

  groupedIpcrData.value.forEach((categoryGroup) => {
    if (categoryGroup.averageRating !== 'N/A') {
      totalRating += parseFloat(categoryGroup.averageRating)
      totalCount++
    }
  })

  return totalCount > 0 ? (totalRating / totalCount).toFixed(2) : 'N/A'
})

const adjectivalRating = computed(() => {
  const rating = parseFloat(finalAverageRating.value)
  if (isNaN(rating)) return 'N/A'

  if (rating >= 4.5) return 'OUTSTANDING'
  if (rating >= 3.5) return 'VERY SATISFACTORY'
  if (rating >= 2.5) return 'SATISFACTORY'
  if (rating >= 1.5) return 'UNSATISFACTORY'
  return 'POOR'
})

const categoryCalculations = computed(() => {
  if (!groupedIpcrData.value.length) return []

  const calculations = []

  const categoryWeights = {
    'STRATEGIC FUNCTION': 0.15,
    'CORE FUNCTION': 0.65,
    'SUPPORT FUNCTION': 0.2,
  }

  groupedIpcrData.value.forEach((categoryGroup) => {
    if (categoryGroup.count > 0) {
      const ratings = []
      categoryGroup.standards.forEach((standard) => {
        if (standard.monthly_ratings?.whole_average?.overall) {
          const rating = parseFloat(standard.monthly_ratings.whole_average.overall)
          if (!isNaN(rating)) {
            ratings.push(rating.toFixed(2))
          }
        }
      })

      const weight = categoryWeights[categoryGroup.category] || 0.33
      const average = categoryGroup.averageRating
      const weightedAverage = parseFloat(average).toFixed(2)

      const formula = `(${ratings.join(' + ')}) / ${categoryGroup.count}`

      calculations.push({
        category: categoryGroup.category,
        formula: formula,
        average: average,
        weight: weight.toFixed(2),
        weightedAverage: weightedAverage,
      })
    }
  })

  return calculations
})

const processedSummaryData = computed(() => {
  if (!ipcrStore.summaryMonthlyPerformance || !Array.isArray(ipcrStore.summaryMonthlyPerformance)) {
    return []
  }

  const categoriesMap = {}

  ipcrStore.summaryMonthlyPerformance.forEach((item) => {
    const category = formatCategoryName(item.category)
    const mfo = item.mfo || 'Unnamed MFO'
    const outputName = item.output || item.mfo

    if (!categoriesMap[category]) {
      categoriesMap[category] = {
        category: category,
        mfos: {},
        totals: {
          quantity: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, rating: 0 },
          effectiveness: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, rating: 0 },
          timeliness: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, rating: 0 },
        },
        count: 0,
      }
    }

    const categoryData = categoriesMap[category]

    if (!categoryData.mfos[mfo]) {
      categoryData.mfos[mfo] = {
        mfo: mfo,
        outputs: [],
        totals: {
          quantity: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, rating: 0 },
          effectiveness: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, rating: 0 },
          timeliness: { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0, total: 0, rating: 0 },
        },
        count: 0,
      }
    }

    const mfoData = categoryData.mfos[mfo]
    const monthlyData = item.monthly_ratings?.monthly || []

    const outputItem = {
      outputName: outputName,
      monthly: {
        quantity: {
          jan: getMonthlyValue(monthlyData, 'January', 'quantity'),
          feb: getMonthlyValue(monthlyData, 'February', 'quantity'),
          mar: getMonthlyValue(monthlyData, 'March', 'quantity'),
          apr: getMonthlyValue(monthlyData, 'April', 'quantity'),
          may: getMonthlyValue(monthlyData, 'May', 'quantity'),
          jun: getMonthlyValue(monthlyData, 'June', 'quantity'),
        },
        effectiveness: {
          jan: getMonthlyValue(monthlyData, 'January', 'effectiveness'),
          feb: getMonthlyValue(monthlyData, 'February', 'effectiveness'),
          mar: getMonthlyValue(monthlyData, 'March', 'effectiveness'),
          apr: getMonthlyValue(monthlyData, 'April', 'effectiveness'),
          may: getMonthlyValue(monthlyData, 'May', 'effectiveness'),
          jun: getMonthlyValue(monthlyData, 'June', 'effectiveness'),
        },
        timeliness: {
          jan: getMonthlyValue(monthlyData, 'January', 'timeliness'),
          feb: getMonthlyValue(monthlyData, 'February', 'timeliness'),
          mar: getMonthlyValue(monthlyData, 'March', 'timeliness'),
          apr: getMonthlyValue(monthlyData, 'April', 'timeliness'),
          may: getMonthlyValue(monthlyData, 'May', 'timeliness'),
          jun: getMonthlyValue(monthlyData, 'June', 'timeliness'),
        },
      },
      totals: {
        quantity: {
          total: calculateMonthlyTotal(monthlyData, 'quantity'),
          rating: item.monthly_ratings?.whole_average?.quantity || 0,
        },
        effectiveness: {
          total: calculateMonthlyTotal(monthlyData, 'effectiveness'),
          rating: item.monthly_ratings?.whole_average?.effectiveness || 0,
        },
        timeliness: {
          total: calculateMonthlyTotal(monthlyData, 'timeliness'),
          rating: item.monthly_ratings?.whole_average?.timeliness || 0,
        },
      },
    }

    mfoData.outputs.push(outputItem)

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun']
    months.forEach((month) => {
      mfoData.totals.quantity[month] += outputItem.monthly.quantity[month] || 0
      mfoData.totals.effectiveness[month] += outputItem.monthly.effectiveness[month] || 0
      mfoData.totals.timeliness[month] += outputItem.monthly.timeliness[month] || 0

      categoryData.totals.quantity[month] += outputItem.monthly.quantity[month] || 0
      categoryData.totals.effectiveness[month] += outputItem.monthly.effectiveness[month] || 0
      categoryData.totals.timeliness[month] += outputItem.monthly.timeliness[month] || 0
    })

    mfoData.totals.quantity.total += outputItem.totals.quantity.total || 0
    mfoData.totals.effectiveness.total += outputItem.totals.effectiveness.total || 0
    mfoData.totals.timeliness.total += outputItem.totals.timeliness.total || 0
    mfoData.count++

    categoryData.totals.quantity.total += outputItem.totals.quantity.total || 0
    categoryData.totals.effectiveness.total += outputItem.totals.effectiveness.total || 0
    categoryData.totals.timeliness.total += outputItem.totals.timeliness.total || 0
    categoryData.count++
  })

  const categories = Object.values(categoriesMap).map((categoryData) => {
    const mfosArray = Object.values(categoryData.mfos).map((mfoData) => {
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun']
      months.forEach((month) => {
        mfoData.totals.quantity[month] =
          mfoData.count > 0 ? (mfoData.totals.quantity[month] / mfoData.count).toFixed(2) : '0.00'
        mfoData.totals.effectiveness[month] =
          mfoData.count > 0
            ? (mfoData.totals.effectiveness[month] / mfoData.count).toFixed(2)
            : '0.00'
        mfoData.totals.timeliness[month] =
          mfoData.count > 0 ? (mfoData.totals.timeliness[month] / mfoData.count).toFixed(2) : '0.00'
      })

      mfoData.totals.quantity.rating =
        mfoData.count > 0 ? (mfoData.totals.quantity.total / mfoData.count).toFixed(2) : '0.00'
      mfoData.totals.effectiveness.rating =
        mfoData.count > 0 ? (mfoData.totals.effectiveness.total / mfoData.count).toFixed(2) : '0.00'
      mfoData.totals.timeliness.rating =
        mfoData.count > 0 ? (mfoData.totals.timeliness.total / mfoData.count).toFixed(2) : '0.00'

      return mfoData
    })

    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun']
    months.forEach((month) => {
      categoryData.totals.quantity[month] =
        categoryData.count > 0
          ? (categoryData.totals.quantity[month] / categoryData.count).toFixed(2)
          : '0.00'
      categoryData.totals.effectiveness[month] =
        categoryData.count > 0
          ? (categoryData.totals.effectiveness[month] / categoryData.count).toFixed(2)
          : '0.00'
      categoryData.totals.timeliness[month] =
        categoryData.count > 0
          ? (categoryData.totals.timeliness[month] / categoryData.count).toFixed(2)
          : '0.00'
    })

    categoryData.totals.quantity.rating =
      categoryData.count > 0
        ? (categoryData.totals.quantity.total / categoryData.count).toFixed(2)
        : '0.00'
    categoryData.totals.effectiveness.rating =
      categoryData.count > 0
        ? (categoryData.totals.effectiveness.total / categoryData.count).toFixed(2)
        : '0.00'
    categoryData.totals.timeliness.rating =
      categoryData.count > 0
        ? (categoryData.totals.timeliness.total / categoryData.count).toFixed(2)
        : '0.00'

    return {
      ...categoryData,
      mfos: mfosArray,
    }
  })

  return categories
})

const calculateTotal = (ratingData) => {
  if (!ratingData) return '0'

  const week1 = parseFloat(ratingData.week1) || 0
  const week2 = parseFloat(ratingData.week2) || 0
  const week3 = parseFloat(ratingData.week3) || 0
  const week4 = parseFloat(ratingData.week4) || 0
  const week5 = parseFloat(ratingData.week5) || 0

  const total = week1 + week2 + week3 + week4 + week5

  // Return as string without decimal places if it's a whole number
  if (total % 1 === 0) {
    return total.toString()
  }

  // Otherwise return with 2 decimal places
  return total.toFixed(2)
}
const groupedMonthlyData = computed(() => {
  if (!ipcrStore.monthlyPerformance || !Array.isArray(ipcrStore.monthlyPerformance)) {
    return []
  }

  const monthsMap = {}

  ipcrStore.monthlyPerformance.forEach((item) => {
    if (!item.monthly_ratings?.monthly) {
      return
    }

    item.monthly_ratings.monthly.forEach((monthData) => {
      const monthName = monthData.month

      if (!monthsMap[monthName]) {
        monthsMap[monthName] = {
          month: monthName,
          categories: {},
        }
      }

      const category = formatCategoryName(item.category)

      if (!monthsMap[monthName].categories[category]) {
        monthsMap[monthName].categories[category] = {
          category: category,
          mfos: {},
          totalQuantity: 0,
          totalEffectiveness: 0,
          totalTimeliness: 0,
          totalQuantitySum: 0,
          totalEffectivenessSum: 0,
          totalTimelinessSum: 0,
          count: 0,
        }
      }

      const categoryObj = monthsMap[monthName].categories[category]
      const mfo = item.mfo || 'Unnamed MFO'

      if (!categoryObj.mfos[mfo]) {
        categoryObj.mfos[mfo] = {
          mfo: mfo,
          outputs: [],
        }
      }

      const mfoObj = categoryObj.mfos[mfo]

      const quantityTotal = calculateTotal(monthData.quantity)
      const effectivenessTotal = calculateTotal(monthData.effectiveness)
      const timelinessTotal = calculateTotal(monthData.timeliness)

      mfoObj.outputs.push({
        outputName: item.output || item.mfo,
        quantity: monthData.quantity || {
          week1: 0,
          week2: 0,
          week3: 0,
          week4: 0,
          week5: 0,
          average: 0,
        },
        effectiveness: monthData.effectiveness || {
          week1: 0,
          week2: 0,
          week3: 0,
          week4: 0,
          week5: 0,
          average: 0,
        },
        timeliness: monthData.timeliness || {
          week1: 0,
          week2: 0,
          week3: 0,
          week4: 0,
          week5: 0,
          average: 0,
        },
        quantityTotal: quantityTotal,
        effectivenessTotal: effectivenessTotal,
        timelinessTotal: timelinessTotal,
      })

      if (monthData.quantity?.average) {
        categoryObj.totalQuantity += parseFloat(monthData.quantity.average) || 0
        categoryObj.totalQuantitySum += parseFloat(quantityTotal) || 0
      }
      if (monthData.effectiveness?.average) {
        categoryObj.totalEffectiveness += parseFloat(monthData.effectiveness.average) || 0
        categoryObj.totalEffectivenessSum += parseFloat(effectivenessTotal) || 0
      }
      if (monthData.timeliness?.average) {
        categoryObj.totalTimeliness += parseFloat(monthData.timeliness.average) || 0
        categoryObj.totalTimelinessSum += parseFloat(timelinessTotal) || 0
      }
      categoryObj.count++
    })
  })

  const result = Object.values(monthsMap).map((monthData) => {
    let finalQuantity = 0
    let finalEffectiveness = 0
    let finalTimeliness = 0
    let finalQuantitySum = 0
    let finalEffectivenessSum = 0
    let finalTimelinessSum = 0
    let totalCategoryCount = 0

    const categoriesArray = Object.values(monthData.categories).map((category) => {
      const categoryAverage = {
        quantity:
          category.count > 0 ? (category.totalQuantity / category.count).toFixed(2) : '0.00',
        effectiveness:
          category.count > 0 ? (category.totalEffectiveness / category.count).toFixed(2) : '0.00',
        timeliness:
          category.count > 0 ? (category.totalTimeliness / category.count).toFixed(2) : '0.00',
      }

      const categoryTotal = {
        quantity:
          category.count > 0 ? (category.totalQuantitySum / category.count).toFixed(2) : '0.00',
        effectiveness:
          category.count > 0
            ? (category.totalEffectivenessSum / category.count).toFixed(2)
            : '0.00',
        timeliness:
          category.count > 0 ? (category.totalTimelinessSum / category.count).toFixed(2) : '0.00',
      }

      const mfosArray = Object.values(category.mfos)

      finalQuantity += parseFloat(categoryAverage.quantity) || 0
      finalEffectiveness += parseFloat(categoryAverage.effectiveness) || 0
      finalTimeliness += parseFloat(categoryAverage.timeliness) || 0
      finalQuantitySum += parseFloat(categoryTotal.quantity) || 0
      finalEffectivenessSum += parseFloat(categoryTotal.effectiveness) || 0
      finalTimelinessSum += parseFloat(categoryTotal.timeliness) || 0
      totalCategoryCount++

      return {
        ...category,
        mfos: mfosArray,
        average: categoryAverage,
        total: categoryTotal,
      }
    })

    const finalAverages = {
      quantity: totalCategoryCount > 0 ? (finalQuantity / totalCategoryCount).toFixed(2) : '0.00',
      effectiveness:
        totalCategoryCount > 0 ? (finalEffectiveness / totalCategoryCount).toFixed(2) : '0.00',
      timeliness:
        totalCategoryCount > 0 ? (finalTimeliness / totalCategoryCount).toFixed(2) : '0.00',
    }

    const finalTotals = {
      quantity:
        totalCategoryCount > 0 ? (finalQuantitySum / totalCategoryCount).toFixed(2) : '0.00',
      effectiveness:
        totalCategoryCount > 0 ? (finalEffectivenessSum / totalCategoryCount).toFixed(2) : '0.00',
      timeliness:
        totalCategoryCount > 0 ? (finalTimelinessSum / totalCategoryCount).toFixed(2) : '0.00',
    }

    return {
      ...monthData,
      categories: categoriesArray,
      finalAverages,
      finalTotals,
    }
  })

  const monthOrder = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]

  result.sort((a, b) => {
    const aMonth = a.month.split(' ')[0]
    const bMonth = b.month.split(' ')[0]
    const aYear = parseInt(a.month.split(' ')[1]) || 0
    const bYear = parseInt(b.month.split(' ')[1]) || 0

    if (aYear !== bYear) return aYear - bYear
    return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth)
  })

  return result
})

// Helper Methods
// const formatRating = (rating) => {
//   if (rating === null || rating === undefined || rating === '') return 'N/A'
//   const num = parseFloat(rating)
//   return isNaN(num) ? 'N/A' : num.toFixed(2)
// }

const getAllCompetencies = (standard) => {
  const competencies = []

  if (standard.core && standard.core.length > 0) {
    competencies.push(...standard.core.map((comp) => ({ ...comp, type: 'Core' })))
  }

  if (standard.technical && standard.technical.length > 0) {
    competencies.push(...standard.technical.map((comp) => ({ ...comp, type: 'Technical' })))
  }

  if (standard.leadership && standard.leadership.length > 0) {
    competencies.push(...standard.leadership.map((comp) => ({ ...comp, type: 'Leadership' })))
  }

  return competencies
}

const getMonthlyValue = (monthlyData, monthName, metric) => {
  if (!monthlyData || !Array.isArray(monthlyData)) return 0

  const monthData = monthlyData.find((m) => m.month.includes(monthName))
  if (!monthData) return 0

  switch (metric) {
    case 'quantity':
      return monthData.quantity?.average || 0
    case 'effectiveness':
      return monthData.effectiveness?.average || 0
    case 'timeliness':
      return monthData.timeliness?.average || 0
    default:
      return 0
  }
}

const calculateMonthlyTotal = (monthlyData, metric) => {
  if (!monthlyData || monthlyData.length === 0) return 0

  let total = 0
  monthlyData.forEach((month) => {
    switch (metric) {
      case 'quantity':
        total += month.quantity?.average || 0
        break
      case 'effectiveness':
        total += month.effectiveness?.average || 0
        break
      case 'timeliness':
        total += month.timeliness?.average || 0
        break
    }
  })

  return total
}

const formatCategoryName = (category) => {
  if (!category) return 'UNCATEGORIZED'

  const cleanedCategory = category.replace(/^[A-C]\.\s*/, '').trim()

  if (cleanedCategory.includes('STRATEGIC') || cleanedCategory.includes('Strategic')) {
    return 'STRATEGIC FUNCTION'
  } else if (cleanedCategory.includes('CORE') || cleanedCategory.includes('Core')) {
    return 'CORE FUNCTION'
  } else if (cleanedCategory.includes('SUPPORT') || cleanedCategory.includes('Support')) {
    return 'SUPPORT FUNCTION'
  }
  return cleanedCategory.toUpperCase()
}

const getProficiencyLevel = (level) => {
  if (!level) return 'Not Specified'

  const levelNum = parseInt(level)
  switch (levelNum) {
    case 4:
      return 'Superior'
    case 3:
      return 'Intermediate'
    case 2:
      return 'Advanced'
    case 1:
      return 'Basic'
    default:
      return level
  }
}

// Tab Change Handler
const handleTabChange = async (tabName) => {
  try {
    if (tabName === 'ipcr') {
      if (!ipcrStore.employeeIpcr && !props.employee?.target_periods?.length) {
        await loadIpcrData()
      }
      return
    }

    let targetPeriodId = ipcrStore.targetPeriodId

    if (!targetPeriodId) {
      if (currentData.value?.target_periods?.[0]?.id) {
        targetPeriodId = currentData.value.target_periods[0].id
      } else if (props.targetPeriod?.id) {
        targetPeriodId = props.targetPeriod.id
      } else if (props.employee?.target_periods?.[0]?.id) {
        targetPeriodId = props.employee.target_periods[0].id
      } else if (ipcrStore.employeeIpcr?.target_periods?.[0]?.id) {
        targetPeriodId = ipcrStore.employeeIpcr.target_periods[0].id
      }
    }

    if (!targetPeriodId && tabName !== 'ipcr') {
      $q.notify({
        type: 'warning',
        message: 'Target period ID not found. Please ensure IPCR data is loaded first.',
        position: 'top',
      })
      activeTab.value = 'ipcr'
      return
    }

    switch (tabName) {
      case 'ps':
        if (!ipcrStore.performanceStandard) {
          await ipcrStore.fetchPerformanceStandard(targetPeriodId)
        }
        break
      case 'mpo':
        if (!ipcrStore.monthlyPerformance) {
          await ipcrStore.fetchMonthlyPerformance(targetPeriodId)
        }
        break
      case 'smpr':
        if (!ipcrStore.summaryMonthlyPerformance) {
          await ipcrStore.fetchSummaryMonthlyPerformance(targetPeriodId)
        }
        break
    }
  } catch (error) {
    console.error('Error loading tab data:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to load ${tabName.toUpperCase()} data: ${error.message}`,
      position: 'top',
    })
  }
}

const loadIpcrData = async () => {
  if (!controlNo.value) {
    $q.notify({
      type: 'negative',
      message: 'Employee control number is missing',
      position: 'top',
    })
    return
  }

  if (!props.targetPeriod?.year || !props.targetPeriod?.semester) {
    $q.notify({
      type: 'negative',
      message: 'Target period information is missing',
      position: 'top',
    })
    return
  }

  try {
    await ipcrStore.fetchEmployeeIpcr(
      controlNo.value,
      props.targetPeriod.year,
      props.targetPeriod.semester,
    )

    if (!ipcrStore.employeeIpcr) {
      $q.notify({
        type: 'info',
        message: 'No IPCR data found for this period',
        position: 'top',
      })
    }
  } catch (error) {
    console.error('Error loading IPCR data:', error)
    $q.notify({
      type: 'negative',
      message: `Failed to load IPCR data: ${error.message}`,
      position: 'top',
    })
  }
}

const handleClose = () => {
  ipcrStore.resetStore()
  emit('close')
}

const handleApprove = () => {
  emit('approve')
}

const formatDate = (date) => {
  if (!date) return '__/__/____'
  const d = new Date(date)
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const year = d.getFullYear()
  return `${month}/${day}/${year}`
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

// PDF Printing Functions
const printPdf = async () => {
  if (!hasData.value) {
    $q.notify({
      type: 'warning',
      message: 'No data available to print',
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
    let stamp1 = null
    let stamp2 = null
    let pmt1 = null
    let pmt2 = null
    let pmt3 = null

    try {
      // Try to load images from your server/public folder
      tagumLogoBase64 = await convertImageToBase64('/tagumlogo.png')
      rotpLogoBase64 = await convertImageToBase64('/rotp.png')
      stamp1 = await convertImageToBase64('/ipcrstamp.png')
      stamp2 = await convertImageToBase64('/accstamp.png')
      pmt1 = await convertImageToBase64('/pmtstamp.png')
      pmt2 = await convertImageToBase64('/pmt2stamp.png')
      pmt3 = await convertImageToBase64('/pmt3.png')
    } catch (error) {
      console.warn('Could not load images, using SVG placeholders:', error)
      // Use SVG placeholders as fallback
      tagumLogoBase64 = createSvgPlaceholder('TAGUM LOGO')
      rotpLogoBase64 = createSvgPlaceholder('ROTP LOGO')
      stamp1 = createSvgPlaceholder('STAMP LOGO')
      stamp2 = createSvgPlaceholder('STAMP LOGO')
      pmt1 = createSvgPlaceholder('STAMP LOGO')
      pmt2 = createSvgPlaceholder('STAMP LOGO')
      pmt3 = createSvgPlaceholder('STAMP LOGO')

      $q.notify({
        type: 'warning',
        message: 'Using placeholder images for PDF',
        position: 'top',
        timeout: 2000,
      })
    }

    // Generate content based on active tab
    let docDefinition
    switch (activeTab.value) {
      case 'ipcr':
        docDefinition = generateIpcrPdfContent(
          tagumLogoBase64,
          rotpLogoBase64,
          stamp1,
          stamp2,
          pmt1,
          pmt2,
          pmt3,
        )
        break
      case 'ps':
        docDefinition = generatePerformanceStandardPdfContent(tagumLogoBase64, rotpLogoBase64, pmt3)
        break
      case 'mpo':
        docDefinition = generateMonthlyPerformancePdfContent(
          tagumLogoBase64,
          rotpLogoBase64,
          stamp1,
          stamp2,
          pmt1,
          pmt2,
          pmt3,
        )
        break
      case 'smpr':
        docDefinition = generateSummaryMonthlyPdfContent(
          tagumLogoBase64,
          rotpLogoBase64,
          stamp1,
          stamp2,
          pmt1,
          pmt2,
          pmt3,
        )
        break
      default:
        docDefinition = generateIpcrPdfContent(
          tagumLogoBase64,
          rotpLogoBase64,
          stamp1,
          stamp2,
          pmt1,
          pmt2,
          pmt3,
        )
    }

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

// Summary Monthly Performance Report PDF Content
const generateSummaryMonthlyPdfContent = () => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.levels?.office || 'N/A'
  const division = props.levels?.division || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'} ${props.targetPeriod?.year || ''}`

  const content = []

  // Header - Centered and properly spaced
  content.push({
    stack: [
      {
        text: 'Republic of the Philippines',
        alignment: 'center',
        fontSize: 9,
        margin: [0, 5, 0, 2],
      },
      {
        text: 'Province of Davao del Norte',
        alignment: 'center',
        fontSize: 9,
        margin: [0, 0, 0, 2],
      },
      {
        text: 'CITY OF TAGUM',
        alignment: 'center',
        fontSize: 9,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      {
        text: 'SUMMARY MONTHLY PERFORMANCE OUTPUT REPORT',
        alignment: 'center',
        fontSize: 9,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      {
        text: period,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        margin: [0, 0, 0, 15],
      },
    ],
    margin: [0, 0, 0, 10],
  })

  // Employee Info Table - Fixed layout
  content.push({
    table: {
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [
          { text: `EMPLOYEE: ${employeeName}`, fontSize: 9, border: true, margin: [2, 2, 2, 2] },
          { text: `POSITION: ${position}`, fontSize: 9, border: true, margin: [2, 2, 2, 2] },
          { text: `OFFICE: ${office}`, fontSize: 9, border: true, margin: [2, 2, 2, 2] },
          { text: `DIVISION: ${division}`, fontSize: 9, border: true, margin: [2, 2, 2, 2] },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0,
      vLineWidth: () => 0,
    },
    margin: [0, 0, 0, 10],
  })

  // Main Performance Table - Fixed with proper column widths
  if (processedSummaryData.value.length > 0) {
    const columnWidths = [
      '15%', // Column 0: MAJOR FINAL OUTPUT (fixed width)

      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
      '*',
    ]

    const tableBody = []

    // Header rows
    tableBody.push(
      [
        {
          text: 'MAJOR FINAL OUTPUT',
          rowSpan: 3,
          alignment: 'center',
          fontSize: 8,
          bold: true,
          fillColor: '#f2f2f2',
          border: [true, true, true, true],
        },
        {
          text: 'ACCOMPLISHMENT',
          colSpan: 24,
          alignment: 'center',
          fontSize: 8,
          bold: true,
          fillColor: '#f2f2f2',
          border: [true, true, true, true],
        },
        ...Array(23).fill({}), // Placeholder cells
      ],
      [
        {},
        {
          text: 'QUANTITY',
          colSpan: 8,
          alignment: 'center',
          fontSize: 8,
          bold: true,
          fillColor: '#f2f2f2',
          border: [true, true, true, true],
        },
        ...Array(7).fill({}),
        {
          text: 'EFFECTIVENESS',
          colSpan: 8,
          alignment: 'center',
          fontSize: 8,
          bold: true,
          fillColor: '#f2f2f2',
          border: [true, true, true, true],
        },
        ...Array(7).fill({}),
        {
          text: 'TIMELINESS',
          colSpan: 8,
          alignment: 'center',
          fontSize: 8,
          bold: true,
          fillColor: '#f2f2f2',
          border: [true, true, true, true],
        },
        ...Array(7).fill({}),
      ],
      [
        {},
        // Quantity columns
        {
          text: 'Jan',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Feb',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Mar',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Apr',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'May',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Jun',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'TOTAL',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'RATING',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        // Effectiveness columns
        {
          text: 'Jan',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Feb',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Mar',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Apr',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'May',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Jun',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'TOTAL',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'RATING',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        // Timeliness columns
        {
          text: 'Jan',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Feb',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Mar',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Apr',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'May',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'Jun',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'TOTAL',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: 'RATING',
          fontSize: 8,
          alignment: 'center',
          bold: true,
          border: [true, true, true, true],
        },
      ],
    )

    // Add data rows
    processedSummaryData.value.forEach((categoryData) => {
      // Category Header
      tableBody.push([
        {
          text: categoryData.category,
          colSpan: 25,
          fontSize: 8,
          bold: true,
          fillColor: '#92d050',
          alignment: 'left',
          border: [true, true, true, true],
        },
        ...Array(24).fill({}),
      ])

      categoryData.mfos.forEach((mfoData, mfoIndex) => {
        // MFO Header
        tableBody.push([
          {
            text: `MFO ${mfoIndex + 1} - ${mfoData.mfo}`,
            colSpan: 25,
            fontSize: 8,
            bold: true,
            fillColor: '#aeaaaa',
            alignment: 'left',
            border: [true, true, true, true],
          },
          ...Array(24).fill({}),
        ])

        mfoData.outputs.forEach((output, outputIndex) => {
          const row = []

          // Output name
          row.push({
            text: `Output ${outputIndex + 1}: ${output.outputName}`,
            fontSize: 8,
            border: [true, true, true, true],
          })

          // Quantity data (8 columns)
          const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun']
          months.forEach((month) => {
            const value = output.monthly.quantity[month]
            row.push({
              text: value !== undefined && value !== null ? value.toString() : '-',
              fontSize: 7,
              alignment: 'center',
              border: [true, true, true, true],
            })
          })
          row.push({
            text: output.totals.quantity.total?.toString() || '0.00',
            fontSize: 8,
            alignment: 'center',
            bold: true,
            fillColor: '#d9d9d9',
            border: [true, true, true, true],
          })
          row.push({
            text: output.totals.quantity.rating?.toString() || '0.00',
            fontSize: 8,
            alignment: 'center',
            bold: true,
            fillColor: '#d9d9d9',
            border: [true, true, true, true],
          })

          // Effectiveness data (8 columns)
          months.forEach((month) => {
            const value = output.monthly.effectiveness[month]
            row.push({
              text: value !== undefined && value !== null ? value.toString() : '-',
              fontSize: 7,
              alignment: 'center',
              border: [true, true, true, true],
            })
          })
          row.push({
            text: output.totals.effectiveness.total?.toString() || '0.00',
            fontSize: 8,
            alignment: 'center',
            bold: true,
            fillColor: '#d9d9d9',
            border: [true, true, true, true],
          })
          row.push({
            text: output.totals.effectiveness.rating?.toString() || '0.00',
            fontSize: 8,
            alignment: 'center',
            bold: true,
            fillColor: '#d9d9d9',
            border: [true, true, true, true],
          })

          // Timeliness data (8 columns)
          months.forEach((month) => {
            const value = output.monthly.timeliness[month]
            row.push({
              text: value !== undefined && value !== null ? value.toString() : '-',
              fontSize: 7,
              alignment: 'center',
              border: [true, true, true, true],
            })
          })
          row.push({
            text: output.totals.timeliness.total?.toString() || '0.00',
            fontSize: 8,
            alignment: 'center',
            bold: true,
            fillColor: '#d9d9d9',
            border: [true, true, true, true],
          })
          row.push({
            text: output.totals.timeliness.rating?.toString() || '0.00',
            fontSize: 8,
            alignment: 'center',
            bold: true,
            fillColor: '#d9d9d9',
            border: [true, true, true, true],
          })

          tableBody.push(row)
        })
      })
    })

    // Additional rows at the bottom
    tableBody.push(
      [
        { text: '', colSpan: 18, border: [true, true, true, true] },
        ...Array(17).fill({}),
        { text: 'Jan', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
        { text: 'Feb', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
        { text: 'March', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
        { text: 'Apr', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
        { text: 'May', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
        { text: 'June', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
        { text: 'TOTAL', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
      ],
      [
        {
          text: 'MAN DAY(S) LOST THRU ABSENCE',
          colSpan: 18,
          fontSize: 8,
          bold: true,
          border: [true, true, true, true],
        },
        ...Array(17).fill({}),
        ...Array(7).fill({
          text: '',
          fontSize: 8,
          alignment: 'center',
          border: [true, true, true, true],
        }),
      ],
      [
        {
          text: 'MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME',
          colSpan: 18,
          fontSize: 8,
          bold: true,
          border: [true, true, true, true],
        },
        ...Array(17).fill({}),
        ...Array(7).fill({
          text: '',
          fontSize: 8,
          alignment: 'center',
          border: [true, true, true, true],
        }),
      ],
      [
        {
          text: 'OBSERVATIONS/REMARKS',
          colSpan: 25,
          fontSize: 8,
          bold: true,
          border: [true, true, true, true],
          margin: [0, 0, 0, 30],
        },
        ...Array(24).fill({}),
      ],
    )

    // Add the main table to content
    content.push({
      table: {
        headerRows: 3,
        widths: columnWidths,
        body: tableBody,
      },
      layout: {
        hLineWidth: (i) => (i < 3 ? 1 : 0.5), // Thicker lines for headers
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
        paddingLeft: () => 2,
        paddingRight: () => 2,
        paddingTop: () => 2,
        paddingBottom: () => 2,
      },
      margin: [0, 0, 0, 0],
    })
  } else {
    content.push({
      text: 'No summary performance data available',
      alignment: 'center',
      italics: true,
      margin: [0, 20, 0, 20],
    })
  }

  // Signature Section - Simplified with proper spacing
  content.push({
    table: {
      widths: ['25%', '8.33%', '25%', '8.33%', '25%', '8.33%'],
      body: [
        [
          {
            text: 'Above entries are true & correct:',
            fontSize: 8,
            margin: [0, 0, 0, 5],
            alignment: 'center',
          },
          {
            text: 'Date:',
            fontSize: 8,
            margin: [0, 0, 0, 5],
            alignment: 'center',
          },
          {
            text: 'Confirmed:',
            fontSize: 9,
            margin: [0, 0, 0, 5],

            alignment: 'center',
          },
          {
            text: 'Date:',
            fontSize: 8,
            margin: [0, 0, 0, 5],

            alignment: 'center',
          },
          {
            text: 'Approved for Final Rating:',
            fontSize: 9,
            margin: [0, 0, 0, 5],

            alignment: 'center',
          },
          {
            text: 'Date:',
            fontSize: 8,
            margin: [0, 0, 0, 5],

            alignment: 'center',
          },
        ],
        [
          {
            text: employeeName,
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 2],
          },
          {
            text: formatDate(new Date()),
            fontSize: 8,
            alignment: 'center',
            margin: [0, 20, 0, 2],
          },
          {
            text:
              props.supervisorySignatory?.name ||
              props.managerialSignatory?.name ||
              '___________________',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 2],
          },
          {
            text: formatDate(new Date()),
            fontSize: 8,
            alignment: 'center',
            margin: [0, 20, 0, 2],
          },
          {
            text: props.managerialSignatory?.name || '___________________',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 2],
          },
          {
            text: formatDate(new Date()),
            fontSize: 8,
            alignment: 'center',
            margin: [0, 20, 0, 2],
          },
        ],
        [
          {
            text: position,
            fontSize: 8,
            alignment: 'center',
          },
          {
            text: '',
            fontSize: 8,
            alignment: 'center',
          },
          {
            text:
              props.supervisorySignatory?.position ||
              props.managerialSignatory?.position ||
              'Supervisor',
            fontSize: 8,
            alignment: 'center',
          },
          {
            text: '',
            fontSize: 8,
            alignment: 'center',
          },
          {
            text: props.managerialSignatory?.position || 'Department Head',
            fontSize: 8,
            alignment: 'center',
          },
          {
            text: '',
            fontSize: 8,
            alignment: 'center',
          },
        ],
      ],
    },
    layout: {
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 10, 0, 0],
  })

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [36, 36, 36, 36], // Consistent margins
    content: content,
    defaultStyle: {
      fontSize: 10,
    },
    compress: true, // Compress PDF to fit content better
  }
}
const generateMonthlyPerformancePdfContent = () => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.levels?.office || 'N/A'
  const division = props.levels?.division || 'N/A'

  const content = []

  if (groupedMonthlyData.value.length > 0) {
    groupedMonthlyData.value.forEach((monthData, monthIndex) => {
      // Page break for months after the first
      if (monthIndex > 0) {
        content.push({ text: '', pageBreak: 'before' })
      }

      // Header
      content.push({
        stack: [
          {
            text: 'Republic of the Philippines',
            alignment: 'center',
            fontSize: 10,
            margin: [0, 5, 0, 2],
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
            margin: [0, 0, 0, 5],
          },
          {
            columns: [
              { width: '*', text: '' },
              {
                width: 300,
                table: {
                  widths: ['*'],
                  body: [
                    [
                      {
                        text: 'MONTHLY PERFORMANCE OUTPUT REPORT',
                        alignment: 'center',
                        fontSize: 10,
                        bold: true,
                        margin: [10, 5, 10, 5],
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
              { width: '*', text: '' },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      })

      // Employee Info
      content.push({
        table: {
          widths: ['25%', '25%', '25%', '25%'],
          body: [
            [
              { text: `EMPLOYEE: ${employeeName}`, fontSize: 9, bold: true },
              { text: `OFFICE: ${office}`, fontSize: 9, bold: true },
              { text: `DIVISION: ${division}`, fontSize: 9, bold: true },
              { text: `MONTH: ${monthData.month}`, fontSize: 9, bold: true },
            ],
          ],
        },
        layout: 'noBorders',
        margin: [0, 0, 0, 5],
      })

      // Monthly Performance Table
      if (monthData.categories?.length) {
        const tableBody = []

        const columnWidths = [
          '15%', // MAJOR FINAL OUTPUT
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
          '*',
        ]

        // Header row 1
        tableBody.push([
          {
            text: 'MAJOR FINAL OUTPUT',
            rowSpan: 3,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'ACCOMPLISHMENTS',
            colSpan: 18,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
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
          {},
          {},
          {},
          {},
          {},
          {},
          {}, // 17 empty cells
        ])

        // Header row 2
        tableBody.push([
          {}, // Empty for rowspan
          {
            text: 'QUANTITY',
            colSpan: 6,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {},
          {},
          {},
          {},
          {}, // 5 empty for QUANTITY colspan
          {
            text: 'EFFECTIVENESS',
            colSpan: 6,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {},
          {},
          {},
          {},
          {}, // 5 empty for EFFECTIVENESS colspan
          {
            text: 'TIMELINESS',
            colSpan: 6,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {},
          {},
          {},
          {},
          {}, // 5 empty for TIMELINESS colspan
        ])

        // Header row 3
        tableBody.push([
          {}, // Empty for rowspan
          {
            text: 'Wk 1',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 2',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 3',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 4',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 5',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'TOTAL',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 1',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 2',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 3',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 4',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 5',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'TOTAL',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 1',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 2',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 3',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 4',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'Wk 5',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          {
            text: 'TOTAL',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
        ])

        // Add data rows
        monthData.categories.forEach((category) => {
          // Category Header
          tableBody.push([
            {
              text: category.category,
              colSpan: 19,
              alignment: 'left',
              fontSize: 9,
              bold: true,
              fillColor: '#92d050',
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
            {},
            {},
            {},
            {},
            {},
            {},
            {},
            {},
          ])

          category.mfos.forEach((mfoGroup, mfoIndex) => {
            // MFO Header
            tableBody.push([
              {
                text: `MFO ${mfoIndex + 1} - ${mfoGroup.mfo}`,
                colSpan: 19,
                alignment: 'left',
                fontSize: 9,
                bold: true,
                fillColor: '#aeaaaa',
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
              {},
              {},
              {},
              {},
              {},
              {},
              {},
              {},
            ])

            // Output rows
            mfoGroup.outputs.forEach((output, outputIndex) => {
              const row = [
                {
                  text: `Output ${outputIndex + 1} - ${output.outputName}`,
                  fontSize: 8,
                  border: [true, true, true, true],
                },
              ]

              // Quantity columns (6 cells)
              ;['week1', 'week2', 'week3', 'week4', 'week5'].forEach((week) => {
                const value = output.quantity[week]
                // Explicitly check for 0 as a valid value
                const displayValue = value === 0 || value === '0' ? '0' : value || ''
                row.push({
                  text: displayValue,
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                })
              })
              row.push({
                text: output.quantityTotal || '0.00',
                fontSize: 8,
                alignment: 'center',
                bold: true,
                fillColor: '#d9d9d9',
                border: [true, true, true, true],
              })

              // Effectiveness columns (6 cells)
              ;['week1', 'week2', 'week3', 'week4', 'week5'].forEach((week) => {
                const value = output.quantity[week]
                // Explicitly check for 0 as a valid value
                const displayValue = value === 0 || value === '0' ? '0' : value || ''
                row.push({
                  text: displayValue,
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                })
              })
              row.push({
                text: output.effectivenessTotal || '0.00',
                fontSize: 8,
                alignment: 'center',
                bold: true,
                fillColor: '#d9d9d9',
                border: [true, true, true, true],
              })

              // Timeliness columns (6 cells)
              ;['week1', 'week2', 'week3', 'week4', 'week5'].forEach((week) => {
                const value = output.quantity[week]
                // Explicitly check for 0 as a valid value
                const displayValue = value === 0 || value === '0' ? '0' : value || ''
                row.push({
                  text: displayValue,
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                })
              })
              row.push({
                text: output.timelinessTotal || '0.00',
                fontSize: 8,
                alignment: 'center',
                bold: true,
                fillColor: '#d9d9d9',
                border: [true, true, true, true],
              })

              tableBody.push(row)
            })
          })
        })

        // Additional Rows (Man Days/Hours) - FIXED with correct colspan
        tableBody.push([
          { text: '', colSpan: 13, border: [true, true, true, true] },
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
          {}, // 12 empty cells for colspan 13
          { text: 'Wk 1', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: 'Wk 2', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: 'Wk 3', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: 'Wk 4', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: 'Wk 5', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: 'TOTAL', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
        ])

        // MAN DAY(S) LOST THRU ABSENCE - FIXED with correct colspan
        tableBody.push([
          {
            text: 'MAN DAY(S) LOST THRU ABSENCE',
            colSpan: 13,
            fontSize: 8,
            bold: true,
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
          {},
          {}, // 12 empty cells for colspan 13
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
        ])

        // MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME - FIXED with correct colspan
        tableBody.push([
          {
            text: 'MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME',
            colSpan: 13,
            fontSize: 8,
            bold: true,
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
          {},
          {}, // 12 empty cells for colspan 13
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
          { text: '', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
        ])

        // Observations/Remarks row - FIXED with correct colspan
        tableBody.push([
          {
            text: 'OBSERVATIONS/REMARKS',
            colSpan: 19,
            fontSize: 8,
            bold: true,
            border: [true, true, true, true],
            margin: [0, 0, 0, 30],
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
          {},
          {},
          {},
          {},
          {},
          {},
          {}, // 18 empty cells for colspan 19
        ])
        // Add the table
        content.push({
          table: {
            headerRows: 3,
            widths: columnWidths,
            body: tableBody,
          },
          layout: {
            hLineWidth: (i) => (i === 0 || i === 3 ? 1 : 0.5),
            vLineWidth: () => 0.5,
            hLineColor: () => '#000000',
            vLineColor: () => '#000000',
          },
          margin: [0, 10, 0, 0],
        })
      } else {
        content.push({
          text: `No data available for ${monthData.month}`,
          alignment: 'center',
          italics: true,
          margin: [0, 20, 0, 0],
        })
      }

      // Signature Table
      const signatureTable = {
        table: {
          widths: ['35%', '15%', '35%', '15%'],
          body: [
            [
              {
                text: 'Above entries are true & correct:',
                fontSize: 8,
                border: [true, true, true, true],
              },
              {
                text: 'Date:',
                fontSize: 8,
                border: [true, true, true, true],
              },
              {
                text: 'Confirmed:',
                fontSize: 8,
                border: [true, true, true, true],
              },
              {
                text: 'Date:',
                fontSize: 8,
                border: [true, true, true, true],
              },
            ],
            [
              {
                text: employeeName,
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [0, 30, 0, 0],
                border: [true, true, true, true],
              },
              {
                text: formatDate(new Date()),
                fontSize: 8,
                alignment: 'center',
                margin: [0, 30, 0, 0],
                border: [true, true, true, true],
              },
              {
                text: props.managerialSignatory?.name || '___________________',
                fontSize: 8,
                bold: true,
                alignment: 'center',
                margin: [0, 30, 0, 0],
                border: [true, true, true, true],
              },
              {
                text: formatDate(new Date()),
                fontSize: 8,
                alignment: 'center',
                margin: [0, 30, 0, 0],
                border: [true, true, true, true],
              },
            ],
            [
              {
                text: position,
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: '',
                border: [true, true, true, true],
              },
              {
                text: props.managerialSignatory?.position || 'Department Head',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: '',
                border: [true, true, true, true],
              },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 0.5,
          vLineWidth: () => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
        },
        margin: [0, 20, 0, 0],
      }

      content.push(signatureTable)
    })
  } else {
    content.push({
      text: 'No monthly performance data available',
      alignment: 'center',
      italics: true,
      margin: [0, 100, 0, 0],
    })
  }

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [36, 36, 36, 36],
    content: content,
    defaultStyle: {
      fontSize: 10,
    },
  }
}

// Performance Standard PDF Content
const generatePerformanceStandardPdfContent = (tagumLogoBase64, rotpLogoBase64, pmt3) => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.levels?.office || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'} ${props.targetPeriod?.year || ''}`

  const content = []

  // Header with logos
  content.push({
    columns: [
      {
        width: '10%',
        stack: rotpLogoBase64
          ? [
              {
                image: rotpLogoBase64,
                width: 50,
                alignment: 'center',
                margin: [0, 0, 0, 10],
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
      {
        width: '10%',
        stack: tagumLogoBase64
          ? [
              {
                image: tagumLogoBase64,
                width: 55,
                alignment: 'center',
                margin: [0, 0, 0, 10],
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
        width: '60%',
        stack: [
          {
            text: office,
            style: 'reportTitle',
            alignment: 'center',
            margin: [0, 20, 0, 5],
          },
          {
            text: [
              { text: 'PERFORMANCE STANDARDS FOR RATING PERIOD ', style: 'reportTitle' },
              { text: period, style: 'reportTitle', decoration: 'underline' },
            ],
            alignment: 'center',
            margin: [0, 0, 0, 10],
          },
        ],
      },

      {
        width: '20%',
        stack: pmt3
          ? [
              {
                image: pmt3,
                width: 180,
                alignment: 'center',
                margin: [0, 0, 0, 10],
              },
            ]
          : [
              {
                text: 'STAMP LOGO',
                alignment: 'center',
                italics: true,
                margin: [0, 0, 0, 10],
              },
            ],
      },
    ],
    margin: [0, 0, 0, 0],
  })

  // Employee Info Table
  const infoTable = {
    table: {
      widths: ['50%', '50%'],
      body: [
        [
          { text: `Employee: ${employeeName}`, fontSize: 10 },
          { text: `Position: ${position}`, fontSize: 10 },
        ],
      ],
    },
    layout: 'noBorders',
    margin: [0, 10, 0, 0],
  }

  content.push(infoTable)

  // Main Performance Standards Table
  if (groupedPerformanceStandardsByCategory.value.length > 0) {
    const tableBody = [
      // Header row
      [
        {
          text: 'MAJOR FINAL OUTPUT (MFO)',
          fontSize: 9,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'center',
        },
        {
          text: 'REQUIRED COMPETENCY',
          fontSize: 9,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'center',
        },
        {
          text: 'SUCCESS INDICATOR',
          fontSize: 9,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'center',
        },
        { text: 'RATING', fontSize: 9, bold: true, fillColor: '#f2f2f2', alignment: 'center' },
        {
          text: 'Q\n(Quantity)',
          fontSize: 8,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'center',
        },
        {
          text: 'E\n(Effectiveness)',
          fontSize: 8,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'center',
        },
        {
          text: 'T\n(Timeliness)',
          fontSize: 8,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'center',
        },
        {
          text: 'Mode of Verification',
          fontSize: 9,
          bold: true,
          fillColor: '#f2f2f2',
          alignment: 'center',
        },
        { text: 'Remarks', fontSize: 9, bold: true, fillColor: '#f2f2f2', alignment: 'center' },
      ],
    ]

    // Add data with category and MFO headers
    groupedPerformanceStandardsByCategory.value.forEach((categoryGroup) => {
      // Category Header Row
      tableBody.push([
        {
          text: categoryGroup.category,
          colSpan: 9,
          alignment: 'left',
          fontSize: 10,
          bold: true,
          fillColor: '#dbdbdb', // Grey color for category
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
      ])

      categoryGroup.mfos.forEach((mfoGroup, mfoIndex) => {
        // MFO Header Row
        tableBody.push([
          {
            text: `MFO ${mfoIndex + 1} - ${mfoGroup.mfo}`,
            colSpan: 9,
            alignment: 'left',
            fontSize: 10,
            bold: true,
            fillColor: '#dbdbdb', // Lighter grey for MFO
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
        ])

        mfoGroup.standards.forEach((standard, stdIndex) => {
          const competencies = getAllCompetencies(standard)
          let competencyText = ''
          if (competencies.length > 0) {
            competencies.forEach((comp, idx) => {
              competencyText += `${idx + 1}. ${comp.description}`
              if (comp.level) {
                competencyText += ` (${getProficiencyLevel(comp.level)})`
              }
              competencyText += '\n'
            })
          } else {
            competencyText = 'No competencies specified'
          }

          if (standard.standard_outcomes && standard.standard_outcomes.length > 0) {
            standard.standard_outcomes.forEach((outcome, outcomeIndex) => {
              const row = []

              if (outcomeIndex === 0) {
                row.push(
                  {
                    text: `Output ${stdIndex + 1} - ${standard.mfo}`,
                    fontSize: 9,
                    rowSpan: standard.standard_outcomes.length,
                    border: [true, true, true, true],
                  },
                  {
                    text: competencyText,
                    fontSize: 8,
                    rowSpan: standard.standard_outcomes.length,
                    border: [true, true, true, true],
                  },
                  {
                    text: standard.success_indicator,
                    fontSize: 9,
                    rowSpan: standard.standard_outcomes.length,
                    border: [true, true, true, true],
                  },
                )
              } else {
                row.push({}, {}, {})
              }

              row.push(
                {
                  text: outcome.rating || '-',
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                },
                {
                  text: outcome.quantity || '-',
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                },
                {
                  text: outcome.effectiveness || '-',
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                },
                {
                  text: outcome.timeliness || '-',
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                },
              )

              if (outcomeIndex === 0) {
                row.push(
                  {
                    text: standard.required_output || '-',
                    fontSize: 9,
                    rowSpan: standard.standard_outcomes.length,
                    alignment: 'center',
                    border: [true, true, true, true],
                  },
                  {
                    text: standard.remarks || '-',
                    fontSize: 9,
                    rowSpan: standard.standard_outcomes.length,
                    border: [true, true, true, true],
                  },
                )
              } else {
                row.push({}, {})
              }

              tableBody.push(row)
            })
          } else {
            tableBody.push([
              {
                text: `Output ${stdIndex + 1} - ${standard.mfo}`,
                fontSize: 9,
                border: [true, true, true, true],
              },
              {
                text: competencyText,
                fontSize: 8,
                border: [true, true, true, true],
              },
              {
                text: standard.success_indicator,
                fontSize: 9,
                border: [true, true, true, true],
              },
              {
                text: '-',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: '-',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: '-',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: '-',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: standard.required_output || '-',
                fontSize: 9,
                alignment: 'center',
                border: [true, true, true, true],
              },
              {
                text: standard.remarks || '-',
                fontSize: 9,
                border: [true, true, true, true],
              },
            ])
          }
        })
      })
    })

    content.push({
      table: {
        headerRows: 1,
        widths: ['15%', '19%', '15%', '6%', '7%', '7%', '7%', '12%', '12%'],
        body: tableBody,
      },
      layout: {
        hLineWidth: () => 0.5,
        vLineWidth: () => 0.5,
        hLineColor: () => '#000000',
        vLineColor: () => '#000000',
        fillColor: (rowIndex, node, columnIndex) => {
          // Apply grey background to category and MFO rows
          if (rowIndex > 0) {
            const cell = node.table.body[rowIndex][columnIndex]
            if (cell.fillColor) {
              return cell.fillColor
            }
          }
          return null
        },
      },
      margin: [0, 0, 0, 20],
    })
  } else {
    content.push({
      text: 'No performance standard data',
      alignment: 'center',
      italics: true,
      margin: [0, 20, 0, 20],
    })
  }

  // ... rest of the PDF content (proficiency table and signatures) remains the same
  // Proficiency Levels table
  const proficiencyBody = [
    [
      {
        text: 'Proficiency Levels of Competency:',
        colSpan: 2,
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {},
    ],
    [
      {
        text: 'Basic',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {
        text: 'Understands basic principles; Can perform task with assistance or direction',
        fontSize: 9,
        border: [true, true, true, true],
      },
    ],
    [
      {
        text: 'Advanced',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {
        text: 'Performs routine task with reliable results; Works with minimal supervision',
        fontSize: 9,
        border: [true, true, true, true],
      },
    ],
    [
      {
        text: 'Intermediate',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {
        text: 'Performs complex and multiple tasks; Can coach and teach others',
        fontSize: 9,
        border: [true, true, true, true],
      },
    ],
    [
      {
        text: 'Superior',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {
        text: 'Considered as an expert in this task; Can describe, teach and lead others',
        fontSize: 9,
        border: [true, true, true, true],
      },
    ],
  ]

  content.push({
    table: {
      widths: ['25%', '75%'],
      body: proficiencyBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [150, 20, 150, 20],
  })

  // Signature Section
  const signatureContent = {
    table: {
      widths: ['33%', '34%', '33%'],
      body: [
        // Header row
        [
          {
            text: 'Conformed:',
            fontSize: 9,
            bold: true,
            alignment: 'left',
            border: [false, false, false, false],
          },
          {
            text: 'Discussed With:',
            fontSize: 9,
            bold: true,
            alignment: 'left',
            border: [false, false, false, false],
          },
          {
            text: 'Approved by:',
            fontSize: 9,
            bold: true,
            alignment: 'left',
            border: [false, false, false, false],
          },
        ],
        // Signature row
        [
          {
            text: employeeName,
            fontSize: 9,
            bold: true,
            decoration: 'underline',
            alignment: 'center',
            margin: [0, 40, 0, 0],
          },
          {
            text:
              props.supervisorySignatory?.name ||
              props.managerialSignatory?.name ||
              '___________________',
            fontSize: 9,
            bold: true,
            decoration: 'underline',
            alignment: 'center',
            margin: [0, 40, 0, 0],
            border: [false, false, false, true],
          },
          {
            text: props.managerialSignatory?.name || '___________________',
            fontSize: 9,
            bold: true,
            decoration: 'underline',
            alignment: 'center',
            margin: [0, 40, 0, 0],
            border: [false, false, false, true],
          },
        ],
        // Position row
        [
          {
            text: position,
            fontSize: 9,
            alignment: 'center',
            border: [false, false, false, false],
          },
          {
            text:
              props.supervisorySignatory?.position ||
              props.managerialSignatory?.position ||
              'Office Head/Rater',
            fontSize: 9,
            alignment: 'center',
            border: [false, false, false, false],
          },
          {
            text: props.managerialSignatory?.position || 'Office Head/Rater',
            fontSize: 9,
            alignment: 'center',
            border: [false, false, false, false],
          },
        ],
        // Label row
        [
          {
            text: 'Employee/Ratee',
            fontSize: 9,
            italics: true,
            alignment: 'center',
            border: [false, false, false, false],
          },
          {
            text: 'Office Head/Rater',
            fontSize: 9,
            italics: true,
            alignment: 'center',
            border: [false, false, false, false],
          },
          {
            text: 'Office Head/Rater',
            fontSize: 9,
            italics: true,
            alignment: 'center',
            border: [false, false, false, false],
          },
        ],
      ],
    },
    layout: 'noBorders',
    margin: [0, 0, 0, 0],
  }

  content.push(signatureContent)

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [20, 30, 20, 30],
    content: content,
    styles: {
      reportTitle: {
        fontSize: 11,
        bold: true,
      },
    },
    defaultStyle: {
      fontSize: 10,
    },
  }
}

const generateIpcrPdfContent = (tagumLogoBase64, rotpLogoBase64, stamp1, stamp2, pmt1, pmt2) => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office =
    currentData.value?.office || props.employee?.office || props.levels?.office || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'} ${props.targetPeriod?.year || ''}`

  const content = []

  // Header with logos - CENTERED
  content.push({
    columns: [
      {
        width: '*',
        text: '',
      },
      {
        width: 'auto',
        columns: [
          {
            width: 'auto',
            stack: tagumLogoBase64
              ? [
                  {
                    image: tagumLogoBase64,
                    width: 55,
                    alignment: 'center',
                    margin: [0, 20, 0, 10],
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
            width: 'auto',
            stack: [
              {
                text: 'INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)',
                style: 'reportTitle',
                alignment: 'center',
                margin: [0, 20, 0, 5],
              },
              {
                text: office,
                style: 'reportTitle',
                alignment: 'center',
                margin: [0, 0, 0, 10],
              },
            ],
            margin: [20, 0, 20, 0],
          },
          {
            width: 'auto',
            stack: rotpLogoBase64
              ? [
                  {
                    image: rotpLogoBase64,
                    width: 55,
                    alignment: 'center',
                    margin: [0, 20, 0, 10],
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
        alignment: 'center',
      },
      {
        width: '*',
        text: '',
      },
    ],
  })

  // Commitment signature section
  content.push({
    columns: [
      {
        width: '75%',
        stack: [
          {
            text: [
              { text: 'I, ' },
              { text: employeeName, decoration: 'underline', bold: true },
              { text: ', of ' },
              { text: office, decoration: 'underline', bold: true },
              {
                text: ', commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measure for the period ',
              },
              { text: period, bold: true },
              { text: '.' },
            ],
            fontSize: 9,
            lineHeight: 1.5,
            margin: [0, 0, 0, 0],
          },

          // Employee signature
          {
            columns: [
              { width: '80%', text: '' },
              {
                width: '20%',
                stack: [
                  {
                    text: employeeName,
                    decoration: 'underline',
                    bold: true,
                    fontSize: 8,
                    alignment: 'center',
                    margin: [0, 20, 0, 2],
                  },
                  {
                    text: position,
                    fontSize: 8,
                    alignment: 'center',
                    margin: [0, 0, 0, 2],
                  },
                  {
                    text: `Date: ${formatDate(new Date())}`,
                    fontSize: 9,
                    alignment: 'center',
                  },
                ],
              },
            ],
          },
          // Signatures table
          {
            table: {
              widths: ['50%', '50%'],
              body: [
                [
                  {
                    text: 'Reviewed by:',
                    fontSize: 9,
                    border: [true, true, true, true],
                    bold: true,
                  },
                  {
                    text: 'Approved by:',
                    fontSize: 9,
                    border: [true, true, true, true],
                    bold: true,
                  },
                ],
                [
                  {
                    stack: [
                      {
                        text:
                          props.supervisorySignatory?.name ||
                          props.managerialSignatory?.name ||
                          '_______________________',
                        decoration: 'underline',
                        bold: true,
                        fontSize: 9,
                        alignment: 'center',
                        margin: [0, 20, 0, 2],
                      },
                      {
                        text:
                          props.supervisorySignatory?.position ||
                          props.managerialSignatory?.position ||
                          'Immediate Supervisor',
                        fontSize: 9,
                        alignment: 'center',
                        margin: [0, 0, 0, 2],
                      },
                      {
                        text: `Date: ${formatDate(new Date())}`,
                        fontSize: 9,
                        alignment: 'center',
                      },
                    ],
                    border: [true, true, true, true],
                  },
                  {
                    stack: [
                      {
                        text: props.managerialSignatory?.name || '_______________________',
                        decoration: 'underline',
                        bold: true,
                        fontSize: 9,
                        alignment: 'center',
                        margin: [0, 20, 0, 2],
                      },
                      {
                        text: props.managerialSignatory?.position || 'Department Head',
                        fontSize: 9,
                        alignment: 'center',
                        margin: [0, 0, 0, 2],
                      },
                      {
                        text: `Date: ${formatDate(new Date())}`,
                        fontSize: 9,
                        alignment: 'center',
                      },
                    ],
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
            margin: [0, 5, 0, 0],
          },
        ],
      },
      {
        width: '25%',
        stack: [
          {
            stack: stamp1
              ? [
                  {
                    image: stamp1,
                    width: 180,
                    alignment: 'center',
                    margin: [0, 0, 0, 10],
                  },
                ]
              : [
                  {
                    text: 'STAMP LOGO',
                    alignment: 'center',
                    italics: true,
                    margin: [0, 0, 0, 10],
                  },
                ],
          },
          {
            stack: stamp2
              ? [
                  {
                    image: stamp2,
                    width: 180,
                    alignment: 'center',
                    margin: [0, 0, 0, 0],
                  },
                ]
              : [
                  {
                    text: 'STAMP LOGO',
                    alignment: 'center',
                    italics: true,
                    margin: [0, 0, 0, 0],
                  },
                ],
          },
        ],
        margin: [10, 0, 0, 0],
      },
    ],
    margin: [0, 10, 0, 10],
  })

  // Performance Management Team and Rating Legend
  content.push({
    columns: [
      {
        width: '35%',
        stack: [
          {
            stack: pmt1
              ? [
                  {
                    image: pmt1,
                    width: 280,
                    alignment: 'center',
                    margin: [0, 0, 0, 0],
                  },
                ]
              : [
                  {
                    text: 'STAMP LOGO',
                    alignment: 'center',
                    italics: true,
                    margin: [0, 0, 0, 0],
                  },
                ],
          },
        ],
      },
      {
        width: '40%',
        table: {
          widths: ['15%', '85%'],
          body: [
            [
              { text: '5', alignment: 'center', fontSize: 8, border: [true, true, true, true] },
              { text: 'Outstanding', fontSize: 8, border: [true, true, true, true] },
            ],
            [
              { text: '4', alignment: 'center', fontSize: 8, border: [true, true, true, true] },
              { text: 'Very Satisfactory', fontSize: 8, border: [true, true, true, true] },
            ],
            [
              { text: '3', alignment: 'center', fontSize: 8, border: [true, true, true, true] },
              { text: 'Satisfactory', fontSize: 8, border: [true, true, true, true] },
            ],
            [
              { text: '2', alignment: 'center', fontSize: 8, border: [true, true, true, true] },
              { text: 'Unsatisfactory', fontSize: 8, border: [true, true, true, true] },
            ],
            [
              { text: '1', alignment: 'center', fontSize: 8, border: [true, true, true, true] },
              { text: 'Poor', fontSize: 8, border: [true, true, true, true] },
            ],
          ],
        },
        layout: {
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
        },
        margin: [20, 0, 0, 0],
      },
    ],
    margin: [0, 0, 0, 10],
  })

  // Main Performance Table - CENTERED with proper widths
  const mainTableBody = [
    // First header row
    [
      {
        text: 'MAJOR FINAL OUTPUT',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
      },
      {
        text: 'REQUIRED COMPETENCY & PROFICIENCY LEVEL',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
      },
      {
        text: 'SUCCESS INDICATOR',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
      },
      {
        text: 'ACTUAL ACCOMPLISHMENT',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
      },
      {
        text: 'RATING',
        colSpan: 4,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {
        text: 'PROFICIENCY RESULT',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
      },
      {
        text: 'REMARKS',
        rowSpan: 2,
        alignment: 'center',
        fontSize: 9,
        bold: true,
        border: [true, true, true, true],
      },
    ],
    // Second header row
    [
      {},
      {},
      {},
      {},
      { text: 'Q', alignment: 'center', fontSize: 9, bold: true, border: [true, true, true, true] },
      { text: 'E', alignment: 'center', fontSize: 9, bold: true, border: [true, true, true, true] },
      { text: 'T', alignment: 'center', fontSize: 9, bold: true, border: [true, true, true, true] },
      { text: 'A', alignment: 'center', fontSize: 9, bold: true, border: [true, true, true, true] },
      {},
      {},
    ],
  ]

  // Add data rows
  if (groupedIpcrData.value.length > 0) {
    groupedIpcrData.value.forEach((categoryGroup) => {
      // Category Header
      mainTableBody.push([
        {
          text: categoryGroup.category,
          colSpan: 10,
          alignment: 'left',
          fontSize: 9,
          bold: true,
          fillColor: '#e8f5e9',
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

      categoryGroup.mfos.forEach((mfoGroup, mfoIndex) => {
        // MFO Header
        mainTableBody.push([
          {
            text: `MFO ${mfoIndex + 1} - ${mfoGroup.mfo}`,
            colSpan: 10,
            alignment: 'left',
            fontSize: 9,
            bold: true,
            fillColor: '#f7f7f7',
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

        mfoGroup.standards.forEach((standard, stdIndex) => {
          const monthlyRatings = standard.monthly_ratings || {}
          const average = monthlyRatings.average || {}

          // Format competencies
          let competenciesText = ''
          const allComp = getAllCompetencies(standard)
          if (allComp.length > 0) {
            allComp.forEach((comp, idx) => {
              competenciesText += `${idx + 1}. ${comp.description} (${getProficiencyLevel(comp.level)})\n`
            })
          } else {
            competenciesText = 'No competencies specified'
          }

          // Format proficiency result
          let proficiencyText = ''
          if (allComp.length > 0) {
            allComp.forEach((comp, idx) => {
              proficiencyText += `${idx + 1}. ${getProficiencyLevel(comp.level)}\n`
            })
          } else {
            proficiencyText = 'Not Applicable'
          }

          mainTableBody.push([
            {
              text: `Output ${stdIndex + 1} - ${standard.output || standard.mfo}`,
              fontSize: 8,
              alignment: 'left',
              border: [true, true, true, true],
            },
            {
              text: competenciesText,
              fontSize: 8,
              alignment: 'left',
              border: [true, true, true, true],
            },
            {
              text: standard.success_indicator || '-',
              fontSize: 8,
              alignment: 'left',
              border: [true, true, true, true],
            },
            {
              text: monthlyRatings.actual_accomplishment || '',
              fontSize: 8,
              alignment: 'left',
              border: [true, true, true, true],
            },
            {
              text: average.quantity,
              alignment: 'center',
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: average.effectiveness,
              alignment: 'center',
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: average.timeliness,
              alignment: 'center',
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: average.overall,
              alignment: 'center',
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: proficiencyText,
              alignment: 'center',
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: monthlyRatings.remarks || '-',
              fontSize: 8,
              border: [true, true, true, true],
            },
          ])
        })
      })

      // Category Average
      mainTableBody.push([
        {
          text: `${categoryGroup.category} Average Rating`,
          colSpan: 7,
          alignment: 'left',
          bold: true,
          fontSize: 8,
          border: [true, true, true, true],
        },
        {},
        {},
        {},
        {},
        {},
        {},
        {
          text: categoryGroup.averageRating,
          alignment: 'center',
          bold: true,
          fontSize: 8,
          border: [true, true, true, true],
        },
        {
          text: '',
          colSpan: 2,
          border: [true, true, true, true],
        },
        {},
      ])
    })

    // Final Average
    mainTableBody.push([
      {
        text: 'Final Average Rating',
        colSpan: 7,
        alignment: 'left',
        bold: true,
        fontSize: 8,
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {},
      {},
      {},
      {
        text: finalAverageRating.value,
        alignment: 'center',
        bold: true,
        fontSize: 8,
        border: [true, true, true, true],
      },
      {
        text: '',
        colSpan: 2,
        border: [true, true, true, true],
      },
      {},
    ])

    // Performance Results section
    mainTableBody.push([
      {
        text: '',
        fontSize: 8,
        border: [true, true, true, true],
      },
      {
        text: 'Performance Results',
        colSpan: 2,
        alignment: 'center',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
      },
      {},
      {
        text: 'Competency Assessment(Subjective)',
        colSpan: 4,
        alignment: 'center',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
      },
      {},
      {},
      {},
      {
        colSpan: 3,
        rowSpan: categoryCalculations.value.length + 3,
        border: [true, true, true, true],
        stack: [
          {
            stack: pmt2
              ? [
                  {
                    image: pmt2,
                    width: 250,
                    alignment: 'center',
                    margin: [0, 0, 0, 0],
                  },
                ]
              : [
                  {
                    text: 'STAMP LOGO',
                    alignment: 'center',
                    italics: true,
                    margin: [0, 0, 0, 0],
                  },
                ],
          },
        ],
      },
      {},
      {},
    ])

    // Category calculations
    if (categoryCalculations.value.length) {
      categoryCalculations.value.forEach((calc, index) => {
        const row = [
          {
            text: calc.category,
            fontSize: 8,
            alignment: 'left',
            border: [true, true, true, true],
          },
          {
            text: calc.weightedAverage,
            colSpan: 2,
            fontSize: 8,
            border: [true, true, true, true],
          },
          {},
        ]

        if (index === 0) {
          row.push({
            text: '',
            colSpan: 4,
            rowSpan: categoryCalculations.value.length + 2,
            border: [true, true, true, true],
          })
        } else {
          row.push({})
          row.push({})
          row.push({})
          row.push({})
        }

        row.push({})
        row.push({})
        row.push({})

        mainTableBody.push(row)
      })

      // Total Row
      mainTableBody.push([
        {
          text: 'Total',
          alignment: 'left',
          fontSize: 8,
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: finalAverageRating.value,
          colSpan: 2,
          fontSize: 8,
          bold: true,
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
      ])

      // Adjectival Rating Row
      mainTableBody.push([
        {
          text: 'ADJECTIVAL RATING',
          fontSize: 8,
          alignment: 'left',
          bold: true,
          border: [true, true, true, true],
        },
        {
          text: adjectivalRating.value,
          colSpan: 2,
          fontSize: 8,
          bold: true,
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
      ])
    }

    // Comments section in main table
    mainTableBody.push([
      {
        text: 'Comments and Recommendations for Development Purposes',
        colSpan: 10,
        alignment: 'left',
        bold: true,
        fontSize: 9,
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

    mainTableBody.push([
      {
        text: '\n\n\n\n\n',
        colSpan: 10,

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
  } else {
    mainTableBody.push([
      {
        text: 'No IPCR data available',
        colSpan: 10,
        alignment: 'center',
        italics: true,
        fontSize: 9,
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

  // Add main performance table (without signatures)
  content.push({
    table: {
      headerRows: 2,
      widths: ['14%', '18%', '12%', '12%', '5%', '5%', '5%', '5%', '12%', '12%'],
      body: mainTableBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
  })

  // SEPARATE SIGNATURE TABLE WITH EQUAL WIDTHS
  const signatureTableBody = [
    [
      {
        text: 'Discussed with:',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        text: 'Date:',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        text: 'Assessed by:',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        text: 'Date:',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        text: 'Final Rating by:',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        text: 'Date:',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
        alignment: 'center',
      },
    ],
    [
      {
        stack: [
          {
            text: employeeName,
            decoration: 'underline',
            bold: true,
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          {
            text: position,
            fontSize: 8,
            alignment: 'center',
          },
        ],
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: formatDate(new Date()),
            decoration: 'underline',
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          {
            text: 'Date',
            fontSize: 8,
            alignment: 'center',
          },
        ],
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: 'I certify that I discussed my assessment of the performance with the employee',
            fontSize: 7,
            alignment: 'left',
            margin: [0, 0, 0, 5],
          },
          {
            text:
              props.supervisorySignatory?.name || props.managerialSignatory?.name || employeeName,
            decoration: 'underline',
            bold: true,
            fontSize: 9,
            alignment: 'center',
            margin: [0, 25, 0, 2],
          },
          {
            text:
              props.supervisorySignatory?.position ||
              props.managerialSignatory?.position ||
              position,
            fontSize: 8,
            alignment: 'center',
          },
        ],
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: formatDate(new Date()),
            decoration: 'underline',
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          {
            text: 'Date',
            fontSize: 8,
            alignment: 'center',
          },
        ],
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: props.managerialSignatory?.name || employeeName,
            decoration: 'underline',
            bold: true,
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          {
            text: props.managerialSignatory?.position || position,
            fontSize: 8,
            alignment: 'center',
          },
        ],
        border: [true, true, true, true],
        alignment: 'center',
      },
      {
        stack: [
          {
            text: formatDate(new Date()),
            decoration: 'underline',
            fontSize: 9,
            alignment: 'center',
            margin: [0, 40, 0, 2],
          },
          {
            text: 'Date',
            fontSize: 8,
            alignment: 'center',
          },
        ],
        border: [true, true, true, true],
        alignment: 'center',
      },
    ],
  ]

  content.push({
    table: {
      pageBreak: 'before',
      headerRows: 0,
      widths: ['20%', '13.33%', '20%', '13.33%', '20%', '13.33%'],
      body: signatureTableBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [0, 0, 0, 0],
    unbreakable: true,
  })

  // Proficiency Levels table
  const proficiencyBody = [
    [
      {
        text: 'Proficiency Levels of Competency:',
        colSpan: 2,
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {},
    ],
    [
      {
        text: 'Basic',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {
        text: 'Understands basic principles; Can perform task with assistance or direction',
        fontSize: 8,

        border: [true, true, true, true],
      },
    ],
    [
      {
        text: 'Advanced',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {
        text: 'Performs routine task with reliable results; Works with minimal supervision',
        fontSize: 8,
        border: [true, true, true, true],
      },
    ],
    [
      {
        text: 'Intermediate',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {
        text: 'Performs complex and multiple tasks; Can coach and teach others',
        fontSize: 8,
        border: [true, true, true, true],
      },
    ],
    [
      {
        text: 'Superior',
        bold: true,
        alignment: 'center',
        fontSize: 9,
        border: [true, true, true, true],
      },
      {
        text: 'Considered as an expert in this task; Can describe, teach and lead others',
        fontSize: 8,
        border: [true, true, true, true],
      },
    ],
  ]

  content.push({
    alignment: 'center',
    table: {
      widths: ['10%', '35%'],
      body: proficiencyBody,
    },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [20, 20, 20, 20],
  })

  // Return the complete document definition
  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [32, 20, 32, 20], // Equal left and right margins for centering
    content: content,
    styles: {
      reportTitle: {
        fontSize: 12,
        bold: true,
      },
      tableHeader: {
        bold: true,
        fontSize: 9,
        fillColor: '#f2f2f2',
      },
      sectionHeader: {
        bold: true,
        fontSize: 9,
        fillColor: '#e8f5e9',
      },
      mfoHeader: {
        bold: true,
        fontSize: 9,
        fillColor: '#f7f7f7',
      },
    },
    defaultStyle: {
      fontSize: 8,
      alignment: 'left', // Default alignment for better control
    },
  }
}
// Lifecycle
onMounted(async () => {
  await loadIpcrData()
})

watch(
  () => [props.employee, props.targetPeriod],
  () => {
    ipcrStore.clearCache()
    loadIpcrData()
  },
  { deep: true },
)
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
  overflow: hidden;
}

.app-header {
  background-color: #00703c;
  color: white;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content {
  flex-grow: 1;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.logo {
  width: 100px;
  height: auto;
  padding: 10px;
}

.center-text {
  text-align: center;
  flex-grow: 1;
  font-weight: bold;
  line-height: 1.5;
}

.title {
  font-size: 16px;
  margin-bottom: 5px;
}

.main-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.division-nav {
  width: 300px;
  background-color: #f5f5f5;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.division-nav-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
}

.employee-details {
  padding: 16px;
}

.report-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #ebebeb;
}

.report-header {
  padding: 16px;
  border-bottom: 1px solid #e0e0e0;
  background-color: #fafafa;
}

.report-content-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 5px;
}

.report-content {
  background-color: white;
  padding: 20px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

.commitment-section {
  margin-top: 20px;
  margin-bottom: 20px;
}

.header-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 20px;
}

.header-text {
  text-align: center;
  margin-bottom: 20px;
}

.padded-text {
  padding: 2px 0;
}

.info-table {
  margin-bottom: 20px;
  border-collapse: collapse;
}

.info-table td {
  padding: 5px 10px;
  border: none;
}

.table-container {
  margin-top: 20px;
  overflow-x: auto;
}

.main-table {
  border-collapse: collapse;
  width: 100%;
}

.main-table th,
.main-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  font-size: 11px;
}

.main-table th {
  text-align: center;
  font-weight: bold;
}

/* Add these styles to your existing CSS */
.avg-cell {
  background-color: #d0cece !important;
}

.total-cell {
  background-color: #d9d9d9 !important;
}

/* Ensure the colors apply to table cells */
.main-table td.avg-cell,
.main-table th.avg-cell {
  background-color: #d0cece !important;
}

.main-table td.total-cell,
.main-table th.total-cell {
  background-color: #d9d9d9 !important;
}

/* Column Width Classes */
.col-mfo {
  width: 12%;
}

.col-competency {
  width: 18%;
}

.col-success {
  width: 12%;
}

.col-accomplishment {
  width: 12%;
}

.col-rating {
  width: 5%;
}

.col-proficiency {
  width: 12%;
}

.col-remarks {
  width: 12%;
}

/* Competency List Styling */
.competency-list {
  font-size: 10px;
  line-height: 1.4;
}

.competency-section {
  margin-bottom: 8px;
}

.competency-section:last-child {
  margin-bottom: 0;
}

.competency-item {
  margin-left: 8px;
  margin-top: 2px;
}

.section-header {
  background-color: #e8f5e9;
  font-weight: bold;
  text-align: center;
  padding: 8px;
}

.section-mfo {
  background-color: #f7f7f7;
  font-weight: bold;
  padding: 8px;
}

.category-header {
  background-color: #92d050;
  font-weight: bold;
  text-align: center;
  padding: 12px 8px;
  font-size: 12px;
}

.mfo-header {
  background-color: #aeaaaa;
  font-weight: bold;
  text-align: center;
  padding: 10px 8px;
  font-size: 11px;
}

.main-table td {
  vertical-align: middle;
}

/* Ensure consistent row heights */
.main-table tbody tr {
  height: 40px;
}
</style>
