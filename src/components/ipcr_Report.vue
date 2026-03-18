<template>
  <!-- App Header -->
  <div class="app-container">
    <div class="app-header">
      <div class="header-content">
        <div class="text-h6 text-white">CITY OF TAGUM - {{ levels?.office || 'N/A' }}</div>
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
              color="orange"
              label="Update Status"
              class="full-width"
              :disable="employee?.ipcrStatus === 'Approved'"
              @click="openStatusModal"
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
                color="blue-9"
                icon="edit"
                label="Input Attendance"
                @click="attendanceModalRef?.openModal()"
              />
              <q-btn
                color="green-9"
                icon="print"
                label="Print"
                @click="printPdf"
                :loading="isPrinting"
                :disable="!hasData"
              />
            </div>

            <!-- Attendance Modal -->
            <AbsentLateInputModal
              ref="attendanceModalRef"
              :employee="employee"
              :target-period="targetPeriod"
              :target-period-id="targetPeriodId"
              :existing-data="existingAttendanceData"
              @save="handleAttendanceSave"
              @close="handleAttendanceClose"
            />
          </div>
        </div>

        <!-- Tabs -->
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
            <!-- ===================== IPCR TAB ===================== -->
            <q-tab-panel name="ipcr">
              <div class="report-content">
                <!-- Header with Logo -->
                <div class="header">
                  <img src="/tagumlogo.png" alt="City of Tagum Logo" class="logo" />
                  <div class="center-text">
                    <div class="title">INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)</div>
                    <div class="title">{{ levels?.office || 'N/A' }}</div>
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
                                    ><u>{{
                                      supervisorySignatory?.name || managerialSignatory?.name
                                    }}</u></strong
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
                        <template v-if="ipcrPerformanceData?.length">
                          <template
                            v-for="(categoryGroup, catIndex) in groupedIpcrData"
                            :key="`cat-${catIndex}`"
                          >
                            <tr>
                              <td colspan="10" class="section-header">
                                {{ categoryGroup.category }}
                              </td>
                            </tr>
                            <template
                              v-for="(mfoGroup, mfoIndex) in categoryGroup.mfos"
                              :key="`mfo-${catIndex}-${mfoIndex}`"
                            >
                              <tr>
                                <td colspan="10" class="section-mfo">
                                  MFO {{ mfoIndex + 1 }} - {{ mfoGroup.mfo }}
                                </td>
                              </tr>
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
                                      <template v-else
                                        ><span class="text-grey-7"
                                          >No competencies specified</span
                                        ></template
                                      >
                                    </div>
                                  </td>
                                  <td>{{ standard.success_indicator }}</td>
                                  <td>
                                    <span v-if="standard.accomplishment?.actual_accomplishment">{{
                                      standard.accomplishment.actual_accomplishment
                                    }}</span>
                                    <span v-else>-</span>
                                  </td>
                                  <td class="text-center">
                                    {{ standard.ratings?.quantity_rating || '-' }}
                                  </td>
                                  <td class="text-center">
                                    {{ standard.ratings?.effectiveness_rating || '-' }}
                                  </td>
                                  <td class="text-center">
                                    {{ standard.ratings?.timeliness_rating || '-' }}
                                  </td>
                                  <td class="text-center">
                                    {{ standard.ratings?.average_rating || '-' }}
                                  </td>
                                  <td class="text-center">
                                    <div class="competency-list">
                                      <template v-if="getAllCompetencies(standard).length > 0">
                                        <div
                                          v-for="(comp, idx) in getAllCompetencies(standard)"
                                          :key="`comp-${idx}`"
                                          class="competency-item"
                                        >
                                          {{ idx + 1 }}. {{ getProficiencyLevel(comp.level) }}
                                        </div>
                                      </template>
                                      <template v-else
                                        ><span class="text-grey-7">Not Applicable</span></template
                                      >
                                    </div>
                                  </td>
                                  <td>
                                    <template v-if="standard.monthly_ratings?.remarks">{{
                                      standard.monthly_ratings.remarks
                                    }}</template>
                                    <span v-else>-</span>
                                  </td>
                                </tr>
                              </template>
                            </template>
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
                          <tr>
                            <td colspan="7" class="text-right text-weight-bold">
                              Final Average Rating
                            </td>
                            <td class="text-center text-weight-bold">{{ finalAverageRating }}</td>
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
                            <td>{{ calc.weightedAverage }}</td>
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
                          <tr>
                            <td>Total</td>
                            <td colspan="4">{{ finalAverageRating }}</td>
                          </tr>
                          <tr>
                            <td>ADJECTIVAL RATING</td>
                            <td colspan="4">{{ adjectivalRating }}</td>
                          </tr>
                        </template>
                        <tr>
                          <td colspan="10">
                            <strong>Comments and Recommendations for Development Purposes</strong>
                          </td>
                        </tr>
                        <tr>
                          <td colspan="10"><div style="height: 50px"></div></td>
                        </tr>
                        <tr>
                          <td colspan="10" style="padding: 0">
                            <table
                              style="width: 100%; border-collapse: collapse; table-layout: fixed"
                            >
                              <tbody>
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
                                <tr style="height: 80px">
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
                                        >{{ employee?.label || employee?.name }}</strong
                                      >
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">
                                      {{ employee?.position }}
                                    </div>
                                  </td>
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
                                      >{{
                                        supervisorySignatory?.name || managerialSignatory?.name
                                      }}</strong
                                    >
                                    <div
                                      style="margin-top: 5px; font-size: 11px; padding-bottom: 5px"
                                    >
                                      {{
                                        supervisorySignatory?.position ||
                                        managerialSignatory?.position
                                      }}
                                    </div>
                                  </td>
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
                                        >{{ managerialSignatory?.name }}</strong
                                      >
                                    </div>
                                    <div style="margin-top: 5px; font-size: 11px">
                                      {{ managerialSignatory?.position }}
                                    </div>
                                  </td>
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

            <!-- ===================== PERFORMANCE STANDARD TAB ===================== -->
            <q-tab-panel name="ps">
              <div class="report-content">
                <div class="header">
                  <img src="/rotp.png" alt="City of Tagum Logo" class="logo" />
                  <img src="/tagumlogo.png" alt="City of Tagum Logo" class="logo" />
                  <div class="center-text">
                    <div class="title">{{ levels.office || 'N/A' }}</div>
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
                        <template v-if="groupedPerformanceStandards.length">
                          <template
                            v-for="(
                              categoryGroup, catIndex
                            ) in groupedPerformanceStandardsByCategory"
                            :key="`cat-${catIndex}`"
                          >
                            <tr class="category-row">
                              <td colspan="9" class="category-header">
                                {{ categoryGroup.category }}
                              </td>
                            </tr>
                            <template
                              v-for="(mfoGroup, mfoIndex) in categoryGroup.mfos"
                              :key="`mfo-${catIndex}-${mfoIndex}`"
                            >
                              <tr class="mfo-row">
                                <td colspan="9" class="mfo-header">
                                  MFO {{ mfoIndex + 1 }} - {{ mfoGroup.mfo }}
                                </td>
                              </tr>
                              <template
                                v-for="(standard, stdIndex) in mfoGroup.standards"
                                :key="`std-${catIndex}-${mfoIndex}-${stdIndex}`"
                              >
                                <template
                                  v-if="
                                    standard.standard_outcomes &&
                                    standard.standard_outcomes.length > 0
                                  "
                                >
                                  <tr
                                    v-for="(outcome, outcomeIndex) in standard.standard_outcomes"
                                    :key="`outcome-${stdIndex}-${outcomeIndex}`"
                                  >
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      Output {{ stdIndex + 1 }} - {{ standard.mfo }}
                                    </td>
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      <div class="competency-list">
                                        <template v-if="getAllCompetencies(standard).length > 0">
                                          <div
                                            v-for="(comp, idx) in getAllCompetencies(standard)"
                                            :key="`comp-${idx}`"
                                            class="competency-item"
                                          >
                                            {{ idx + 1 }}. {{ comp.description
                                            }}<span v-if="comp.level" class="text-weight-light">
                                              ({{ getProficiencyLevel(comp.level) }})</span
                                            >
                                          </div>
                                        </template>
                                        <template v-else
                                          ><span class="text-grey-7"
                                            >No competencies specified</span
                                          ></template
                                        >
                                      </div>
                                    </td>
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      {{ standard.success_indicator }}
                                    </td>
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
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                      style="text-align: center"
                                    >
                                      {{ standard.required_output || '-' }}
                                    </td>
                                    <td
                                      v-if="outcomeIndex === 0"
                                      :rowspan="standard.standard_outcomes.length"
                                    >
                                      {{ standard.remarks || '-' }}
                                    </td>
                                  </tr>
                                </template>
                                <template v-else>
                                  <tr>
                                    <td>Output {{ stdIndex + 1 }} - {{ standard.mfo }}</td>
                                    <td>
                                      <div class="competency-list">
                                        <template v-if="getAllCompetencies(standard).length > 0">
                                          <div
                                            v-for="(comp, idx) in getAllCompetencies(standard)"
                                            :key="`comp-${idx}`"
                                            class="competency-item"
                                          >
                                            {{ idx + 1 }}. {{ comp.description
                                            }}<span v-if="comp.level" class="text-weight-light">
                                              ({{ getProficiencyLevel(comp.level) }})</span
                                            >
                                          </div>
                                        </template>
                                        <template v-else
                                          ><span class="text-grey-7"
                                            >No competencies specified</span
                                          ></template
                                        >
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
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- ===================== MONTHLY PERFORMANCE OUTPUT TAB ===================== -->
            <q-tab-panel name="mpo">
              <div class="report-content">
                <!-- Has data: render each month -->
                <template v-if="groupedMonthlyData.length > 0">
                  <div
                    v-for="(monthData, monthIndex) in groupedMonthlyData"
                    :key="`month-${monthIndex}`"
                    :class="{ 'page-break': monthIndex > 0 }"
                  >
                    <!-- Month Header -->
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
                            <template v-if="monthData.categories?.length > 0">
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

                                  <!-- Output Rows -->
                                  <tr
                                    v-for="(output, outputIndex) in mfoGroup.outputs"
                                    :key="`output-${monthIndex}-${catIndex}-${mfoIndex}-${outputIndex}`"
                                  >
                                    <td>Output {{ outputIndex + 1 }} - {{ output.outputName }}</td>
                                    <!-- Quantity -->
                                    <td class="text-center">{{ output.quantity.week1 || '' }}</td>
                                    <td class="text-center">{{ output.quantity.week2 || '' }}</td>
                                    <td class="text-center">{{ output.quantity.week3 || '' }}</td>
                                    <td class="text-center">{{ output.quantity.week4 || '' }}</td>
                                    <td class="text-center">{{ output.quantity.week5 || '' }}</td>
                                    <td class="text-center total-cell">
                                      {{ calculateTotal(output.quantity) }}
                                    </td>
                                    <!-- Effectiveness -->
                                    <td class="text-center">
                                      {{ output.effectiveness.week1 || '' }}
                                    </td>
                                    <td class="text-center">
                                      {{ output.effectiveness.week2 || '' }}
                                    </td>
                                    <td class="text-center">
                                      {{ output.effectiveness.week3 || '' }}
                                    </td>
                                    <td class="text-center">
                                      {{ output.effectiveness.week4 || '' }}
                                    </td>
                                    <td class="text-center">
                                      {{ output.effectiveness.week5 || '' }}
                                    </td>
                                    <td class="text-center total-cell">
                                      {{ calculateTotal(output.effectiveness) }}
                                    </td>
                                    <!-- Timeliness -->
                                    <td class="text-center">{{ output.timeliness.week1 || '' }}</td>
                                    <td class="text-center">{{ output.timeliness.week2 || '' }}</td>
                                    <td class="text-center">{{ output.timeliness.week3 || '' }}</td>
                                    <td class="text-center">{{ output.timeliness.week4 || '' }}</td>
                                    <td class="text-center">{{ output.timeliness.week5 || '' }}</td>
                                    <td class="text-center total-cell">
                                      {{ calculateTotal(output.timeliness) }}
                                    </td>
                                  </tr>
                                </template>
                              </template>

                              <!-- Attendance section header -->
                              <tr>
                                <td colspan="13"></td>
                                <td>Wk 1</td>
                                <td>Wk 2</td>
                                <td>Wk 3</td>
                                <td>Wk 4</td>
                                <td>Wk 5</td>
                                <td>TOTAL</td>
                              </tr>

                              <!-- Absences row -->
                              <tr>
                                <td colspan="13">MAN DAY(S) LOST THRU ABSENCE</td>
                                <td
                                  v-for="week in [
                                    'week1',
                                    'week2',
                                    'week3',
                                    'week4',
                                    'week5',
                                    'total_absent',
                                  ]"
                                  :key="week"
                                  style="text-align: center"
                                >
                                  {{ getMonthAttendance(monthData.month, 'absents', week) }}
                                </td>
                              </tr>

                              <!-- Tardiness row -->
                              <tr>
                                <td colspan="13">MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME</td>
                                <td
                                  v-for="week in [
                                    'week1',
                                    'week2',
                                    'week3',
                                    'week4',
                                    'week5',
                                    'total_late',
                                  ]"
                                  :key="week"
                                  style="text-align: center"
                                >
                                  {{ getMonthAttendance(monthData.month, 'lates', week) }}
                                </td>
                              </tr>

                              <!-- Remarks -->
                              <tr>
                                <td colspan="19" style="height: 80px; position: relative">
                                  <div style="position: absolute; top: 4px; left: 4px">
                                    OBSERVATIONS/REMARKS
                                  </div>
                                </td>
                              </tr>
                            </template>

                            <!-- No data fallback -->
                            <tr v-else>
                              <td colspan="19" class="text-center text-grey-7">
                                No data available for {{ monthData.month }}
                              </td>
                            </tr>
                          </tbody>
                        </table>

                        <!-- Signature Table -->
                        <div style="display: flex; padding-bottom: 30px; justify-content: center">
                          <table
                            style="width: 100%; border-collapse: collapse; border: 1px solid #ddd"
                          >
                            <tbody>
                              <tr>
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
                                      >{{ employee?.label || employee?.name }}</strong
                                    >
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">
                                    {{ employee?.position }}
                                  </div>
                                </td>
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
                                      >{{ managerialSignatory?.name }}</strong
                                    >
                                  </div>
                                  <div style="margin-top: 5px; font-size: 11px">
                                    {{ managerialSignatory?.position }}
                                  </div>
                                </td>
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

                <!-- No data fallback -->
                <div v-else class="q-pa-xl text-center text-grey-7">
                  <q-icon name="info" size="3em" color="grey-5" />
                  <div class="q-mt-md">No monthly performance data available</div>
                </div>
              </div>
            </q-tab-panel>

            <!-- ===================== SUMMARY MONTHLY PERFORMANCE REPORT TAB ===================== -->
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
                          <template v-if="isFirstSemester">
                            <th>Jan</th>
                            <th>Feb</th>
                            <th>Mar</th>
                            <th>Apr</th>
                            <th>May</th>
                            <th>Jun</th>
                          </template>
                          <template v-else>
                            <th>Jul</th>
                            <th>Aug</th>
                            <th>Sep</th>
                            <th>Oct</th>
                            <th>Nov</th>
                            <th>Dec</th>
                          </template>
                          <th>TOTAL</th>
                          <th>RATING</th>
                          <template v-if="isFirstSemester">
                            <th>Jan</th>
                            <th>Feb</th>
                            <th>Mar</th>
                            <th>Apr</th>
                            <th>May</th>
                            <th>Jun</th>
                          </template>
                          <template v-else>
                            <th>Jul</th>
                            <th>Aug</th>
                            <th>Sep</th>
                            <th>Oct</th>
                            <th>Nov</th>
                            <th>Dec</th>
                          </template>
                          <th>TOTAL</th>
                          <th>RATING</th>
                          <template v-if="isFirstSemester">
                            <th>Jan</th>
                            <th>Feb</th>
                            <th>Mar</th>
                            <th>Apr</th>
                            <th>May</th>
                            <th>Jun</th>
                          </template>
                          <template v-else>
                            <th>Jul</th>
                            <th>Aug</th>
                            <th>Sep</th>
                            <th>Oct</th>
                            <th>Nov</th>
                            <th>Dec</th>
                          </template>
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
                            <tr>
                              <td colspan="25" class="category-header">
                                {{ categoryData.category }}
                              </td>
                            </tr>
                            <template
                              v-for="(mfoData, mfoIndex) in categoryData.mfos"
                              :key="`mfo-${catIndex}-${mfoIndex}`"
                            >
                              <tr>
                                <td colspan="25" class="mfo-header">
                                  MFO {{ mfoIndex + 1 }} - {{ mfoData.mfo }}
                                </td>
                              </tr>
                              <tr
                                v-for="(output, outputIndex) in mfoData.outputs"
                                :key="`output-${catIndex}-${mfoIndex}-${outputIndex}`"
                              >
                                <td>Output {{ outputIndex + 1 }}: {{ output.outputName }}</td>
                                <template v-if="isFirstSemester">
                                  <td class="text-center">
                                    {{ output.monthly.quantity.jan || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.feb || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.mar || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.apr || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.may || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.jun || '0' }}
                                  </td>
                                </template>
                                <template v-else>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.jul || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.aug || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.sep || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.oct || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.nov || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.quantity.dec || '0' }}
                                  </td>
                                </template>
                                <td class="text-center total-cell">
                                  {{ output.totals.quantity.total || '0' }}
                                </td>
                                <td class="text-center total-cell">
                                  {{ output.totals.quantity.rating || '0' }}
                                </td>
                                <template v-if="isFirstSemester">
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.jan || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.feb || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.mar || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.apr || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.may || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.jun || '0' }}
                                  </td>
                                </template>
                                <template v-else>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.jul || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.aug || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.sep || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.oct || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.nov || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.effectiveness.dec || '0' }}
                                  </td>
                                </template>
                                <td class="text-center total-cell">
                                  {{ output.totals.effectiveness.total || '0' }}
                                </td>
                                <td class="text-center total-cell">
                                  {{ output.totals.effectiveness.rating || '0' }}
                                </td>
                                <template v-if="isFirstSemester">
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.jan || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.feb || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.mar || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.apr || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.may || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.jun || '0' }}
                                  </td>
                                </template>
                                <template v-else>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.jul || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.aug || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.sep || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.oct || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.nov || '0' }}
                                  </td>
                                  <td class="text-center">
                                    {{ output.monthly.timeliness.dec || '0' }}
                                  </td>
                                </template>
                                <td class="text-center total-cell">
                                  {{ output.totals.timeliness.total || '0' }}
                                </td>
                                <td class="text-center total-cell">
                                  {{ output.totals.timeliness.rating || '0' }}
                                </td>
                              </tr>
                            </template>

                            <!-- Attendance Header -->
                            <tr>
                              <td colspan="18"></td>
                              <template v-if="isFirstSemester">
                                <td>Jan</td>
                                <td>Feb</td>
                                <td>Mar</td>
                                <td>Apr</td>
                                <td>May</td>
                                <td>Jun</td>
                              </template>
                              <template v-else>
                                <td>Jul</td>
                                <td>Aug</td>
                                <td>Sep</td>
                                <td>Oct</td>
                                <td>Nov</td>
                                <td>Dec</td>
                              </template>
                              <td>TOTAL</td>
                            </tr>

                            <!-- Absences -->
                            <tr>
                              <td colspan="18">MAN DAY(S) LOST THRU ABSENCE</td>
                              <template v-if="isFirstSemester">
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'jan') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'feb') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'mar') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'apr') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'may') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'jun') }}
                                </td>
                              </template>
                              <template v-else>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'jul') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'aug') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'sep') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'oct') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'nov') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('absents', 'dec') }}
                                </td>
                              </template>
                              <td class="text-center">{{ getTotalAbsences() }}</td>
                            </tr>

                            <!-- Lates -->
                            <tr>
                              <td colspan="18">MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME</td>
                              <template v-if="isFirstSemester">
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'jan') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'feb') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'mar') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'apr') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'may') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'jun') }}
                                </td>
                              </template>
                              <template v-else>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'jul') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'aug') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'sep') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'oct') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'nov') }}
                                </td>
                                <td class="text-center">
                                  {{ getSemesterAttendance('lates', 'dec') }}
                                </td>
                              </template>
                              <td class="text-center">{{ getTotalLates() }}</td>
                            </tr>

                            <!-- Remarks -->
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
                            No summary performance data available
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </div>
  </div>

  <!-- Status Update Modal -->
  <q-dialog v-model="showStatusModal" persistent>
    <q-card style="min-width: 380px; border-radius: 12px; overflow: hidden">
      <div
        style="
          background: linear-gradient(135deg, #e65100, #f57c00);
          padding: 20px 24px 16px;
          position: relative;
        "
      >
        <div class="row items-center no-wrap">
          <q-icon name="edit_notifications" color="white" size="28px" class="q-mr-sm" />
          <div>
            <div class="text-white text-weight-bold" style="font-size: 16px">Change Status</div>
            <div class="text-orange-2 text-caption">Target Period Update</div>
          </div>
        </div>
      </div>
      <q-card-section class="q-pt-lg q-pb-md q-px-lg">
        <div class="text-body1 text-grey-8 q-mb-md">
          Are you sure you want to change the status of this target period?
        </div>
        <div
          class="q-pa-sm rounded-borders q-mb-md"
          style="background: #f5f5f5; border-left: 4px solid #f57c00; border-radius: 6px"
        >
          <div class="row items-center q-gutter-xs">
            <q-icon name="calendar_today" size="16px" color="orange-9" />
            <span class="text-caption text-weight-medium text-grey-7"
              >{{ targetPeriod?.semester || 'N/A' }} {{ targetPeriod?.year || '' }}</span
            >
          </div>
          <div class="row items-center q-gutter-xs q-mt-xs">
            <q-icon name="badge" size="16px" color="orange-9" />
            <span class="text-caption text-grey-7"
              >Current:
              <q-badge
                :color="getStatusColor(employee?.ipcrStatus)"
                :label="employee?.ipcrStatus || 'N/A'"
                class="q-ml-xs"
            /></span>
          </div>
          <div class="row items-center q-gutter-xs q-mt-xs">
            <q-icon name="arrow_forward" size="16px" color="green-8" />
            <span class="text-caption text-grey-7"
              >New: <q-badge color="green-8" label="Approved" class="q-ml-xs"
            /></span>
          </div>
        </div>
        <q-banner
          v-if="monitorStore.error"
          dense
          rounded
          class="text-white q-mb-md"
          style="background: #c62828"
        >
          <template v-slot:avatar><q-icon name="error" /></template>
          {{ monitorStore.error }}
        </q-banner>
      </q-card-section>
      <q-card-actions align="right" class="q-px-lg q-pb-lg q-pt-none">
        <q-btn
          flat
          label="Cancel"
          color="grey-7"
          :disable="monitorStore.loading"
          @click="closeStatusModal"
          style="border-radius: 8px; padding: 8px 20px"
        />
        <q-btn
          label="Approve"
          icon="check_circle"
          color="green-8"
          unelevated
          :loading="monitorStore.loading"
          :disable="monitorStore.loading"
          @click="confirmApprove"
          style="border-radius: 8px; padding: 8px 20px"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useIPCRStatus } from 'src/composables/ipcr_status'
