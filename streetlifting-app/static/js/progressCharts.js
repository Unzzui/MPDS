document.addEventListener("DOMContentLoaded", function () {
	const rmRecordsData = JSON.parse(
		document.getElementById("rmRecordsData").textContent
	);

	console.log("Datos recibidos para el gráfico:", rmRecordsData);

	const labels = rmRecordsData.map((record) => record.date);
	const data = {
		labels: labels,
		datasets: [
			{
				label: "1RM Pull-up",
				data: rmRecordsData.map((record) => record.pull_up_rm),
				borderColor: "rgba(255, 99, 132, 1)",
				backgroundColor: "rgba(255, 99, 132, 0.2)",
				tension: 0.4, // Suavizar las líneas
			},
			{
				label: "1RM Weighted Dips",
				data: rmRecordsData.map((record) => record.dip_rm),
				borderColor: "rgba(54, 162, 235, 1)",
				backgroundColor: "rgba(54, 162, 235, 0.2)",
				tension: 0.4,
			},
			{
				label: "1RM Squat",
				data: rmRecordsData.map((record) => record.squat_rm),
				borderColor: "rgba(75, 192, 192, 1)",
				backgroundColor: "rgba(75, 192, 192, 0.2)",
				tension: 0.4,
			},
			{
				label: "1RM Muscle-ups",
				data: rmRecordsData.map((record) => record.muscle_up_rm),
				borderColor: "rgba(153, 102, 255, 1)",
				backgroundColor: "rgba(153, 102, 255, 0.2)",
				tension: 0.4,
			},
		],
	};

	const config = {
		type: "line",
		data: data,
		options: {
			responsive: true,
			plugins: {
				title: {
					display: true,
					text: "Evolución del 1RM",
				},
			},
			scales: {
				x: {
					type: "time",
					time: {
						unit: "month",
					},
					title: {
						display: true,
						text: "Fecha",
					},
				},
				y: {
					title: {
						display: true,
						text: "Peso (kg)",
					},
				},
			},
		},
	};

	new Chart(document.getElementById("progressChart"), config);
});
