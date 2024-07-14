
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

    // Wetterdaten beim Laden der Seite abrufen mit Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            const weatherData = await fetchWeather(latitude, longitude);
            currentWeather = weatherData;
            displayWeather(weatherData);
            // Aufgaben aus dem LocalStorage laden
            loadTasks();
        }, (error) => {
            console.error("Geolocation error:", error);
        });
    } else {
        console.error("Geolocation wird von diesem Browser nicht unterstützt.");
    }

    // Slider-Ereignislistener zum Aktualisieren des Temperaturwertes
    tempSlider.addEventListener('input', () => {
        tempValue.textContent = `${tempSlider.value}°C`;
    });

    // Klick-Ereignislistener zum Anzeigen des Formulars zum Hinzufügen von Aufgaben
    addTaskButton.addEventListener('click', () => {
        taskForm.style.display = 'block';
    });

    // Klick-Ereignislistener zum Speichern der Aufgabe
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
        renderTasks(); // Aufgaben neu rendern, um die angezeigten Aufgaben zu aktualisieren
    });

    // Funktion zum Rendern einer Aufgabe in der Aufgabenliste
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
            renderTasks(); // Aufgaben neu rendern, um die angezeigten Aufgaben zu aktualisieren
        });

        taskList.appendChild(li);
    }

    // Funktion zum Rendern einer Aufgabe in der Aufgaben-Kachel
    function renderTaskCard(task, animate = true) {
        const { name, minTemp, rainStatus, completed } = task;

        if (!isTaskSuitable(minTemp, rainStatus)) {
            return; // Überspringe das Rendern dieser Karte, wenn die Aufgabe nicht geeignet ist
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
            renderTasks(); // Aufgaben neu rendern, um die angezeigten Aufgaben zu aktualisieren
        });

        card.appendChild(deleteButton);
        taskGrid.appendChild(card);
    }

    // Funktion zur Überprüfung, ob eine Aufgabe für die aktuellen Wetterbedingungen geeignet ist
    function isTaskSuitable(minTemp, rainStatus) {
        const currentTemp = currentWeather.temperature;
        const currentRain = currentWeather.rain;

        if (currentTemp < minTemp) {
            return false;
        }

        // Überprüfe die genauen Regenbedingungen
        if (rainStatus === 'none' && currentRain > 0) {
            return false;
        } else if (rainStatus === 'light' && currentRain > 2) {
            return false;
        } else if (rainStatus === 'rain' && currentRain <= 2) {
            return false;
        }

        return true;
    }

    // Wetterdaten basierend auf Breitengrad und Längengrad abrufen
    async function fetchWeather(latitude, longitude) {
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&timezone=Europe/Berlin`);
        const data = await response.json();
        return {
            temperature: data.current_weather.temperature,
            rain: data.current_weather.precipitation ?? 0, // Setze auf 0, wenn undefined
            weatherCode: data.current_weather.weathercode
        };
    }

    // Wetterinformationen anzeigen
    function displayWeather(weather) {
        weatherText.textContent = `Aktuelle Temperatur: ${weather.temperature}°C, Niederschlag: ${weather.rain}mm`;

        const weatherImage = getWeatherImage(weather.weatherCode);
        weatherIcon.src = `images/${weatherImage}.png`;
        weatherIcon.alt = weatherImage; // Aktualisiere das alt-Attribut für Barrierefreiheit
    }

    // Bild basierend auf dem Wettercode abrufen
    function getWeatherImage(weatherCode) {
        switch (weatherCode) {
            case 0: // Klarer Himmel
            case 1: // Überwiegend klar
                return 'clear';
            case 2: // Teilweise bewölkt
                return 'partly_cloudy';
            case 3: // Bewölkt
            case 45: // Nebel
            case 48: // Reifnebel
                return 'cloudy';
            case 51: // Leichter Nieselregen
            case 53: // Mäßiger Nieselregen
            case 55: // Starker Nieselregen
            case 56: // Leichter gefrierender Nieselregen
            case 57: // Starker gefrierender Nieselregen
            case 61: // Leichter Regen
                return 'light_rain';
            case 63: // Mäßiger Regen
            case 65: // Starker Regen
            case 66: // Leichter gefrierender Regen
            case 67: // Starker gefrierender Regen
            case 80: // Leichte Regenschauer
            case 81: // Mäßige Regenschauer
            case 82: // Starke Regenschauer
                return 'rain';
            case 71: // Leichter Schneefall
            case 73: // Mäßiger Schneefall
            case 75: // Starker Schneefall
            case 77: // Schneekörner
            case 85: // Leichte Schneeschauer
            case 86: // Starke Schneeschauer
                return 'snow';
            case 95: // Leichtes oder mäßiges Gewitter
            case 96: // Gewitter mit leichtem Hagel
            case 99: // Gewitter mit starkem Hagel
                return 'thunderstorm';
            default:
                return 'unknown'; // Verwende ein Standardbild für unbekannte Fälle
        }
    }

    // Aufgabe im LocalStorage speichern
    function saveTask(task) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.push(task);
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Aufgaben aus dem LocalStorage laden
    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        taskList.innerHTML = ''; // Aufgabenliste leeren
        taskGrid.innerHTML = ''; // Aufgabenraster leeren
        tasks.forEach(task => {
            renderTask(task);
        });
        renderTasks(); // Initiales Rendern der geeigneten Aufgaben
    }

    // Aufgabe im LocalStorage aktualisieren
    function updateTask(name, minTemp, rainStatus, completed) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.map(task => {
            if (task.name === name && task.minTemp == minTemp && task.rainStatus === rainStatus) {
                task.completed = completed;
            }
            return task;
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(); // Aufgaben neu rendern, um die angezeigten Aufgaben zu aktualisieren
    }

    // Aufgabe im LocalStorage löschen
    function deleteTask(name, minTemp, rainStatus) {
        let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks = tasks.filter(task => !(task.name === name && task.minTemp == minTemp && task.rainStatus === rainStatus));
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderTasks(); // Aufgaben neu rendern, um die angezeigten Aufgaben zu aktualisieren
    }

    // Aufgaben rendern
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
    
        // Blende das matchingTasks-Element basierend auf der Anwesenheit geeigneter Aufgaben ein oder aus
        const matchingTasks = document.getElementById('matchingTasks');
        if (hasSuitableTasks) {
            matchingTasks.style.display = 'grid';
        } else {
            matchingTasks.style.display = 'none';
        }
    }
});
