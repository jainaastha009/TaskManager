import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ReactTabulator } from "react-tabulator";
import "react-tabulator/lib/styles.css";
import "react-tabulator/css/tabulator.min.css";
import "../App.css";

const Tasktable = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("");

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

  const handleAddTask = () => {
    setTasks((prev) => [
      { id: tasks.length + 1, title: "New Task", status: "To Do" },
      ...prev,
    ]);
    toast.success("Task added successfully!");
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    toast.error("Task deleted.");
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(filter.toLowerCase())
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
        return `<button class="bg-red-500 text-white px-2 py-1 rounded">Delete</button>`;
      },
      cellClick: (e, cell) => {
        const id = cell.getRow().getData().id;
        handleDeleteTask(id);
      },
    },
  ];

  return (
    <div className="p-6 bg-gray-100">
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Filter tasks"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border p-2 rounded"
        />
        <button
          onClick={handleAddTask}
          className="bg-blue-500 text-white px-4 py-2 rounded"
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
    </div>
  );
};

export default Tasktable;
