import { TaskModel } from '@bryntum/gantt';

export default class CustomTaskModel extends TaskModel {
    static $name = 'CustomTaskModel';

    static fields = [
        { name : 'assignee', type : 'string' }
    ];
}
