  <!-- ipcr_report.vue -->
<template>
  <!-- App Header -->
  <div class="app-container">
    <div class="app-header">
      <div class="header-content">
        <div class="text-h6 text-white">CITY OF TAGUM - HUMAN RESOURCE MANAGEMENT OFFICE</div>
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
          <div class="text-h6">Employee Details</div>
        </div>
        <q-list padding class="employee-details">
          <q-item>
            <q-item-section>
              <q-item-label caption>Name</q-item-label>
              <q-item-label>{{ employee?.name || 'N/A' }}</q-item-label>
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
              <q-item-label caption>Division</q-item-label>
              <q-item-label>{{ employee?.division || 'N/A' }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item>
            <q-item-section>
              <q-item-label caption>Status</q-item-label>
              <q-item-label>
                <q-badge :color="getStatusColor(employee?.status)" :text-color="getStatusTextColor(employee?.status)"
                  align="middle" class="q-px-md q-py-xs" rounded>
                  <q-icon :name="getStatusIcon(employee?.status)" class="q-mr-xs" />
                  {{ employee?.status }}
                </q-badge>
              </q-item-label>
            </q-item-section>
          </q-item>
          <q-separator class="q-my-md" />
          <q-item>
            <q-btn color="positive" label="Approve" class="full-width" :disable="employee?.status === 'Approved'"
              @click="$emit('approve')" />
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
              <div class="text-subtitle2">Target Period: January - June 2025</div>
            </div>
            <div class="flex justify-end q-gutter-sm">
              <q-btn color="green-9" icon="print" label="Print" @click="directPrint" :loading="isPrinting" />
              <q-btn color="green-9" icon="download" label="Download" @click="downloadPdf" :loading="isGeneratingPdf" />
              <q-tooltip>Download as PDF</q-tooltip>
            </div>
          </div>
        </div>

        <!-- Tabs for different report types -->
        <q-tabs v-model="activeTab" dense class="text-grey" active-color="green-8" indicator-color="green-8"
          align="justify" narrow-indicator>
          <q-tab name="ipcr" label="IPCR" />
          <q-tab name="ps" label="Performance Standard" />
          <q-tab name="mpo" label="Monthly Performance Output" />
          <q-tab name="smpr" label="Summary Monthly Performance Report" />
        </q-tabs>

        <!-- Scrollable Report Content -->
        <div class="report-content-scroll">
          <q-tab-panels v-model="activeTab" animated>
            <!-- IPCR Tab -->
            <q-tab-panel name="ipcr">
              <div class="report-content" id="print-section-ipcr">
                <!-- Header with Logo -->
                <div class="header">
                  <img src="https://phshirt.com/wp-content/uploads/2021/11/City-of-Tagum-Logo.png"
                    alt="City of Tagum Logo" class="logo">
                  <div class="center-text">
                    <div class="title">INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)</div>
                    <div class="title">CITY OF HUMAN RESOURCE MANAGEMENT OFFICE</div>
                  </div>
                  <img src="/src/assets/RP.png" alt="City of Tagum Logo" class="logo">
                </div>

                <div>
                  <div style="display: flex;">
                    <!-- Left section (3/4 width) -->
                    <div style="flex: 3; padding-right: 10px;">
                      <div>I, <strong><u>{{ employee?.name }}</u></strong>, of <strong><u>{{
                            employee?.division }}</u></strong>,
                        commit to deliver and
                        agree to be rated on the attainment of the following targets in
                        accordance
                        with the indicated measure for the period January - June 2025.
                      </div>
                      <div style="display: flex; justify-content: flex-end; padding-right: 80px;">
                        <div style="padding-bottom: 10px; text-align: center;">
                          <div style="padding-top: 30px;"><strong><u>{{ employee?.name
                                }}</u></strong></div>
                          <div>{{ employee?.position }}</div>
                          <div>Date:<strong><u>01/21/2025</u></strong></div>
                        </div>
                      </div>
                      <div>
                        <table style="width: 100%; border-collapse: collapse; border: 1px solid black;">
                          <thead>
                            <tr>
                              <th style="border: 1px solid black; padding: 8px; text-align: left;">
                                Reviewed by:</th>
                              <th style="border: 1px solid black; padding: 8px; text-align: left;">
                                Approved by:</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td style="border: 1px solid black; padding-top: 30px; text-align: center;">
                                <div><strong><u>{{ employee?.name }}</u></strong></div>
                                <div>{{ employee?.position }}</div>
                                <div>Date:<u>01/21/2025</u></div>
                              </td>
                              <td style="border: 1px solid black; padding-top: 30px; text-align: center;">
                                <div><strong><u>{{ employee?.name }}</u></strong></div>
                                <div>{{ employee?.position }}</div>
                                <div>Date:<u>01/21/2025</u></div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Right section (1/4 width) -->
                    <div style="flex: 1; align-items: flex-end; display: flex; flex-direction: column; gap: 30px;">
                      <!-- First Stamp -->
                      <div style="border: 3px double navy; text-align: center; color: navy; width: 250px;">
                        <div style="font-size: 10px; font-weight: bold;">LOCAL GOVERNMENT OF
                          TAGUM CITY</div>
                        <div style="font-size: 13px;">{{
                          employee?.division }}</div>
                        <div style="font-size: 13px;">
                          IPCR Accomplishment
                        </div>
                        <div style="font-size: 13px; font-weight: bold;">RECEIVED</div>
                        <div style="text-align: left; padding-left: 10px;">
                          By: <span style="border-bottom: 1px solid #000; display: inline-block; width: 190px;"></span>
                        </div>
                        <div style="text-align: left; padding-left: 10px;">
                          Date & Time: <span
                            style="border-bottom: 1px solid #000; display: inline-block; width: 120px;"></span>
                        </div>
                      </div>

                      <div style="border: 3px double navy; text-align: center; color: navy; width: 250px;">
                        <div style="font-size: 10px; font-weight: bold;">LOCAL GOVERNMENT OF
                          TAGUM CITY</div>
                        <div style="font-size: 13px;">{{
                          employee?.division }}</div>
                        <div style="font-size: 13px;">
                          IPCR Accomplishment
                        </div>
                        <div style="font-size: 13px; font-weight: bold;">RECEIVED</div>
                        <div style="text-align: left; padding-left: 10px;">
                          By: <span style="border-bottom: 1px solid #000; display: inline-block; width: 190px;"></span>
                        </div>
                        <div style="text-align: left; padding-left: 10px;">
                          Date & Time: <span
                            style="border-bottom: 1px solid #000; display: inline-block; width: 120px;"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style="display: flex; gap: 20px; align-items: flex-start; margin-top: 20px;">
                  <!-- Stamp Box -->
                  <div style="border: 3px double navy; text-align: center; color: navy; width: 300px; padding: 10px;">
                    <div style="font-size: 13px; font-weight: bold;">Performance Management Team
                    </div>
                    <div style="text-align: left; padding-left: 10px; font-size:10px; margin-top: 15px;">
                      Target Calibrated by: <span
                        style="border-bottom: 1px solid #000; display: inline-block; width: 150px;"></span>
                    </div>
                    <div style="text-align: left; padding-left: 10px; font-size:10px; margin-top: 10px;">
                      Date: <span style="border-bottom: 1px solid #000; display: inline-block; width: 230px;"></span>
                    </div>
                  </div>

                  <!-- Rating Table -->
                  <table style="border-collapse: collapse; border: 1px solid black; width: 250px;">
                    <tbody>
                      <tr>
                        <td
                          style="border: 1px solid black; text-align: center; width: 30px; padding: 5px; font-size: 10px;">
                          5</td>
                        <td style="border: 1px solid black; padding: 5px 10px; font-size: 10px;">
                          Outstanding</td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid black; text-align: center; padding: 5px; font-size: 10px;">
                          4
                        </td>
                        <td style="border: 1px solid black; padding: 5px 10px; font-size: 10px;">
                          Very
                          Satisfactory</td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid black; text-align: center; padding: 5px; font-size: 10px;">
                          3
                        </td>
                        <td style="border: 1px solid black; padding: 5px 10px; font-size: 10px;">
                          Satisfactory
                        </td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid black; text-align: center; padding: 5px; font-size: 10px;">
                          2
                        </td>
                        <td style="border: 1px solid black; padding: 5px 10px; font-size: 10px;">
                          Unsatisfactory
                        </td>
                      </tr>
                      <tr>
                        <td style="border: 1px solid black; text-align: center; padding: 5px; font-size: 10px;">
                          1
                        </td>
                        <td style="border: 1px solid black; padding: 5px 10px; font-size: 10px;">
                          Poor</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div class="q-mt-md">
                  <!-- Main Table -->
                  <div class="table-container">
                    <table class="full-width main-table">
                      <thead class="no-repeat-header">
                        <tr>
                          <th rowspan="2" class="text-center mfo-column">MAJOR FINAL OUTPUT
                          </th>
                          <th rowspan="2" class="text-center mfo-column">SUCCESS INDICATOR
                          </th>
                          <th rowspan="2" class="text-center mfo-column">ACTUAL ACCOMPLISHMENT
                          </th>
                          <th colspan="4" class="text-center">RATING</th>
                          <th rowspan="2" class="text-center">REMARKS</th>
                        </tr>
                        <tr>
                          <th class="text-center">Q (Quality)</th>
                          <th class="text-center">E (Efficiency)</th>
                          <th class="text-center">T (Timeliness)</th>
                          <th class="text-center">A (Average)</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Strategic Functions -->
                        <tr>
                          <td colspan="8" class="section-header">STRATEGIC FUNCTION</td>

                        </tr>
                        <tr>
                          <td colspan="8" class="section-mfo">MFO 1: controll panel</td>

                        </tr>
                        <tr>
                          <td>Outpot 1:Strategic Plan Implementation</td>
                          <td>Strategic Plan Implementation</td>
                          <td>Strategic Plan Implementation</td>
                          <td class="text-center">{{ employee?.strategic }}</td>
                          <td class="text-center">{{ employee?.strategic }}</td>
                          <td class="text-center">{{ employee?.strategic }}</td>
                          <td class="text-center">{{ employee?.strategic }}</td>
                          <td>Implements strategic initiatives on schedule</td>
                        </tr>
                        <tr>
                          <td colspan="6" class="text-right text-weight-bold">Strategic
                            Functions Average Rating</td>
                          <td class="text-center text-weight-bold">{{
                            employee?.rating }}</td>
                          <td></td>
                        </tr>

                        <!-- Core Functions -->
                        <tr>
                          <td colspan="8" class="section-header">CORE FUNCTION</td>
                        </tr>
                        <tr>
                          <td colspan="8" class="section-mfo">MFO 1: Planning and Recruitment</td>
                        </tr>
                        <tr>
                          <td>Outpot 1: Recruitment and Selection</td>
                          <td>Recruitment and Selection</td>
                          <td>Recruitment and Selection</td>
                          <td class="text-center">{{ employee?.core }}</td>
                          <td class="text-center">{{ employee?.core }}</td>
                          <td class="text-center">{{ employee?.core }}</td>
                          <td class="text-center">{{ employee?.core }}</td>
                          <td>Processes recruitment documents efficiently</td>
                        </tr>
                        <tr>
                          <td>Outpot 2:Employee Development</td>
                          <td>Employee Development</td>
                          <td>Employee Development</td>
                          <td class="text-center">{{ employee?.core }}</td>
                          <td class="text-center">{{ employee?.core }}</td>
                          <td class="text-center">{{ employee?.core }}</td>
                          <td class="text-center">{{ employee?.core }}</td>
                          <td>Implements training programs effectively</td>
                        </tr>
                        <tr>
                          <td colspan="6" class="text-right text-weight-bold">Core
                            Functions Average Rating</td>
                          <td class="text-center text-weight-bold">4</td>
                          <td></td>
                        </tr>

                        <!-- Support Functions -->
                        <tr>
                          <td colspan="8" class="section-header">SUPPORT FUNCTION</td>
                        </tr>
                        <tr>
                          <td>Outpot 1: Administrative Support</td>
                          <td>Administrative Support</td>
                          <td>Administrative Support</td>
                          <td class="text-center">{{ employee?.support }}</td>
                          <td class="text-center">{{ employee?.support }}</td>
                          <td class="text-center">{{ employee?.support }}</td>
                          <td class="text-center">{{ employee?.support }}</td>
                          <td>Provides timely administrative support</td>
                        </tr>
                        <tr>
                          <td colspan="6" class="text-right text-weight-bold">Support
                            Functions Average
                            Rating</td>
                          <td class="text-center text-weight-bold">{{
                            employee?.rating }}</td>
                          <td></td>
                        </tr>

                        <!-- Final Rating -->
                        <tr>
                          <td colspan="6" class="text-right text-weight-bold">Final Average
                            Rating
                          </td>
                          <td class="text-center text-weight-bold">8</td>
                          <td></td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td>Core Function</td>
                          <td colspan="4">3.50 = ((4 + 4.33 + 4.66 + 4.33 +4.66 + 4.33 + 5
                            +3.66) / 8) *
                            0.8</td>
                          <td rowspan="4" colspan="3">
                            <div
                              style="border: 3px double navy; text-align: center; color: navy; width: 300px; padding: 10px;">
                              <div style="font-size: 13px; font-weight: bold;">Performance
                                Management Team
                              </div>
                              <div style="text-align: left; padding-left: 10px; font-size:10px; margin-top: 15px;">
                                Target Calibrated by: <span
                                  style="border-bottom: 1px solid #000; display: inline-block; width: 150px;"></span>
                              </div>
                              <div style="text-align: left; padding-left: 10px; font-size:10px; margin-top: 10px;">
                                Date: <span
                                  style="border-bottom: 1px solid #000; display: inline-block; width: 230px;"></span>
                              </div>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td>Support Function</td>
                          <td colspan="4">3.50 = ((4 + 4.33 + 4.66 + 4.33 +4.66 + 4.33 + 5
                            +3.66) / 8) *
                            0.8</td>
                        </tr>
                        <tr>
                          <td>Total</td>
                          <td colspan="4">4.22</td>
                        </tr>
                        <tr>
                          <td>ADJECTIVAL RATING
                          </td>
                          <td colspan="4">4 = VERY SATISFACTORY</td>
                        </tr>
                        <tr>
                          <td colspan="8"><strong>Comments and Recommendations for
                              Development
                              Purposes</strong></td>
                        </tr>
                        <tr>
                          <td colspan="8">
                            <div style="height: 50px;"></div>
                          </td>
                        </tr>
                        <tr>
                          <td><strong>Discussed with:</strong></td>
                          <td><strong>Date:</strong></td>
                          <td colspan="2"><strong>Assessed by:</strong></td>
                          <td><strong>Date:</strong></td>
                          <td colspan="2"><strong>Final Rating by:</strong></td>
                          <td><strong>Date:</strong></td>
                        </tr>
                        <tr>
                          <td style="padding-top: 50px; text-align: center;">
                            <div><strong><u>{{ employee?.name }}</u></strong></div>
                            <div>{{ employee?.position }}</div>
                            <div>Date:<u>01/21/2025</u></div>
                          </td>
                          <td></td>
                          <td colspan="2" style="padding-top: 50px; text-align: center;">
                            <div><strong><u>{{ employee?.name }}</u></strong></div>
                            <div>{{ employee?.position }}</div>
                            <div>Date:<u>01/21/2025</u></div>
                          </td>
                          <td></td>
                          <td colspan="2" style="padding-top: 50px; text-align: center;">
                            <div><strong><u>{{ employee?.name }}</u></strong></div>
                            <div>{{ employee?.position }}</div>
                            <div>Date:<u>01/21/2025</u></div>
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                  <!-- Signature Section -->
                  <!-- <div class="q-mt-xl row">
                                        <div class="col-6">
                                            <div class="text-center">Rated by:</div>
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
                                    </div> -->
                </div>
              </div>
            </q-tab-panel>

            <!-- Performance Standard Tab -->
            <q-tab-panel name="ps">
              <div class="report-content" id="print-section-ps">
                <!-- Header with Logo -->
                <div class="header">
                  <img src="https://phshirt.com/wp-content/uploads/2021/11/City-of-Tagum-Logo.png"
                    alt="City of Tagum Logo" class="logo">
                  <div class="center-text">
                    <div class="title">{{ employee?.division }}</div>
                    <div class="title">PERFORMANCE STANDARDS FOR RATING PERIOD <u>January - June
                        2025</u></div>
                  </div>
                  <img src="/src/assets/RP.png" alt="City of Tagum Logo" class="logo">
                </div>

                <!-- Main Content -->
                <div class="q-mt-md">
                  <table class="full-width info-table">
                    <tbody>
                      <tr>
                        <td><strong>Employee:</strong> {{ employee?.name }}</td>
                        <td><strong>Position:</strong> {{ employee?.position }}</td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Main Table -->
                  <div class="table-container">
                    <table class="full-width main-table">
                      <thead class="no-repeat-header">
                        <tr>
                          <th>MFO</th>
                          <th>SUCCESS INDICATOR</th>
                          <th>RATING</th>
                          <th>Q (Quantity)</th>
                          <th>E (Effectiveness)</th>
                          <th>T (Timeliness)</th>
                          <th>Mode of Verification</th>
                          <th>Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        <!-- Strategic Functions -->
                        <tr>
                          <td colspan="8" class="section-header">STRATEGIC FUNCTION (20%)</td>
                        </tr>
                        <tr>
                          <td rowspan="6">Strategic Plan Implementation</td>
                          <td rowspan="6">Strategic Plan Implementation</td>
                        </tr>
                        <!-- Rating -->
                        <tr>
                          <td style="text-align: center;">5</td>
                          <td style="text-align: center;">25</td>
                          <td style="text-align: center;">Without error</td>
                          <td style="text-align: center;">6 months</td>
                          <td rowspan="5">VISUAL REPRESENTATION</td>
                          <td rowspan="5"></td>

                        </tr>
                        <tr>
                          <td style="text-align: center;">4</td>
                          <td style="text-align: center;">23</td>
                          <td style="text-align: center;">1-5 errors</td>
                          <td style="text-align: center;"></td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">3</td>
                          <td style="text-align: center;">20</td>
                          <td style="text-align: center;">5-10 errors</td>
                          <td style="text-align: center;"></td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">2</td>
                          <td style="text-align: center;">15</td>
                          <td style="text-align: center;">More than 10 errors</td>
                          <td style="text-align: center;">More than 6 months</td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">1</td>
                          <td style="text-align: center;">10</td>
                          <td style="text-align: center;"></td>
                          <td style="text-align: center;"></td>
                        </tr>

                        <!-- Core Functions -->
                        <tr>
                          <td colspan="8" class="section-header">CORE FUNCTION (60%)</td>
                        </tr>
                        <tr>
                          <td rowspan="6">Strategic Plan Implementation</td>
                          <td rowspan="6">Strategic Plan Implementation</td>
                        </tr>
                        <!-- Rating -->
                        <tr>
                          <td style="text-align: center;">5</td>
                          <td style="text-align: center;">25</td>
                          <td style="text-align: center;">Without error</td>
                          <td style="text-align: center;">6 months</td>
                          <td rowspan="5">VISUAL REPRESENTATION</td>
                          <td rowspan="5"></td>

                        </tr>
                        <tr>
                          <td style="text-align: center;">4</td>
                          <td style="text-align: center;">23</td>
                          <td style="text-align: center;">1-5 errors</td>
                          <td style="text-align: center;"></td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">3</td>
                          <td style="text-align: center;">20</td>
                          <td style="text-align: center;">5-10 errors</td>
                          <td style="text-align: center;"></td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">2</td>
                          <td style="text-align: center;">15</td>
                          <td style="text-align: center;">More than 10 errors</td>
                          <td style="text-align: center;">More than 6 months</td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">1</td>
                          <td style="text-align: center;">10</td>
                          <td style="text-align: center;"></td>
                          <td style="text-align: center;"></td>
                        </tr>

                        <!-- Support Functions -->
                        <tr>
                          <td colspan="8" class="section-header">SUPPORT FUNCTION (20%)</td>
                        </tr>
                        <tr>
                          <td rowspan="6">Strategic Plan Implementation</td>
                          <td rowspan="6">Strategic Plan Implementation</td>
                        </tr>
                        <!-- Rating -->
                        <tr>
                          <td style="text-align: center;">5</td>
                          <td style="text-align: center;">25</td>
                          <td style="text-align: center;">Without error</td>
                          <td style="text-align: center;">6 months</td>
                          <td rowspan="5">VISUAL REPRESENTATION</td>
                          <td rowspan="5"></td>

                        </tr>
                        <tr>
                          <td style="text-align: center;">4</td>
                          <td style="text-align: center;">23</td>
                          <td style="text-align: center;">1-5 errors</td>
                          <td style="text-align: center;"></td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">3</td>
                          <td style="text-align: center;">20</td>
                          <td style="text-align: center;">5-10 errors</td>
                          <td style="text-align: center;"></td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">2</td>
                          <td style="text-align: center;">15</td>
                          <td style="text-align: center;">More than 10 errors</td>
                          <td style="text-align: center;">More than 6 months</td>
                        </tr>
                        <tr>
                          <td style="text-align: center;">1</td>
                          <td style="text-align: center;">10</td>
                          <td style="text-align: center;"></td>
                          <td style="text-align: center;"></td>
                        </tr>
                      </tbody>
                    </table>
                    <!-- Signature Section -->
                    <div class="q-mt-xl row">
                      <div class="col-4">
                        <div class="text-center">Conformed:</div>
                        <div class="text-center q-mt-lg">
                          <div class="text-weight-bold"><u>JANYLENE A. PALERMO, MM</u></div>
                          <div>City Human Resource Management Officer</div>
                        </div>
                      </div>
                      <div class="col-4">
                        <div class="text-center">Discussed With:</div>
                        <div class="text-center q-mt-lg">
                          <div class="text-weight-bold"><u>HON. REY T. UY</u></div>
                          <div>City Mayor</div>
                        </div>
                      </div>
                      <div class="col-4">
                        <div class="text-center">Approved by:</div>
                        <div class="text-center q-mt-lg">
                          <div class="text-weight-bold"><u>HON. REY T. UY</u></div>
                          <div>City Mayor</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </q-tab-panel>

            <!-- Monthly Performance Output Tab -->
            <q-tab-panel name="mpo">
              <div class="report-content" id="print-section-mpo">
                <!-- Header with Logo -->
                <div class="header-container">
                  <div class="header-text">
                    <div class="padded-text">Republic of the Philippinees
                    </div>
                    <div class="padded-text">Province of Davao del Norte
                    </div>
                    <div class="text-weight-bold padded-text">CITY OF TAGUM
                    </div>

                    <div style="border: 3px double black; text-align: center; color: black; width: auto; padding: 5px;">
                      <div class="text-weight-bold padded-text">MONTHLY PERFORMANCE OUTPUT REPORT
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Main Content -->
                <div class="q-mt-md">
                  <table class="full-width info-table">
                    <tbody>
                      <tr>
                        <td><strong>Employee:</strong> {{ employee?.name }}</td>
                        <td><strong>Office:</strong> {{ employee?.division }}</td>
                        <td><strong>Division:</strong> {{ employee?.division }}</td>
                        <td><strong>Month:</strong> January 2025</td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Main Table -->
                  <div class="table-container">
                    <table class="full-width main-table">
                      <thead class="no-repeat-header">
                        <tr>
                          <th rowspan="4" class="text-center">MAJOR FINAL OUTPUT</th>
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
                        <!-- Strategic Functions -->
                        <tr>
                          <td colspan="19" class="section-header">STRATEGIC FUNCTION</td>
                        </tr>
                        <tr>
                          <td>Strategic Plan Implementation</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                        </tr>

                        <!-- Core Functions -->
                        <tr>
                          <td colspan="19" class="section-header">CORE FUNCTION</td>
                        </tr>
                        <tr>
                          <td>Recruitment and Selection</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                        </tr>

                        <!-- Support Functions -->
                        <tr>
                          <td colspan="19" class="section-header">SUPPORT FUNCTION</td>
                        </tr>
                        <tr>
                          <td>Administrative Support</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                        </tr>

                        <!-- Summary -->
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
                          <td>0</td>
                        </tr>
                        <tr>
                          <td colspan="13">MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                        </tr>
                        <tr>
                          <td colspan="19">OBSERVATIONS/REMARKS: <div style="height: 50px;">
                            </div>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="6">Aboved entries are true and correct:</td>
                          <td colspan="3">Date:</td>
                          <td colspan="7">Confirmed:</td>
                          <td colspan="3">Date:</td>
                        </tr>
                        <tr>
                          <td colspan="6">
                            <div style="height: 50px;">
                            </div>
                          </td>
                          <td colspan="3">
                            <div style="height: 50px;">
                            </div>
                          </td>
                          <td colspan="7">
                            <div style="height: 50px;">
                            </div>
                          </td>
                          <td colspan="3">
                            <div style="height: 50px;">
                            </div>
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>

                </div>
              </div>
            </q-tab-panel>

            <!-- Summary Monthly Performance Report Tab -->
            <q-tab-panel name="smpr">
              <div class="report-content" id="print-section-smpr">
                <!-- Header with Logo -->
                <div class="header-container">
                  <div class="header-text">
                    <div class="padded-text">Republic of the Philippinees
                    </div>
                    <div class="padded-text">Province of Davao del Norte
                    </div>
                    <div class="text-weight-bold padded-text">CITY OF TAGUM
                    </div>

                    <div style="border: 3px double black; text-align: center; color: black; width: auto; padding: 5px;">
                      <div class="text-weight-bold padded-text">SUMMARY MONTHLY PERFORMANCE OUTPUT
                        REPORT</div>
                    </div>
                  </div>
                </div>


                <!-- Main Content -->
                <div class="q-mt-md">
                  <table class="full-width info-table">
                    <tbody>
                      <tr>
                        <td><strong>Employee:</strong> {{ employee?.name }}</td>
                        <td><strong>Period:</strong> January - June 2025</td>
                      </tr>
                    </tbody>
                  </table>

                  <!-- Main Table -->
                  <div class="table-container">
                    <table class="full-width main-table">
                      <thead class="no-repeat-header">
                        <tr>
                          <th rowspan="3" class="text-center">MAJOR FINAL OUTPUT</th>
                          <th colspan="24" class="text-center">ACCOMPLISHMENT</th>
                        </tr>
                        <tr>
                          <th colspan="8" class="text-center">QUANTITY</th>
                          <th colspan="8" class="text-center">EFFECTIVENESS</th>
                          <th colspan="8" class="text-center">TIMELINESS</th>
                        </tr>
                        <tr>
                          <th>Jan</th>
                          <th>Feb</th>
                          <th>March</th>
                          <th>Apr</th>
                          <th>May</th>
                          <th>June</th>
                          <th>TOTAL</th>
                          <th>RATING</th>
                          <th>Jan</th>
                          <th>Feb</th>
                          <th>March</th>
                          <th>Apr</th>
                          <th>May</th>
                          <th>June</th>
                          <th>TOTAL</th>
                          <th>RATING</th>
                          <th>Jan</th>
                          <th>Feb</th>
                          <th>March</th>
                          <th>Apr</th>
                          <th>May</th>
                          <th>June</th>
                          <th>TOTAL</th>
                          <th>RATING</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td colspan="25">B. CORE FUNCTION</td>
                        </tr>
                        <tr>
                          <td>Computer Program Report Templates</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                        </tr>
                        <tr>
                          <td>Computer Program Report Templates</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                        </tr>
                        <!-- Summary -->
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
                          <td>0</td>
                        </tr>
                        <tr>
                          <td colspan="18">MAN HRS./MINUTES LOST THRU TARDINESS/UNDERTIME</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                          <td>0</td>
                        </tr>
                        <tr>
                          <td colspan="25">OBSERVATIONS/REMARKS: <div style="height: 50px;">
                            </div>
                          </td>
                        </tr>
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="7">Aboved entries are true and correct:</td>
                          <td colspan="2">Date:</td>
                          <td colspan="6">Confirmed:</td>
                          <td colspan="2">Date:</td>
                          <td colspan="6">Approved for Final Rating:</td>
                          <td colspan="2">Date:</td>
                        </tr>
                        <tr>
                          <td colspan="7">
                            <div style="height: 50px;">
                            </div>
                          </td>
                          <td colspan="2">
                            <div style="height: 50px;">
                            </div>
                          </td>
                          <td colspan="6">
                            <div style="height: 50px;">
                            </div>
                          </td>
                          <td colspan="2">
                            <div style="height: 50px;">
                            </div>
                          </td>
                          <td colspan="6">
                            <div style="height: 50px;">
                            </div>
                          </td>
                          <td colspan="2">
                            <div style="height: 50px;">
                            </div>
                          </td>
                        </tr>
                      </tfoot>
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
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useIPCRStatus } from 'src/composables/ipcr_status';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const $q = useQuasar();