import { useIpcrStore } from 'src/stores/office/IpcrStore'
import { useMonitorStatusStore } from 'src/stores/monitorStatusStore'
import AbsentLateInputModal from './AbsentLateInputModal.vue'

// ── PDF Make ────────────────────────────────────────────────────────────────
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

// ── Store & Quasar ──────────────────────────────────────────────────────────
const $q = useQuasar()
const ipcrStore = useIpcrStore()
const monitorStore = useMonitorStatusStore()

// ── Props ───────────────────────────────────────────────────────────────────
const props = defineProps({
  employee: { type: Object, required: true },
  targetPeriod: { type: Object, required: true },
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
  supervisorySignatory: { type: Object, default: null },
  managerialSignatory: { type: Object, default: null },
})

// ── Emits ───────────────────────────────────────────────────────────────────
const emit = defineEmits(['close', 'approve', 'status-updated'])

// ── State ───────────────────────────────────────────────────────────────────
const activeTab = ref('ipcr')
const isPrinting = ref(false)
const showStatusModal = ref(false)
const attendanceModalRef = ref(null)
const existingAttendanceData = ref({})

// ── Composables ──────────────────────────────────────────────────────────────
const { getStatusColor, getStatusTextColor, getStatusIcon } = useIPCRStatus()

// ── Computed: Basic ──────────────────────────────────────────────────────────
const controlNo = computed(
  () =>
    props.employee?.employeeData?.ControlNo ||
    props.employee?.ControlNo ||
    props.employee?.control_no ||
    null,
)

