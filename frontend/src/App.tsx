import { type FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
import { BryntumGantt, type BryntumGanttProps } from '@bryntum/gantt-react-enterprise';
import { DateHelper } from '@bryntum/core-enterprise';
import CustomTaskModel from './lib/CustomTaskModel';
import AssigneeBadge from './AssigneeBadge';
import AssigneeToggle from './AssigneeToggle';
import { useAppStore } from './store';
import './App.css';

const toDateString = (value: unknown): string | undefined => {
    if (!value) return undefined;
    if (value instanceof Date) return DateHelper.format(value, 'YYYY-MM-DD');
    return String(value);
};

const GanttView: FunctionComponent = () => {
    const gantt = useRef<BryntumGantt>(null);

    const addTask = useAppStore((state) => state.addTask);
    const updateTask = useAppStore((state) => state.updateTask);
    const removeTask = useAppStore((state) => state.removeTask);

    const handleDataChange = useCallback(
        (event: {
      store: { id: string | number };
      action: string;
      records: unknown[];
      isExpand?: boolean;
      isCollapse?: boolean;
    }) => {
            if (event.store.id !== 'tasks') return;
            if (event.isExpand || event.isCollapse) return;

            const { action } = event;
            // Bryntum's Model type does not declare data, so describe the records here
            const records = event.records as { id: number | string; data: Record<string, unknown> }[];

            const toBackendParentId = (value: unknown): number | null =>
                typeof value === 'number' ? value : null;

            for (const record of records) {
                const data = record.data;
                const id = record.id;
                const isPhantom = typeof id === 'string' && id.startsWith('_generated');

                switch (action) {
                    case 'add':
                        if (isPhantom) {
                            addTask({
                                name        : data.name as string,
                                startDate   : toDateString(data.startDate),
                                endDate     : toDateString(data.endDate),
                                duration    : data.duration as number,
                                percentDone : data.percentDone as number,
                                parentId    : toBackendParentId(data.parentId),
                                assignee    : data.assignee as string
                            }).then((newTask) => {
                                if (newTask?.id && gantt.current?.instance) {
                                    gantt.current.instance.project.taskStore.applyChangeset({
                                        updated : [{ $PhantomId : id, id : newTask.id }]
                                    });
                                }
                            });
                        }
                        break;
                    case 'update':
                        if (!isPhantom && typeof id === 'number') {
                            updateTask(id, {
                                name        : data.name as string,
                                startDate   : toDateString(data.startDate),
                                endDate     : toDateString(data.endDate),
                                duration    : data.duration as number,
                                percentDone : data.percentDone as number,
                                parentId    : toBackendParentId(data.parentId),
                                assignee    : data.assignee as string
                            });
                        }
                        break;
                    case 'remove':
                        if (!isPhantom && typeof id === 'number') {
                            removeTask(id);
                        }
                        break;
                }
            }
        },
        [addTask, updateTask, removeTask]
    );

    const [ganttProps] = useState<BryntumGanttProps>(() => ({
        viewPreset : 'weekAndDayLetter',
        barMargin  : 10,
        project    : {
            taskModelClass     : CustomTaskModel,
            autoSetConstraints : true,
            taskStore          : {
                transformFlatData : true,
                data              : useAppStore.getState().tasks
            }
        },
        columns : [
            { type : 'name', field : 'name', width : 370 },
            {
                text     : 'Assignee',
                field    : 'assignee',
                width    : 140,
                renderer : ({ record }: { record: { get: (field: string) => string } }) => {
                    const assignee = record.get('assignee');
                    if (!assignee) return null;
                    return <AssigneeBadge assignee={assignee} />;
                }
            },
            { type : 'startdate', field : 'startDate', text : 'Start Date' },
            { type : 'enddate', field : 'endDate', text : 'End Date' },
            { type : 'percentdone', field : 'percentDone', text : '% Done', width : 100 }
        ]
    }));

    return (
        <BryntumGantt
            ref={gantt}
            {...ganttProps}
            onDataChange={handleDataChange}
        />
    );
};

const App: FunctionComponent = () => {
    const isLoading = useAppStore((state) => state.isLoading);
    const fetchTasks = useAppStore((state) => state.fetchTasks);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    if (isLoading) {
        return <div style={{ padding : 20 }}>Loading...</div>;
    }

    return (
        <div style={{ display : 'flex', flexDirection : 'column', height : '100vh' }}>
            <AssigneeToggle />
            <div style={{ flex : 1 }}>
                <GanttView />
            </div>
        </div>
    );
};

export default App;
