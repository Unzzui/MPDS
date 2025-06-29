document.addEventListener("DOMContentLoaded", function () {
	console.log("Inicializando calendario...");

	const prevMonthButton = document.getElementById("prev-month");
	const nextMonthButton = document.getElementById("next-month");
	const calendar = document.getElementById("calendar-body");
	const currentMonthLabel = document.getElementById("current-month");
	const dayDetails = document.getElementById("day-details");
	const dayInfo = document.getElementById("day-info");
	const closeDetailsButton = document.getElementById("close-details");

	let currentDate = new Date();
	let currentYear = currentDate.getFullYear();
	let currentMonth = currentDate.getMonth();
	let today = currentDate.getDate();

	function updateMonthLabel() {
		const monthNames = [
			"Enero",
			"Febrero",
			"Marzo",
			"Abril",
			"Mayo",
			"Junio",
			"Julio",
			"Agosto",
			"Septiembre",
			"Octubre",
			"Noviembre",
			"Diciembre",
		];
		currentMonthLabel.textContent = `${monthNames[currentMonth]} ${currentYear}`;
	}

	function generateOfficialCalendarStructure(year, month) {
		const daysInMonth = new Date(year, month + 1, 0).getDate();
		let firstDayOfWeek = new Date(year, month, 1).getDay();
		// Ajustar para que el calendario comience en lunes
		firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

		const calendarStructure = [];

		// Días vacíos antes del primer día del mes
		for (let i = 0; i < firstDayOfWeek; i++) {
			calendarStructure.push({
				day: null,
				status: "inactive",
				type: "",
				emoji: "",
			});
		}

		// Días del mes
		for (let day = 1; day <= daysInMonth; day++) {
			calendarStructure.push({ day, status: "upcoming", type: "", emoji: "" });
		}

		// Días vacíos al final de la semana para completar la última fila
		while (calendarStructure.length % 7 !== 0) {
			calendarStructure.push({
				day: null,
				status: "inactive",
				type: "",
				emoji: "",
			});
		}

		return calendarStructure;
	}

	function integrateCalendarData(structure, data) {
		data.forEach((entry) => {
			const dayEntry = structure.find((item) => item.day === entry.day);
			if (dayEntry) {
				dayEntry.status = entry.status;
				dayEntry.type = entry.type;
				dayEntry.emoji = entry.emoji;
				dayEntry.workout_id = entry.workout_id;
			}
		});
		return structure;
	}

	function renderCalendar(data) {
		calendar.innerHTML = ""; // Limpiar el calendario existente

		let row = document.createElement("tr");
		data.forEach((day, index) => {
			const cell = document.createElement("td");
			cell.classList.add("calendar-day");

			// Aplicar clases basadas en el estado del día
			if (day.status === "inactive") {
				cell.classList.add("inactive");
			} else if (day.status === "completed") {
				cell.classList.add("completed");
				cell.dataset.workoutId = day.workout_id;
				cell.dataset.type = day.type;
				cell.addEventListener("click", () => showDayDetails(day));
			} else if (day.status === "block_end") {
				cell.classList.add("block-end");
			} else if (day.status === "upcoming") {
				cell.classList.add("upcoming");
				cell.addEventListener("click", () => showDayDetails(day));
			}

			// Contenido de la celda
			if (day.day !== null) {
				const type = day.type || "";
				const emoji = day.emoji || "";
				cell.innerHTML = `<div>${day.day}</div><small>${type} ${emoji}</small>`;
				// Destacar el día actual
				if (
					day.day === today &&
					currentMonth === currentDate.getMonth() &&
					currentYear === currentDate.getFullYear()
				) {
					cell.classList.add("current-day");
				}
			} else {
				cell.textContent = ""; // Celdas vacías para días inactivos
			}

			row.appendChild(cell);

			// Crear una nueva fila al completar una semana
			if ((index + 1) % 7 === 0) {
				calendar.appendChild(row);
				row = document.createElement("tr");
			}
		});

		// Agregar la última fila si no está completa
		if (row.children.length > 0) {
			calendar.appendChild(row);
		}
	}

	function showDayDetails(day) {
		const type = day.type || "No especificado";
		const emoji = day.emoji || "";
		const formattedDate = `${currentYear}-${String(currentMonth + 1).padStart(
			2,
			"0"
		)}-${String(day.day).padStart(2, "0")}`;
		const dayType = day.type ? day.type : "default";

		dayInfo.innerHTML = `
			<p>Día: ${day.day || "No disponible"}</p>
			<p>Estado: ${day.status || "No especificado"}</p>
			<p>Tipo: ${type} ${emoji}</p>
			${
				dayType !== "default"
					? `<button id="add-workout-button" data-date="${formattedDate}" data-day-type="${dayType}" class="btn">Agregar Entrenamiento</button>`
					: `<p>No puedes registrar un entrenamiento en este día.</p>`
			}
		`;

		dayDetails.classList.remove("hidden");

		// Vincular el evento al botón
		const addWorkoutButton = document.getElementById("add-workout-button");
		if (addWorkoutButton) {
			addWorkoutButton.addEventListener("click", () => {
				const date = addWorkoutButton.dataset.date;
				const dayType = addWorkoutButton.dataset.dayType;
				if (dayType === "default" || dayType === "No definido") {
					alert("El tipo de día no está definido.");
					return;
				}
				// Redirigir a la URL correspondiente
				window.location.href = `/log/${encodeURIComponent(
					dayType
				)}?date=${date}`;
			});
		}
	}

	closeDetailsButton.addEventListener("click", () => {
		dayDetails.classList.add("hidden");
	});

	function changeMonth(offset) {
		currentMonth += offset;
		if (currentMonth < 0) {
			currentMonth = 11;
			currentYear--;
		} else if (currentMonth > 11) {
			currentMonth = 0;
			currentYear++;
		}
		updateMonthLabel();
		loadCalendarData(currentYear, currentMonth);
	}

	function loadCalendarData(year, month) {
		fetch(`/calendar-data?year=${year}&month=${month + 1}`)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Error al cargar datos del servidor.");
				}
				return response.json();
			})
			.then((data) => {
				const officialStructure = generateOfficialCalendarStructure(
					year,
					month
				);
				const integratedData = integrateCalendarData(officialStructure, data);
				renderCalendar(integratedData);
			})
			.catch((error) => {
				console.error("Error al cargar el calendario:", error);
				const fallbackStructure = generateOfficialCalendarStructure(
					year,
					month
				);
				renderCalendar(fallbackStructure);
			});
	}

	prevMonthButton.addEventListener("click", () => changeMonth(-1));
	nextMonthButton.addEventListener("click", () => changeMonth(1));

	updateMonthLabel();
	loadCalendarData(currentYear, currentMonth);
});
