document.getElementById('addTaskButton').addEventListener('click', function() {
    const taskInput = document.getElementById('taskInput');
    const taskValue = taskInput.value.trim();

    if (taskValue) {
        const taskList = document.getElementById('taskList');

        const li = document.createElement('li');
        li.textContent = taskValue;

        li.addEventListener('click', function() {
            this.classList.toggle('completed');
        });

        taskList.appendChild(li);
        taskInput.value = '';
    }
});