const isTabLoading = computed(() => {
  const map = {
    ipcr: 'isLoadingIpcr',
    ps: 'isLoadingPerformanceStandard',
    mpo: 'isLoadingMonthlyPerformance',
    smpr: 'isLoadingSummaryMonthlyPerformance',
  }
  return ipcrStore[map[activeTab.value]] ?? false
})

const currentData = computed(() => {
  switch (activeTab.value) {
    case 'ipcr':
      return ipcrStore.employeeIpcr || props.employee || null
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

const hasData = computed(() => !!currentData.value)

const targetPeriodId = computed(
  () =>
    props.targetPeriod?.id ||
    ipcrStore.targetPeriodId ||
    ipcrStore.employeeIpcr?.target_periods?.[0]?.id ||
    props.employee?.target_periods?.[0]?.id ||
    null,
)

const isFirstSemester = computed(() => {
  const s = props.targetPeriod?.semester?.toLowerCase() || ''
  return s.includes('first') || s.includes('1st') || s.includes('jan')
})

// ── Computed: IPCR ───────────────────────────────────────────────────────────
const ipcrPerformanceData = computed(() => {
  if (activeTab.value !== 'ipcr') return []
  return (
    ipcrStore.employeeIpcr?.performance_standards ||
    ipcrStore.employeeIpcr?.target_periods?.[0]?.performance_standards ||
    currentData.value?.performance_standards ||
    currentData.value?.target_periods?.[0]?.performance_standards ||
    props.employee?.target_periods?.[0]?.performance_standards ||
    []
  )
})

const groupedIpcrData = computed(() => {
  if (!ipcrPerformanceData.value?.length) return []

  const categoriesMap = {}
  ipcrPerformanceData.value.forEach((item) => {
    const cat = formatCategoryName(item.category)
    if (!categoriesMap[cat]) categoriesMap[cat] = { category: cat, standards: [], mfos: {} }
    const mfo = item.mfo || 'Unnamed MFO'
    if (!categoriesMap[cat].mfos[mfo]) categoriesMap[cat].mfos[mfo] = { mfo, standards: [] }
    categoriesMap[cat].mfos[mfo].standards.push(item)
    categoriesMap[cat].standards.push(item)
  })

  return Object.values(categoriesMap).map((catData) => {
    let totalRating = 0
    let ratingCount = 0
    catData.standards.forEach((s) => {
      const r = parseFloat(s.ratings?.average_rating || s.ratings?.overall || 0)
      if (!isNaN(r) && r > 0) {
        totalRating += r
        ratingCount++
      }
    })
    return {
      category: catData.category,
      mfos: Object.values(catData.mfos),
      averageRating: ratingCount > 0 ? (totalRating / ratingCount).toFixed(2) : 'N/A',
      rawTotal: totalRating,
      count: ratingCount,
    }
  })
})

const finalAverageRating = computed(() => {
  const validGroups = groupedIpcrData.value.filter((g) => g.averageRating !== 'N/A')
  if (!validGroups.length) return 'N/A'
  const sum = validGroups.reduce((acc, g) => acc + parseFloat(g.averageRating), 0)
  return (sum / validGroups.length).toFixed(2)
})

const adjectivalRating = computed(() => {
  const r = parseFloat(finalAverageRating.value)
  if (isNaN(r)) return 'N/A'
  if (r >= 4.5) return 'OUTSTANDING'
  if (r >= 3.5) return 'VERY SATISFACTORY'
  if (r >= 2.5) return 'SATISFACTORY'
  if (r >= 1.5) return 'UNSATISFACTORY'
  return 'POOR'
})

const categoryCalculations = computed(() => {
  return groupedIpcrData.value
    .filter((g) => g.count > 0)
    .map((g) => ({
      category: g.category,
      weightedAverage: g.averageRating,
    }))
})

// ── Computed: Performance Standards ─────────────────────────────────────────
const groupedPerformanceStandards = computed(() => {
  const data = ipcrStore.performanceStandard
  if (Array.isArray(data)) return data
  return data?.performance_standards || []
})

const groupedPerformanceStandardsByCategory = computed(() => {
  if (!groupedPerformanceStandards.value.length) return []
  const map = {}
  groupedPerformanceStandards.value.forEach((s) => {
    const cat = formatCategoryName(s.category)
    if (!map[cat]) map[cat] = { category: cat, mfos: {} }
    const mfo = s.mfo || 'Unnamed MFO'
    if (!map[cat].mfos[mfo]) map[cat].mfos[mfo] = { mfo, standards: [] }
    map[cat].mfos[mfo].standards.push(s)
  })
  return Object.values(map).map((c) => ({ ...c, mfos: Object.values(c.mfos) }))
})

// ── Computed: Monthly Performance ────────────────────────────────────────────
/**
 * FIX: The original bare <template> had no v-if, so it never rendered.
 * groupedMonthlyData now reliably returns an array of month objects.
 */
const groupedMonthlyData = computed(() => {
  const monthlyData = ipcrStore.monthlyPerformance
  if (!monthlyData) return []

  const standards = monthlyData.standards || []
  if (!standards.length) return []

  const monthsMap = {}

  standards.forEach((item) => {
    if (!item.monthly_ratings?.monthly) return

    item.monthly_ratings.monthly.forEach((monthEntry) => {
      const monthName = monthEntry.month
      if (!monthName) return

      if (!monthsMap[monthName]) monthsMap[monthName] = { month: monthName, categories: {} }

      const cat = formatCategoryName(item.category)
      if (!monthsMap[monthName].categories[cat])
        monthsMap[monthName].categories[cat] = { category: cat, mfos: {} }

      const mfo = item.mfo || 'Unnamed MFO'
      if (!monthsMap[monthName].categories[cat].mfos[mfo])
        monthsMap[monthName].categories[cat].mfos[mfo] = { mfo, outputs: [] }

      const qty = monthEntry.quantity || {}
      const eff = monthEntry.effectiveness || {}
      const tim = monthEntry.timeliness || {}

      monthsMap[monthName].categories[cat].mfos[mfo].outputs.push({
        outputName: item.output || item.mfo,
        quantity: qty,
        effectiveness: eff,
        timeliness: tim,
        quantityTotal: computeWeekTotal(qty),
        effectivenessTotal: computeWeekTotal(eff),
        timelinessTotal: computeWeekTotal(tim),
      })
    })
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

  return Object.values(monthsMap)
    .map((m) => ({
      ...m,
      categories: Object.values(m.categories).map((c) => ({
        ...c,
        mfos: Object.values(c.mfos),
      })),
    }))
    .sort((a, b) => {
      const aMonth = a.month.split(' ')[0]
      const bMonth = b.month.split(' ')[0]
      const aYear = parseInt(a.month.split(' ')[1]) || 0
      const bYear = parseInt(b.month.split(' ')[1]) || 0
      if (aYear !== bYear) return aYear - bYear
      return monthOrder.indexOf(aMonth) - monthOrder.indexOf(bMonth)
    })
})

// ── Computed: Attendance ─────────────────────────────────────────────────────
const attendanceByMonth = computed(() => {
  const map = {}
  const attendance = ipcrStore.monthlyPerformance?.attendance || []
  attendance.forEach((att) => {
    if (att.month) {
      map[att.month] = {
        absents: att.absents?.[0] || {},
        lates: att.lates?.[0] || {},
      }
    }
  })
  return map
})

// ── Computed: Summary Monthly ────────────────────────────────────────────────
const processedSummaryData = computed(() => {
  const data = ipcrStore.summaryMonthlyPerformance
  if (!data) return []
  const standards = Array.isArray(data) ? data : data.standards || []
  return processStandardsData(standards)
})

// ── Helper Functions ─────────────────────────────────────────────────────────
const computeWeekTotal = (data) => {
  if (!data) return '0'
  const total = ['week1', 'week2', 'week3', 'week4', 'week5'].reduce(
    (s, w) => s + (parseFloat(data[w]) || 0),
    0,
  )
  return total % 1 === 0 ? total.toString() : total.toFixed(2)
}

const calculateTotal = (ratingData) => computeWeekTotal(ratingData)

/**
 * FIX: Centralized attendance getter for MPO tab — replaces the broken
 * v-for="week in [..., 'total_absent']" pattern that caused undefined renders.
 */
const getMonthAttendance = (monthName, type, key) => {
  const monthAtt = attendanceByMonth.value[monthName]
  if (!monthAtt) return ''
  return monthAtt[type]?.[key] || ''
}

const getSemesterAttendance = (type, monthKey) => {
  const monthName = getMonthNameFromKey(monthKey)
  const attendance = ipcrStore.summaryMonthlyPerformance?.attendance || []
  const monthData = attendance.find((i) => i.month?.toLowerCase().includes(monthName))
  if (type === 'absents') return monthData?.absents?.[0]?.total_absent || '0'
  if (type === 'lates') return monthData?.lates?.[0]?.total_late || '0'
  return '0'
}

const getMonthNameFromKey = (key) => {
  const map = {
    jan: 'january',
    feb: 'february',
    mar: 'march',
    apr: 'april',
    may: 'may',
    jun: 'june',
    jul: 'july',
    aug: 'august',
    sep: 'september',
    oct: 'october',
    nov: 'november',
    dec: 'december',
  }
  return map[key] || key
}

const getTotalAbsences = () => {
  return (ipcrStore.summaryMonthlyPerformance?.attendance || [])
    .reduce((sum, i) => sum + (parseInt(i.absents?.[0]?.total_absent) || 0), 0)
    .toString()
}

const getTotalLates = () => {
  return (ipcrStore.summaryMonthlyPerformance?.attendance || [])
    .reduce((sum, i) => sum + (parseInt(i.lates?.[0]?.total_late) || 0), 0)
    .toString()
}

const getAllCompetencies = (standard) => {
  return [
    ...(standard.core || []).map((c) => ({ ...c, type: 'Core' })),
    ...(standard.technical || []).map((c) => ({ ...c, type: 'Technical' })),
    ...(standard.leadership || []).map((c) => ({ ...c, type: 'Leadership' })),
  ]
}

const formatCategoryName = (category) => {
  if (!category) return 'UNCATEGORIZED'
  const clean = category.replace(/^[A-C]\.\s*/, '').trim()
  if (clean.match(/strategic/i)) return 'STRATEGIC FUNCTION'
  if (clean.match(/core/i)) return 'CORE FUNCTION'
  if (clean.match(/support/i)) return 'SUPPORT FUNCTION'
  return clean.toUpperCase()
}

const getProficiencyLevel = (level) => {
  const map = { 4: 'Superior', 3: 'Intermediate', 2: 'Advanced', 1: 'Basic' }
  return map[parseInt(level)] || level || 'Not Specified'
}

const formatDate = (date) => {
  if (!date) return '__/__/____'
  const d = new Date(date)
  return `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${d.getFullYear()}`
}

const processStandardsData = (standards) => {
  const isFirstSem = isFirstSemester.value
  const categoriesMap = {}

  standards.forEach((item) => {
    const category = formatCategoryName(item.category)
    const mfo = item.mfo || 'Unnamed MFO'
    const outputName = item.output || item.mfo

    if (!categoriesMap[category]) categoriesMap[category] = { category, mfos: {} }
    if (!categoriesMap[category].mfos[mfo]) categoriesMap[category].mfos[mfo] = { mfo, outputs: [] }

    const monthlyRatings = item.monthly_ratings?.monthly || []
    const emptyMonths = isFirstSem
      ? { jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0 }
      : { jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0 }

    const monthly = {
      quantity: { ...emptyMonths },
      effectiveness: { ...emptyMonths },
      timeliness: { ...emptyMonths },
    }

    const monthKeyMap = {
      january: 'jan',
      february: 'feb',
      march: 'mar',
      april: 'apr',
      may: 'may',
      june: 'jun',
      july: 'jul',
      august: 'aug',
      september: 'sep',
      october: 'oct',
      november: 'nov',
      december: 'dec',
    }

    monthlyRatings.forEach((entry) => {
      const name = entry.month?.toLowerCase() || ''
      const shortKey = Object.keys(monthKeyMap).find((k) => name.includes(k))
      const key = shortKey ? monthKeyMap[shortKey] : null
      if (key && key in monthly.quantity) {
        monthly.quantity[key] = entry.quantity?.month_total || 0
        monthly.effectiveness[key] = entry.effectiveness?.month_total || 0
        monthly.timeliness[key] = entry.timeliness?.month_total || 0
      }
    })

    categoriesMap[category].mfos[mfo].outputs.push({
      outputName,
      monthly,
      totals: {
        quantity: {
          total: item.totals?.quantity_total || 0,
          rating: item.ratings?.quantity_rating || 0,
        },
        effectiveness: {
          total: item.totals?.effectiveness_total || 0,
          rating: item.ratings?.effectiveness_rating || 0,
        },
        timeliness: {
          total: item.totals?.timeliness_total || 0,
          rating: item.ratings?.timeliness_rating || 0,
        },
      },
    })
  })

  return Object.values(categoriesMap).map((c) => ({ ...c, mfos: Object.values(c.mfos) }))
}

// ── Modal Methods ────────────────────────────────────────────────────────────
const openStatusModal = () => {
  showStatusModal.value = true
}
const closeStatusModal = () => {
  showStatusModal.value = false
  monitorStore.error = ''
}

const confirmApprove = async () => {
  const tpId = targetPeriodId.value
  if (!tpId) {
    $q.notify({ type: 'negative', message: 'Target period ID not found.', position: 'top' })
    return
  }
  try {
    await monitorStore.ipcrApproveStatus({ targetperiodId: tpId, status: 'Approved' })
    emit('status-updated', { ...props.employee, ipcrStatus: 'Approved' })
    $q.notify({
      type: 'positive',
      message: 'Status updated to Approved successfully!',
      position: 'top',
      timeout: 2000,
    })
    closeStatusModal()
    emit('close')
    emit('approve')
  } catch (error) {
    console.error('Error updating status:', error)
    $q.notify({
      type: 'negative',
      message: monitorStore.error || 'Failed to update status',
      position: 'top',
    })
  }
}

// ── Attendance Save ──────────────────────────────────────────────────────────
const handleAttendanceSave = async (data) => {
  try {
    existingAttendanceData.value = data.attendanceData
    $q.notify({
      type: 'positive',
      message: 'Attendance data saved successfully!',
      position: 'top',
      timeout: 2000,
    })
    await new Promise((r) => setTimeout(r, 500))
    if (targetPeriodId.value) {
      ipcrStore.clearData('monthlyPerformance')
      ipcrStore.clearData('summaryMonthlyPerformance')
      await Promise.all([
        ipcrStore.fetchMonthlyPerformance(targetPeriodId.value),
        ipcrStore.fetchSummaryMonthlyPerformance(targetPeriodId.value),
      ])
    }
  } catch {
    $q.notify({ type: 'negative', message: 'Failed to save attendance data.', position: 'top' })
  }
}

const handleAttendanceClose = () => {}

// ── Tab Change ───────────────────────────────────────────────────────────────
const handleTabChange = async (tabName, forceReload = false) => {
  try {
    if (tabName === 'ipcr') {
      if (!ipcrStore.employeeIpcr && !props.employee?.target_periods?.length) await loadIpcrData()
      return
    }

    const tpId = targetPeriodId.value || props.employee?.target_periods?.[0]?.id

    if (!tpId) {
      $q.notify({
        type: 'warning',
        message: 'Target period ID not found. Please load IPCR data first.',
        position: 'top',
      })
      activeTab.value = 'ipcr'
      return
    }

    const fetchers = {
      ps: { store: 'performanceStandard', fn: 'fetchPerformanceStandard' },
      mpo: { store: 'monthlyPerformance', fn: 'fetchMonthlyPerformance' },
      smpr: { store: 'summaryMonthlyPerformance', fn: 'fetchSummaryMonthlyPerformance' },
    }
    const f = fetchers[tabName]
    if (f && (!ipcrStore[f.store] || forceReload)) {
      await ipcrStore[f.fn](tpId)
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
  if (!controlNo.value || !props.targetPeriod?.year || !props.targetPeriod?.semester) {
    $q.notify({
      type: 'negative',
      message: 'Missing employee or target period information.',
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
      $q.notify({ type: 'info', message: 'No IPCR data found for this period.', position: 'top' })
    }
  } catch (error) {
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

// ── Image Helpers ─────────────────────────────────────────────────────────────
const convertImageToBase64 = (url) =>
  new Promise((resolve, reject) => {
    const img = new window.Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      canvas.getContext('2d').drawImage(img, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = url
  })

const createSvgPlaceholder = (text, width = 80, height = 80) => {
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f0f0f0" stroke="#666" stroke-width="1" stroke-dasharray="2"/>
    <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#666" font-size="10" font-family="Arial">${text}</text>
  </svg>`
  return `data:image/svg+xml;base64,${btoa(svg)}`
}

// ── PDF Print ────────────────────────────────────────────────────────────────
const printPdf = async () => {
  if (!hasData.value) {
    $q.notify({ type: 'warning', message: 'No data available to print', position: 'top' })
    return
  }
  isPrinting.value = true
  try {
    const pdfMakeInstance = await initPdfMake()
    let tagumLogoBase64, rotpLogoBase64, stamp1, stamp2, pmt1, pmt2, pmt3
    try {
      ;[tagumLogoBase64, rotpLogoBase64, stamp1, stamp2, pmt1, pmt2, pmt3] = await Promise.all([
        convertImageToBase64('/tagumlogo.png'),
        convertImageToBase64('/rotp.png'),
        convertImageToBase64('/ipcrstamp.png'),
        convertImageToBase64('/accstamp.png'),
        convertImageToBase64('/pmtstamp.png'),
        convertImageToBase64('/pmt2stamp.png'),
        convertImageToBase64('/pmt3.png'),
      ])
    } catch {
      tagumLogoBase64 = createSvgPlaceholder('TAGUM')
      rotpLogoBase64 = createSvgPlaceholder('ROTP')
      stamp1 = stamp2 = pmt1 = pmt2 = pmt3 = createSvgPlaceholder('STAMP')
    }

    const generators = {
      ipcr: generateIpcrPdfContent,
      ps: generatePerformanceStandardPdfContent,
      mpo: generateMonthlyPerformancePdfContent,
      smpr: generateSummaryMonthlyPdfContent,
    }
    const docDef = (generators[activeTab.value] || generators.ipcr)(
      tagumLogoBase64,
      rotpLogoBase64,
      stamp1,
      stamp2,
      pmt1,
      pmt2,
      pmt3,
    )
    pdfMakeInstance.createPdf(docDef).open()
    $q.notify({ type: 'positive', message: 'PDF generated successfully', position: 'top' })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: `Failed to generate PDF: ${error.message}`,
      position: 'top',
    })
  } finally {
    isPrinting.value = false
  }
}

// ── PDF Content Generators ───────────────────────────────────────────────────
const generateIpcrPdfContent = (tagumLogoBase64, rotpLogoBase64, stamp1, stamp2, pmt1, pmt2) => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office =
    currentData.value?.office || props.employee?.office || props.levels?.office || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'} ${props.targetPeriod?.year || ''}`
  const content = []

  content.push({
    columns: [
      { width: '*', text: '' },
      {
        width: 'auto',
        columns: [
          {
            width: 'auto',
            stack: tagumLogoBase64
              ? [{ image: tagumLogoBase64, width: 55, alignment: 'center', margin: [0, 20, 0, 10] }]
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
              { text: office, style: 'reportTitle', alignment: 'center', margin: [0, 0, 0, 10] },
            ],
            margin: [20, 0, 20, 0],
          },
          {
            width: 'auto',
            stack: rotpLogoBase64
              ? [{ image: rotpLogoBase64, width: 55, alignment: 'center', margin: [0, 20, 0, 10] }]
              : [{ text: 'ROTP LOGO', alignment: 'center', italics: true, margin: [0, 20, 0, 10] }],
          },
        ],
        alignment: 'center',
      },
      { width: '*', text: '' },
    ],
  })

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
                text: `, commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measure for the period `,
              },
              { text: period, bold: true },
              { text: '.' },
            ],
            fontSize: 9,
            lineHeight: 1.5,
          },
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
                  { text: position, fontSize: 8, alignment: 'center', margin: [0, 0, 0, 2] },
                  { text: `Date: ${formatDate(new Date())}`, fontSize: 9, alignment: 'center' },
                ],
              },
            ],
          },
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
                      { text: `Date: ${formatDate(new Date())}`, fontSize: 9, alignment: 'center' },
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
                      { text: `Date: ${formatDate(new Date())}`, fontSize: 9, alignment: 'center' },
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
          stamp1
            ? { image: stamp1, width: 180, alignment: 'center', margin: [0, 0, 0, 10] }
            : { text: 'STAMP', alignment: 'center', italics: true },
          stamp2
            ? { image: stamp2, width: 180, alignment: 'center' }
            : { text: 'STAMP', alignment: 'center', italics: true },
        ],
        margin: [10, 0, 0, 0],
      },
    ],
    margin: [0, 10, 0, 10],
  })

  content.push({
    columns: [
      {
        width: '35%',
        stack: [
          pmt1
            ? { image: pmt1, width: 280, alignment: 'center' }
            : { text: 'PMT STAMP', alignment: 'center', italics: true },
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

  const mainTableBody = [
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

  if (groupedIpcrData.value.length > 0) {
    groupedIpcrData.value.forEach((catGroup) => {
      mainTableBody.push([
        {
          text: catGroup.category,
          colSpan: 10,
          alignment: 'left',
          fontSize: 9,
          bold: true,
          fillColor: '#e8f5e9',
          border: [true, true, true, true],
        },
        ...Array(9).fill({}),
      ])
      catGroup.mfos.forEach((mfoGroup, mfoIndex) => {
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
          ...Array(9).fill({}),
        ])
        mfoGroup.standards.forEach((s, si) => {
          const allComp = getAllCompetencies(s)
          const competenciesText =
            allComp.length > 0
              ? allComp
                  .map((c, i) => `${i + 1}. ${c.description} (${getProficiencyLevel(c.level)})`)
                  .join('\n')
              : 'No competencies specified'
          const proficiencyText =
            allComp.length > 0
              ? allComp.map((c, i) => `${i + 1}. ${getProficiencyLevel(c.level)}`).join('\n')
              : 'Not Applicable'
          const ratings = s.ratings || {}
          mainTableBody.push([
            {
              text: `Output ${si + 1} - ${s.output || s.mfo}`,
              fontSize: 8,
              border: [true, true, true, true],
            },
            { text: competenciesText, fontSize: 8, border: [true, true, true, true] },
            { text: s.success_indicator || '-', fontSize: 8, border: [true, true, true, true] },
            {
              text: s.monthly_ratings?.actual_accomplishment || s.actual_accomplishment || '',
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: ratings.quantity_rating || '-',
              alignment: 'center',
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: ratings.effectiveness_rating || '-',
              alignment: 'center',
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: ratings.timeliness_rating || '-',
              alignment: 'center',
              fontSize: 8,
              border: [true, true, true, true],
            },
            {
              text: ratings.average_rating || '-',
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
              text: s.monthly_ratings?.remarks || '-',
              fontSize: 8,
              border: [true, true, true, true],
            },
          ])
        })
      })
      mainTableBody.push([
        {
          text: `${catGroup.category} Average Rating`,
          colSpan: 7,
          alignment: 'left',
          bold: true,
          fontSize: 8,
          border: [true, true, true, true],
        },
        ...Array(6).fill({}),
        {
          text: catGroup.averageRating,
          alignment: 'center',
          bold: true,
          fontSize: 8,
          border: [true, true, true, true],
        },
        { text: '', colSpan: 2, border: [true, true, true, true] },
        {},
      ])
    })
    mainTableBody.push([
      {
        text: 'Final Average Rating',
        colSpan: 7,
        alignment: 'left',
        bold: true,
        fontSize: 8,
        border: [true, true, true, true],
      },
      ...Array(6).fill({}),
      {
        text: finalAverageRating.value,
        alignment: 'center',
        bold: true,
        fontSize: 8,
        border: [true, true, true, true],
      },
      { text: '', colSpan: 2, border: [true, true, true, true] },
      {},
    ])
    mainTableBody.push([
      { text: '', fontSize: 8, border: [true, true, true, true] },
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
          pmt2
            ? { image: pmt2, width: 250, alignment: 'center' }
            : { text: 'PMT STAMP', alignment: 'center', italics: true },
        ],
      },
      {},
      {},
    ])
    categoryCalculations.value.forEach((calc, i) => {
      const row = [
        { text: calc.category, fontSize: 8, alignment: 'left', border: [true, true, true, true] },
        { text: calc.weightedAverage, colSpan: 2, fontSize: 8, border: [true, true, true, true] },
        {},
      ]
      if (i === 0) {
        row.push(
          {
            text: '',
            colSpan: 4,
            rowSpan: categoryCalculations.value.length + 2,
            border: [true, true, true, true],
          },
          {},
          {},
          {},
        )
      } else {
        row.push({}, {}, {}, {})
      }
      row.push({}, {}, {})
      mainTableBody.push(row)
    })
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
    mainTableBody.push([
      {
        text: 'Comments and Recommendations for Development Purposes',
        colSpan: 10,
        alignment: 'left',
        bold: true,
        fontSize: 9,
        border: [true, true, true, true],
      },
      ...Array(9).fill({}),
    ])
    mainTableBody.push([
      { text: '\n\n\n\n\n', colSpan: 10, border: [true, true, true, true] },
      ...Array(9).fill({}),
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
      ...Array(9).fill({}),
    ])
  }

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

  const sigBody = [
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
          { text: position, fontSize: 8, alignment: 'center' },
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
          { text: 'Date', fontSize: 8, alignment: 'center' },
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
          { text: 'Date', fontSize: 8, alignment: 'center' },
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
          { text: 'Date', fontSize: 8, alignment: 'center' },
        ],
        border: [true, true, true, true],
        alignment: 'center',
      },
    ],
  ]
  content.push({
    table: {
      headerRows: 0,
      widths: ['20%', '13.33%', '20%', '13.33%', '20%', '13.33%'],
      body: sigBody,
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

  const profBody = [
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
    table: { widths: ['10%', '35%'], body: profBody },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [20, 20, 20, 20],
  })

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [32, 20, 32, 20],
    content,
    styles: { reportTitle: { fontSize: 12, bold: true } },
    defaultStyle: { fontSize: 8 },
  }
}

