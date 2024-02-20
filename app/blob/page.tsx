"use client";

import React, { useEffect, useState } from "react";
import xmlJs from "xml-js";

function DependencyDisplay({ data }) {
  // Render dependencies
  function renderDependencies() {
    if (
      !data ||
      !data.project ||
      !data.project.dependencyManagement ||
      !data.project.dependencyManagement.dependencies
    ) {
      return <div>No dependencies found</div>;
    }

    const dependencies =
      data.project.dependencyManagement.dependencies.dependency;

    // Extract unique groupId and version pairs
    const uniqueDependencies = dependencies.reduce((acc, dependency) => {
      const groupId = dependency.groupId._text;
      const version = dependency.version?._text || "";
      const existingIndex = acc.findIndex((item) => item.groupId === groupId);
      if (existingIndex === -1) {
        acc.push({ groupId, version });
      } else {
        // If version already exists for the groupId, update it
        if (acc[existingIndex].version !== version) {
          acc[existingIndex].version += `, ${version}`;
        }
      }
      return acc;
    }, []);

    return (
      <div>
        {uniqueDependencies.map((dependency, index) => (
          <div key={index}>
            <p>
              {dependency.groupId} {dependency.version}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2>Dependencies</h2>
      {renderDependencies()}
    </div>
  );
}

const Page = () => {
  const [xmlData, setXmlData] = useState(null);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/shopizer-ecommerce/shopizer/main/pom.xml"
    ) // Replace with the URL or path to your XML data
      .then((response) => response.text())
      .then((xmlText) => {
        const jsonData = xmlJs.xml2json(xmlText, { compact: true, spaces: 4 });

        setXmlData(JSON.parse(jsonData));
        console.log(xmlData);
      })

      .catch((error) => {
        console.error("Error fetching XML data:", error);
      });
  }, []);

  return (
    <div>
      {xmlData && xmlData.project ? (
        <div>
          {/* <pre>{JSON.stringify(xmlData, null, 4)}</pre> */}
          <DependencyDisplay data={xmlData} />
        </div>
      ) : (
        <p>Loading XML data...</p>
      )}
    </div>
  );
};

export default Page;
