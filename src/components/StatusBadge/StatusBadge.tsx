import type { ContractStatus } from '../../types';
import { statusDisplayInfo } from '../../types';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: ContractStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`status-badge ${status}`}>{statusDisplayInfo[status].label}</span>;
}
