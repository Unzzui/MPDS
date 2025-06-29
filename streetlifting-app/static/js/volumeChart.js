document.addEventListener("DOMContentLoaded", function () {
	const volumeChartData = JSON.parse(
		document.getElementById("volumeChartData").textContent
	);

	const dates = Object.keys(volumeChartData); // Fechas como etiquetas
	const exercises = new Set();

	// Crear estructura de datos por ejercicio
	const datasets = [];
	dates.forEach((date) => {
		const dailyData = volumeChartData[date];
		Object.keys(dailyData).forEach((exercise) => exercises.add(exercise));
	});

	exercises.forEach((exercise) => {
		const data = dates.map((date) => volumeChartData[date][exercise] || 0);
		datasets.push({
			label: exercise,
			data: data,
			borderColor: getRandomColor(), // Función para generar colores
			backgroundColor: getRandomColor(0.5),
		});
	});

	const data = {
		labels: dates,
		datasets: datasets,
	};

	const config = {
		type: "bar",
		data: data,
		options: {
			responsive: true,
			plugins: {
				legend: {
					position: "top",
				},
			},
			scales: {
				x: {
					title: {
						display: true,
						text: "Fecha",
					},
				},
				y: {
					title: {
						display: true,
						text: "Volumen (kg)",
					},
				},
			},
		},
	};

	const volumeChart = new Chart(document.getElementById("volumeChart"), config);

	function getRandomColor(alpha = 1) {
		const r = Math.floor(Math.random() * 255);
		const g = Math.floor(Math.random() * 255);
		const b = Math.floor(Math.random() * 255);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}
});
