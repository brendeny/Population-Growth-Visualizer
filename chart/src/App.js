import React, { useEffect, useState } from "react";
import axios from "axios";
import { Chart } from "react-google-charts";
import { Toggle } from "react-toggle-component";
import { Navbar, Container, Row, Col } from "react-bootstrap";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';


function App() {
  const [growthAmounts, setGrowthAmounts] = useState([]);
  const [largestThreePopGrowth, setLargestThreePopGrowth] = useState([]);
  const [isChart, setIsChart] = useState(true);

  useEffect(() => {
    getData();
  }, []);

  /**
   * Retrieves and parses the data from the json files and populates the q1 and q2 arrays with "Q1 2020"
   * and "Q4 2019" data for population numbers of Canadian provinces 
   */

  async function getData() {
    let q1 = [];
    let q2 = [];

    await axios
      .get("https://lisampledata.blob.core.windows.net/sample/q1-2020.json")
      .then((res) => {
        const data = res.data;

        data.forEach((element) => {
          element["Q1 2020"] = parseInt(
            element["Q1 2020"].replace(/,/g, ""),
            10
          );
        });

        q1 = data;
      })
      .catch((err) => console.log(err));

    await axios
      .get("https://lisampledata.blob.core.windows.net/sample/q4-2019.json")
      .then((res) => {
        const data = res.data;

        data.forEach((element) => {
          element["Q4 2019"] = parseInt(
            element["Q4 2019"].replace(/,/g, ""),
            10
          );
        });

        q2 = data;
      })
      .catch((err) => console.log(err));

    q1.forEach((element) => {
      element["Geography"] = element["Geography"].replace(" 5", "");
    });

    compareData(q1, q2);
  }

  /**
   * Calculates the population growth for each of the provinces and creates a new array
   * @param {*q1-2020 data array} q1 
   * @param {*q4-2019 data array} q2 
   */
  function compareData(q1, q2) {
    let differences = [];

    for (let i = 0; i < q1.length; i++) {
      differences.push({
        Geography: q1[i]["Geography"],
        Growth: q1[i]["Q1 2020"] - q2[i]["Q4 2019"],
      });
    }

    let growthRates = [];

    growthRates[0] = [
      { type: "string", label: "Province" },
      { type: "number", label: "Population Growth: Q4-2019 to Q1-2020" },
    ];

    for (let i = 0; i < differences.length; i++) {
      growthRates.push([differences[i]["Geography"], differences[i]["Growth"]]);
    }

    setGrowthAmounts(growthRates);
    sortByKey(differences, "Growth");

    let topThree = [];
    topThree[0] = ["Province", "Population Growth"];
    differences = differences.slice(0, 3);

    for (let i = 0; i < differences.length; i++) {
      topThree.push([differences[i]["Geography"], differences[i]["Growth"]]);
    }

    setLargestThreePopGrowth(topThree);
  }
  
  /**
   * Sorts the specified keys in the given array
   * @param {*quarter array} array 
   * @param {*unsorted keys} key 
   */
  function sortByKey(array, key) {
    return array.sort(function (a, b) {
      let x = a[key];
      let y = b[key];
      return x > y ? -1 : x < y ? 1 : 0;
    });
  }


/**
 * Sets isChart to true or false based on onToggle button click
 */
  function toggleChart() {
    isChart ? setIsChart(false) : setIsChart(true);
  }
  

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        
        <Navbar.Brand href="https://github.com/brendeny" target="_blank"><img
          src="/logo192.png"
          width="30"
          height="30"
          className="d-inline-block align-top"
        /> Population Growth Visualizer</Navbar.Brand>
        <br></br>
        <Toggle name="toggle-1" onToggle={toggleChart} />
      </Navbar>

      <div className="center">
        <Container>
          <Row className="justify-content-md-center">
            {isChart ? (
              <Col>
                <Chart
                  // width="800px"
                  height="700px"
                  chartType="Bar"
                  loader={<div>Loading Chart</div>}
                  data={largestThreePopGrowth}
                  options={{
                    chart: {
                      title: "Population Growth in Canada",
                      subtitle:
                        "Top 3 Provinces by Population Growth: Q4-2019 to Q1-2020",
                    },
                  }}
                />
              </Col>
            ) : (
              
              <Col md="auto">
                <Chart
                  chartType="Table"
                  loader={<div>Loading Chart</div>}
                  data={growthAmounts}
                  options={{
                    showRowNumber: false,
                  }}
                />
              </Col>
            )}
          </Row>
        </Container>
      </div>
    </div>
  );
}

export default App;
