<template>
  <iframe v-if="pdfUrl" :src="pdfUrl" style="width: 100vw; height: 100vh; border: none" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useSummaryReportStore } from 'stores/summaryReportStore'

const props = defineProps({
  publicationDate: {
    type: String,
    required: true,
  },
})

const pdfUrl = ref(null)
const reportData = ref(null)
const summaryReportStore = useSummaryReportStore()

async function getImageBase64(url) {
  const response = await fetch(url)
  const blob = await response.blob()

  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(blob)
  })
}

async function fetchReportData() {
  reportData.value = await summaryReportStore.fetchQualifiedReport(props.publicationDate)
}

async function generatePdf() {
  const logoBase64 = await getImageBase64('/logo.png')

  const pdfMakeModule = await import('pdfmake/build/pdfmake')
  const pdfMake = pdfMakeModule.default || pdfMakeModule

  const vfsFonts = await import('pdfmake/build/vfs_fonts')
  pdfMake.vfs = vfsFonts.pdfMake.vfs

  const docDefinition = {
    pageSize: 'LEGAL',
    pageOrientation: 'landscape',
    pageMargins: [72, 120, 72, 40],

    header: () => ({
      stack: [
        {
          canvas: [
            {
              type: 'rect',
              x: (1008 - 936) / 2,
              y: 60,
              w: 936,
              h: 25,
              color: '#008000',
            },
          ],
        },
        {
          margin: [72, -65, 72, 0],
          columns: [
            {
              width: 70,
              image: logoBase64,
              height: 65,
            },
            {
              width: '*',
              stack: [
                {
                  text: 'REPUBLIC OF THE PHILIPPINES',
                  fontSize: 8,
                  color: '#00703c',
                },
                {
                  text: 'PROVINCE OF DAVAO DEL NORTE',
                  fontSize: 8,
                  color: '#00703c',
                },
                {
                  text: 'CITY OF TAGUM',
                  fontSize: 10,
                  bold: true,
                  color: '#00703c',
                },
                {
                  text: 'CITY HUMAN RESOURCE MANAGEMENT OFFICE',
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

    content: [],

    defaultStyle: {
      fontSize: 10,
    },
  }

  pdfMake.createPdf(docDefinition).getBlob((blob) => {
    pdfUrl.value = URL.createObjectURL(blob)
  })
}

onMounted(async () => {
  await fetchReportData()
  await generatePdf()
})

onUnmounted(() => {
  if (pdfUrl.value) URL.revokeObjectURL(pdfUrl.value)
})
</script>
