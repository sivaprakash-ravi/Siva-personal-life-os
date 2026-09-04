import { ReactNode } from 'react';

import {
  DashboardCard,
  EmptyState,
  ErrorState,
  LoadingState,
  SectionHeader,
} from '@/components/ui/dashboard';

export type SectionPanelProps = {
  title: string;
  eyebrow?: string;
  loading: boolean;
  error: boolean;
  /** When true and data is empty, show the EmptyState. */
  showEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  onRetry?: () => void;
  contentStyle?: object;
  children?: ReactNode;
};

/**
 * Convenience wrapper for dashboard sections: renders a consistent section
 * header and manages loading / error / empty / data states uniformly.
 */
export function SectionPanel({
  title,
  eyebrow,
  loading,
  error,
  showEmpty = false,
  emptyTitle = 'No data yet',
  emptyMessage = 'Add data from the relevant screen to see it here.',
  actionLabel,
  onActionPress,
  onRetry,
  contentStyle,
  children,
}: SectionPanelProps) {
  return (
    <>
      <SectionHeader title={title} eyebrow={eyebrow} actionLabel={actionLabel} onActionPress={onActionPress} />

      {loading ? (
        <DashboardCard contentStyle={contentStyle}>
          <LoadingState compact />
        </DashboardCard>
      ) : error ? (
        <DashboardCard contentStyle={contentStyle}>
          <ErrorState compact onRetry={onRetry} />
        </DashboardCard>
      ) : showEmpty ? (
        <DashboardCard contentStyle={contentStyle}>
          <EmptyState title={emptyTitle} message={emptyMessage} />
        </DashboardCard>
      ) : (
        children
      )}
    </>
  );
}
