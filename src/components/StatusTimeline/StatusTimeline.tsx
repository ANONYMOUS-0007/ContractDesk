import { format } from 'date-fns';
import type { StatusTransition } from '../../types';
import { statusDisplayInfo } from '../../types';
import './StatusTimeline.css';

interface StatusTimelineProps {
  history: StatusTransition[];
}

export function StatusTimeline({ history }: StatusTimelineProps) {
  return (
    <div className="timeline">
      {history.map((transition, index) => {
        const info = statusDisplayInfo[transition.to];
        return (
          <div key={index} className="timeline-item">
            <div className="timeline-dot" style={{ background: `linear-gradient(135deg, ${info.color}, ${info.color}88)` }} />
            <div className="timeline-content">
              <div className="timeline-header">
                <span className="timeline-status" style={{ color: info.color }}>{info.label}</span>
                {transition.from && (
                  <span className="timeline-from">from {statusDisplayInfo[transition.from].label}</span>
                )}
              </div>
              <p className="timeline-time">{format(new Date(transition.timestamp), 'MMM d, yyyy · h:mm a')}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
