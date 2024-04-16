const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/Mern-database', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.error(err));

// Define schema for the pre-existing collection
const UserSchema = new mongoose.Schema({
  _id: String,
  ts: String,
  machine_status: Number,
  vibration: Number
});

// Create a model for the pre-existing collection
const User = mongoose.model('User', UserSchema, 'Mern-collection');

// Define route to fetch and display user data
app.get('/', async (req, res) => {
  try {
    // Fetch all users from MongoDB
    const users = await User.find();

    // Extract required data for chart
    const data = [['Timestamp', 'Machine Status']];
    users.forEach(user => {
      data.push([user.ts, user.machine_status]);
    });

    // Send the HTML page with embedded chart
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Machine Status Chart</title>
        <script type="text/javascript" src="https://www.gstatic.com/charts/loader.js"></script>
        <script type="text/javascript">
          google.charts.load('current', { packages: ['corechart'] });
          google.charts.setOnLoadCallback(drawChart);
          function drawChart() {
            var data = google.visualization.arrayToDataTable(${JSON.stringify(data)});
            var options = {
              title: 'Machine Status Chart',
              curveType: 'function',
              legend: { position: 'bottom' },
              backgroundColor: '#f9f9f9',
              chartArea: { width: '80%', height: '70%' },
              hAxis: {
                title: 'Timestamp',
                titleTextStyle: { color: '#333' },
                textStyle: { color: '#333' }
              },
              vAxis: {
                title: 'Machine Status',
                titleTextStyle: { color: '#333' },
                textStyle: { color: '#333' }
              }
            };
            var chart = new google.visualization.LineChart(document.getElementById('chart_div'));
            chart.draw(data, options);
          }
        </script>
      </head>
      <body>
        <div id="chart_div" style="width: 100%; height: 500px;"></div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
