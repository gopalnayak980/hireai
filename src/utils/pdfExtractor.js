import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

// Configure worker path for Vite bundling
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker

/**
 * Extract clean, structured text from all pages of a PDF file
 * 
 * @param {ArrayBuffer | Uint8Array} arrayBuffer - PDF raw data
 * @returns {Promise<string>} Extracted text across all pages
 */
export const extractTextFromPDF = async (arrayBuffer) => {
  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
    useSystemFonts: true,
    isEvalSupported: false,
  })

  const pdf = await loadingTask.promise
  const numPages = pdf.numPages
  const pageTexts = []

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum)
    const textContent = await page.getTextContent()

    let lastY = null
    let pageText = ''

    for (const item of textContent.items) {
      if ('str' in item) {
        // Detect new line if vertical coordinate changes significantly
        if (lastY !== null && Math.abs(item.transform[5] - lastY) > 6) {
          pageText += '\n'
        } else if (pageText && !pageText.endsWith(' ') && !pageText.endsWith('\n') && item.str && !item.str.startsWith(' ')) {
          pageText += ' '
        }
        pageText += item.str
        lastY = item.transform[5]
      }
    }

    const cleaned = pageText.trim()
    if (cleaned) {
      pageTexts.push(cleaned)
    }
  }

  return pageTexts.join('\n\n').trim()
}
