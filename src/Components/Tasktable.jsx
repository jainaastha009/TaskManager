import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { ReactTabulator } from "react-tabulator";
import "react-toastify/dist/ReactToastify.css";
import "react-tabulator/lib/styles.css";
import "react-tabulator/css/tabulator.min.css";
import "../App.css";

const Tasktable = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // New status filter state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", status: "To Do" });
  const [isEditing, setIsEditing] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  useEffect(() => {
    fetch("https://jsonplaceholder.typicode.com/todos")
      .then((response) => response.json())
      .then((data) =>
        setTasks(
          data.map((task) => ({
            id: task.id,
            title: task.title,
            status: task.completed ? "Done" : "To Do",
          }))
        )
      );
  }, []);

  const handleAddOrUpdateTask = () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required!");
      return;
    }

    if (isEditing) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTaskId ? { ...task, ...newTask } : task
        )
      );
      toast.success("Task updated successfully!");
    } else {
      setTasks((prev) => [
        { id: tasks.length + 1, title: newTask.title, status: newTask.status },
        ...prev,
      ]);
      toast.success("Task added successfully!");
    }

    setIsModalOpen(false);
    setNewTask({ title: "", status: "To Do" });
    setIsEditing(false);
    setEditingTaskId(null);
  };

  const handleEditTask = (id) => {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      setNewTask({ title: taskToEdit.title, status: taskToEdit.status });
      setIsEditing(true);
      setEditingTaskId(id);
      setIsModalOpen(true);
    }
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast.error("Task deleted.");
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(filter.toLowerCase()) &&
      (statusFilter ? task.status === statusFilter : true)
  );

  // Compute task counts for each status
  const taskCounts = tasks.reduce(
    (counts, task) => {
      counts[task.status] = (counts[task.status] || 0) + 1;
      return counts;
    },
    { "To Do": 0, "In Progress": 0, "Done": 0 }
  );

  const columns = [
    { title: "ID", field: "id", editor: false },
    { title: "Title", field: "title", editor: "input" },
    {
      title: "Status",
      field: "status",
      editor: "select",
      editorParams: {
        values: ["To Do", "In Progress", "Done"],
      },
      cellEdited: (cell) => {
        const updatedTask = cell.getData();
        setTasks((prev) =>
          prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
        );
        toast.info(`Task updated to "${updatedTask.status}".`);
      },
    },
    {
      title: "Actions",
      field: "actions",
      formatter: () => {
        return `
          <button class="bg-yellow-500 text-white px-2 py-1 rounded mr-2">Edit</button>
          <button class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
        `;
      },
      cellClick: (e, cell) => {
        const id = cell.getRow().getData().id;
        if (e.target.textContent === "Edit") {
          handleEditTask(id);
        } else if (e.target.textContent === "Delete") {
          handleDeleteTask(id);
        }
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-100">
      <ToastContainer autoClose={1000} />
      <div className="mb-4">
        <h2 className="mb-2 text-lg font-bold">Task Summary</h2>
        <div className="flex gap-4">
          <p className="p-2 text-blue-800 bg-blue-100 rounded">
            To Do: {taskCounts["To Do"]}
          </p>
          <p className="p-2 text-yellow-800 bg-yellow-100 rounded">
            In Progress: {taskCounts["In Progress"]}
          </p>
          <p className="p-2 text-green-800 bg-green-100 rounded">
            Done: {taskCounts["Done"]}
          </p>
        </div>
      </div>

      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Filter tasks"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border rounded"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded"
        >
          <option value="">All Statuses</option>
          <option value="To Do">To Do</option>
          <option value="Done">Done</option>
          <option value="In Progress">In Progress</option>
        </select>
        <button
          onClick={() => {
            setIsModalOpen(true);
            setIsEditing(false);
            setNewTask({ title: "", status: "To Do" });
          }}
          className="px-4 py-2 text-white bg-blue-500 rounded"
        >
          Add Task
        </button>
      </div>

      {filteredTasks.length > 0 ? (
        <ReactTabulator
          data={filteredTasks}
          columns={columns}
          layout="fitColumns"
          options={{
            movableRows: true,
            pagination: "local",
            paginationSize: 20,
          }}
        />
      ) : (
        <p className="text-center text-gray-500">No tasks available</p>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="p-6 bg-white rounded shadow-lg w-96">
            <h2 className="mb-4 text-lg font-bold">
              {isEditing ? "Edit Task" : "Add New Task"}
            </h2>
            <input
              type="text"
              placeholder="Task Title"
              value={newTask.title}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full p-2 mb-4 border rounded"
            />
            <select
              value={newTask.status}
              onChange={(e) =>
                setNewTask((prev) => ({ ...prev, status: e.target.value }))
              }
              className="w-full p-2 mb-4 border rounded"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAddOrUpdateTask}
                className="px-4 py-2 text-white bg-blue-500 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasktable;