// Props
const props = defineProps({
    employee: {
        type: Object,
        required: true
    }
});

// Emits
defineEmits(['close', 'approve']);

// State
const activeTab = ref('ipcr');
const isPrinting = ref(false);
const isGeneratingPdf = ref(false);

// Status helpers
const { getStatusColor, getStatusTextColor, getStatusIcon } = useIPCRStatus();

// Print report
const directPrint = () => {
    isPrinting.value = true;

    // Create a hidden iframe with proper styling for printing
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';

    document.body.appendChild(printFrame);

    printFrame.onload = () => {
        const printDocument = printFrame.contentWindow.document;
        const printSectionId = `print-section-${activeTab.value}`;
        const printSection = document.getElementById(printSectionId);
        if (!printSection) {
            console.error('Print section not found');
            document.body.removeChild(printFrame);
            isPrinting.value = false;
            return;
        }

        // Copy the CSS
        const styles = document.querySelectorAll('style, link[rel="stylesheet"]');
        styles.forEach(style => {
            printDocument.head.appendChild(style.cloneNode(true));
        });

        // Add print-specific stylesheet
        const printStyle = document.createElement('style');
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
            .app-container,
            .report-container,
            .report-content-scroll {
                height: auto !important;
                overflow: visible !important;
            }
            .report-content {
                background-color: white !important;
                padding: 20px !important;
                margin: 0 !important;
                width: 100% !important;
                box-shadow: none !important;
            }
            table {
                width: 100% !important;
                border-collapse: collapse !important;
                page-break-inside: auto !important;
            }
            tr {
                page-break-inside: avoid !important;
                page-break-after: auto !important;
            }
            thead {
                display: table-row-group !important;
                break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
            }
            /* Prevent thead from repeating */
            thead tr {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
            }
            /* Prevent th from repeating */
            th {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
            }
            tfoot {
                display: table-row-group !important;
                break-inside: avoid !important;
                page-break-after: avoid !important;
                page-break-inside: avoid !important;
            }
            /* Prevent tfoot from repeating */
            tfoot tr {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                page-break-after: avoid !important;
            }
            th, td {
                border: 1px solid #000 !important;
                padding: 8px !important;
                font-size: 12px !important;
            }
            img {
                max-width: 100% !important;
                page-break-inside: avoid !important;
            }
            .no-print,
            .q-dialog__backdrop,
            .q-tabs,
            .report-header,
            .division-nav,
            .app-header {
                display: none !important;
            }
            * {
                print-color-adjust: exact !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
            .header-container {
                display: flex !important;
                align-items: center !important;
                margin-bottom: 20px !important;
            }
            .city-logo {
                margin-right: 20px !important;
            }
            .city-logo img {
                width: 120px !important;
                height: auto !important;
            }
            .header-text {
                margin-left: 20px !important;
            }
            .green-banner {
                background-color: #00703C !important;
                color: white !important;
                font-weight: bold !important;
                padding: 8px 0 !important;
                text-align: center !important;
                width: 100% !important;
            }
            .mfo-column { width: 10%; }
            .competency-column { width: 10%; }
            .indicator-column { width: 10%; }
            .output-column { width: 10%; }
            .standard-column { width: 8%; }
        `;
        printDocument.head.appendChild(printStyle);

        // Copy the content
        printDocument.body.innerHTML = printSection.innerHTML;

        // Print and cleanup
        setTimeout(() => {
            printFrame.contentWindow.print();
            setTimeout(() => {
                document.body.removeChild(printFrame);
                isPrinting.value = false;
            }, 500);
        }, 500);
    };

    // Set iframe source to trigger onload
    printFrame.src = 'about:blank';
};

// PDF download functionality
const downloadPdf = async () => {
    isGeneratingPdf.value = true;
    try {
        const printSectionId = `print-section-${activeTab.value}`;
        const element = document.getElementById(printSectionId);
        if (!element) {
            throw new Error('PDF section not found');
        }

        // Store original styles
        const originalDisplayStyles = new Map();
        document.querySelectorAll('.report-content').forEach(el => {
            originalDisplayStyles.set(el, el.style.display);
            el.style.display = 'none';
        });

        // Show only current tab content
        element.style.display = 'block';

        const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: element.offsetWidth,
            height: element.offsetHeight,
            backgroundColor: '#ffffff'
        });

        // Restore original display styles
        document.querySelectorAll('.report-content').forEach(el => {
            el.style.display = originalDisplayStyles.get(el) || '';
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'legal'
        });

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        const fileName = `${props.employee.name.replace(/\s+/g, '_')}_${activeTab.value.toUpperCase()}_Report.pdf`;
        pdf.save(fileName);
    } catch (error) {
        console.error('Error generating PDF:', error);
        $q.notify({
            type: 'negative',
            message: `Failed to generate PDF: ${error.message}`,
            position: 'top'
        });
    } finally {
        isGeneratingPdf.value = false;
    }
};
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
    background-color: #00703C;
    ;
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
    padding: 16px;
}

.report-content {
    background-color: white;
    padding: 20px;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.2);
}

.header-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 20px;
}

.green-line {
    width: 100%;
    height: 5px;
    background-color: #2e7d32;
    margin-bottom: 10px;
}

.city-logo {
    margin-bottom: 10px;
}

.header-text {
    text-align: center;
    margin-bottom: 20px;
}

.green-banner {
    background-color: #2e7d32;
    color: white;
    padding: 5px 0;
    margin-top: 10px;
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
}

.main-table th {
    background-color: #f2f2f2;
    text-align: center;
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
  text-align: center;
  padding: 8px;
}
.mfo-column {
    width: 40%;
}

@media print {
    @page {
        size: legal;
        margin: 10mm;
    }

    body {
        margin: 0;
        padding: 20px;
    }

    .app-container {
        height: auto !important;
        overflow: visible !important;
    }

    .report-content {
        background-color: white !important;
        padding: 20px !important;
        margin: 0 !important;
        width: 100% !important;
    }

    table {
        width: 100% !important;
        border-collapse: collapse !important;
        page-break-inside: auto !important;
    }

    tr {
        page-break-inside: avoid !important;
        page-break-after: auto !important;
    }

    thead {
        display: table-row-group !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
    }

    /* Prevent thead from repeating */
    thead tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
    }

    /* Prevent th from repeating */
    th {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
    }

    tfoot {
        display: table-row-group !important;
        break-inside: avoid !important;
        page-break-after: avoid !important;
        page-break-inside: avoid !important;
    }

    /* Prevent tfoot from repeating */
    tfoot tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
        page-break-after: avoid !important;
    }

    th,
    td {
        border: 1px solid #000 !important;
        padding: 8px !important;
    }

    img {
        max-width: 100% !important;
        page-break-inside: avoid !important;
    }

    .no-print,
    .q-dialog__backdrop,
    .q-tabs,
    .report-header,
    .division-nav,
    .app-header {
        display: none !important;
    }

    * {
        color-scheme: exact !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
    }
}
</style>
