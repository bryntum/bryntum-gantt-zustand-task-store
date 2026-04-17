import { useAppStore } from './store';

const TEAM_MEMBERS = ['Alice', 'Bob', 'Charlie'];

const teamColors: Record<string, string> = {
    Alice   : '#6366f1',
    Bob     : '#f59e0b',
    Charlie : '#22c55e'
};

const AssigneeToggle = () => {
    const selectedMembers = useAppStore((state) => state.selectedMembers);
    const toggleMember = useAppStore((state) => state.toggleMember);

    return (
        <div style={{ padding : '16px', borderBottom : '1px solid #e2e8f0' }}>
            <h3 style={{ margin : '0 0 8px 0', fontSize : '0.9em', color : '#64748b' }}>
        Highlight team member tasks:
            </h3>
            <div style={{ display : 'flex', gap : '8px' }}>
                {TEAM_MEMBERS.map((name) => {
                    const isSelected = selectedMembers.includes(name);
                    return (
                        <button
                            key={name}
                            onClick={() => toggleMember(name)}
                            style={{
                                backgroundColor : isSelected ? teamColors[name] : '#f1f5f9',
                                color           : isSelected ? '#fff' : '#475569',
                                border          : 'none',
                                padding         : '6px 14px',
                                borderRadius    : '6px',
                                cursor          : 'pointer',
                                fontSize        : '0.85em',
                                fontFamily      : 'inherit'
                            }}
                        >
                            {name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AssigneeToggle;
