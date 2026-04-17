import { useAppStore } from './store';

const teamColors: Record<string, string> = {
    Alice   : '#6366f1',
    Bob     : '#f59e0b',
    Charlie : '#22c55e'
};

const AssigneeBadge = ({ assignee }: { assignee: string }) => {
    const selectedMembers = useAppStore((state) => state.selectedMembers);
    const isSelected = selectedMembers.includes(assignee);

    return (
        <span
            style={{
                backgroundColor : isSelected ? teamColors[assignee] : '#e2e8f0',
                color           : isSelected ? '#fff' : '#475569',
                padding         : '2px 8px',
                borderRadius    : '4px',
                fontSize        : '0.8em',
                fontWeight      : isSelected ? 600 : 400,
                transition      : 'all 0.2s'
            }}
        >
            {assignee}
        </span>
    );
};

export default AssigneeBadge;
