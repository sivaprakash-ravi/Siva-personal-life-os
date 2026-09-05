/**
 * Downloads / shares the server-generated V1 report PDF.
 *
 * Web: fetches the PDF as a Blob and triggers a browser download.
 * Native: downloads the PDF to the cache directory and opens the system share
 * sheet (expo-sharing supports android/ios; expo-file-system's modern File/Paths
 * API is not available on web, hence the Platform guard + dynamic imports).
 */

import { Platform } from 'react-native';

import { getReportPdf, reportPdfUrl, type ReportType } from '@/services/api';
import { reportPdfFilename } from '@/utils/report-period';

export async function downloadReportPdf(
  reportType: ReportType,
  referenceDate: string,
): Promise<void> {
  const filename = reportPdfFilename(reportType, referenceDate);

  if (Platform.OS === 'web') {
    const blob = await getReportPdf(reportType, referenceDate);
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 5_000);
    return;
  }

  const { File, Paths } = await import('expo-file-system');
  const Sharing = await import('expo-sharing');

  const destination = new File(Paths.cache, filename);
  const file = await File.downloadFileAsync(
    reportPdfUrl(reportType, referenceDate),
    destination,
  );

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
      dialogTitle: 'Share report',
    });
  }
}