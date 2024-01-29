import { useEffect, useState } from "react";
import { loadGetInitialProps } from "next/dist/shared/lib/utils";
import Image from "next/image";
import "chart.js/auto";
import type { NextPage } from "next";
import { Doughnut } from "react-chartjs-2";
import * as XLSX from "xlsx";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";

const Home: NextPage = () => {
  const getCategoryCounts = async () => {
    try {
      const response = await fetch("/BuildsBG_only-data.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const categoryColumn = "CurationType";

      const data = XLSX.utils.sheet_to_json(sheet);

      const categoryCounts: Record<string, number> = {};
      data.forEach((row: any) => {
        const category = row[categoryColumn];
        if (category !== undefined) {
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        } else {
          console.log("");
        }
      });

      return categoryCounts;
    } catch (error) {
      console.error("Error reading Excel file:", error);
      return {};
    }
  };

  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    getCategoryCounts().then(counts => {
      setCategoryCounts(counts);
    });
  }, []);

  const [averageDescriptionLength, setAverageDescriptionLength] = useState<number | null>(null);
  const [totalDescriptionLength, setTotalDescriptionLength] = useState<number | null>(null);
  const getAverageDescriptionLength = async () => {
    try {
      const response = await fetch("/BuildsBG_only-data.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(sheet);

      const descriptionLengths = data.map((row: any) => row["Description LEN"]);

      const totalLength = descriptionLengths.reduce((total, length) => total + length, 0);
      const averageLength = totalLength / descriptionLengths.length;

      setAverageDescriptionLength(parseFloat(averageLength.toFixed(2)));
      setTotalDescriptionLength(parseFloat(totalLength.toFixed(2)));
    } catch (error) {
      console.error("Error calculating average description length:", error);
    }
  };

  const [longestDescriptionProject, setLongestDescriptionProject] = useState<any | null>(null);

  const findLongestDescriptionProject = async () => {
    try {
      const response = await fetch("/BuildsBG_only-data.xlsx");
      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      const data = XLSX.utils.sheet_to_json(sheet);
      console.log("Data: ", data);

      // Find the row with the longest description
      const projectWithLongestDescription = data.reduce(
        (maxRow: any, currentRow: any) => {
          const currentDescription = currentRow["Description LEN"];
          const maxDescription = maxRow["Description LEN"] || "";

          if (currentDescription && currentDescription > maxDescription.length) {
            return currentRow; // Update maxRow to the currentRow when a longer description is found
          }

          return maxRow;
        },
        { "Description LEN": "" },
      );

      setLongestDescriptionProject(projectWithLongestDescription);
    } catch (error) {
      console.error("Error finding project with longest description:", error);
    }
  };

  useEffect(() => {
    getCategoryCounts().then(counts => {
      setCategoryCounts(counts);
    });
    getAverageDescriptionLength();
    findLongestDescriptionProject();
  }, []);

  const chartData = {
    labels: Object.keys(categoryCounts),
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#FF4CD2",
          // Add more colors as needed
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          // Add more colors as needed
        ],
      },
    ],
  };

  const getTotalCount = () => {
    return Object.values(categoryCounts).reduce((total, count) => total + count, 0);
  };

  const options = {
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <>
      <MetaHeader />
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5 mb-5">
          <h1 className="text-center mb-10">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Scaffold-ETH 2 Builds Report</span>
          </h1>
        </div>

        <div className="bg-base-300 w-full">
          <h1 className="text-center mb-8">
            <span className="block text-3xl mb-2 pt-10 mt-10 font-bold">Categories of the Builds</span>
          </h1>
        </div>

        <div className="flex justify-center bg-base-300 w-full px-8 py-6">
          <div className="flex justify-center items-center gap-12 flex-row sm:flex-row pt-5">
            <div className="chart-container" style={{ position: "relative", width: "650px", height: "650px" }}>
              <h1 className="font-bold"> </h1>
              <Doughnut data={chartData} options={options} />
              <div className="center-text font-bold">
                <p>Total Projects</p>
                <p>{getTotalCount()}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center bg-primary w-full px-8 py-6 mt-10">
          <div className="flex justify-center items-center gap-12 flex-row sm:flex-row pt-5">
            <h1 className="text-2xl font-bold"> Now, its the time for some interesting metrics for buidls! </h1>
          </div>
        </div>

        <div className="flex justify-center bg-base-300 w-75 px-8 py-6 mt-10 rounded-2xl">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row">
            <div className="text-center mb-4 sm:mb-0">
              <h1 className="text-2xl font-bold">Total Description Length:</h1>
              <p className="text-2xl font-bold text-[#e00000]">
                {totalDescriptionLength !== null ? totalDescriptionLength : "Loading..."}
              </p>
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">Average Description Length:</h1>
              <p className="text-2xl font-bold text-[#e00000]">
                {averageDescriptionLength !== null ? averageDescriptionLength : "Loading..."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center bg-base-300 w-75 px-8 py-6 mt-10 rounded-2xl">
          <div className="flex justify-center items-center px-10 ml-10 flex-col sm:flex-row">
            <div className="text-center ">
              <h1 className="text-2xl font-bold uppercase">The Buidl with longest description:</h1>
              <div className="max-w-md rounded overflow-hidden shadow-lg mt-6">
                {longestDescriptionProject !== null && (
                  <>
                    <div className="max-w-md rounded overflow-hidden shadow-lg mt-6 hover:bg-primary">
                      <div className="mb-6 ml-4">
                        <Address address={longestDescriptionProject.Builder} />
                      </div>
                      <div className="font-bold text-xl mb-2">{longestDescriptionProject.Name}</div>
                      <div className="px-6 py-4 my-10">
                        <p className="text-gray-700 text-base">{longestDescriptionProject.Desc}</p>
                      </div>
                      <span className="inline-block bg-[#e00000] rounded-full px-3 py-1 text-sm font-semibold text-gray-200 mr-2 mb-2">
                        {longestDescriptionProject["CurationType"]}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .center-text {
          position: absolute;
          top: 60%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
        }

        .chart-container {
          position: relative;
        }
      `}</style>
    </>
  );
};

export default Home;