const generatePerformanceStandardPdfContent = (tagumLogoBase64, rotpLogoBase64, pmt3) => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.levels?.office || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'} ${props.targetPeriod?.year || ''}`
  const content = []

  content.push({
    columns: [
      {
        width: '10%',
        stack: rotpLogoBase64
          ? [{ image: rotpLogoBase64, width: 50, alignment: 'center', margin: [0, 0, 0, 10] }]
          : [{ text: 'ROTP LOGO', alignment: 'center', italics: true }],
      },
      {
        width: '10%',
        stack: tagumLogoBase64
          ? [{ image: tagumLogoBase64, width: 55, alignment: 'center', margin: [0, 0, 0, 10] }]
          : [{ text: 'TAGUM LOGO', alignment: 'center', italics: true }],
      },
      {
        width: '60%',
        stack: [
          { text: office, style: 'reportTitle', alignment: 'center', margin: [0, 20, 0, 5] },
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
          ? [{ image: pmt3, width: 180, alignment: 'center', margin: [0, 0, 0, 10] }]
          : [{ text: 'STAMP LOGO', alignment: 'center', italics: true }],
      },
    ],
  })

  content.push({
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
  })

  const tableBody = [
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
      { text: 'Q\n(Quantity)', fontSize: 8, bold: true, fillColor: '#f2f2f2', alignment: 'center' },
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

  groupedPerformanceStandardsByCategory.value.forEach((catGroup) => {
    tableBody.push([
      {
        text: catGroup.category,
        colSpan: 9,
        alignment: 'left',
        fontSize: 10,
        bold: true,
        fillColor: '#dbdbdb',
        border: [true, true, true, true],
      },
      ...Array(8).fill({}),
    ])
    catGroup.mfos.forEach((mfoGroup, mi) => {
      tableBody.push([
        {
          text: `MFO ${mi + 1} - ${mfoGroup.mfo}`,
          colSpan: 9,
          alignment: 'left',
          fontSize: 10,
          bold: true,
          fillColor: '#dbdbdb',
          border: [true, true, true, true],
        },
        ...Array(8).fill({}),
      ])
      mfoGroup.standards.forEach((s, si) => {
        const allComp = getAllCompetencies(s)
        const compText =
          allComp.length > 0
            ? allComp
                .map(
                  (c, i) =>
                    `${i + 1}. ${c.description}${c.level ? ` (${getProficiencyLevel(c.level)})` : ''}`,
                )
                .join('\n')
            : 'No competencies specified'
        if (s.standard_outcomes?.length > 0) {
          s.standard_outcomes.forEach((outcome, oi) => {
            const row = []
            if (oi === 0) {
              row.push(
                {
                  text: `Output ${si + 1} - ${s.mfo}`,
                  fontSize: 9,
                  rowSpan: s.standard_outcomes.length,
                  border: [true, true, true, true],
                },
                {
                  text: compText,
                  fontSize: 8,
                  rowSpan: s.standard_outcomes.length,
                  border: [true, true, true, true],
                },
                {
                  text: s.success_indicator,
                  fontSize: 9,
                  rowSpan: s.standard_outcomes.length,
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
            if (oi === 0) {
              row.push(
                {
                  text: s.required_output || '-',
                  fontSize: 9,
                  rowSpan: s.standard_outcomes.length,
                  alignment: 'center',
                  border: [true, true, true, true],
                },
                {
                  text: s.remarks || '-',
                  fontSize: 9,
                  rowSpan: s.standard_outcomes.length,
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
            { text: `Output ${si + 1} - ${s.mfo}`, fontSize: 9, border: [true, true, true, true] },
            { text: compText, fontSize: 8, border: [true, true, true, true] },
            { text: s.success_indicator, fontSize: 9, border: [true, true, true, true] },
            { text: '-', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
            { text: '-', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
            { text: '-', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
            { text: '-', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
            {
              text: s.required_output || '-',
              fontSize: 9,
              alignment: 'center',
              border: [true, true, true, true],
            },
            { text: s.remarks || '-', fontSize: 9, border: [true, true, true, true] },
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
    },
    margin: [0, 0, 0, 20],
  })

  const profBody = [
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
    table: { widths: ['25%', '75%'], body: profBody },
    layout: {
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => '#000000',
      vLineColor: () => '#000000',
    },
    margin: [150, 20, 150, 20],
  })

  content.push({
    table: {
      widths: ['33%', '34%', '33%'],
      body: [
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
  })

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [20, 30, 20, 30],
    content,
    styles: { reportTitle: { fontSize: 11, bold: true } },
    defaultStyle: { fontSize: 10 },
  }
}

const generateMonthlyPerformancePdfContent = () => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.levels?.office || 'N/A'
  const division = props.levels?.division || 'N/A'
  const content = []

  if (!groupedMonthlyData.value.length) {
    content.push({
      text: 'No monthly performance data available',
      alignment: 'center',
      italics: true,
      margin: [0, 100, 0, 0],
    })
  } else {
    groupedMonthlyData.value.forEach((monthData, monthIndex) => {
      if (monthIndex > 0) content.push({ text: '', pageBreak: 'before' })

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
                layout: { hLineWidth: () => 1, vLineWidth: () => 1 },
              },
              { width: '*', text: '' },
            ],
          },
        ],
        margin: [0, 0, 0, 10],
      })

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

      const colWidths = [
        '15%',
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
      const tableBody = [
        [
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
          ...Array(17).fill({}),
        ],
        [
          {},
          {
            text: 'QUANTITY',
            colSpan: 6,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          ...Array(5).fill({}),
          {
            text: 'EFFECTIVENESS',
            colSpan: 6,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          ...Array(5).fill({}),
          {
            text: 'TIMELINESS',
            colSpan: 6,
            alignment: 'center',
            fontSize: 9,
            bold: true,
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          },
          ...Array(5).fill({}),
        ],
        [
          {},
          ...[
            'Wk 1',
            'Wk 2',
            'Wk 3',
            'Wk 4',
            'Wk 5',
            'TOTAL',
            'Wk 1',
            'Wk 2',
            'Wk 3',
            'Wk 4',
            'Wk 5',
            'TOTAL',
            'Wk 1',
            'Wk 2',
            'Wk 3',
            'Wk 4',
            'Wk 5',
            'TOTAL',
          ].map((t) => ({
            text: t,
            fontSize: 8,
            bold: true,
            alignment: 'center',
            fillColor: '#f2f2f2',
            border: [true, true, true, true],
          })),
        ],
      ]

      if (monthData.categories?.length) {
        monthData.categories.forEach((cat) => {
          tableBody.push([
            {
              text: cat.category,
              colSpan: 19,
              alignment: 'left',
              fontSize: 9,
              bold: true,
              fillColor: '#92d050',
              border: [true, true, true, true],
            },
            ...Array(18).fill({}),
          ])
          cat.mfos.forEach((mfoGroup, mi) => {
            tableBody.push([
              {
                text: `MFO ${mi + 1} - ${mfoGroup.mfo}`,
                colSpan: 19,
                alignment: 'left',
                fontSize: 9,
                bold: true,
                fillColor: '#aeaaaa',
                border: [true, true, true, true],
              },
              ...Array(18).fill({}),
            ])
            mfoGroup.outputs.forEach((output, oi) => {
              const row = [
                {
                  text: `Output ${oi + 1} - ${output.outputName}`,
                  fontSize: 8,
                  border: [true, true, true, true],
                },
              ]
              ;['week1', 'week2', 'week3', 'week4', 'week5'].forEach((w) =>
                row.push({
                  text: String(output.quantity[w] ?? ''),
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                }),
              )
              row.push({
                text: output.quantityTotal || '0',
                fontSize: 8,
                alignment: 'center',
                bold: true,
                fillColor: '#d9d9d9',
                border: [true, true, true, true],
              })
              ;['week1', 'week2', 'week3', 'week4', 'week5'].forEach((w) =>
                row.push({
                  text: String(output.effectiveness[w] ?? ''),
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                }),
              )
              row.push({
                text: output.effectivenessTotal || '0',
                fontSize: 8,
                alignment: 'center',
                bold: true,
                fillColor: '#d9d9d9',
                border: [true, true, true, true],
              })
              ;['week1', 'week2', 'week3', 'week4', 'week5'].forEach((w) =>
                row.push({
                  text: String(output.timeliness[w] ?? ''),
                  fontSize: 8,
                  alignment: 'center',
                  border: [true, true, true, true],
                }),
              )
              row.push({
                text: output.timelinessTotal || '0',
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

        const monthAtt = attendanceByMonth.value[monthData.month] || { absents: {}, lates: {} }
        tableBody.push([
          { text: '', colSpan: 13, border: [true, true, true, true] },
          ...Array(12).fill({}),
          ...['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4', 'Wk 5', 'TOTAL'].map((t) => ({
            text: t,
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          })),
        ])
        tableBody.push([
          {
            text: 'MAN DAY(S) LOST THRU ABSENCE',
            colSpan: 13,
            fontSize: 8,
            bold: true,
            border: [true, true, true, true],
          },
          ...Array(12).fill({}),
          {
            text: String(monthAtt.absents.week1 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.absents.week2 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.absents.week3 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.absents.week4 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.absents.week5 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.absents.total_absent || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
        ])
        tableBody.push([
          {
            text: 'MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME',
            colSpan: 13,
            fontSize: 8,
            bold: true,
            border: [true, true, true, true],
          },
          ...Array(12).fill({}),
          {
            text: String(monthAtt.lates.week1 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.lates.week2 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.lates.week3 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.lates.week4 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.lates.week5 || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
          {
            text: String(monthAtt.lates.total_late || ''),
            fontSize: 8,
            alignment: 'center',
            border: [true, true, true, true],
          },
        ])
        tableBody.push([
          {
            text: 'OBSERVATIONS/REMARKS',
            colSpan: 19,
            fontSize: 8,
            bold: true,
            border: [true, true, true, true],
            margin: [0, 0, 0, 30],
          },
          ...Array(18).fill({}),
        ])
      } else {
        tableBody.push([
          {
            text: `No data available for ${monthData.month}`,
            colSpan: 19,
            alignment: 'center',
            italics: true,
            border: [true, true, true, true],
          },
          ...Array(18).fill({}),
        ])
      }

      content.push({
        table: { headerRows: 3, widths: colWidths, body: tableBody },
        layout: {
          hLineWidth: (i) => (i === 0 || i === 3 ? 1 : 0.5),
          vLineWidth: () => 0.5,
          hLineColor: () => '#000000',
          vLineColor: () => '#000000',
        },
        margin: [0, 10, 0, 0],
      })

      content.push({
        table: {
          widths: ['35%', '15%', '35%', '15%'],
          body: [
            [
              {
                text: 'Above entries are true & correct:',
                fontSize: 8,
                border: [true, true, true, true],
              },
              { text: 'Date:', fontSize: 8, border: [true, true, true, true] },
              { text: 'Confirmed:', fontSize: 8, border: [true, true, true, true] },
              { text: 'Date:', fontSize: 8, border: [true, true, true, true] },
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
              { text: '', border: [true, true, true, true] },
              {
                text: props.managerialSignatory?.position || 'Department Head',
                fontSize: 8,
                alignment: 'center',
                border: [true, true, true, true],
              },
              { text: '', border: [true, true, true, true] },
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
      })
    })
  }

  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [36, 36, 36, 36],
    content,
    defaultStyle: { fontSize: 10 },
  }
}

const generateSummaryMonthlyPdfContent = () => {
  const employeeName = props.employee?.label || props.employee?.name || 'N/A'
  const position = props.employee?.position || 'N/A'
  const office = props.levels?.office || 'N/A'
  const division = props.levels?.division || 'N/A'
  const period = `${props.targetPeriod?.semester || 'N/A'} ${props.targetPeriod?.year || ''}`
  const isFirstSem = isFirstSemester.value
  const monthColumns = isFirstSem
    ? [
        { key: 'jan', label: 'Jan' },
        { key: 'feb', label: 'Feb' },
        { key: 'mar', label: 'Mar' },
        { key: 'apr', label: 'Apr' },
        { key: 'may', label: 'May' },
        { key: 'jun', label: 'Jun' },
      ]
    : [
        { key: 'jul', label: 'Jul' },
        { key: 'aug', label: 'Aug' },
        { key: 'sep', label: 'Sep' },
        { key: 'oct', label: 'Oct' },
        { key: 'nov', label: 'Nov' },
        { key: 'dec', label: 'Dec' },
      ]

  const content = []

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
      { text: 'CITY OF TAGUM', alignment: 'center', fontSize: 9, bold: true, margin: [0, 0, 0, 5] },
      {
        text: 'SUMMARY MONTHLY PERFORMANCE OUTPUT REPORT',
        alignment: 'center',
        fontSize: 9,
        bold: true,
        margin: [0, 0, 0, 5],
      },
      { text: period, alignment: 'center', fontSize: 9, bold: true, margin: [0, 0, 0, 15] },
    ],
    margin: [0, 0, 0, 10],
  })

  content.push({
    table: {
      widths: ['25%', '25%', '25%', '25%'],
      body: [
        [
          { text: `EMPLOYEE: ${employeeName}`, fontSize: 9 },
          { text: `POSITION: ${position}`, fontSize: 9 },
          { text: `OFFICE: ${office}`, fontSize: 9 },
          { text: `DIVISION: ${division}`, fontSize: 9 },
        ],
      ],
    },
    layout: { hLineWidth: () => 0, vLineWidth: () => 0 },
    margin: [0, 0, 0, 10],
  })

  const colWidths = ['15%', ...Array(24).fill('*')]
  const tableBody = [
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
      ...Array(23).fill({}),
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
      ...monthColumns.map((m) => ({
        text: m.label,
        fontSize: 8,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
      })),
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
      ...monthColumns.map((m) => ({
        text: m.label,
        fontSize: 8,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
      })),
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
      ...monthColumns.map((m) => ({
        text: m.label,
        fontSize: 8,
        alignment: 'center',
        bold: true,
        border: [true, true, true, true],
      })),
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
  ]

  processedSummaryData.value.forEach((catData) => {
    tableBody.push([
      {
        text: catData.category,
        colSpan: 25,
        fontSize: 8,
        bold: true,
        fillColor: '#92d050',
        alignment: 'left',
        border: [true, true, true, true],
      },
      ...Array(24).fill({}),
    ])
    catData.mfos.forEach((mfoData, mi) => {
      tableBody.push([
        {
          text: `MFO ${mi + 1} - ${mfoData.mfo}`,
          colSpan: 25,
          fontSize: 8,
          bold: true,
          fillColor: '#aeaaaa',
          alignment: 'left',
          border: [true, true, true, true],
        },
        ...Array(24).fill({}),
      ])
      mfoData.outputs.forEach((output, oi) => {
        const row = [
          {
            text: `Output ${oi + 1}: ${output.outputName}`,
            fontSize: 8,
            border: [true, true, true, true],
          },
        ]
        ;['quantity', 'effectiveness', 'timeliness'].forEach((type) => {
          monthColumns.forEach((m) =>
            row.push({
              text: String(output.monthly[type][m.key] ?? '-'),
              fontSize: 7,
              alignment: 'center',
              border: [true, true, true, true],
            }),
          )
          row.push({
            text: String(output.totals[type].total || '0'),
            fontSize: 8,
            alignment: 'center',
            bold: true,
            fillColor: '#d9d9d9',
            border: [true, true, true, true],
          })
          row.push({
            text: String(output.totals[type].rating || '0'),
            fontSize: 8,
            alignment: 'center',
            bold: true,
            fillColor: '#d9d9d9',
            border: [true, true, true, true],
          })
        })
        tableBody.push(row)
      })
    })
    tableBody.push([
      { text: '', colSpan: 18, border: [true, true, true, true] },
      ...Array(17).fill({}),
      ...monthColumns.map((m) => ({
        text: m.label,
        fontSize: 8,
        alignment: 'center',
        border: [true, true, true, true],
      })),
      { text: 'TOTAL', fontSize: 8, alignment: 'center', border: [true, true, true, true] },
    ])
    tableBody.push([
      {
        text: 'MAN DAY(S) LOST THRU ABSENCE',
        colSpan: 18,
        fontSize: 8,
        bold: true,
        border: [true, true, true, true],
      },
      ...Array(17).fill({}),
      ...monthColumns.map((m) => ({
        text: getSemesterAttendance('absents', m.key),
        fontSize: 8,
        alignment: 'center',
        border: [true, true, true, true],
      })),
      {
        text: getTotalAbsences(),
        fontSize: 8,
        alignment: 'center',
        border: [true, true, true, true],
      },
    ])
    tableBody.push([
      {
        text: 'MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME',
        colSpan: 18,
        fontSize: 8,
        bold: true,
        border: [true, true, true, true],
      },
      ...Array(17).fill({}),
      ...monthColumns.map((m) => ({
        text: getSemesterAttendance('lates', m.key),
        fontSize: 8,
        alignment: 'center',
        border: [true, true, true, true],
      })),
      { text: getTotalLates(), fontSize: 8, alignment: 'center', border: [true, true, true, true] },
    ])
    tableBody.push([
      {
        text: 'OBSERVATIONS/REMARKS',
        colSpan: 25,
        fontSize: 8,
        bold: true,
        border: [true, true, true, true],
        margin: [0, 0, 0, 15],
      },
      ...Array(24).fill({}),
    ])
  })

  if (!processedSummaryData.value.length) {
    tableBody.push([
      {
        text: 'No summary performance data available',
        colSpan: 25,
        alignment: 'center',
        italics: true,
        border: [true, true, true, true],
      },
      ...Array(24).fill({}),
    ])
  }

  content.push({
    table: { headerRows: 3, widths: colWidths, body: tableBody },
    layout: {
      hLineWidth: (i) => (i < 3 ? 1 : 0.5),
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
          { text: 'Date:', fontSize: 8, margin: [0, 0, 0, 5], alignment: 'center' },
          { text: 'Confirmed:', fontSize: 9, margin: [0, 0, 0, 5], alignment: 'center' },
          { text: 'Date:', fontSize: 8, margin: [0, 0, 0, 5], alignment: 'center' },
          {
            text: 'Approved for Final Rating:',
            fontSize: 9,
            margin: [0, 0, 0, 5],
            alignment: 'center',
          },
          { text: 'Date:', fontSize: 8, margin: [0, 0, 0, 5], alignment: 'center' },
        ],
        [
          {
            text: employeeName,
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 2],
          },
          { text: formatDate(new Date()), fontSize: 8, alignment: 'center', margin: [0, 20, 0, 2] },
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
          { text: formatDate(new Date()), fontSize: 8, alignment: 'center', margin: [0, 20, 0, 2] },
          {
            text: props.managerialSignatory?.name || '___________________',
            fontSize: 8,
            bold: true,
            alignment: 'center',
            margin: [0, 20, 0, 2],
          },
          { text: formatDate(new Date()), fontSize: 8, alignment: 'center', margin: [0, 20, 0, 2] },
        ],
        [
          { text: position, fontSize: 8, alignment: 'center' },
          { text: '', fontSize: 8 },
          {
            text:
              props.supervisorySignatory?.position ||
              props.managerialSignatory?.position ||
              'Supervisor',
            fontSize: 8,
            alignment: 'center',
          },
          { text: '', fontSize: 8 },
          {
            text: props.managerialSignatory?.position || 'Department Head',
            fontSize: 8,
            alignment: 'center',
          },
          { text: '', fontSize: 8 },
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
    pageMargins: [36, 36, 36, 36],
    content,
    defaultStyle: { fontSize: 10 },
    compress: true,
  }
}

// ── Lifecycle ────────────────────────────────────────────────────────────────
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

.total-cell {
  background-color: #d9d9d9 !important;
}
.avg-cell {
  background-color: #d0cece !important;
}

.main-table td.total-cell,
.main-table th.total-cell {
  background-color: #d9d9d9 !important;
}

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

.competency-list {
  font-size: 10px;
  line-height: 1.4;
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
.main-table tbody tr {
  height: 40px;
}

.page-break {
  page-break-before: always;
}
</style>
