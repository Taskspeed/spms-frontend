import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { format } from 'date-fns'

// Initialize pdfmake
pdfMake.vfs = pdfFonts.pdfMake.vfs

// Define fonts
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
}

// Helper function to generate IPCR PDF
export const generateIPCRPDF = (employee) => {
  const docDefinition = {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [20, 20, 20, 20],
    content: [
      // Header with logos
      {
        columns: [
          {
            image: 'city_logo',
            width: 60,
            height: 60,
            margin: [0, 0, 10, 0],
          },
          {
            stack: [
              {
                text: 'INDIVIDUAL PERFORMANCE COMMITMENT AND REVIEW (IPCR)',
                style: 'headerTitle',
                alignment: 'center',
              },
              {
                text: 'CITY OF HUMAN RESOURCE MANAGEMENT OFFICE',
                style: 'headerSubtitle',
                alignment: 'center',
              },
            ],
            width: '*',
          },
          {
            image: 'philippines_logo',
            width: 60,
            height: 60,
            margin: [10, 0, 0, 0],
          },
        ],
        columnGap: 10,
      },

      // Employee details
      {
        text: [
          'I, ',
          { text: employee.name || 'N/A', bold: true, decoration: 'underline' },
          ', of ',
          { text: employee.division || 'N/A', bold: true, decoration: 'underline' },
          ', commit to deliver and agree to be rated on the attainment of the following targets in accordance with the indicated measure for the period January - June 2025.',
        ],
        margin: [0, 20, 0, 20],
      },

      // Main content section
      {
        columns: [
          // Left section (3/4)
          {
            width: '70%',
            stack: [
              // Signature section
              {
                text: employee.name || 'N/A',
                bold: true,
                decoration: 'underline',
                alignment: 'right',
                margin: [0, 0, 80, 0],
              },
              {
                text: employee.position || 'N/A',
                alignment: 'right',
                margin: [0, 0, 80, 0],
              },
              {
                text: `Date: ${format(new Date(), 'MM/dd/yyyy')}`,
                alignment: 'right',
                margin: [0, 0, 80, 20],
              },

              // Review/Approval table
              {
                table: {
                  headerRows: 1,
                  widths: ['50%', '50%'],
                  body: [
                    [
                      { text: 'Reviewed by:', bold: true },
                      { text: 'Approved by:', bold: true },
                    ],
                    [
                      {
                        stack: [
                          {
                            text: employee.name || 'N/A',
                            bold: true,
                            decoration: 'underline',
                            alignment: 'center',
                          },
                          { text: employee.position || 'N/A', alignment: 'center' },
                          {
                            text: `Date: ${format(new Date(), 'MM/dd/yyyy')}`,
                            alignment: 'center',
                          },
                        ],
                      },
                      {
                        stack: [
                          {
                            text: employee.name || 'N/A',
                            bold: true,
                            decoration: 'underline',
                            alignment: 'center',
                          },
                          { text: employee.position || 'N/A', alignment: 'center' },
                          {
                            text: `Date: ${format(new Date(), 'MM/dd/yyyy')}`,
                            alignment: 'center',
                          },
                        ],
                      },
                    ],
                  ],
                },
                layout: {
                  hLineWidth: function () {
                    return 1
                  },
                  vLineWidth: function () {
                    return 1
                  },
                  hLineColor: function () {
                    return '#000000'
                  },
                  vLineColor: function () {
                    return '#000000'
                  },
                },
              },

              // Stamp and Rating section
              {
                columns: [
                  // Stamp box
                  {
                    width: '60%',
                    stack: [
                      {
                        text: 'Performance Management Team',
                        style: 'stampHeader',
                        alignment: 'center',
                        margin: [0, 0, 0, 10],
                      },
                      {
                        text: 'Target Calibrated by: ____________________',
                        fontSize: 8,
                      },
                      {
                        text: 'Date: ____________________________',
                        fontSize: 8,
                        margin: [0, 5, 0, 0],
                      },
                    ],
                    border: [3, 3, 3, 3],
                    borderColor: '#000080',
                    margin: [0, 20, 10, 0],
                  },
                  // Rating table
                  {
                    width: '40%',
                    table: {
                      widths: [20, '*'],
                      body: [
                        [{ text: '5', alignment: 'center' }, { text: 'Outstanding' }],
                        [{ text: '4', alignment: 'center' }, { text: 'Very Satisfactory' }],
                        [{ text: '3', alignment: 'center' }, { text: 'Satisfactory' }],
                        [{ text: '2', alignment: 'center' }, { text: 'Unsatisfactory' }],
                        [{ text: '1', alignment: 'center' }, { text: 'Poor' }],
                      ],
                    },
                    layout: {
                      hLineWidth: function () {
                        return 1
                      },
                      vLineWidth: function () {
                        return 1
                      },
                      hLineColor: function () {
                        return '#000000'
                      },
                      vLineColor: function () {
                        return '#000000'
                      },
                    },
                    margin: [10, 20, 0, 0],
                  },
                ],
              },
            ],
          },

          // Right section (1/4) - Stamp boxes
          {
            width: '30%',
            stack: [
              // First stamp
              {
                stack: [
                  {
                    text: 'LOCAL GOVERNMENT OF TAGUM CITY',
                    fontSize: 8,
                    bold: true,
                    alignment: 'center',
                  },
                  { text: employee.division || 'N/A', fontSize: 10, alignment: 'center' },
                  { text: 'IPCR Accomplishment', fontSize: 10, alignment: 'center' },
                  {
                    text: 'RECEIVED',
                    fontSize: 10,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 5, 0, 10],
                  },
                  { text: 'By: ____________________', fontSize: 8, alignment: 'left' },
                  {
                    text: 'Date & Time: ______________',
                    fontSize: 8,
                    alignment: 'left',
                    margin: [0, 5, 0, 0],
                  },
                ],
                border: [3, 3, 3, 3],
                borderColor: '#000080',
                margin: [0, 0, 0, 20],
              },
              // Second stamp
              {
                stack: [
                  {
                    text: 'LOCAL GOVERNMENT OF TAGUM CITY',
                    fontSize: 8,
                    bold: true,
                    alignment: 'center',
                  },
                  { text: employee.division || 'N/A', fontSize: 10, alignment: 'center' },
                  { text: 'IPCR Accomplishment', fontSize: 10, alignment: 'center' },
                  {
                    text: 'RECEIVED',
                    fontSize: 10,
                    bold: true,
                    alignment: 'center',
                    margin: [0, 5, 0, 10],
                  },
                  { text: 'By: ____________________', fontSize: 8, alignment: 'left' },
                  {
                    text: 'Date & Time: ______________',
                    fontSize: 8,
                    alignment: 'left',
                    margin: [0, 5, 0, 0],
                  },
                ],
                border: [3, 3, 3, 3],
                borderColor: '#000080',
              },
            ],
          },
        ],
      },

      // Main IPCR Table
      {
        margin: [0, 20, 0, 0],
        table: {
          headerRows: 2,
          widths: ['15%', '15%', '15%', '10%', '10%', '10%', '10%', '15%'],
          body: [
            // First header row
            [
              { text: 'MAJOR FINAL OUTPUT', rowSpan: 2, alignment: 'center', style: 'tableHeader' },
              { text: 'SUCCESS INDICATOR', rowSpan: 2, alignment: 'center', style: 'tableHeader' },
              {
                text: 'ACTUAL ACCOMPLISHMENT',
                rowSpan: 2,
                alignment: 'center',
                style: 'tableHeader',
              },
              { text: 'RATING', colSpan: 4, alignment: 'center', style: 'tableHeader' },
              {},
              {},
              {},
              { text: 'REMARKS', rowSpan: 2, alignment: 'center', style: 'tableHeader' },
            ],
            // Second header row
            [
              {},
              {},
              {},
              { text: 'Q (Quality)', alignment: 'center', style: 'tableHeader' },
              { text: 'E (Efficiency)', alignment: 'center', style: 'tableHeader' },
              { text: 'T (Timeliness)', alignment: 'center', style: 'tableHeader' },
              { text: 'A (Average)', alignment: 'center', style: 'tableHeader' },
              {},
            ],
            // Strategic Functions
            [
              {
                text: 'STRATEGIC FUNCTION',
                colSpan: 8,
                alignment: 'center',
                style: 'sectionHeader',
              },
              {},
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            [
              { text: 'MFO 1: controll panel', colSpan: 8, alignment: 'left', style: 'sectionMFO' },
              {},
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            [
              'Outpot 1:Strategic Plan Implementation',
              'Strategic Plan Implementation',
              'Strategic Plan Implementation',
              { text: employee?.strategic || 'N/A', alignment: 'center' },
              { text: employee?.strategic || 'N/A', alignment: 'center' },
              { text: employee?.strategic || 'N/A', alignment: 'center' },
              { text: employee?.strategic || 'N/A', alignment: 'center' },
              'Implements strategic initiatives on schedule',
            ],
            [
              {
                text: 'Strategic Functions Average Rating',
                colSpan: 6,
                alignment: 'right',
                bold: true,
              },
              {},
              {},
              {},
              {},
              {},
              { text: employee?.rating || 'N/A', alignment: 'center', bold: true },
              '',
            ],
            // Core Functions
            [
              { text: 'CORE FUNCTION', colSpan: 8, alignment: 'center', style: 'sectionHeader' },
              {},
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            [
              {
                text: 'MFO 1: Planning and Recruitment',
                colSpan: 8,
                alignment: 'left',
                style: 'sectionMFO',
              },
              {},
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            [
              'Outpot 1: Recruitment and Selection',
              'Recruitment and Selection',
              'Recruitment and Selection',
              { text: employee?.core || 'N/A', alignment: 'center' },
              { text: employee?.core || 'N/A', alignment: 'center' },
              { text: employee?.core || 'N/A', alignment: 'center' },
              { text: employee?.core || 'N/A', alignment: 'center' },
              'Processes recruitment documents efficiently',
            ],
            [
              'Outpot 2:Employee Development',
              'Employee Development',
              'Employee Development',
              { text: employee?.core || 'N/A', alignment: 'center' },
              { text: employee?.core || 'N/A', alignment: 'center' },
              { text: employee?.core || 'N/A', alignment: 'center' },
              { text: employee?.core || 'N/A', alignment: 'center' },
              'Implements training programs effectively',
            ],
            [
              { text: 'Core Functions Average Rating', colSpan: 6, alignment: 'right', bold: true },
              {},
              {},
              {},
              {},
              {},
              { text: '4', alignment: 'center', bold: true },
              '',
            ],
            // Support Functions
            [
              { text: 'SUPPORT FUNCTION', colSpan: 8, alignment: 'center', style: 'sectionHeader' },
              {},
              {},
              {},
              {},
              {},
              {},
              {},
            ],
            [
              'Outpot 1: Administrative Support',
              'Administrative Support',
              'Administrative Support',
              { text: employee?.support || 'N/A', alignment: 'center' },
              { text: employee?.support || 'N/A', alignment: 'center' },
              { text: employee?.support || 'N/A', alignment: 'center' },
              { text: employee?.support || 'N/A', alignment: 'center' },
              'Provides timely administrative support',
            ],
            [
              {
                text: 'Support Functions Average Rating',
                colSpan: 6,
                alignment: 'right',
                bold: true,
              },
              {},
              {},
              {},
              {},
              {},
              { text: employee?.rating || 'N/A', alignment: 'center', bold: true },
              '',
            ],
            // Final Rating
            [
              { text: 'Final Average Rating', colSpan: 6, alignment: 'right', bold: true },
              {},
              {},
              {},
              {},
              {},
              { text: '8', alignment: 'center', bold: true },
              '',
            ],
          ],
        },
        layout: {
          hLineWidth: function () {
            return 1
          },
          vLineWidth: function () {
            return 1
          },
          hLineColor: function () {
            return '#000000'
          },
          vLineColor: function () {
            return '#000000'
          },
        },
      },

      // Footer tables and signatures
      {
        margin: [0, 20, 0, 0],
        columns: [
          // Calculations table
          {
            width: '60%',
            table: {
              widths: ['30%', '70%'],
              body: [
                [
                  'Core Function',
                  '3.50 = ((4 + 4.33 + 4.66 + 4.33 +4.66 + 4.33 + 5 +3.66) / 8) * 0.8',
                ],
                [
                  'Support Function',
                  '3.50 = ((4 + 4.33 + 4.66 + 4.33 +4.66 + 4.33 + 5 +3.66) / 8) * 0.8',
                ],
                ['Total', '4.22'],
                ['ADJECTIVAL RATING', '4 = VERY SATISFACTORY'],
              ],
            },
            layout: {
              hLineWidth: function () {
                return 1
              },
              vLineWidth: function () {
                return 1
              },
              hLineColor: function () {
                return '#000000'
              },
              vLineColor: function () {
                return '#000000'
              },
            },
          },
          // Performance Management Team stamp
          {
            width: '40%',
            stack: [
              {
                text: 'Performance Management Team',
                style: 'stampHeader',
                alignment: 'center',
              },
              {
                text: 'Target Calibrated by: ____________________',
                fontSize: 8,
              },
              {
                text: 'Date: ____________________________',
                fontSize: 8,
                margin: [0, 5, 0, 0],
              },
            ],
            border: [3, 3, 3, 3],
            borderColor: '#000080',
            margin: [10, 0, 0, 0],
          },
        ],
      },

      // Comments section
      {
        text: 'Comments and Recommendations for Development Purposes',
        bold: true,
        margin: [0, 20, 0, 10],
      },
      {
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1 }],
        margin: [0, 0, 0, 20],
      },

      // Final signature table
      {
        table: {
          headerRows: 1,
          widths: ['20%', '10%', '20%', '10%', '20%', '10%'],
          body: [
            [
              { text: 'Discussed with:', bold: true },
              { text: 'Date:', bold: true },
              { text: 'Assessed by:', bold: true, colSpan: 2 },
              {},
              { text: 'Final Rating by:', bold: true, colSpan: 2 },
              {},
            ],
            [
              {
                stack: [
                  {
                    text: employee.name || 'N/A',
                    bold: true,
                    decoration: 'underline',
                    alignment: 'center',
                  },
                  { text: employee.position || 'N/A', alignment: 'center' },
                  { text: `Date: ${format(new Date(), 'MM/dd/yyyy')}`, alignment: 'center' },
                ],
              },
              '',
              {
                stack: [
                  {
                    text: employee.name || 'N/A',
                    bold: true,
                    decoration: 'underline',
                    alignment: 'center',
                  },
                  { text: employee.position || 'N/A', alignment: 'center' },
                  { text: `Date: ${format(new Date(), 'MM/dd/yyyy')}`, alignment: 'center' },
                ],
                colSpan: 2,
              },
              {},
              {
                stack: [
                  {
                    text: employee.name || 'N/A',
                    bold: true,
                    decoration: 'underline',
                    alignment: 'center',
                  },
                  { text: employee.position || 'N/A', alignment: 'center' },
                  { text: `Date: ${format(new Date(), 'MM/dd/yyyy')}`, alignment: 'center' },
                ],
                colSpan: 2,
              },
              {},
            ],
          ],
        },
        layout: {
          hLineWidth: function (rowIndex) {
            return rowIndex === 0 ? 0 : 1
          },
          vLineWidth: function () {
            return 1
          },
          hLineColor: function () {
            return '#000000'
          },
          vLineColor: function () {
            return '#000000'
          },
        },
        margin: [0, 40, 0, 0],
      },
    ],

    styles: {
      headerTitle: {
        fontSize: 14,
        bold: true,
      },
      headerSubtitle: {
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
        fontSize: 10,
        fillColor: '#e8f5e9',
      },
      sectionMFO: {
        bold: true,
        fontSize: 9,
        fillColor: '#f7f7f7',
      },
      stampHeader: {
        fontSize: 10,
        bold: true,
        color: '#000080',
      },
    },

    // You'll need to provide images for the logos
    images: {
      city_logo: 'data:image/png;base64,...', // Add your base64 logo here
      philippines_logo: 'data:image/png;base64,...', // Add your base64 logo here
    },
  }

  return docDefinition
}

// Generate Performance Standard PDF
export const generatePerformanceStandardPDF = () => {
  // Similar structure as above but for Performance Standard
  // ... (implementation similar to IPCR)
  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    content: [
      // Performance Standard content
    ],
  }
}

// Generate Monthly Performance Output PDF
export const generateMonthlyPerformancePDF = () => {
  // ... (implementation)
  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    content: [
      // Monthly Performance Output content
    ],
  }
}

// Generate Summary Monthly Performance Report PDF
export const generateSummaryMonthlyPDF = () => {
  // ... (implementation)
  return {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    content: [
      // Summary Monthly Performance Report content
    ],
  }
}

// Export PDF function
export const exportPDF = (employee, reportType) => {
  let docDefinition

  switch (reportType) {
    case 'ipcr':
      docDefinition = generateIPCRPDF(employee)
      break
    case 'ps':
      docDefinition = generatePerformanceStandardPDF(employee)
      break
    case 'mpo':
      docDefinition = generateMonthlyPerformancePDF(employee)
      break
    case 'smpr':
      docDefinition = generateSummaryMonthlyPDF(employee)
      break
    default:
      docDefinition = generateIPCRPDF(employee)
  }

  // Create and download PDF
  pdfMake
    .createPdf(docDefinition)
    .download(
      `${employee.name.replace(/\s+/g, '_')}_${reportType.toUpperCase()}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
    )
}
