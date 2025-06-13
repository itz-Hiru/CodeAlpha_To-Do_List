const form = document.getElementById("form");
const taskContainer = document.getElementById("taskContainer");

function toggleForm(edit = false) {
  if (!edit) document.getElementById("editIndex").value = "";
  form.style.display = form.style.display === "none" ? "block" : "none";
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function calculateStatus(task) {
  if (task.subtaskStatus && task.subtaskStatus.every((v) => v)) return "green";
  const now = new Date();
  const due = new Date(task.dueDate);
  const diff = (due - now) / (1000 * 60 * 60 * 24);
  if (diff < 0) return "red";
  if (diff <= 1) return "orange";
  return "cyan";
}

function renderTasks() {
  const tasks = getTasks();
  taskContainer.innerHTML = "";

  tasks
    .slice()
    .reverse()
    .forEach((task, indexReversed) => {
      const index = tasks.length - 1 - indexReversed;
      const status = calculateStatus(task);

      const priorityClass = {
        High: "priority-high",
        Medium: "priority-medium",
        Low: "priority-low",
      }[task.priority];

      const card = document.createElement("div");
      card.className = `task-card ${status}`;

      card.innerHTML = `
      <h3 class="task-title">${task.title}</h3>
      <p class="task-desc">${task.description}</p>

      <div class="task-meta">
        <span class="${priorityClass}">Priority: ${task.priority}</span>
        <span>Due: ${task.dueDate}</span>
      </div>

      <ul style="margin-top: 0.75rem; padding-left: 1rem; list-style: none;">
        ${task.subtasks
          .map(
            (s, i) => `
          <li style="margin-bottom: 0.5rem;">
            <label style="display: flex; align-items: center; gap: 0.5rem;">
              <input type="checkbox" ${
                task.subtaskStatus[i] ? "checked" : ""
              } onclick="toggleSubtask(${index}, ${i})" />
              <span style="${
                task.subtaskStatus[i]
                  ? "text-decoration: line-through; color: gray;"
                  : "color: #222"
              }">${s.trim()}</span>
            </label>
          </li>
        `
          )
          .join("")}
      </ul>

      <div class="task-actions" style="margin-top: 1rem;">
        <button onclick="editTask(${index})" class="edit-btn">Edit</button>
        <button onclick="deleteTask(${index})" class="delete-btn">Delete</button>
      </div>
    `;

      taskContainer.appendChild(card);
    });
}

function submitTask(event) {
  event.preventDefault();

  const title = document.getElementById("title").value.trim();
  const dueDate = document.getElementById("dueDate").value.trim();

  if (!title) {
    alert("Task title is required.");
    return;
  }
  if (!dueDate) {
    alert("Due date is required.");
    return;
  }

  const description = document.getElementById("description").value;
  const priority = document.getElementById("priority").value;
  const subtasks = document
    .getElementById("subtasks")
    .value.split(",")
    .map((s) => s.trim());
  const index = document.getElementById("editIndex").value;

  const tasks = getTasks();

  if (index !== "") {
    tasks[index] = {
      ...tasks[index],
      title,
      description,
      priority,
      subtasks,
      subtaskStatus: subtasks.map(
        (_, i) => tasks[index].subtaskStatus[i] || false
      ),
      dueDate,
    };
  } else {
    tasks.push({
      title,
      description,
      priority,
      subtasks,
      subtaskStatus: subtasks.map(() => false),
      dueDate,
    });
  }

  saveTasks(tasks);
  renderTasks();

  document.getElementById("form").reset();
  document.getElementById("editIndex").value = "";
  document.getElementById("form").style.display = "none";
}

function editTask(index) {
  const tasks = getTasks();
  const task = tasks[index];
  document.getElementById("title").value = task.title;
  document.getElementById("description").value = task.description;
  document.getElementById("priority").value = task.priority;
  document.getElementById("subtasks").value = task.subtasks.join(", ");
  document.getElementById("dueDate").value = task.dueDate;
  document.getElementById("editIndex").value = index;
  toggleForm(true);
}

function deleteTask(index) {
  const tasks = getTasks();
  tasks.splice(index, 1);
  saveTasks(tasks);
  renderTasks();
}

function toggleSubtask(taskIndex, subIndex) {
  const tasks = getTasks();
  tasks[taskIndex].subtaskStatus[subIndex] =
    !tasks[taskIndex].subtaskStatus[subIndex];
  saveTasks(tasks);
  renderTasks();
}

window.onload = () => {
  renderTasks();
};
