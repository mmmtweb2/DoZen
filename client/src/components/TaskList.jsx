import React from 'react';
import TaskItem from './TaskItem'; // ייבוא קומפוננטת פריט משימה


function TaskList({
    tasks,
    onToggleComplete,
    onDeleteTask,
    onEditTask,
    onAddSubtask,
    onToggleSubtaskComplete,
    onDeleteSubtask,
    onEditSubtask,
    onSetTaskDueDate,
    onSetTaskPriority
}) {
    if (tasks.length === 0) {
        return <p>אין משימות להצגה בתיקיה זו.</p>;
    }

    return (
        <ul className="task-list">
            {tasks.map((task) => (
                <TaskItem
                    // --- שינוי מ-task.id ל-task._id ---
                    key={task._id}
                    // ---------------------------------
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onDeleteTask={onDeleteTask}
                    onEditTask={onEditTask}
                    onAddSubtask={onAddSubtask}
                    onToggleSubtaskComplete={onToggleSubtaskComplete}
                    onDeleteSubtask={onDeleteSubtask}
                    onEditSubtask={onEditSubtask}
                    onSetTaskDueDate={onSetTaskDueDate}
                    onSetTaskPriority={onSetTaskPriority}
                />
            ))}
        </ul>
    );
}

export default TaskList;
