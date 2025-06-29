document.addEventListener("DOMContentLoaded", function () {
	const frequencyChartData = JSON.parse(
		document.getElementById("frequencyChartData").textContent
	);

	const labels = Object.keys(frequencyChartData);
	const data = {
		labels: labels,
		datasets: [
			{
				label: "Frecuencia de Entrenamiento",
				data: Object.values(frequencyChartData),
				borderColor: "rgba(75, 192, 192, 1)",
				backgroundColor: "rgba(75, 192, 192, 0.2)",
			},
		],
	};

	const config = {
		type: "bar",
		data: data,
		options: {
			responsive: true,
			scales: {
				x: {
					title: {
						display: true,
						text: "Ejercicio",
					},
				},
				y: {
					title: {
						display: true,
						text: "Frecuencia",
					},
				},
			},
		},
	};

	const frequencyChart = new Chart(
		document.getElementById("frequencyChart"),
		config
	);
});
