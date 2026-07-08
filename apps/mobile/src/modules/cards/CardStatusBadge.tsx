import { Badge } from '@/shared/ui/Badge';
import { CardStatus } from './types';
import { StatusColorToken } from '@/lib/theme';

interface Props {
  status: CardStatus;
  className?: string;
}

const statusToneMap: Record<CardStatus, StatusColorToken> = {
  draft: 'muted-text',
  ready: 'brand',
  published: 'verified',
  failed: 'dispute',
};

const statusLabelMap: Record<CardStatus, string> = {
  draft: 'Draft',
  ready: 'Ready to Publish',
  published: 'Published',
  failed: 'Failed',
};

export function CardStatusBadge({ status, className }: Props) {
  return (
    <Badge tone={statusToneMap[status]} className={className}>
      {statusLabelMap[status]}
    </Badge>
  );
}
