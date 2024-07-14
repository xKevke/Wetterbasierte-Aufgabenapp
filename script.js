// script.js
document.addEventListener('DOMContentLoaded', async () => {
    const weatherInfo = document.getElementById('weatherInfo');
    const weatherIcon = document.getElementById('weatherIcon');
    const weatherText = document.getElementById('weatherText');
    
    const addTaskButton = document.getElementById('addTaskButton');
    const taskForm = document.getElementById('taskForm');
    const saveTaskButton = document.getElementById('saveTask');
    const taskList = document.getElementById('taskList');
    const taskGrid = document.getElementById('taskGrid');
    const tempSlider = document.getElementById('tempSlider');
    const tempValue = document.getElementById('tempValue');
    const rainSelect = document.getElementById('rainSelect');
    const taskNameInput = document.getElementById('taskName');
    let currentWeather = {};

    // Fetch weather on page load with geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const weatherData = await fetchWeather(latitude, longitude);
            currentWeather = weatherData;
            displayWeather(weatherData);
            // Load tasks from localStorage
            loadTasks();
        }, (error) => {
            console.error("Geolocation error:", error);
        });
    } else {
        console.error("Geolocation is not supported by this browser.");
    }

    tempSlider.addEventListener('input', () => {
        tempValue.textContent = `${tempSlider.value}°C`;
    });

    addTaskButton.addEventListener('click', () => {
        taskForm.style.display = 'block';
    });

    saveTaskButton.addEventListener('click', () => {
        const taskName = taskNameInput.value;
        const minTemp = tempSlider.value;
        const rainStatus = rainSelect.value;
        const completed = false;
        const task = { name: taskName, minTemp, rainStatus, completed };
        saveTask(task);
        renderTask(task);
        taskForm.style.display = 'none';
        taskNameInput.value = '';
        tempSlider.value = 20;
        tempValue.textContent = '20°C';
        rainSelect.value = 'none';
        renderTasks(); // Re-render tasks to update the displayed tasks
    });

    function renderTask(task) {
        const { name, minTemp, rainStatus, completed } = task;

        const li = document.createElement('li');
        li.innerHTML = `${name} - Mindesttemperatur: ${minTemp}°C, Regenstatus: ${rainStatus}
                        <button class="delete-button">Löschen</button>`;
        li.dataset.minTemp = minTemp;
        li.dataset.rainStatus = rainStatus;
        li.dataset.name = name;
        li.dataset.completed = completed;

        if (completed) {
            li.classList.add('completed');
        }

        const deleteButton = li.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            deleteTask(name, minTemp, rainStatus);
            li.remove();
            renderTasks(); // Re-render tasks to update the displayed tasks
        });

        taskList.appendChild(li);
    }

    function renderTaskCard(task, animate = true) {
        const { name, minTemp, rainStatus, completed } = task;

        if (!isTaskSuitable(minTemp, rainStatus)) {
            return; // Skip rendering this card if the task is not suitable
        }

        const card = document.createElement('div');
        card.classList.add('task-card');
        if (animate) {
            card.classList.add('new-task-animation');
        }
        card.innerHTML = `${name} `;
        card.dataset.minTemp = minTemp;
        card.dataset.rainStatus = rainStatus;
        card.dataset.name = name;
        card.dataset.completed = completed;

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.textContent = 'Löschen';
        deleteButton.addEventListener('click', () => {
            deleteTask(name, minTemp, rainStatus);
            card.remove();
            renderTasks(); // Re-render tasks to update the displayed tasks
        });

        card.appendChild(deleteButton);
        taskGrid.appendChild(card);
    }

    function isTaskSuitable(minTemp, rainStatus) {
        const currentTemp = currentWeather.temperature;
        const currentRain = currentWeather.rain;

        if (currentTemp < minTemp) {
            return false;
        }

        // Check for exact rain conditions
        if (rainStatus === 'none' && currentRain > 0) {
            return false;
        } else if (rainStatus === 'light' && currentRain > 2) {
            return false;
        } else if (rainStatus === 'rain' && currentRain <= 2) {
            return false;
        }

        return true;
    }

    // Fetch weather data based on latitude and longitude
    async function fetchWeather(latitude, longitude) {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe/Berlin`);
        const data = await response.json();
        return {
            temperature: data.current_weather.temperature,
            rain: data.current_weather.precipitation ?? 0, // Set to 0 if undefined
            weatherCode: data.current_weather.weathercode
        };
    }

    function displayWeather(weather) {
        weatherText.textContent = `Aktuelle Temperatur: ${weather.temperature}°C, Niederschlag: ${weather.rain}mm`;

        const weatherImage = getWeatherImage(weather.weatherCode);
        weatherIcon.src = `images/${weatherImage}.png`;
        weatherIcon.alt = weatherImage; // Update the alt attribute for accessibility
    }

    function getWeatherImage(weatherCode) {
        switch (weatherCode) {
            case 0: // Clear sky
            case 1: // Mainly clear
                return 'clear';
            case 2: // Partly cloudy
                return 'partly_cloudy';
            case 3: // Overcast
            case 45: // Fog
            case 48: // Depositing rime fog
                return 'cloudy';
            case 51: // Drizzle: Light
            case 53: // Drizzle: Moderate
            case 55: // Drizzle: Dense intensity
            case 56: // Freezing Drizzle: Light
            case 57: // Freezing Drizzle: Dense intensity
            case 61: // Rain: Slight
                return 'light_rain';
            case 63: // Rain: Moderate
            case 65: // Rain: Heavy intensity
            case 66: // Freezing Rain: Light
            case 67: // Freezing Rain: Heavy intensity
            case 80: // Rain showers: Slight
            case 81: // Rain showers: Moderate
            case 82: // Rain showers: Violent
                return 'rain';
            case 71: // Snow fall: Slight
            case 73: // Snow fall: Moderate
            case 75: // Snow fall: Heavy intensity
            case 77: // Snow grains
            case 85: // Snow showers slight
            case 86: // Snow showers heavy
                return 'snow';
            case 95: // Thunderstorm: Slight or moderate
            case 96: // Thunderstorm with slight hail
            case 99: // Thunderstorm with heavy hail
                return 'thunderstorm';
            default:
                return 'unknown'; // Use a default image for unknown cases
        }
    }

    function saveTask(task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskList.innerHTML = ''; // Clear the task list
        taskGrid.innerHTML = ''; // Clear the task grid
        tasks.forEach(task => {
            renderTask(task);
        });
        renderTasks(); // Initial rendering of suitable tasks
    }

    function updateTask(name, minTemp, rainStatus, completed) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(task => {
            if (task.name === name && task.minTemp == minTemp && task.rainStatus === rainStatus) {
                task.completed = completed;
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(); // Re-render tasks to update the displayed tasks
    }

    function deleteTask(name, minTemp, rainStatus) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => !(task.name === name && task.minTemp == minTemp && task.rainStatus === rainStatus));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(); // Re-render tasks to update the displayed tasks
    }

    function renderTasks() {
        taskGrid.innerHTML = '';
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        let hasSuitableTasks = false;
        tasks.forEach(task => {
            if (isTaskSuitable(task.minTemp, task.rainStatus)) {
                renderTaskCard(task, false);
                hasSuitableTasks = true;
            }
        });
    
        // Hide or show the matchingTasks div based on the presence of suitable tasks
        const matchingTasks = document.getElementById('matchingTasks');
        if (hasSuitableTasks) {
            matchingTasks.style.display = 'grid';
        } else {
            matchingTasks.style.display = 'none';
        }
    }
    
    
});
